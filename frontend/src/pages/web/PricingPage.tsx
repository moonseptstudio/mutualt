import { ArrowRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/client';
import toast from 'react-hot-toast';
import { useState, useRef } from 'react';
import PaymentModal from '../../components/modals/PaymentModal';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import PricingCard from '../../components/common/PricingCard';

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
    const { isAuthenticated, login, user } = useAuth();
    const navigate = useNavigate();
    const [isUpgrading, setIsUpgrading] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<{name: string, price: string, duration: number} | null>(null);

    const handleUpgradeRequest = (plan: {name: string, price: string, duration: number}) => {
        if (!isAuthenticated) {
            navigate('/register');
            return;
        }



        setSelectedPlan(plan);
        setShowPaymentModal(true);
    };

    const handlePaymentSuccess = async () => {
        if (!selectedPlan) return;
        setShowPaymentModal(false);
        await performUpgrade(selectedPlan.duration);
    };

    const performUpgrade = async (durationMonths: number) => {
        try {
            setIsUpgrading(true);
            await apiClient.post('/packages/buy', { duration: durationMonths });
            
            if (user) {
                login({ ...user, packageName: 'PREMIUM' });
            }
            
            toast.success("Welcome to Premium! All features unlocked.", { icon: '💎' });
            navigate('/dashboard');
        } catch (err: any) {
            console.error("Upgrade failed", err);
            toast.error(err.response?.data?.message || "Failed to upgrade. Please try again.");
        } finally {
            setIsUpgrading(false);
        }
    };

    const pricingRef = useRef<HTMLDivElement>(null);
    useScroll({ target: pricingRef, offset: ["start start", "end start"] });

    return (
        <div className="relative">
            <PaymentModal 
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                onPaymentSuccess={handlePaymentSuccess}
                packageName={selectedPlan?.name || "Premium"}
                price={selectedPlan?.price || "0"}
            />

            {/* Pricing Cards Section */}
            <section ref={pricingRef} className="relative mesh-gradient-bg overflow-hidden flex flex-col justify-center min-h-screen pt-24 pb-24">
                <FloatingShapes />
                <motion.div 
                  
                  className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10"
                >
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <motion.div variants={fadeInUp} className="inline-block px-4 py-1.5 bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider rounded-full mb-6 mx-auto text-center">
                            Pricing
                        </motion.div>
                        <motion.h1 variants={fadeInUp} className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
                            Simple Pricing, <span className="shimmer-text">No Hidden Fees.</span>
                        </motion.h1>
                        <motion.p variants={fadeInUp} className="text-xl text-slate-600 leading-relaxed font-sans">
                            Choose the package that helps you reach your preferred station faster.
                        </motion.p>
                    </div>

                    <motion.div 
                        variants={staggerContainer}
                        className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto"
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
                </motion.div>
            </section>

            {/* FAQ Section */}
            <ScrollAnimatedSection className="bg-white perspective-2000 overflow-hidden flex items-center py-24">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div 
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={staggerContainer}
                        className="p-12 sm:p-20 glass-panel-strong rounded-[40px] border border-slate-100 text-center shadow-2xl shadow-blue-500/5"
                    >
                        <motion.h3 variants={fadeInUp} className="text-2xl sm:text-3xl font-bold text-slate-900 mb-12 tracking-tight">Frequently Asked Questions</motion.h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-left">
                            <motion.div variants={fadeInUp} className="group">
                                <h4 className="font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">Can I upgrade later?</h4>
                                <p className="text-sm text-slate-600 font-sans leading-relaxed">Yes, you can upgrade from Basic to Premium at any time from your dashboard settings.</p>
                            </motion.div>
                            <motion.div variants={fadeInUp} className="group">
                                <h4 className="font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">What happens after the duration ends?</h4>
                                <p className="text-sm text-slate-600 font-sans leading-relaxed">Your account will automatically revert to the Basic (Free) plan. You can renew your premium access at any time.</p>
                            </motion.div>
                            <motion.div variants={fadeInUp} className="group">
                                <h4 className="font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">Is there a recurring charge?</h4>
                                <p className="text-sm text-slate-600 font-sans leading-relaxed">No, these are one-time payments for the specified duration. We do not store your card for recurring billing.</p>
                            </motion.div>
                            <motion.div variants={fadeInUp} className="group">
                                <h4 className="font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">How long is the listing active?</h4>
                                <p className="text-sm text-slate-600 font-sans leading-relaxed">Your profile stays active until you successfully find a match or manually disable it.</p>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </ScrollAnimatedSection>

            {/* CTA Section */}
            <ScrollAnimatedSection className="mesh-gradient-bg flex items-center justify-center py-24">
                <FloatingShapes />
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="text-center relative z-10"
                >
                    <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-10 tracking-tight">Still have questions?</h2>
                    <Link 
                        to="/register" 
                        className="inline-flex items-center px-10 py-4.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-2xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-1 transition-all duration-300 group"
                    >
                        Contact Support
                        <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                    </Link>
                </motion.div>
            </ScrollAnimatedSection>
        </div>
    );
};

export default PricingPage;
