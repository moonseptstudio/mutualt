import { Check, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/client';
import toast from 'react-hot-toast';
import { useState } from 'react';
import PaymentModal from '../../components/modals/PaymentModal';
import { motion, useScroll, useTransform } from 'framer-motion';

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
        <motion.div style={{ y: y2 }} className="absolute top-1/2 -right-20 w-80 h-80 rounded-full bg-violet-100/30 blur-3xl" />
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

const PricingCard = ({ name, price, description, features, highlighted, onAction, actionLabel }: any) => {
  return (
    <motion.div 
      variants={fadeInUp}
      whileHover={{ scale: highlighted ? 1.05 : 1.02, y: -5 }}
      className={`relative p-8 rounded-3xl border transition-all duration-500 glass-panel-hover ${highlighted
            ? 'bg-blue-600 dark:bg-slate-900 text-white border-blue-600 dark:border-slate-800 shadow-2xl z-10'
            : 'bg-white dark:bg-slate-800/40 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-700 shadow-sm'
        }`}
    >
        {highlighted && (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-linear-to-r from-blue-400 to-violet-400 text-white text-xs font-bold rounded-full shadow-lg">
                    <Sparkles size={12} /> Most Popular
                </span>
            </div>
        )}
        <h3 className="text-xl font-bold mb-2">{name}</h3>
        <p className={`text-sm mb-6 ${highlighted ? 'text-blue-100/80' : 'text-slate-500'}`}>{description}</p>
        <div className="flex items-baseline mb-8">
            <span className="text-4xl font-bold tracking-tight">Rs. {price}</span>
            <span className={`text-sm ml-2 ${highlighted ? 'text-blue-100/60' : 'text-slate-500'}`}>{price === "0" ? "/ forever" : "/ one-time"}</span>
        </div>
        <ul className="space-y-4 mb-10">
            {features.map((feature: any, idx: number) => (
                <li key={idx} className="flex items-center space-x-3 text-sm font-medium">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${highlighted ? 'bg-white/20' : 'bg-blue-50'}`}>
                        <Check size={12} className={highlighted ? 'text-white' : 'text-blue-600'} />
                    </div>
                    <span>{feature}</span>
                </li>
            ))}
        </ul>
        <button
            onClick={onAction}
            className={`w-full text-center py-4 rounded-2xl font-bold transition-all cursor-pointer ${highlighted
                    ? 'bg-white text-blue-600 hover:bg-blue-50 shadow-xl'
                    : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                }`}
        >
            {actionLabel}
        </button>
    </motion.div>
  );
};

import { useRef } from 'react';

const PricingPage = () => {
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
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto"
                    >
                        <PricingCard
                            name="Basic"
                            price="0"
                            description="Standard basic features for simple swaps"
                            features={[
                                "2-Way Direct Matching Only",
                                "View-Only (Cannot Send Requests)",
                                "Hidden Contact Details",
                                "NIC Identity Verification",
                                "Station Preferences (Up to 3)",
                                "Search & Filter Vacancies",
                                "Dashboard Access (with Ads)"
                            ]}
                            highlighted={false}
                            onAction={() => navigate('/register')}
                            actionLabel="Start for Free"
                        />
                        <PricingCard
                            name="Premium (1 Month)"
                            price="440"
                            description="Best for quick direct & 3-way swaps"
                            features={[
                                "Direct Messaging Option",
                                "Unlimited Match Requests",
                                "2-Way & 3-Way Dynamic Matching",
                                "Full Profile Visibility",
                                "Station Preferences (Up to 3)",
                                "Advanced Search & Filters",
                                "No Advertisements (Ad-Free)",
                                "Premium Customer Support"
                            ]}
                            highlighted={false}
                            onAction={() => handleUpgradeRequest({name: "Premium (1 Month)", price: "440", duration: 1})}
                            actionLabel={isUpgrading ? "Upgrading..." : (user?.packageName === 'PREMIUM' ? "Extend 1 Month" : "Buy 1 Month")}
                        />
                        <PricingCard
                            name="Premium (2 Months)"
                            price="690"
                            description="Save more with 2 months access"
                            features={[
                                "Direct Messaging Option",
                                "Unlimited Match Requests",
                                "2-Way & 3-Way Dynamic Matching",
                                "Full Profile Visibility",
                                "Station Preferences (Up to 3)",
                                "Advanced Search & Filters",
                                "No Advertisements (Ad-Free)",
                                "Premium Customer Support"
                            ]}
                            highlighted={false}
                            onAction={() => handleUpgradeRequest({name: "Premium (2 Months)", price: "690", duration: 2})}
                            actionLabel={isUpgrading ? "Upgrading..." : (user?.packageName === 'PREMIUM' ? "Extend 2 Months" : "Buy 2 Months")}
                        />
                        <PricingCard
                            name="Premium (3 Months)"
                            price="990"
                            description="Maximum value for long-term search"
                            features={[
                                "Direct Messaging Option",
                                "Unlimited Match Requests",
                                "2-Way & 3-Way Dynamic Matching",
                                "Full Profile Visibility",
                                "Station Preferences (Up to 3)",
                                "Advanced Search & Filters",
                                "No Advertisements (Ad-Free)",
                                "Premium Customer Support"
                            ]}
                            highlighted={true}
                            onAction={() => handleUpgradeRequest({name: "Premium (3 Months)", price: "990", duration: 3})}
                            actionLabel={isUpgrading ? "Upgrading..." : (user?.packageName === 'PREMIUM' ? "Extend 3 Months" : "Buy 3 Months")}
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
                        className="inline-flex items-center px-10 py-4.5 bg-linear-to-r from-blue-500 to-violet-500 text-white font-bold rounded-2xl shadow-2xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-1 transition-all duration-300 group"
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
