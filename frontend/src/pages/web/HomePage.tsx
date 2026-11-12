
import testimonialBgImg from '../../assets/homePage/testimonial-bg.png';
import Network3DBackground from '../../components/home/Network3DBackground';
import ChainCarouselFeatures from '../../components/home/ChainCarouselFeatures';

import { 
  CheckCircle2, 
  ArrowRight, 
  Users, 
  ClipboardList,
  Settings2,
  GitMerge,
  Star,
  Quote,
  MapPin,
  TrendingUp,
  Globe,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { useRef, useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/client';
import toast from 'react-hot-toast';
import PaymentModal from '../../components/modals/PaymentModal';
import PricingCard from '../../components/common/PricingCard';
import SEO from '../../components/SEO';
import { DEFAULT_KEYWORDS, SITE_URL, absoluteUrl } from '../../config/seo';


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

/* ─── Particle Field Background ─── */
const ParticleField = () => {
  const particles = useMemo(() => 
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      duration: `${6 + Math.random() * 8}s`,
      delay: `${Math.random() * 5}s`,
      tx: `${-100 + Math.random() * 200}px`,
      ty: `${-200 + Math.random() * -100}px`,
      size: `${3 + Math.random() * 4}px`,
    })), []
  );

  return (
    <div className="particle-field" aria-hidden="true">
      {particles.map(p => (
        <div
          key={p.id}
          className="particle"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            '--duration': p.duration,
            '--delay': p.delay,
            '--tx': p.tx,
            '--ty': p.ty,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
};

/* ─── Floating geometric shapes with parallax ─── */
const FloatingShapes = () => {
  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 360]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <motion.div style={{ y: y1 }} className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-blue-200/35 blur-3xl" />
      <motion.div style={{ y: y2 }} className="absolute -top-10 right-10 w-56 h-56 rounded-full bg-sky-200/25 blur-2xl" />
      <motion.div style={{ y: y1, rotate }} className="absolute bottom-20 -left-10 w-40 h-40 rounded-full bg-blue-100/30 blur-2xl" />
      <motion.div style={{ rotate }} className="absolute top-[15%] left-[12%] w-16 h-16 border-2 border-blue-200/40 rounded-xl" />
      <motion.div style={{ y: y2 }} className="absolute top-[25%] right-[15%] w-12 h-12 border-2 border-blue-200/40 rounded-full" />
    </div>
  );
};

/* ─── Scroll-linked Section Animation Wrapper ─── */
const ScrollAnimatedSection = ({ children, className = "", id }: { children: React.ReactNode, className?: string, id?: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.9, 1, 1, 0.9]);
  const y = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [40, 0, 0, -40]);

  return (
    <motion.div
      ref={ref}
      id={id}
      style={{ opacity, scale, y }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/* ─── Count Up Animation Hook ─── */
const useCountUp = (end: number, duration: number = 2000) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (!inView) return;
    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [inView, end, duration]);

  return { count, ref };
};

/* ─── Stat Item with Count-Up (Left Border Minimalist) ─── */
const StatItem = ({ value, suffix = '', label, icon: Icon }: any) => {
  const numericValue = parseInt(value.replace(/[^\d]/g, ''));
  const { count, ref } = useCountUp(numericValue);
  
  return (
    <motion.div 
      ref={ref}
      variants={fadeInUp} 
      whileHover={{ x: 6 }}
      className="relative text-left pl-5 sm:pl-6 border-l-2 border-white/35 hover:border-sky-300 transition-all duration-300 group py-1"
    >
      {/* Icon placed at Top-Right without any background */}
      <div className="absolute top-1 right-2 text-white/50 group-hover:text-sky-300 group-hover:scale-110 transition-all duration-300 pointer-events-none">
        <Icon size={24} strokeWidth={2} />
      </div>

      {/* Luminous Counter Number */}
      <p className="text-4xl sm:text-5xl font-black tracking-tight text-white drop-shadow-sm mb-1.5 group-hover:text-sky-100 transition-colors">
        {count.toLocaleString()}{suffix}
      </p>

      {/* Metric Label */}
      <p className="text-blue-100/90 font-bold uppercase tracking-wider text-xs sm:text-sm group-hover:text-white transition-colors pr-8">
        {label}
      </p>
    </motion.div>
  );
};



