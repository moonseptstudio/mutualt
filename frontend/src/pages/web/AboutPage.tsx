import { ShieldCheck, Target, Users, Heart, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import WhyUsCardSwitcher from '../../components/about/WhyUsCardSwitcher';
import NetworkMeshBackground from '../../components/hero/NetworkMeshBackground';
import SEO from '../../components/SEO';
import { breadcrumbSchema } from '../../config/seo';

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

/* ─── Core Values Hook ─── */
const useCoreValues = () => {
  const { t } = useTranslation();
  return [
    {
      icon: ShieldCheck,
      title: t('about_page.val1_title', 'Integrity'),
      description: t('about_page.val1_desc', 'Ensuring all profiles are verified and transparent.'),
      stampNumber: "1"
    },
    {
      icon: Target,
      title: t('about_page.val2_title', 'Precision'),
      description: t('about_page.val2_desc', 'Developing highly accurate matching algorithms.'),
      stampNumber: "2"
    },
    {
      icon: Users,
      title: t('about_page.val3_title', 'Community'),
      description: t('about_page.val3_desc', 'Built by government employees, for government employees.'),
      stampNumber: "3"
    },
    {
      icon: Heart,
      title: t('about_page.val4_title', 'Impact'),
      description: t('about_page.val4_desc', 'Improving work-life balance for public service professionals.'),
      stampNumber: "4"
    }
  ];
};

const ValueCard = ({ icon: Icon, title, description, stampNumber }: any) => {
  const { t } = useTranslation();
  return (
    <div 
      style={{ width: '270px', height: '295px' }}
      className="shrink-0 select-none"
    >
      <motion.div 
        whileHover={{ y: -6, scale: 1.02 }}
        transition={{ duration: 0.25 }}
        className="group relative flex flex-col h-full cursor-pointer"
      >
        {/* Envelope Outer Shell */}
        <div className="relative flex flex-col justify-between h-full bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-md shadow-blue-900/5 group-hover:shadow-xl group-hover:shadow-blue-500/15 group-hover:border-blue-400/50 transition-all duration-300 overflow-hidden">
          
          {/* Top Airmail / Administrative Accent Line */}
          <div className="h-1.5 w-full bg-linear-to-r from-blue-600 via-sky-400 to-blue-600 opacity-90 group-hover:opacity-100 transition-opacity" />

          {/* Envelope Flap Header with Triangle Fold */}
          <div className="relative bg-slate-50/90 pt-4 pb-5 px-5 border-b border-slate-100 flex justify-center">
            {/* Circular Wax Seal / Stamp with Icon (Centered) */}
            <div className="relative z-10 w-10 h-10 rounded-xl bg-linear-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center shadow-md shadow-blue-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 ring-3 ring-white">
              <Icon size={19} className="drop-shadow-xs" />
            </div>

            {/* Envelope Flap Triangle V-point */}
            <svg 
              className="absolute left-0 right-0 -bottom-3 w-full h-3 text-slate-50/90 drop-shadow-[0_2px_2px_rgba(0,0,0,0.03)]" 
              viewBox="0 0 100 20" 
              preserveAspectRatio="none"
            >
              <polygon points="0,0 50,20 100,0" fill="currentColor" />
              <polyline points="0,0 50,20 100,0" fill="none" stroke="#e2e8f0" strokeWidth="1" />
            </svg>
          </div>

          {/* Letter / Paper Body */}
          <div className="p-4 sm:p-5 pt-4 flex-1 flex flex-col justify-between text-center relative z-10">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1.5 group-hover:text-blue-600 transition-colors">
                {title}
              </h3>
              
              <p className="text-slate-600 text-xs sm:text-[13px] leading-relaxed font-sans">
                {description}
              </p>
            </div>

            {/* Bottom Postal / Verification Footer */}
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-slate-400 text-[10px]">
              <span className="font-mono text-[10px] font-bold tracking-wider text-blue-600 uppercase">
                {t('about_page.core_value_label', 'Core Value')} 0{stampNumber}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 group-hover:bg-emerald-500 transition-colors" />
                <span className="text-[10px] font-mono text-slate-400 group-hover:text-slate-600 transition-colors">
                  {t('about_page.verified', 'Verified')}
                </span>
              </div>
            </div>
          </div>

          {/* Subtle Diagonal Fold Watermark Lines at Bottom (Envelope Creases) */}
          <div className="absolute inset-x-0 bottom-0 h-10 pointer-events-none opacity-20 overflow-hidden">
            <div className="absolute -left-10 -bottom-8 w-36 h-20 border-t border-r border-slate-300 rotate-12" />
            <div className="absolute -right-10 -bottom-8 w-36 h-20 border-t border-l border-slate-300 -rotate-12" />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const MobileHorizontalTrack = ({
  scrollYProgress,
  coreValues,
}: {
  scrollYProgress: any;
  coreValues: any[];
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [scrollDistance, setScrollDistance] = useState(0);

  useEffect(() => {
    const updateDistance = () => {
      if (trackRef.current) {
        const totalTrackWidth = trackRef.current.scrollWidth;
        const viewportWidth = window.innerWidth;
        const dist = Math.max(0, totalTrackWidth - viewportWidth + 32);
        setScrollDistance(dist);
      }
    };

    updateDistance();
    window.addEventListener('resize', updateDistance);
    return () => window.removeEventListener('resize', updateDistance);
  }, []);

  const x = useTransform(scrollYProgress, (progress: number) => {
    const clamped = Math.min(0.92, Math.max(0.08, progress));
    const normalized = (clamped - 0.08) / (0.92 - 0.08);
    return -normalized * scrollDistance;
  });

  return (
    <div className="w-full overflow-hidden py-3">
      <motion.div
        ref={trackRef}
        style={{ x }}
        className="flex gap-5 px-6 w-max will-change-transform"
      >
        {coreValues.map((val) => (
          <ValueCard
            key={val.stampNumber}
            icon={val.icon}
            title={val.title}
            description={val.description}
            stampNumber={val.stampNumber}
          />
        ))}
      </motion.div>
    </div>
  );
};

const DesktopStickyCard = ({
  card,
  index,
  scrollYProgress,
  windowWidth,
}: {
  card: any;
  index: number;
  scrollYProgress: any;
  windowWidth: number;
}) => {
  // Desktop sequential pacing:
  // Card 0 starts immediately upon scroll: [0.00, 0.15]
  // Card 1: [0.18, 0.35]
  // Card 2: [0.38, 0.55]
  // Card 3: [0.58, 0.75]
  // [0.75, 1.00] -> all 4 cards docked in view with 24px gap before vertical scrolling resumes
  const startP = index === 0 ? 0.00 : 0.18 + (index - 1) * 0.20;
  const endP = index === 0 ? 0.15 : startP + 0.17;

  // Exact card slot in centered row:
  const cardWidth = 270;
  const gap = 24;
  const totalRowWidth = 4 * cardWidth + 3 * gap; // 1152px
  const rowLeft = Math.max(0, (windowWidth - totalRowWidth) / 2);
  const cardLeft = rowLeft + index * (cardWidth + gap);

  // Exact offset so the card starts safely past the right edge of viewport:
  const offsetX = Math.max(400, (windowWidth - cardLeft) + 60);

  const x = useTransform(scrollYProgress, (progress: number) => {
    if (progress <= startP) return offsetX;
    if (progress >= endP) return 0;
    const t = (progress - startP) / (endP - startP);
    // Sine Ease-Out: immediate movement upon scroll with gentle, soft landing
    const ease = Math.sin((t * Math.PI) / 2);
    return (1 - ease) * offsetX;
  });

  const opacity = useTransform(scrollYProgress, (progress: number) => {
    if (progress <= startP) return 0;
    if (progress >= startP + 0.03) return 1;
    return (progress - startP) / 0.03;
  });

  return (
    <motion.div
      style={{ x, opacity }}
      className="shrink-0 will-change-transform"
    >
      <ValueCard
        icon={card.icon}
        title={card.title}
        description={card.description}
        stampNumber={card.stampNumber}
      />
    </motion.div>
  );
};

const CoreValuesSection = () => {
  const { t } = useTranslation();
  const coreValues = useCoreValues();
  const targetRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [windowWidth, setWindowWidth] = useState(() => 
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"]
  });

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useMotionValueEvent(scrollYProgress, "change", (progress: number) => {
    if (progress < 0.18) {
      setActiveIdx(0);
    } else if (progress < 0.38) {
      setActiveIdx(1);
    } else if (progress < 0.58) {
      setActiveIdx(2);
    } else {
      setActiveIdx(3);
    }
  });

  const isDesktop = windowWidth >= 1024;

  return (
    <section ref={targetRef} className="relative h-[300vh] lg:h-[500vh]">
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-center mesh-gradient-bg py-8">
        <FloatingShapes />
        
        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="max-w-7xl mx-auto text-center mb-8 sm:mb-10">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-blue-500 mb-3">
              {t('about_page.values_badge', 'Values')}
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3 tracking-tight">
              {t('about_page.values_title', 'Our Core Values')}
            </h2>
            <p className="text-slate-600 font-sans max-w-xl mx-auto text-sm sm:text-base">
              {t('about_page.values_subtitle', 'The principles that guide our platform development and community support.')}
            </p>
          </div>

          {/* Cards Track: Mobile Horizontal Track vs Desktop Sequential Sticky Cards */}
          {isDesktop ? (
            <div className="w-full flex justify-center overflow-hidden py-3">
              <div className="flex items-center gap-6 will-change-transform">
                {coreValues.map((card, idx) => (
                  <DesktopStickyCard
                    key={card.stampNumber}
                    card={card}
                    index={idx}
                    scrollYProgress={scrollYProgress}
                    windowWidth={windowWidth}
                  />
                ))}
              </div>
            </div>
          ) : (
            <MobileHorizontalTrack scrollYProgress={scrollYProgress} coreValues={coreValues} />
          )}

          {/* Sequential Dot Indicator */}
          <div className="flex items-center justify-center gap-2 mt-6">
            {coreValues.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  activeIdx === i ? 'w-6 bg-blue-600' : 'w-1.5 bg-slate-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const AboutPage = () => {
    const { t } = useTranslation();
    const heroRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
    const heroY = useTransform(heroScroll, [0, 1], [0, 150]);
    const heroScale = useTransform(heroScroll, [0, 1], [1, 0.9]);
    const heroOpacity = useTransform(heroScroll, [0, 0.8], [1, 0]);

    return (
        <div className="relative">
            <SEO
                title="About Us"
                description="Learn why MutualTransfer.lk was built: a secure, verified platform helping Sri Lankan government employees find mutual transfer partners without agents or middlemen."
                keywords="about Mutual Transfer Sri Lanka, government transfer platform, mutual transfer service Sri Lanka"
                path="/about"
                structuredData={[
                    breadcrumbSchema([['About Us', '/about']]),
                    {
                        '@context': 'https://schema.org',
                        '@type': 'AboutPage',
                        name: 'About MutualTransfer.lk',
                        description:
                            'Why MutualTransfer.lk was built and how it helps Sri Lankan government employees find mutual transfers.',
                    },
                ]}
            />
            {/* Hero Section */}
            <section ref={heroRef} className="relative mesh-gradient-bg overflow-hidden flex flex-col justify-center min-h-screen pt-24">
                <NetworkMeshBackground />
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
                        {t('about_page.badge', 'About Us')}
                    </motion.div>
                    <motion.h1 variants={fadeInUp} className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-8 tracking-tight">
                        {t('about_page.hero_title_1', 'Our Mission to')}{' '}
                        <span className="shimmer-text">{t('about_page.hero_title_highlight', 'Simplify Moves.')}</span>
                    </motion.h1>
                    <motion.p variants={fadeInUp} className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-sans">
                        {t('about_page.hero_subtitle', 'Reducing the administrative burden for over 1.5 million government employees in Sri Lanka through technology-driven mutual matching.')}
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
                            <motion.h2 variants={fadeInUp} className="text-3xl font-bold text-slate-900 mb-8 tracking-tight">
                                {t('about_page.why_title', 'Why We Built This')}
                            </motion.h2>
                            <div className="space-y-6 text-slate-600 leading-relaxed font-sans">
                                <motion.p variants={fadeInUp}>
                                    {t('about_page.why_p1', 'As government employees, finding a mutual transfer can often take years of searching through social media groups, manual advertisements, and personal networks.')}
                                </motion.p>
                                <motion.p variants={fadeInUp}>
                                    {t('about_page.why_p2', 'MutualTransfer.lk was born out of a desire to simplify this process. We believe that every teacher, nurse, and doctor should be able to serve where they feel most productive and supported by their families.')}
                                </motion.p>
                                <motion.p variants={fadeInUp}>
                                    {t('about_page.why_p3', 'Our platform uses advanced graph algorithms to find not just direct 1-to-1 matches, but complex circular chains that would be impossible to discover manually.')}
                                </motion.p>
                            </div>
                        </motion.div>
                        <motion.div 
                          initial="hidden"
                          whileInView="visible"
                          viewport={{ once: true, margin: "-100px" }}
                          variants={fadeInUp}
                          className="w-full flex justify-center perspective-2000"
                        >
                            <WhyUsCardSwitcher />
                        </motion.div>
                    </div>
                </div>
            </ScrollAnimatedSection>

            {/* Core Values Horizontal-on-Vertical Scroll Section */}
            <CoreValuesSection />

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
                        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-10 tracking-tight">
                            {t('about_page.cta_title', 'Ready to find your match?')}
                        </h2>
                        <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
                            <Link 
                                to="/register" 
                                className="w-full sm:w-auto px-12 py-5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-2xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center group"
                            >
                                {t('about_page.cta_get_started', 'Get Started')}
                                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                            </Link>
                            <Link 
                                to="/pricing" 
                                className="w-full sm:w-auto px-12 py-5 glass-panel text-slate-900 font-bold rounded-2xl hover:bg-slate-50 transition-all border border-slate-200"
                            >
                                {t('about_page.cta_view_pricing', 'View Pricing')}
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </ScrollAnimatedSection>
        </div>
    );
};

export default AboutPage;
