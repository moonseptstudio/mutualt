
import matchingNetworkImg from '../../assets/homePage/matching-network.png';
import testimonialBgImg from '../../assets/homePage/testimonial-bg.png';
import deviceMockupImg from '../../assets/homePage/device-mockup.png';

import { 
  CheckCircle2, 
  ArrowRight, 
  Shield, 
  Zap, 
  Users, 
  Search,
  Check,
  Sparkles,
  ClipboardList,
  Settings2,
  GitMerge,
  Star,
  Quote,
  MapPin,
  TrendingUp,
  Globe,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { useRef, useEffect, useState, useMemo } from 'react';

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
      <motion.div style={{ y: y1 }} className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-blue-200/30 blur-3xl" />
      <motion.div style={{ y: y2 }} className="absolute -top-10 right-10 w-56 h-56 rounded-full bg-violet-200/25 blur-2xl" />
      <motion.div style={{ y: y1, rotate }} className="absolute bottom-20 -left-10 w-40 h-40 rounded-full bg-emerald-200/20 blur-2xl" />
      <motion.div style={{ rotate }} className="absolute top-[15%] left-[12%] w-16 h-16 border-2 border-blue-200/40 rounded-xl" />
      <motion.div style={{ y: y2 }} className="absolute top-[25%] right-[15%] w-12 h-12 border-2 border-violet-200/40 rounded-full" />
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

/* ─── Stat Item with Count-Up ─── */
const StatItem = ({ value, suffix = '', label, icon: Icon }: any) => {
  const numericValue = parseInt(value.replace(/[^\d]/g, ''));
  const { count, ref } = useCountUp(numericValue);
  
  return (
    <motion.div 
      ref={ref}
      variants={fadeInUp} 
      className="text-center stat-glow rounded-2xl p-6 bg-white/50 backdrop-blur-sm"
    >
      <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-linear-to-br from-blue-500/10 to-violet-500/10 flex items-center justify-center">
        <Icon size={22} className="text-blue-600" />
      </div>
      <p className="text-3xl sm:text-4xl font-bold tracking-tight shimmer-text mb-1">
        {count.toLocaleString()}{suffix}
      </p>
      <p className="text-slate-500 text-[10px] sm:text-xs font-bold uppercase tracking-widest">{label}</p>
    </motion.div>
  );
};

/* ─── Feature Card ─── */
const gradientClasses = [
  'icon-gradient-blue',
  'icon-gradient-violet',
  'icon-gradient-emerald',
  'icon-gradient-cyan',
  'icon-gradient-amber',
  'icon-gradient-rose',
];

const FeatureCard = ({ icon: Icon, title, description, index }: any) => {
  return (
    <motion.div
      variants={fadeInUp}
      whileHover={{ y: -10, scale: 1.02 }}
      className="glass-panel rounded-[32px] p-8 group relative overflow-hidden flex flex-col justify-between h-full"
    >
      <div className="relative z-10">
        <div className={`w-14 h-14 ${gradientClasses[index % gradientClasses.length]} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-500`}>
          <Icon size={26} className="text-white" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">{title}</h3>
        <p className="text-slate-500 text-sm leading-relaxed mb-6 font-medium">
          {description}
        </p>
      </div>

      

      {/* Hover background effect */}
      <div className="absolute inset-0 bg-linear-to-br from-blue-50/0 via-transparent to-violet-50/0 group-hover:from-blue-50/50 group-hover:to-violet-50/50 transition-colors duration-500" />
      
      {/* Decorative corner */}
      <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-slate-100/30 rounded-full blur-2xl group-hover:bg-blue-100/40 transition-colors duration-500" />
    </motion.div>
  );
};

/* ─── Large Feature Card (Bento) ─── */
const LargeFeatureCard = ({ title, description, imgSrc, badge }: any) => {
  return (
    <motion.div
      variants={fadeInUp}
      whileHover={{ y: -6, scale: 1.01 }}
      className="bento-large glass-panel rounded-[32px] group relative overflow-hidden flex flex-col md:flex-row"
    >
      <div className="flex-1 p-8 sm:p-10 flex flex-col justify-between relative z-10">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-violet-100 text-violet-600 text-[10px] font-bold uppercase tracking-widest rounded-full">
              Featured
            </span>
            {badge && (
              <span className="px-3 py-1 bg-emerald-100 text-emerald-600 text-[10px] font-bold uppercase tracking-widest rounded-full animate-pulse">
                {badge}
              </span>
            )}
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4 leading-tight">{title}</h3>
          <p className="text-slate-500 leading-relaxed mb-8 max-w-sm">
            {description}
          </p>
        </div>
        
        <Link 
          to="/register" 
          className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 group/btn w-fit"
        >
          Explore Feature
          <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="flex-1 relative h-64 md:h-auto overflow-hidden">
        <div className="absolute inset-x-0 bottom-0 top-0 md:top-auto md:h-2/3 bg-linear-to-t from-white via-white/40 to-transparent z-10 hidden md:block" />
        <img 
          src={imgSrc} 
          alt={title} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
        />
        {/* Glass overlay for mobile/small screens */}
        <div className="absolute inset-0 bg-linear-to-t from-white/80 via-transparent to-transparent md:hidden" />
      </div>

      {/* Decorative elements */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-violet-200/20 blur-3xl rounded-full" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-200/20 blur-3xl rounded-full" />
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
          <span className="absolute -top-2 -right-2 w-7 h-7 bg-linear-to-br from-blue-500 to-violet-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-md">
            {step}
          </span>
        </div>
        {!isLast && (
          <div className="w-0.5 h-full bg-linear-to-b from-blue-200 to-violet-200/30 mt-4" />
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
  return (
    <div className="glass-panel rounded-3xl p-8 min-w-[340px] max-w-[380px] shrink-0 group hover:shadow-xl transition-shadow duration-500">
      <Quote size={24} className="text-blue-400/40 mb-4" />
      <p className="text-slate-600 text-sm leading-relaxed mb-6 italic">"{quote}"</p>
      <div className="flex items-center gap-1 mb-4">
        {Array.from({ length: rating }).map((_, i) => (
          <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
        ))}
      </div>
      <div>
        <p className="font-bold text-slate-800 text-sm">{name}</p>
        <p className="text-slate-400 text-xs flex items-center gap-1 mt-0.5">
          <MapPin size={10} /> {role} · {location}
        </p>
      </div>
    </div>
  );
};

/* ─── Pricing Card ─── */
const PricingCard = ({ name, price, description, features, highlighted }: any) => {
  return (
    <motion.div
      variants={fadeInUp}
      whileHover={{ scale: highlighted ? 1.05 : 1.02 }}
      className={`relative rounded-3xl p-8 transition-all duration-500 ${
        highlighted
          ? 'gradient-border-animated shadow-2xl shadow-blue-500/10 z-10'
          : 'glass-panel hover:shadow-lg'
      }`}
    >
      {highlighted && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-linear-to-r from-blue-500 to-violet-500 text-white text-xs font-bold rounded-full shadow-lg">
            <Sparkles size={12} /> Most Popular
          </span>
        </div>
      )}
      <h3 className="text-xl font-bold text-slate-800 mb-2">{name}</h3>
      <p className="text-sm text-slate-500 mb-6">{description}</p>
      <div className="flex items-baseline mb-8">
        <span className="text-4xl font-bold text-slate-900 tracking-tight">Rs. {price}</span>
        <span className="text-sm text-slate-400 ml-2">{price === "0" ? "/ forever" : "/ one-time"}</span>
      </div>
      <ul className="space-y-4 mb-10">
        {features.map((feature: any, idx: number) => (
          <li key={idx} className="flex items-center space-x-3 text-sm font-medium text-slate-700">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${highlighted ? 'bg-linear-to-br from-blue-500 to-violet-500' : 'bg-blue-100'}`}>
              <Check size={12} className={highlighted ? 'text-white' : 'text-blue-600'} />
            </div>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <Link
        to="/register"
        className={`block text-center py-3.5 rounded-2xl font-bold transition-all duration-300 ${
          highlighted
            ? 'bg-linear-to-r from-blue-500 to-violet-500 text-white hover:shadow-xl hover:shadow-blue-500/25'
            : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
        }`}
      >
        {price === "0" ? "Start for Free" : "Upgrade to Premium"}
      </Link>
    </motion.div>
  );
};

/* ─── Wave Divider SVG ─── */
const WaveDivider = ({ flip = false }: { flip?: boolean }) => (
  <div className={`wave-divider ${flip ? 'top-0 bottom-auto rotate-180' : ''}`}>
    <svg viewBox="0 0 1440 60" preserveAspectRatio="none">
      <path
        d="M0,30 C360,60 720,0 1080,30 C1260,45 1380,20 1440,30 L1440,60 L0,60 Z"
        fill="#f8fafc"
      />
    </svg>
  </div>
);

/* ─── Testimonials data ─── */
const testimonials = [
  { name: "Kasun Perera", role: "Teacher", location: "Colombo", quote: "MutualTransfer.lk found me a 3-way circular match in just 2 days. What would have taken months through notice boards happened in hours.", rating: 5 },
  { name: "Nimali Fernando", role: "Nurse", location: "Kandy", quote: "The verified profiles gave me confidence. I knew every match was genuine. Best decision I made for my career transfer.", rating: 5 },
  { name: "Samantha Wijesinghe", role: "Doctor", location: "Galle", quote: "Premium was absolutely worth it. The 3-way matching algorithm found connections I never would have discovered manually.", rating: 5 },
  { name: "Ruwan Jayawardena", role: "Teacher", location: "Matara", quote: "Simple, fast, and reliable. Registered in the morning, had a match by evening. The future of transfers in Sri Lanka.", rating: 4 },
  { name: "Dilini Senanayake", role: "Nurse", location: "Jaffna", quote: "I was skeptical at first, but the platform delivered beyond expectations. Found my perfect station match within a week.", rating: 5 },
  { name: "Amal Dissanayake", role: "Teacher", location: "Kurunegala", quote: "The district scouting feature helped me explore options I hadn't even considered. Truly a game-changer.", rating: 5 },
];

/* ═══════════════════════════════════════════════
   ██  HOME PAGE
   ═══════════════════════════════════════════════ */
const HomePage = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.9]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div>

      {/* ─── HERO SECTION ─── */}
      <section ref={heroRef} className="relative mesh-gradient-bg overflow-hidden min-h-screen flex flex-col justify-center pt-24">
        <ParticleField />
        <FloatingShapes />

        <motion.div 
          style={{ y: heroY, scale: heroScale, opacity: heroOpacity }}
          className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center text-left">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              {/* Headline with word reveal */}
              <motion.h1 variants={fadeInUp} className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-slate-900 mb-6 tracking-tight leading-[1.1]">
                Find Your, <br />
                <span className="shimmer-text">Dream Station</span>
              </motion.h1>

              {/* Sub-headline */}
              <motion.p variants={fadeInUp} className="text-lg sm:text-xl text-slate-600 mb-10 leading-relaxed max-w-xl font-sans">
                Sri Lanka's most trusted transfer platform for government employees in Sri Lanka.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                <Link
                  to="/register"
                  className="w-full sm:w-auto px-10 py-4.5 bg-linear-to-r from-blue-500 to-violet-500 text-white font-bold rounded-2xl shadow-2xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center group magnetic-hover"
                >
                  Join the Network
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                </Link>
              </motion.div>

              
            </motion.div>

            {/* Hero Device Mockup */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.85, y: 40 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.21, 0.45, 0.32, 0.9], delay: 0.3 }}
              className="relative hidden lg:block"
            >
              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="relative"
              >
                <img 
                  src={deviceMockupImg} 
                  alt="Platform on multiple devices"
                  className="w-full h-auto object-contain drop-shadow-2xl"
                />
                <div className="absolute inset-0 bg-linear-to-t from-white/5 to-transparent pointer-events-none rounded-3xl" />
              </motion.div>
              
              {/* Floating notification 1 */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-10 right-30 glass-panel-strong p-4 rounded-2xl shadow-xl"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="text-emerald-500" size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Match Found</p>
                    <p className="text-sm font-bold text-slate-800">3 Way Matching System</p>
                  </div>
                </div>
              </motion.div>

              {/* Floating notification 2 */}
              <motion.div 
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute top-10 -left-12 glass-panel-strong p-4 rounded-2xl shadow-xl"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="text-blue-500" size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Success Rate</p>
                    <p className="text-sm font-bold text-slate-800">98% Accuracy</p>
                  </div>
                </div>
              </motion.div>

              {/* Floating badge */}
              <motion.div 
                animate={{ y: [0, -6, 0], rotate: [0, 3, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                className="absolute top-[25%] -right-16 glass-panel-strong py-2 px-4 rounded-xl shadow-lg"
              >
                <div className="flex items-center gap-2">
                  <Shield className="text-violet-500" size={16} />
                  <span className="text-xs font-bold text-slate-700">Secured Privacy</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>


        {/* Wave divider at bottom */}
        <WaveDivider />
      </section>


      {/* ─── HOW IT WORKS (Timeline) ─── */}
      <ScrollAnimatedSection className="relative perspective-2000 py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: Title */}
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
            >
              <motion.span variants={fadeInUp} className="inline-block text-xs font-bold uppercase tracking-widest text-blue-500 mb-4">How It Works</motion.span>
              <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-4">
                Get Matched in <br />
                <span className="shimmer-text">3 Simple Steps</span>
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-slate-500 leading-relaxed mb-8">
                Our intelligent matching engine does the heavy lifting. Register, set your preferences, and let our algorithm find your perfect transfer match.
              </motion.p>
              <motion.div variants={fadeInUp}>
                <Link
                  to="/register"
                  className="inline-flex items-center px-8 py-3.5 bg-linear-to-r from-blue-500 to-violet-500 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-1 transition-all duration-300 group"
                >
                  Get Started
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
                title="Register & Verify"
                description="Create your account with NIC verification. Set up your professional profile in minutes."
              />
              <StepCard
                step={2}
                icon={Settings2}
                title="Set Preferences"
                description="Choose your desired stations, districts, and transfer preferences for pinpoint matching."
              />
              <StepCard
                step={3}
                icon={GitMerge}
                title="Get Matched"
                description="Our DFS algorithm finds direct and circular matches automatically. Accept with one click."
                isLast
              />
            </motion.div>
          </div>
        </div>
      </ScrollAnimatedSection>

      {/* ─── STATS BAR ─── */}
      <ScrollAnimatedSection className="relative overflow-hidden perspective-2000 py-24">
        <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-blue-200/60 to-transparent" />
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="glass-panel-strong rounded-3xl py-12 px-6 sm:px-12"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              <StatItem value="1500" suffix="+" label="Registered Employees" icon={Users} />
              <StatItem value="450" suffix="+" label="Successful Transfers" icon={CheckCircle2} />
              <StatItem value="25" suffix="+" label="Hospital Networks" icon={Globe} />
              <StatItem value="98" suffix="%" label="Matching Accuracy" icon={TrendingUp} />
            </div>
          </motion.div>
        </div>
      </ScrollAnimatedSection>

      {/* ─── FEATURES BENTO GRID ─── */}
      <ScrollAnimatedSection className="relative mesh-gradient-bg perspective-2000 py-24">
        <FloatingShapes />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <motion.span variants={fadeInUp} className="inline-block text-xs font-bold uppercase tracking-widest text-violet-500 mb-4">Features</motion.span>
            <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6 tracking-tight">
              Why Choose MutualTransfer.lk?
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-slate-600 leading-relaxed">
              We replace traditional notice boards and social media groups with a data-driven matching engine tailored for Sri Lanka.
            </motion.p>
          </motion.div>
          
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="bento-grid"
          >
            {/* Large featured card */}
            <LargeFeatureCard
              title="Advanced Circular Matching"
              description="Our proprietary algorithm discovers complex 3-way circular transfer chains (A → B → C → A) that are humanly impossible to detect. Visualize your path to a new station."
              imgSrc={matchingNetworkImg}
              badge="New Algorithm"
            />

            {/* Regular cards */}
            <FeatureCard index={0} icon={Zap} title="Instant Scanning" description="Process thousands of professional requirements in milliseconds to find direct shifts." />
            <FeatureCard index={2} icon={Shield} title="Multi-Level Security" description="NIC and Email validation ensures only legitimate government personnel access the system." />
            <FeatureCard index={3} icon={Users} title="Unified Network" description="A centralized hub for Teachers, Nurses, and Doctors across all 25 districts." />
            <FeatureCard index={4} icon={Search} title="Hierarchical Search" description="Drill down through Province, District, and Hospital level vacancies with precision." />
            <FeatureCard index={5} icon={CheckCircle2} title="Verified Results" description="98% data accuracy ensures your match is valid and ready for official processing." />
          </motion.div>
        </div>
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
            <motion.span variants={fadeInUp} className="inline-block text-xs font-bold uppercase tracking-widest text-emerald-500 mb-4">Testimonials</motion.span>
            <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6 tracking-tight">
              Loved by <span className="shimmer-text">Thousands</span> of Users
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-slate-600 leading-relaxed">
              Real stories from government employees across Sri Lanka who find their perfect transfer match.
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
            <motion.span variants={fadeInUp} className="inline-block text-xs font-bold uppercase tracking-widest text-blue-500 mb-4">Pricing</motion.span>
            <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6 tracking-tight">Pricing & Packages</motion.h2>
            <motion.p variants={fadeInUp} className="text-slate-600">Select the plan that best fits your transfer goals.</motion.p>
          </motion.div>
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto"
          >
            <PricingCard
              name="Basic"
              price="0"
              description="Ideal for simple direct swaps."
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
            />
          </motion.div>
        </div>
      </ScrollAnimatedSection>

      {/* ─── CTA BANNER ─── */}
      <ScrollAnimatedSection className="relative overflow-hidden perspective-2000 py-24">
        <div className="absolute inset-0 bg-linear-to-r from-blue-50 via-violet-50/60 to-cyan-50" />
        <ParticleField />
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-blue-200/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-violet-200/50 to-transparent" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="glass-panel-strong rounded-3xl p-10 sm:p-14"
          >
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <Sparkles className="w-10 h-10 text-blue-500 mx-auto mb-6" />
            </motion.div>
            <h2 className="text-2xl sm:text-4xl font-bold text-slate-900 mb-6 tracking-tight">
              Ready to Find Your{' '}
              <span className="shimmer-text">Perfect Transfer?</span>
            </h2>
            <p className="text-slate-600 mb-10 max-w-xl mx-auto leading-relaxed">
              Join thousands of government employees who have already found their ideal station match on MutualTransfer.lk.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center px-10 py-4.5 bg-linear-to-r from-blue-500 to-violet-500 text-white font-bold rounded-2xl shadow-2xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-1 transition-all duration-300 group magnetic-hover"
            >
              Get Started Now
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
            </Link>
          </motion.div>
        </div>
      </ScrollAnimatedSection>
    </div>
  );
};

export default HomePage;