/* ─── How-it-Works Step (Timeline) ─── */
const StepCard = ({ step, icon: Icon, title, description, isLast }: any) => {
  return (
    <motion.div variants={fadeInUp} className="flex gap-6 relative">
      {/* Timeline connector */}
      <div className="flex flex-col items-center">
        <div className="relative z-10">
          <div className="w-16 h-16 glass-panel-strong rounded-2xl flex items-center justify-center shadow-lg animate-glow-pulse">
            <Icon size={28} className="text-blue-600" />
          </div>
          <span className="absolute -top-2 -right-2 w-7 h-7 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-md">
            {step}
          </span>
        </div>
        {!isLast && (
          <div className="w-0.5 h-full bg-linear-to-b from-blue-200 to-blue-200/30 mt-4" />
        )}
      </div>
      {/* Content */}
      <div className="pb-12">
        <h3 className="text-xl font-bold text-slate-800 mb-2 mt-3">{title}</h3>
        <p className="text-slate-500 leading-relaxed max-w-sm">{description}</p>
      </div>
    </motion.div>
  );
};

/* ─── Testimonial Card ─── */
const TestimonialCard = ({ name, role, location, quote, rating }: any) => {
  const { t } = useTranslation();
  return (
    <div className="glass-panel rounded-3xl p-8 min-w-[340px] max-w-[380px] shrink-0 group hover:shadow-xl transition-shadow duration-500">
      <Quote size={24} className="text-blue-400/40 mb-4" />
      <p className="text-slate-600 text-sm leading-relaxed mb-6 italic">"{t(quote)}"</p>
      <div className="flex items-center gap-1 mb-4">
        {Array.from({ length: rating }).map((_, i) => (
          <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
        ))}
      </div>
      <div>
        <p className="font-bold text-slate-800 text-sm">{name}</p>
        <p className="text-slate-400 text-xs flex items-center gap-1 mt-0.5">
          <MapPin size={10} /> {t(role)} · {t(location)}
        </p>
      </div>
    </div>
  );
};

/* ─── Wave Divider SVG ─── */
const WaveDivider = ({ flip = false }: { flip?: boolean }) => (
  <div className={`wave-divider ${flip ? 'top-0 bottom-auto rotate-180' : ''}`}>
    <svg viewBox="0 0 1440 140" preserveAspectRatio="none" className="w-full block overflow-visible">
      <defs>
        {/* Primary foreground curve border gradient */}
        <linearGradient id="waveBorderPrimary" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
          <stop offset="25%" stopColor="#2563eb" stopOpacity="0.85" />
          <stop offset="65%" stopColor="#1d4ed8" stopOpacity="0.9" />
          <stop offset="85%" stopColor="#3b82f6" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.4" />
        </linearGradient>

        {/* Secondary background layer curve border gradient */}
        <linearGradient id="waveBorderSecondary" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.2" />
          <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.25" />
        </linearGradient>

        {/* Subtle upper glow filter for edge definition */}
        <filter id="waveGlow" x="-5%" y="-20%" width="110%" height="150%">
          <feDropShadow dx="0" dy="-2" stdDeviation="4" floodColor="#2563eb" floodOpacity="0.18" />
        </filter>
      </defs>

      {/* Layer 1: Background soft wave fill */}
      <path
        d="M0,50 C360,130 680,20 1020,90 C1240,135 1380,80 1440,75 L1440,140 L0,140 Z"
        fill="#f8fafc"
        fillOpacity="0.65"
      />
      {/* Layer 1: Secondary wave border line */}
      <path
        d="M0,50 C360,130 680,20 1020,90 C1240,135 1380,80 1440,75"
        fill="none"
        stroke="url(#waveBorderSecondary)"
        strokeWidth="2"
      />

      {/* Layer 2: Foreground primary wave fill with glow */}
      <path
        d="M0,70 C320,145 600,30 900,85 C1180,140 1340,55 1440,70 L1440,140 L0,140 Z"
        fill="#f8fafc"
        filter="url(#waveGlow)"
      />
      {/* Layer 2: Primary prominent crisp wave border line */}
      <path
        d="M0,70 C320,145 600,30 900,85 C1180,140 1340,55 1440,70"
        fill="none"
        stroke="url(#waveBorderPrimary)"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
    </svg>
  </div>
);

