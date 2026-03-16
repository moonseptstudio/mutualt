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

const PricingPage = () => {
    const { isAuthenticated, login, user } = useAuth();
    const navigate = useNavigate();
    const [isUpgrading, setIsUpgrading] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    const handleUpgradeRequest = () => {
        if (!isAuthenticated) {
            navigate('/register');
            return;
        }

        if (user?.packageName === 'PREMIUM') {
            toast.success("You are already on the Premium plan!");
            navigate('/dashboard');
            return;
        }

        setShowPaymentModal(true);
    };

    const handlePaymentSuccess = async () => {
        setShowPaymentModal(false);
        await performUpgrade();
    };

    const performUpgrade = async () => {
        try {
            setIsUpgrading(true);
            await apiClient.post('/packages/buy');
            
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

    return (
        <div className="relative">
            <PaymentModal 
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                onPaymentSuccess={handlePaymentSuccess}
                packageName="Premium"
                price="1,500"
            />

            {/* Pricing Cards Section */}
            <section className="snap-section relative mesh-gradient-bg overflow-hidden flex items-center pt-20">
                <FloatingShapes />
                <motion.div 
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={staggerContainer}
                  className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10"
                >
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <motion.div variants={fadeInUp} className="inline-block px-4 py-1.5 bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider rounded-full mb-6">
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
                            name="Basic"
                            price="0"
                            description="Perfect for finding a partner in the same hospital or direct swap."
                            features={[
                                "2-Way Direct Matching",
                                "NIC Identity Verification",
                                "Station Preference (Up to 3)",
                                "Search & Filter Vacancies",
                                "Dashboard Access (with Ads)"
                            ]}
                            highlighted={false}
                            onAction={() => !isAuthenticated ? navigate('/register') : navigate('/dashboard')}
                            actionLabel={!isAuthenticated ? "Start for Free" : "Current Plan"}
                        />
                        <PricingCard
                            name="Premium"
                            price="1,500"
                            description="Our most popular plan for complex circular transfers."
                            features={[
                                "2-Way & 3-Way Dynamic Matching",
                                "Unlimited Station Preferences",
                                "Priority Status in Search",
                                "No Advertisements",
                                "Dashboard Match History",
                                "Priority Customer Support"
                            ]}
                            highlighted={true}
                            onAction={handleUpgradeRequest}
                            actionLabel={isUpgrading ? "Upgrading..." : (user?.packageName === 'PREMIUM' ? "Plan Active" : (isAuthenticated ? "Upgrade to Premium" : "Get Started"))}
                        />
                    </motion.div>
                </motion.div>
            </section>

            {/* FAQ Section */}
            <section className="snap-section bg-white perspective-2000 overflow-hidden flex items-center">
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
                                <h4 className="font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">What happens after 1,500 LKR?</h4>
                                <p className="text-sm text-slate-600 font-sans leading-relaxed">Premium is a one-time fee. There are no monthly subscriptions or recurring charges.</p>
                            </motion.div>
                            <motion.div variants={fadeInUp} className="group">
                                <h4 className="font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">Is my NIC data safe?</h4>
                                <p className="text-sm text-slate-600 font-sans leading-relaxed">All data is encrypted and only used for verifying your eligibility as a government employee.</p>
                            </motion.div>
                            <motion.div variants={fadeInUp} className="group">
                                <h4 className="font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">How long is the listing active?</h4>
                                <p className="text-sm text-slate-600 font-sans leading-relaxed">Your profile stays active until you successfully find a match or manually disable it.</p>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="snap-section mesh-gradient-bg flex items-center justify-center">
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
            </section>
        </div>
    );
};

export default PricingPage;
