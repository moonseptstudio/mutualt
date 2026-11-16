import { ArrowRight, Gift, Sparkles, CheckCircle2 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/client';
import toast from 'react-hot-toast';
import { useState, useRef } from 'react';
import PaymentModal from '../../components/modals/PaymentModal';
import { useTrialStatusQuery, claimFreeTrial, queryKeys } from '../../api/queries';
import { queryClient } from '../../api/queryClient';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import PricingCard from '../../components/common/PricingCard';
import faqBg from '../../assets/pricing/faqbg.webp';
import PricingCrystalsBackground from '../../components/hero/PricingCrystalsBackground';
import StickyFaqSection, { type FaqItem } from '../../components/common/StickyFaqSection';
import SEO from '../../components/SEO';
import { breadcrumbSchema, faqSchema, SITE_URL, ORG_NAME } from '../../config/seo';

/* ─── Animation Variants ─── */
const fadeInUp: any = {
  hidden: { opacity: 0, y: 40, rotateX: -10 },
  visible: { 
    opacity: 1, 
    y: 0, 
    rotateX: 0,
    transition: { duration: 0.8, ease: [0.21, 0.45, 0.32, 0.9] }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

/* ─── Floating Shapes Component (for parallax) ─── */
const FloatingShapes = () => {
    const { scrollYProgress } = useScroll();
    const y1 = useTransform(scrollYProgress, [0, 1], [0, -150]);
    const y2 = useTransform(scrollYProgress, [0, 1], [0, 100]);
  
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <motion.div style={{ y: y1 }} className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-blue-100/40 blur-3xl" />
        <motion.div style={{ y: y2 }} className="absolute top-1/2 -right-20 w-80 h-80 rounded-full bg-sky-100/35 blur-3xl" />
      </div>
    );
};

/* ─── Scroll-linked Section Animation Wrapper ─── */
const ScrollAnimatedSection = ({ children, className = "", id, ref: externalRef }: { children: React.ReactNode, className?: string, id?: string, ref?: React.RefObject<HTMLDivElement> }) => {
  const internalRef = useRef<HTMLDivElement>(null);
  const targetRef = externalRef || internalRef;
  
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end start"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.95, 1, 1, 0.95]);
  const y = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [40, 0, 0, -40]);

  return (
    <motion.div
      ref={targetRef}
      id={id}
      style={{ opacity, scale, y }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const PricingPage = () => {
    const { t } = useTranslation();
    const { isAuthenticated, updateUser, user } = useAuth();
    const navigate = useNavigate();
    const [isUpgrading, setIsUpgrading] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [isTrialCheckout, setIsTrialCheckout] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<{name: string, price: string, duration: number} | null>(null);

    // Free-trial state only exists for a signed-in account.
    const trialQuery = useTrialStatusQuery(isAuthenticated);
    const trial = trialQuery.data;
    const trialDays = trial?.trialDays ?? 14;

    const premiumPlanName = t('home.pricing_plan_premium1', 'Premium (1 Month)');

    const handleUpgradeRequest = (plan: {name: string, price: string, duration: number}) => {
        if (!isAuthenticated) {
            navigate('/register');
            return;
        }

        setIsTrialCheckout(false);
        setSelectedPlan(plan);
        setShowPaymentModal(true);
    };

    /** Opens the no-card trial panel. Visitors are sent to register first. */
    const handleTrialRequest = () => {
        if (!isAuthenticated) {
            navigate('/register');
            return;
        }

        setIsTrialCheckout(true);
        setSelectedPlan({ name: premiumPlanName, price: "440", duration: 0 });
        setShowPaymentModal(true);
    };

    const handlePaymentSuccess = async () => {
        setShowPaymentModal(false);

        if (isTrialCheckout) {
            await performTrialClaim();
            return;
        }

        if (!selectedPlan) return;
        await performUpgrade(selectedPlan.duration);
    };

    /** Marks the session as Premium without disturbing which storage holds it. */
    const markPremium = () => {
        if (user) {
            updateUser({ packageName: 'PREMIUM' });
        }
        queryClient.invalidateQueries({ queryKey: queryKeys.trial });
        queryClient.invalidateQueries({ queryKey: queryKeys.profile });
    };

    const performTrialClaim = async () => {
        try {
            setIsUpgrading(true);
            const status = await claimFreeTrial();
            markPremium();

            toast.success(
                t('trial.claim_success', 'Your {{days}}-day free trial is active!', { days: status.trialDays }),
                { icon: '🎁' }
            );
            navigate('/dashboard');
        } catch (err: any) {
            console.error("Trial activation failed", err);
            // The server answers with a code so the reason can be shown in the user's language.
            const code = err.response?.data?.code;
            toast.error(
              code === 'TRIAL_ALREADY_CLAIMED'
                ? t('trial.error_already_claimed', 'This account has already used its free trial.')
                : code === 'TRIAL_WINDOW_CLOSED'
                  ? t('trial.error_window_closed', 'The free trial is only available during your first {{days}} days.', { days: trialDays })
                  : t('trial.claim_failed', "Couldn't start your free trial. Please try again.")
            );
            queryClient.invalidateQueries({ queryKey: queryKeys.trial });
        } finally {
            setIsUpgrading(false);
            setIsTrialCheckout(false);
        }
    };

    const performUpgrade = async (durationMonths: number) => {
        try {
            setIsUpgrading(true);
            await apiClient.post('/packages/buy', { duration: durationMonths });

            markPremium();

            toast.success(t('pricing_page.upgrade_success', "Welcome to Premium! All features unlocked."), { icon: '💎' });
            navigate('/dashboard');
        } catch (err: any) {
            console.error("Upgrade failed", err);
            toast.error(err.response?.data?.message || t('pricing_page.upgrade_failed', "Failed to upgrade. Please try again."));
        } finally {
            setIsUpgrading(false);
        }
    };

    const heroRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
    const heroY = useTransform(heroScroll, [0, 1], [0, 150]);
    const heroScale = useTransform(heroScroll, [0, 1], [1, 0.9]);
    const heroOpacity = useTransform(heroScroll, [0, 0.8], [1, 0]);

    const faqItems: FaqItem[] = [
        {
            question: t('home.pricing_faq_q1', 'Can I upgrade later?'),
            answer: t('home.pricing_faq_a1', 'Yes, you can upgrade from Basic to Premium at any time from your dashboard settings.')
        },
        {
            question: t('home.pricing_faq_q2', 'What happens after the duration ends?'),
            answer: t('home.pricing_faq_a2', 'Your account will automatically revert to the Basic (Free) plan. You can renew your premium access at any time.')
        },
        {
            question: t('home.pricing_faq_q3', 'Is there a recurring charge?'),
            answer: t('home.pricing_faq_a3', 'No, these are one-time payments for the specified duration. We do not store your card for recurring billing.')
        },
        {
            question: t('home.pricing_faq_q4', 'How long is the listing active?'),
            answer: t('home.pricing_faq_a4', 'Your profile stays active until you successfully find a match or manually disable it.')
        }
    ];

    return (
        <div className="relative">
            <SEO
                title="Pricing & Packages"
                description="Simple pricing with no hidden fees. Start free with 2-way matching, or unlock 3-way dynamic matching, unlimited requests and direct messaging from LKR 440."
                keywords="mutual transfer price Sri Lanka, mutual transfer packages, premium transfer matching Sri Lanka"
                path="/pricing"
                structuredData={[
                    breadcrumbSchema([['Pricing', '/pricing']]),
                    {
                        '@context': 'https://schema.org',
                        '@type': 'Product',
                        name: 'MutualTransfer.lk Membership',
                        description:
                            'Membership packages for Sri Lankan government employees looking for mutual workplace transfers.',
                        brand: { '@type': 'Brand', name: ORG_NAME },
                        offers: [
                            {
                                '@type': 'Offer',
                                name: 'Basic',
                                price: '0',
                                priceCurrency: 'LKR',
                                availability: 'https://schema.org/InStock',
                                url: `${SITE_URL}/pricing`,
                                description: 'Standard basic features for simple swaps. View-only access.',
                            },
                            {
                                '@type': 'Offer',
                                name: 'Premium (1 Month)',
                                price: '440',
                                priceCurrency: 'LKR',
                                availability: 'https://schema.org/InStock',
                                url: `${SITE_URL}/pricing`,
                                description:
                                    '2-way and 3-way dynamic matching, unlimited match requests, direct messaging and full contact visibility.',
                            },
                        ],
                    },
                    faqSchema([
                        {
                            question: 'Can I upgrade later?',
                            answer:
                                'Yes, you can upgrade from Basic to Premium at any time from your dashboard settings.',
                        },
                        {
                            question: 'What happens after the duration ends?',
                            answer:
                                'Your account will automatically revert to the Basic (Free) plan. You can renew your premium access at any time.',
                        },
                        {
                            question: 'Is there a recurring charge?',
                            answer:
                                'No, these are one-time payments for the specified duration. We do not store your card for recurring billing.',
                        },
                        {
                            question: 'How long is the listing active?',
                            answer:
                                'Your profile stays active until you successfully find a match or manually disable it.',
                        },
                    ]),
                ]}
            />
            <PaymentModal 
                isOpen={showPaymentModal}
                onClose={() => { setShowPaymentModal(false); setIsTrialCheckout(false); }}
                onPaymentSuccess={handlePaymentSuccess}
                packageName={selectedPlan?.name || "Premium"}
                price={selectedPlan?.price || "0"}
                trialMode={isTrialCheckout}
                trialDays={trialDays}
                trialDaysLeftToClaim={trial?.daysLeftToClaim}
            />

            {/* ─── Hero Section ─── */}
            <section ref={heroRef} className="relative mesh-gradient-bg overflow-hidden flex flex-col justify-center min-h-screen pt-24 pb-12">
                <PricingCrystalsBackground />
                <FloatingShapes />
                <motion.div 
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={staggerContainer}
                    style={{ y: heroY, scale: heroScale, opacity: heroOpacity }}
                    className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 my-auto"
                >
                    <motion.div variants={fadeInUp} className="inline-block px-4 py-1.5 bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider rounded-full mb-6 text-center mx-auto">
                        {t('common.pricing', 'Packages')}
                    </motion.div>
                    <motion.h1 variants={fadeInUp} className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-8 tracking-tight">
                        {t('pricing_page.hero_title_1', 'Simple Pricing,')}{' '}
                        <span className="shimmer-text">{t('pricing_page.hero_title_highlight', 'No Hidden Fees.')}</span>
                    </motion.h1>
                    <motion.p variants={fadeInUp} className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-sans">
                        {t('pricing_page.hero_subtitle', 'Choose the package that helps you reach your preferred station faster.')}
                    </motion.p>
                </motion.div>
            </section>

            {/* ─── Pricing Plans Section ─── */}
            <ScrollAnimatedSection className="bg-white perspective-2000 overflow-hidden py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div 
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={staggerContainer}
                        className="text-center mb-16"
                    >
                        <motion.h2 variants={fadeInUp} className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">
                            {t('pricing_page.plans_title', 'Choose Your Plan')}
                        </motion.h2>
                        <motion.p variants={fadeInUp} className="text-slate-600 font-sans max-w-xl mx-auto">
                            {t('pricing_page.plans_subtitle', 'Transparent, one-time pricing tailored for government officers across Sri Lanka.')}
                        </motion.p>
                    </motion.div>

                    {/* ─── 14-Day Free Trial Banner ─── */}
                    {(!isAuthenticated || trial?.eligible || trial?.active) && (
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.6 }}
                            className="max-w-4xl mx-auto mb-12"
                        >
                            <div className="relative overflow-hidden rounded-[32px] promo-banner-bg p-8 sm:p-10 shadow-2xl shadow-violet-500/20">
                                <div className="absolute inset-0 bg-gradient-to-br from-violet-600/30 to-pink-600/20" />
                                <div className="absolute -top-10 -left-10 w-40 h-40 bg-violet-400/20 rounded-full blur-3xl" />
                                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-pink-400/20 rounded-full blur-3xl" />

                                <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6 sm:gap-8 text-center sm:text-left">
                                    <div className="w-16 h-16 shrink-0 bg-white/15 backdrop-blur-md border border-white/25 rounded-2xl flex items-center justify-center shadow-lg">
                                        <Gift size={30} className="text-amber-300" />
                                    </div>

                                    <div className="flex-1">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-400/20 border border-emerald-400/30 text-emerald-200 text-[10px] font-black uppercase tracking-widest rounded-full mb-3">
                                            <CheckCircle2 size={10} />
                                            {t('trial.no_card_badge', 'No card required')}
                                        </span>

                                        {trial?.active ? (
                                            <>
                                                <h3 className="text-2xl font-black text-white tracking-tight">
                                                    {t('trial.active_title', 'Your free trial is running')}
                                                </h3>
                                                <p className="text-violet-100/80 text-sm mt-1.5">
                                                    {t('trial.active_desc', '{{days}} days of Premium left. Buy a package any time to keep going.', { days: trial.daysRemaining })}
                                                </p>
                                            </>
                                        ) : (
                                            <>
                                                <h3 className="text-2xl font-black text-white tracking-tight">
                                                    {t('trial.banner_title', 'First {{days}} days completely free', { days: trialDays })}
                                                </h3>
                                                <p className="text-violet-100/80 text-sm mt-1.5">
                                                    {isAuthenticated
                                                        ? t('trial.banner_desc_eligible', 'Unlock every Premium feature for {{days}} more days. No card details, no charge.', { days: trial?.daysLeftToClaim ?? trialDays })
                                                        : t('trial.banner_desc_guest', 'Every new account gets full Premium access for {{days}} days. No card details, no charge.', { days: trialDays })}
                                                </p>
                                            </>
                                        )}
                                    </div>

                                    {!trial?.active && (
                                        <button
                                            onClick={handleTrialRequest}
                                            disabled={isUpgrading}
                                            className="w-full sm:w-auto shrink-0 px-8 py-4 bg-white text-slate-900 font-black rounded-2xl flex items-center justify-center gap-2 shadow-lg hover:scale-[1.03] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                                        >
                                            <Sparkles size={16} className="text-violet-600" />
                                            <span>
                                                {isAuthenticated
                                                    ? t('trial.activate_cta', 'Start My Free Trial')
                                                    : t('trial.guest_cta', 'Create Free Account')}
                                            </span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    <motion.div 
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={staggerContainer}
                        className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch"
                    >
                        <PricingCard
                            name={t('home.pricing_plan_basic', 'Basic')}
                            price="0"
                            description={t('home.pricing_basic_desc', 'Standard basic features for simple swaps')}
                            features={[
                                t('home.pricing_feature_2way', '2-Way Direct Matching Only'),
                                t('home.pricing_feature_pref3', 'Station Preferences (Up to 3)'),
                                t('home.pricing_feature_search', 'Search & Filter Vacancies'),
                                t('home.pricing_feature_verify', 'NIC Identity Verification'),
                                t('home.pricing_feature_view_only', 'View-Only (Cannot Send Requests)')
                            ]}
                            highlighted={false}
                            onAction={() => navigate(isAuthenticated ? '/dashboard' : '/register')}
                            actionLabel={t('home.pricing_start_free', 'Start for Free')}
                            periodLabel={t('home.pricing_forever', '/ forever')}
                        />
                        <PricingCard
                            name={t('home.pricing_plan_premium1', 'Premium (1 Month)')}
                            price="440"
                            description={t('home.pricing_premium1_desc', 'Best for quick direct & 3-way swaps')}
                            features={[
                                t('home.pricing_feature_dynamic', '2-Way & 3-Way Dynamic Matching'),
                                t('home.pricing_feature_unlimited', 'Unlimited Match Requests'),
                                t('home.pricing_feature_msg', 'Direct Messaging Option'),
                                t('home.pricing_feature_visibility', 'Full Profile & Contact Visibility'),
                                t('home.pricing_feature_no_ads', '100% Ad-Free Experience')
                            ]}
                            highlighted={true}
                            onAction={() => handleUpgradeRequest({name: t('home.pricing_plan_premium1', 'Premium (1 Month)'), price: "440", duration: 1})}
                            actionLabel={isUpgrading ? t('home.pricing_upgrading', 'Upgrading...') : (user?.packageName === 'PREMIUM' ? t('home.pricing_extend_1m', 'Extend 1 Month') : t('home.pricing_buy_1m', 'Buy 1 Month'))}
                            periodLabel={t('home.pricing_one_time', '/ one-time')}
                        />
                    </motion.div>
                </div>
            </ScrollAnimatedSection>

            {/* ─── FAQ Section with Sticky Scroll Cards ─── */}
            <StickyFaqSection
                badge={t('home.pricing_faq_badge', 'Help & FAQ')}
                title={t('home.pricing_faq_title', 'Frequently Asked Questions')}
                subtitle={t('home.pricing_faq_subtitle', 'Find quick answers to common questions about our plans, billing, and membership features.')}
                items={faqItems}
                bgImage={faqBg}
                supportLink="/contact#contact-form"
                supportTitle={t('contact_page.support_title', 'Still have questions?')}
                supportDesc={t('contact_page.support_desc', 'Our support team is always ready to guide you.')}
                supportActionLabel={t('contact_page.support_action', 'Send a Message')}
            />

            {/* ─── CTA Section ─── */}
            <ScrollAnimatedSection className="bg-white perspective-2000 overflow-hidden flex items-center justify-center py-24">
                <motion.div 
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
                >
                    <div className="glass-panel-strong rounded-[40px] p-12 sm:p-20 shadow-2xl shadow-blue-500/5">
                        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-10 tracking-tight">
                            {t('pricing_page.cta_title', 'Still have questions?')}
                        </h2>
                        <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
                            <Link 
                                to="/register" 
                                className="w-full sm:w-auto px-12 py-5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-2xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center group"
                            >
                                {t('pricing_page.cta_get_started', 'Get Started')}
                                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                            </Link>
                            <Link 
                                to="/contact" 
                                className="w-full sm:w-auto px-12 py-5 glass-panel text-slate-900 font-bold rounded-2xl hover:bg-slate-50 transition-all border border-slate-200"
                            >
                                {t('pricing_page.cta_contact_support', 'Contact Support')}
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </ScrollAnimatedSection>
        </div>
    );
};

export default PricingPage;