/* ─── Testimonials data ─── */
const testimonials = [
  { name: "Kasun Perera", role: "home.testimonial_role_teacher", location: "districts.colombo", quote: "home.testimonial1_quote", rating: 5 },
  { name: "Nimali Fernando", role: "home.testimonial_role_nurse", location: "districts.kandy", quote: "home.testimonial2_quote", rating: 5 },
  { name: "Samantha Wijesinghe", role: "home.testimonial_role_doctor", location: "districts.galle", quote: "home.testimonial2_quote", rating: 5 },
  { name: "Ruwan Jayawardena", role: "home.testimonial_role_teacher", location: "districts.matara", quote: "home.testimonial1_quote", rating: 4 },
  { name: "Dilini Senanayake", role: "home.testimonial_role_nurse", location: "districts.jaffna", quote: "home.testimonial2_quote", rating: 5 },
  { name: "Amal Dissanayake", role: "home.testimonial_role_teacher", location: "districts.kurunegala", quote: "home.testimonial1_quote", rating: 5 },
];

/* ═══════════════════════════════════════════════
   ██  HOME PAGE
   ═══════════════════════════════════════════════ */
const HomePage = () => {
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
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.9]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div>
      <SEO
        title="Mutual Transfer Sri Lanka | Government Employee Transfers"
        appendSiteName={false}
        description="Find mutual transfer partners easily in Sri Lanka. The premier platform connecting Nurses, Doctors, Teachers and all Government Employees for fast, reliable workplace transfers."
        keywords={DEFAULT_KEYWORDS}
        path="/"
        structuredData={[
          {
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            '@id': `${SITE_URL}/#webpage`,
            url: `${SITE_URL}/`,
            name: 'Mutual Transfer Sri Lanka | Government Employee Transfers',
            isPartOf: { '@id': `${SITE_URL}/#website` },
            about: { '@id': `${SITE_URL}/#organization` },
            primaryImageOfPage: { '@type': 'ImageObject', url: absoluteUrl('/og-image.png') },
          },
          {
            '@context': 'https://schema.org',
            '@type': 'Service',
            name: 'Government Employee Mutual Transfer Matching',
            serviceType: 'Mutual transfer matching',
            provider: { '@id': `${SITE_URL}/#organization` },
            areaServed: { '@type': 'Country', name: 'Sri Lanka' },
            audience: {
              '@type': 'Audience',
              audienceType: 'Sri Lankan government employees, nurses, doctors, teachers',
            },
            description:
              'Matches Sri Lankan government employees seeking mutual workplace transfers, including 2-way and 3-way transfer chains.',
          },
        ]}
      />
      <PaymentModal 
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onPaymentSuccess={handlePaymentSuccess}
        packageName={selectedPlan?.name || "Premium"}
        price={selectedPlan?.price || "0"}
      />

      {/* ─── HERO SECTION ─── */}
      <section ref={heroRef} className="relative mesh-gradient-bg overflow-hidden min-h-screen lg:h-screen lg:max-h-screen flex flex-col justify-start lg:justify-center pt-20 sm:pt-24 lg:pt-16 lg:pb-12">
        {/* Interactive 3D Connected Crystal Network Background */}
        <Network3DBackground />
        <FloatingShapes />

        <motion.div 
          style={{ y: heroY, scale: heroScale, opacity: heroOpacity }}
          className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 my-auto"
        >
          {/* On mobile: pt-80 frames the 7 3D interconnected avatars extending lower down into the screen */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center text-left pt-80 sm:pt-88 lg:pt-0">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              {/* Headline with word reveal */}
              <motion.h1 variants={fadeInUp} className="text-4xl sm:text-5xl lg:text-5xl xl:text-6xl font-extrabold text-slate-900 mb-4 lg:mb-5 tracking-tight leading-[1.15]">
                {t('home.hero_title_part1')} <br />
                <span className="shimmer-text">{t('home.hero_title_dream')}</span>
              </motion.h1>

              {/* Sub-headline */}
              <motion.p variants={fadeInUp} className="text-base sm:text-lg lg:text-xl text-slate-600 mb-6 lg:mb-8 leading-relaxed max-w-xl font-sans">
                {t('home.hero_subtitle')}
              </motion.p>

              {/* CTA Buttons - Positioned comfortably lower on mobile */}
              <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mt-4 lg:mt-6 pb-12 sm:pb-0">
                <Link
                  to="/register"
                  className="w-full sm:w-auto px-10 py-4.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center group magnetic-hover text-base sm:text-lg"
                >
                   {t('home.join_network')}
                  <ArrowRight className="ml-2 group-hover:translate-x-1.5 transition-transform" size={20} />
                </Link>
              </motion.div>

              
            </motion.div>

            {/* Right Column - 3D Network Focus Showcase Space */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.21, 0.45, 0.32, 0.9], delay: 0.2 }}
              className="relative w-full hidden lg:flex items-center justify-center min-h-[360px] xl:min-h-[420px] pointer-events-none"
            >
              {/* Subtle ambient light aura complementing the 3D crystal network */}
              <div className="w-80 h-80 rounded-full bg-linear-to-tr from-blue-500/20 via-sky-400/15 to-blue-300/10 blur-3xl" />
            </motion.div>
          </div>
        </motion.div>


        {/* Wave divider at bottom */}
        <WaveDivider />
      </section>


      {/* ─── HOW IT WORKS (Timeline) ─── */}
      <ScrollAnimatedSection className="relative perspective-2000 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: Title */}
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
            >
              <motion.span variants={fadeInUp} className="inline-block text-xs font-bold uppercase tracking-widest text-blue-500 mb-4">{t('home.how_it_works_label')}</motion.span>
              <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-4">
                {t('home.how_it_works_title')}
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-slate-500 leading-relaxed mb-8">
                {t('home.how_it_works_subtitle')}
              </motion.p>
              <motion.div variants={fadeInUp}>
                <Link
                  to="/register"
                  className="inline-flex items-center px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-1 transition-all duration-300 group"
                >
                  {t('home.get_started')}
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
                </Link>
              </motion.div>
            </motion.div>

            {/* Right: Timeline steps */}
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
            >
              <StepCard
                step={1}
                icon={ClipboardList}
                title={t('home.step1_title')}
                description={t('home.step1_desc')}
              />
              <StepCard
                step={2}
                icon={Settings2}
                title={t('home.step2_title')}
                description={t('home.step2_desc')}
              />
              <StepCard
                step={3}
                icon={GitMerge}
                title={t('home.step3_title')}
                description={t('home.step3_desc')}
                isLast
              />
            </motion.div>
          </div>
        </div>
      </ScrollAnimatedSection>

      {/* ─── STATS BAR (Our Impact) ─── */}
      <ScrollAnimatedSection className="relative overflow-hidden perspective-2000 py-24 bg-linear-to-br from-blue-600 via-blue-700 to-indigo-900 dark:from-slate-950 dark:via-blue-950 dark:to-slate-950 text-white">
        {/* Background Ambient Glows & Effects */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-sky-400/20 dark:bg-sky-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-indigo-500/25 dark:bg-blue-600/15 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-blue-400/15 dark:bg-blue-500/10 blur-3xl rounded-full pointer-events-none" />
        
        {/* Subtle Particle Field for depth */}
        <ParticleField />

        {/* Top & Bottom Accent Lines */}
        <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-white/30 dark:via-blue-500/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-white/25 dark:via-blue-500/30 to-transparent" />
        
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center max-w-3xl mx-auto mb-14"
          >
            <motion.span 
              variants={fadeInUp} 
              className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest text-blue-100 bg-white/15 dark:bg-blue-500/20 backdrop-blur-md border border-white/20 dark:border-blue-400/30 shadow-xs mb-4"
            >
              {t('home.stats_label')}
            </motion.span>
            <motion.h2 
              variants={fadeInUp} 
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-5 tracking-tight drop-shadow-xs"
            >
              {t('home.stats_title')}
            </motion.h2>
            <motion.p 
              variants={fadeInUp} 
              className="text-blue-100/90 dark:text-blue-200/80 leading-relaxed text-base sm:text-lg max-w-2xl mx-auto"
            >
              {t('home.stats_subtitle')}
            </motion.p>
          </motion.div>

          {/* Grid of 4 Minimalist Left-Bordered Stat Items */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10 sm:gap-10 lg:gap-12"
          >
            <StatItem value="1500" suffix="+" label={t('home.stats_label1')} icon={Users} />
            <StatItem value="450" suffix="+" label={t('home.stats_label2')} icon={CheckCircle2} />
            <StatItem value="25" suffix="+" label={t('home.stats_label3')} icon={Globe} />
            <StatItem value="98" suffix="%" label={t('home.stats_label4')} icon={TrendingUp} />
          </motion.div>
        </div>
      </ScrollAnimatedSection>

      {/* ─── FEATURES CHAIN CAROUSEL ─── */}
      <ScrollAnimatedSection className="relative mesh-gradient-bg perspective-2000 py-16 md:py-20">
        <FloatingShapes />
        <ChainCarouselFeatures />
      </ScrollAnimatedSection>

      {/* ─── TESTIMONIALS CAROUSEL ─── */}
      <ScrollAnimatedSection className="relative overflow-hidden perspective-2000 py-24">
        {/* Background image */}
        <div className="absolute inset-0 opacity-20">
          <img src={testimonialBgImg} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-linear-to-b from-white/60 via-transparent to-white/80" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center max-w-3xl mx-auto mb-14"
          >
            <motion.span variants={fadeInUp} className="inline-block text-xs font-bold uppercase tracking-widest text-blue-500 mb-4">{t('home.testimonials_label')}</motion.span>
            <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6 tracking-tight">
              {t('home.testimonials_title')}
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-slate-600 leading-relaxed">
              {t('home.testimonials_subtitle')}
            </motion.p>
          </motion.div>

          {/* Auto-scrolling carousel */}
          <div className=" py-10">
            <div className="testimonial-track">
              {/* Duplicate testimonials for infinite loop */}
              {[...testimonials, ...testimonials].map((t, i) => (
                <TestimonialCard key={i} {...t} />
              ))}
            </div>
          </div>
        </div>
      </ScrollAnimatedSection>

      {/* ─── PRICING SECTION ─── */}
      <ScrollAnimatedSection className="relative perspective-2000 py-24" id="pricing">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center max-w-3xl mx-auto mb-20"
          >
            <motion.span variants={fadeInUp} className="inline-block text-xs font-bold uppercase tracking-widest text-blue-500 mb-4">{t('home.pricing_label')}</motion.span>
            <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6 tracking-tight">{t('home.pricing_title')}</motion.h2>
            <motion.p variants={fadeInUp} className="text-slate-600">{t('home.pricing_subtitle')}</motion.p>
          </motion.div>
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto"
          >
            <PricingCard
              name={t('home.pricing_plan_basic')}
              price="0"
              description={t('home.pricing_basic_desc')}
              features={[
                t('home.pricing_feature_2way'),
                t('home.pricing_feature_pref3'),
                t('home.pricing_feature_search'),
                t('home.pricing_feature_verify'),
                t('home.pricing_feature_view_only')
              ]}
              highlighted={false}
              onAction={() => navigate(isAuthenticated ? '/dashboard' : '/register')}
              actionLabel={t('home.pricing_start_free')}
              periodLabel={t('home.pricing_forever')}
            />
            <PricingCard
              name={t('home.pricing_plan_premium1')}
              price="440"
              description={t('home.pricing_premium1_desc')}
              features={[
                t('home.pricing_feature_dynamic'),
                t('home.pricing_feature_unlimited'),
                t('home.pricing_feature_msg'),
                t('home.pricing_feature_visibility'),
                t('home.pricing_feature_no_ads')
              ]}
              highlighted={true}
              onAction={() => handleUpgradeRequest({name: t('home.pricing_plan_premium1'), price: "440", duration: 1})}
              actionLabel={isUpgrading ? t('home.pricing_upgrading', 'Upgrading...') : (user?.packageName === 'PREMIUM' ? t('home.pricing_extend_1m', 'Extend 1 Month') : t('home.pricing_buy_1m', 'Buy 1 Month'))}
              periodLabel={t('home.pricing_one_time')}
            />
          </motion.div>
        </div>
      </ScrollAnimatedSection>

      {/* ─── CTA BANNER ─── */}
      <ScrollAnimatedSection className="relative overflow-hidden perspective-2000 py-24">
        <div className="absolute inset-0 bg-linear-to-r from-blue-50/80 via-sky-50/60 to-blue-50/80" />
        <ParticleField />
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-blue-200/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-blue-200/50 to-transparent" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="glass-panel-strong rounded-3xl p-10 sm:p-14"
          >
            <h2 className="text-2xl sm:text-4xl font-bold text-slate-900 mb-6 tracking-tight">
              {t('home.cta_title')}
            </h2>
            <p className="text-slate-600 mb-10 max-w-xl mx-auto leading-relaxed">
              {t('home.cta_subtitle')}
            </p>
            <Link
              to="/register"
              className="inline-flex items-center px-10 py-4.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-2xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-1 transition-all duration-300 group magnetic-hover"
            >
              {t('home.cta_btn', 'Get Started Now')}
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
            </Link>
          </motion.div>
        </div>
      </ScrollAnimatedSection>
    </div>
  );
};

export default HomePage;
