import { ShieldCheck, Target, Users, Heart, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
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

const ValueCard = ({ icon: Icon, title, description }: any) => {
  return (
    <motion.div 
      variants={fadeInUp}
      whileHover={{ y: -5, scale: 1.02 }}
      className="flex flex-col items-center text-center p-8 bg-white rounded-3xl border border-slate-100 shadow-sm glass-panel-hover transition-all duration-300"
    >
        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 shadow-xs">
            <Icon size={32} className="text-blue-600" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-4">{title}</h3>
        <p className="text-slate-600 text-sm leading-relaxed font-sans">{description}</p>
    </motion.div>
  );
};

const AboutPage = () => {
    return (
        <div className="relative">
            {/* Hero Section */}
            <section className="snap-section relative mesh-gradient-bg overflow-hidden flex items-center justify-center pt-20">
                <FloatingShapes />
                <motion.div 
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={staggerContainer}
                  className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10"
                >
                    <motion.div variants={fadeInUp} className="inline-block px-4 py-1.5 bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider rounded-full mb-6">
                        About Us
                    </motion.div>
                    <motion.h1 variants={fadeInUp} className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-8 tracking-tight">
                        Our Mission to <span className="shimmer-text">Simplify Moves.</span>
                    </motion.h1>
                    <motion.p variants={fadeInUp} className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-sans">
                        Reducing the administrative burden for over 1.5 million government employees in Sri Lanka through technology-driven mutual matching.
                    </motion.p>
                </motion.div>
            </section>

            {/* Content Section */}
            <section className="snap-section bg-white perspective-2000 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                          initial="hidden"
                          whileInView="visible"
                          viewport={{ once: true, margin: "-100px" }}
                          variants={staggerContainer}
                        >
                            <motion.h2 variants={fadeInUp} className="text-3xl font-bold text-slate-900 mb-8 tracking-tight">Why We Built This</motion.h2>
                            <div className="space-y-6 text-slate-600 leading-relaxed font-sans">
                                <motion.p variants={fadeInUp}>
                                    As government employees, finding a mutual transfer can often take years of searching through social media groups, manual advertisements, and personal networks.
                                </motion.p>
                                <motion.p variants={fadeInUp}>
                                    MutualTransfer.lk was born out of a desire to simplify this process. We believe that every teacher, nurse, and doctor should be able to serve where they feel most productive and supported by their families.
                                </motion.p>
                                <motion.p variants={fadeInUp}>
                                    Our platform uses advanced graph algorithms to find not just direct 1-to-1 matches, but complex circular chains that would be impossible to discover manually.
                                </motion.p>
                            </div>
                        </motion.div>
                        <motion.div 
                          initial="hidden"
                          whileInView="visible"
                          viewport={{ once: true, margin: "-100px" }}
                          variants={staggerContainer}
                          className="grid grid-cols-2 gap-4 perspective-2000"
                        >
                            <motion.div 
                                variants={fadeInUp}
                                whileHover={{ rotateY: -10, rotateX: 5, scale: 1.05 }}
                                className="bg-blue-600 rounded-3xl h-64 flex items-end p-8 text-white overflow-hidden relative shadow-2xl shadow-blue-500/20"
                            >
                                <span className="text-6xl font-black opacity-10 absolute top-0 -left-4">01</span>
                                <p className="font-bold relative z-10 text-lg">Efficient Matching</p>
                            </motion.div>
                            <motion.div 
                                variants={fadeInUp}
                                whileHover={{ rotateY: 10, rotateX: 5, scale: 1.05 }}
                                className="bg-slate-50 rounded-3xl h-64 flex items-end p-8 text-slate-900 overflow-hidden relative border border-slate-100 shadow-xl"
                            >
                                <span className="text-6xl font-black opacity-5 absolute top-0 -left-4">02</span>
                                <p className="font-bold relative z-10 text-lg">Transparent Process</p>
                            </motion.div>
                            <motion.div 
                                variants={fadeInUp}
                                whileHover={{ rotateX: -10, scale: 1.02 }}
                                className="bg-slate-900 rounded-3xl h-64 flex items-end p-8 text-white overflow-hidden relative col-span-2 shadow-2xl"
                            >
                                <span className="text-6xl font-black opacity-10 absolute top-0 -left-6">03</span>
                                <p className="font-bold relative z-10 text-2xl">Government-Wide Network</p>
                                <div className="absolute top-8 right-8 w-16 h-16 bg-blue-500/20 rounded-full blur-xl animate-pulse" />
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="snap-section mesh-gradient-bg relative perspective-2000 overflow-hidden">
                <FloatingShapes />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <motion.div 
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true, margin: "-100px" }}
                      variants={staggerContainer}
                      className="text-center mb-20"
                    >
                        <motion.span variants={fadeInUp} className="inline-block text-xs font-bold uppercase tracking-widest text-blue-500 mb-4">Values</motion.span>
                        <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 tracking-tight">Our Core Values</motion.h2>
                        <motion.p variants={fadeInUp} className="text-slate-600 font-sans max-w-xl mx-auto">The principles that guide our platform development and community support.</motion.p>
                    </motion.div>
                    <motion.div 
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true, margin: "-100px" }}
                      variants={staggerContainer}
                      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
                    >
                        <ValueCard
                            icon={ShieldCheck}
                            title="Integrity"
                            description="Ensuring all profiles are verified and transparent."
                        />
                        <ValueCard
                            icon={Target}
                            title="Precision"
                            description="Developing highly accurate matching algorithms."
                        />
                        <ValueCard
                            icon={Users}
                            title="Community"
                            description="Built by government employees, for government employees."
                        />
                        <ValueCard
                            icon={Heart}
                            title="Impact"
                            description="Improving work-life balance for public service professionals."
                        />
                    </motion.div>
                </div>
            </section>

            {/* CTA */}
            <section className="snap-section bg-white perspective-2000 overflow-hidden flex items-center justify-center">
                <motion.div 
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                  className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
                >
                    <div className="glass-panel-strong rounded-[40px] p-12 sm:p-20 shadow-2xl shadow-blue-500/5">
                        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-10 tracking-tight">Ready to find your match?</h2>
                        <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
                            <Link 
                                to="/register" 
                                className="w-full sm:w-auto px-12 py-5 bg-linear-to-r from-blue-500 to-violet-500 text-white font-bold rounded-2xl shadow-2xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center group"
                            >
                                Get Started
                                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                            </Link>
                            <Link 
                                to="/pricing" 
                                className="w-full sm:w-auto px-12 py-5 glass-panel text-slate-900 font-bold rounded-2xl hover:bg-slate-50 transition-all border border-slate-200"
                            >
                                View Pricing
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </section>
        </div>
    );
};

export default AboutPage;
