import { ShieldCheck, Target, Users, Heart, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import whyUsImg1 from '../../assets/aboutUs/image01.webp';
import whyUsImg2 from '../../assets/aboutUs/image02.webp';
import whyUsImg3 from '../../assets/aboutUs/image03.webp';

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

const ValueCard = ({ icon: Icon, title, description, stampNumber }: any) => {
  return (
    <motion.div 
      variants={fadeInUp}
      whileHover={{ y: -10, scale: 1.02 }}
      className="group relative flex flex-col h-full cursor-pointer"
    >
      {/* Envelope Outer Shell */}
      <div className="relative flex flex-col justify-between h-full bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/90 shadow-lg shadow-blue-900/5 group-hover:shadow-2xl group-hover:shadow-blue-500/15 group-hover:border-blue-400/50 transition-all duration-500 overflow-hidden">
        
        {/* Top Airmail / Administrative Accent Line */}
        <div className="h-1.5 w-full bg-linear-to-r from-blue-600 via-sky-400 to-blue-600 opacity-90 group-hover:opacity-100 transition-opacity" />

        {/* Envelope Flap Header with Triangle Fold */}
        <div className="relative bg-slate-50/90 pt-5 pb-7 px-6 border-b border-slate-100 flex justify-center">
          {/* Circular Wax Seal / Stamp with Icon (Centered) */}
          <div className="relative z-10 w-12 h-12 rounded-2xl bg-linear-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 ring-4 ring-white">
            <Icon size={22} className="drop-shadow-xs" />
          </div>

          {/* Envelope Flap Triangle V-point */}
          <svg 
            className="absolute left-0 right-0 -bottom-3.5 w-full h-3.5 text-slate-50/90 drop-shadow-[0_2px_2px_rgba(0,0,0,0.03)]" 
            viewBox="0 0 100 20" 
            preserveAspectRatio="none"
          >
            <polygon points="0,0 50,20 100,0" fill="currentColor" />
            <polyline points="0,0 50,20 100,0" fill="none" stroke="#e2e8f0" strokeWidth="1" />
          </svg>
        </div>

        {/* Letter / Paper Body */}
        <div className="p-6 sm:p-7 pt-7 flex-1 flex flex-col justify-between text-center relative z-10">
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-2.5 group-hover:text-blue-600 transition-colors">
              {title}
            </h3>
            
            <p className="text-slate-600 text-sm leading-relaxed font-sans">
              {description}
            </p>
          </div>

          {/* Bottom Postal / Verification Footer */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-slate-400 text-xs">
            <span className="font-mono text-[11px] font-bold tracking-wider text-blue-600 uppercase">
              Core Value 0{stampNumber}
            </span>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 group-hover:bg-emerald-500 transition-colors" />
              <span className="text-[10px] font-mono text-slate-400 group-hover:text-slate-600 transition-colors">Verified</span>
            </div>
          </div>
        </div>

        {/* Subtle Diagonal Fold Watermark Lines at Bottom (Envelope Creases) */}
        <div className="absolute inset-x-0 bottom-0 h-12 pointer-events-none opacity-25 overflow-hidden">
          <div className="absolute -left-12 -bottom-10 w-44 h-24 border-t border-r border-slate-300 rotate-12" />
          <div className="absolute -right-12 -bottom-10 w-44 h-24 border-t border-l border-slate-300 -rotate-12" />
        </div>
      </div>
    </motion.div>
  );
};

const AboutPage = () => {
    const heroRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
    const heroY = useTransform(heroScroll, [0, 1], [0, 150]);
    const heroScale = useTransform(heroScroll, [0, 1], [1, 0.9]);
    const heroOpacity = useTransform(heroScroll, [0, 0.8], [1, 0]);

    return (
        <div className="relative">
            {/* Hero Section */}
            <section ref={heroRef} className="relative mesh-gradient-bg overflow-hidden flex flex-col justify-center min-h-screen pt-24">
                <FloatingShapes />
                <motion.div 
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={staggerContainer}
                  style={{ y: heroY, scale: heroScale, opacity: heroOpacity }}
                  className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10"
                >
                    <motion.div variants={fadeInUp} className="inline-block px-4 py-1.5 bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider rounded-full mb-6 text-center mx-auto">
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
            <ScrollAnimatedSection className="bg-white perspective-2000 overflow-hidden py-24">
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
                                whileHover={{ rotateY: -10, rotateX: 5, scale: 1.03 }}
                                className="bg-slate-900 rounded-3xl h-64 flex items-end p-8 text-white overflow-hidden relative shadow-2xl shadow-blue-500/20 group cursor-pointer border border-white/10"
                            >
                                <img 
                                    src={whyUsImg1} 
                                    alt="Efficient Matching" 
                                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" 
                                />
                                <div className="absolute inset-0 bg-linear-to-t from-slate-950/90 via-slate-900/40 to-transparent pointer-events-none" />
                                <span className="text-6xl font-black opacity-30 absolute top-2 left-4 text-white pointer-events-none">01</span>
                                <p className="font-bold relative z-10 text-lg text-white drop-shadow-sm">Efficient Matching</p>
                            </motion.div>
                            <motion.div 
                                variants={fadeInUp}
                                whileHover={{ rotateY: 10, rotateX: 5, scale: 1.03 }}
                                className="bg-slate-900 rounded-3xl h-64 flex items-end p-8 text-white overflow-hidden relative shadow-xl shadow-slate-900/10 group cursor-pointer border border-white/10"
                            >
                                <img 
                                    src={whyUsImg2} 
                                    alt="Transparent Process" 
                                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" 
                                />
                                <div className="absolute inset-0 bg-linear-to-t from-slate-950/90 via-slate-900/40 to-transparent pointer-events-none" />
                                <span className="text-6xl font-black opacity-30 absolute top-2 left-4 text-white pointer-events-none">02</span>
                                <p className="font-bold relative z-10 text-lg text-white drop-shadow-sm">Transparent Process</p>
                            </motion.div>
                            <motion.div 
                                variants={fadeInUp}
                                whileHover={{ rotateX: -6, scale: 1.02 }}
                                className="bg-slate-900 rounded-3xl h-64 flex items-end p-8 text-white overflow-hidden relative col-span-2 shadow-2xl group cursor-pointer border border-white/10"
                            >
                                <img 
                                    src={whyUsImg3} 
                                    alt="Government-Wide Network" 
                                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
                                />
                                <div className="absolute inset-0 bg-linear-to-t from-slate-950/90 via-slate-900/40 to-transparent pointer-events-none" />
                                <span className="text-6xl font-black opacity-30 absolute top-2 left-4 text-white pointer-events-none">03</span>
                                <p className="font-bold relative z-10 text-2xl text-white drop-shadow-sm">Government-Wide Network</p>
                                <div className="absolute top-6 right-6 w-16 h-16 bg-blue-500/20 rounded-full blur-xl animate-pulse pointer-events-none" />
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </ScrollAnimatedSection>

            {/* Values */}
            <ScrollAnimatedSection className="mesh-gradient-bg relative perspective-2000 overflow-hidden py-24">
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
                            stampNumber="1"
                        />
                        <ValueCard
                            icon={Target}
                            title="Precision"
                            description="Developing highly accurate matching algorithms."
                            stampNumber="2"
                        />
                        <ValueCard
                            icon={Users}
                            title="Community"
                            description="Built by government employees, for government employees."
                            stampNumber="3"
                        />
                        <ValueCard
                            icon={Heart}
                            title="Impact"
                            description="Improving work-life balance for public service professionals."
                            stampNumber="4"
                        />
                    </motion.div>
                </div>
            </ScrollAnimatedSection>

            {/* CTA */}
            <ScrollAnimatedSection className="bg-white perspective-2000 overflow-hidden flex items-center justify-center py-24">
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
                                className="w-full sm:w-auto px-12 py-5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-2xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center group"
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
            </ScrollAnimatedSection>
        </div>
    );
};

export default AboutPage;
