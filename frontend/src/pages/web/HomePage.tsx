import { 
  CheckCircle2, 
  ArrowRight, 
  Shield, 
  RefreshCw, 
  Zap, 
  Users, 
  Search,
  Check,
  Sparkles,
  ClipboardList,
  Settings2,
  GitMerge,
} from 'lucide-react';
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

/* ─── Floating geometric shapes with parallax ─── */
const FloatingShapes = () => {
  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 360]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Top-left soft blue circle */}
      <motion.div style={{ y: y1 }} className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-blue-200/30 blur-3xl" />
      {/* Top-right lavender blob */}
      <motion.div style={{ y: y2 }} className="absolute -top-10 right-10 w-56 h-56 rounded-full bg-violet-200/25 blur-2xl" />
      {/* Bottom-left mint */}
      <motion.div style={{ y: y1, rotate }} className="absolute bottom-20 -left-10 w-40 h-40 rounded-full bg-emerald-200/20 blur-2xl" />
      
      {/* Geometric outlines */}
      <motion.div style={{ rotate }} className="absolute top-[15%] left-[12%] w-16 h-16 border-2 border-blue-200/40 rounded-xl" />
      <motion.div style={{ y: y2 }} className="absolute top-[25%] right-[15%] w-12 h-12 border-2 border-violet-200/40 rounded-full" />
    </div>
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
      whileHover={{ y: -8, rotateX: 4, rotateY: -2, scale: 1.02 }}
      className="glass-panel rounded-3xl p-8 group tilt-3d relative"
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-linear-to-bl from-blue-50/80 to-transparent rounded-bl-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className={`w-14 h-14 ${gradientClasses[index % gradientClasses.length]} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
        <Icon size={26} className="text-white" />
      </div>
      <h3 className="text-lg font-bold text-slate-800 mb-3">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
    </motion.div>
  );
};

/* ─── How-it-Works Step ─── */
const StepCard = ({ step, icon: Icon, title, description }: any) => {
  return (
    <motion.div
      variants={fadeInUp}
      className="flex flex-col items-center text-center"
    >
      <div className="relative mb-6">
        <div className="w-20 h-20 glass-panel-strong rounded-3xl flex items-center justify-center shadow-lg animate-glow-pulse">
          <Icon size={32} className="text-blue-600" />
        </div>
        <span className="absolute -top-2 -right-2 w-8 h-8 bg-linear-to-br from-blue-500 to-violet-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-md">
          {step}
        </span>
      </div>
      <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed max-w-[240px]">{description}</p>
    </motion.div>
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
          ? 'glass-panel-strong border-2 border-blue-200/60 shadow-2xl shadow-blue-500/10 z-10'
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

/* ─── Stat Item ─── */
const StatItem = ({ value, label }: any) => {
  return (
    <motion.div variants={fadeInUp} className="text-center">
      <p className="text-3xl sm:text-5xl font-bold tracking-tight shimmer-text mb-2">{value}</p>
      <p className="text-slate-500 text-[10px] sm:text-xs font-bold uppercase tracking-widest">{label}</p>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════
   ██  HOME PAGE
   ═══════════════════════════════════════════════ */
const HomePage = () => {
  return (
    <div>

      {/* ─── HERO SECTION ─── */}
      <section className="snap-section relative mesh-gradient-bg overflow-hidden">
        <FloatingShapes />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center text-left">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              {/* Badge */}
              <motion.div variants={fadeInUp} className="inline-flex items-center space-x-2 glass-panel px-5 py-2.5 rounded-full mb-8">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-linear-to-r from-blue-500 to-violet-500" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider bg-linear-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                  Next-Gen 3D Match Engine
                </span>
              </motion.div>

              {/* Headline */}
              <motion.h1 variants={fadeInUp} className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight leading-[1.1]">
                Revolutionizing Mutual <br />
                <span className="shimmer-text">Transfers in Sri Lanka.</span>
              </motion.h1>

              {/* Sub-headline */}
              <motion.p variants={fadeInUp} className="text-base sm:text-lg text-slate-600 mb-10 leading-relaxed max-w-xl">
                The most advanced 3D matching system for teachers, nurses, and doctors.
                Secure, transparent, and built for speed.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                <Link
                  to="/register"
                  className="w-full sm:w-auto px-10 py-4.5 bg-linear-to-r from-blue-500 to-violet-500 text-white font-bold rounded-2xl shadow-2xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center group"
                >
                  Join the Network
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                </Link>
                <Link
                  to="/about"
                  className="w-full sm:w-auto px-10 py-4.5 glass-panel-strong text-slate-800 font-bold rounded-2xl hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center"
                >
                  Watch Demo
                </Link>
              </motion.div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.8, rotateY: -30 }}
              whileInView={{ opacity: 1, scale: 1, rotateY: -25 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="relative perspective-2000 hidden lg:block"
            >
              <div 
                className="relative animate-float-slow transform rotate-x-15 shadow-2xl rounded-[40px] overflow-hidden border border-white/40"
              >
                <img 
                  src="file:///C:/Users/user/.gemini/antigravity/brain/47a24356-bf7e-4c00-a651-895ec580bf8c/platform_dashboard_3d_mockup_1773386005310.png" 
                  alt="3D Platform Dashboard"
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-tr from-white/10 to-transparent pointer-events-none" />
              </div>
              
              {/* Floating element 1 */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-10 -right-10 glass-panel-strong p-4 rounded-2xl shadow-xl"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="text-emerald-500" size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Match Found</p>
                    <p className="text-sm font-bold text-slate-800">Circular Cycle 102</p>
                  </div>
                </div>
              </motion.div>

              {/* Floating element 2 */}
              <motion.div 
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -bottom-6 -left-12 glass-panel-strong p-4 rounded-2xl shadow-xl"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="text-blue-500" size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">User Trust</p>
                    <p className="text-sm font-bold text-slate-800">100% Verified Profiles</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <div className="w-8 h-12 rounded-full border-2 border-slate-300/60 flex justify-center pt-2">
            <motion.div 
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1 h-2 bg-linear-to-b from-blue-400 to-violet-400 rounded-full" 
            />
          </div>
        </motion.div>
      </section>

      {/* ─── STATS BAR ─── */}
      <section className="snap-section relative overflow-hidden perspective-2000">
        <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-blue-200/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-violet-200/50 to-transparent" />
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="glass-panel-strong rounded-3xl py-12 px-6 sm:px-12"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
              <StatItem value="1500+" label="Registered Employees" />
              <StatItem value="450+" label="Successful Transfers" />
              <StatItem value="25+" label="Hospital Networks" />
              <StatItem value="98%" label="Matching Accuracy" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="snap-section relative perspective-2000">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center mb-20"
          >
            <motion.span variants={fadeInUp} className="inline-block text-xs font-bold uppercase tracking-widest text-blue-500 mb-4">How It Works</motion.span>
            <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">Get Matched in 3 Simple Steps</motion.h2>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 relative"
          >
            <div className="hidden md:block absolute top-10 left-[calc(33.33%+10px)] right-[calc(33.33%+10px)] dashed-connector h-0.5" />

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
            />
          </motion.div>
        </div>
      </section>

      {/* ─── FEATURES GRID ─── */}
      <section className="snap-section relative mesh-gradient-bg perspective-2000">
        <FloatingShapes />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center max-w-3xl mx-auto mb-20"
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
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
          >
            <FeatureCard index={0} icon={Zap} title="Instant Matching" description="Our DFS engine scans thousands of preferences to find direct and circular shifts in milliseconds." />
            <FeatureCard index={1} icon={RefreshCw} title="Circular Cycles" description="Unlock 3-way matches (A → B → C → A) that you would never find manually." />
            <FeatureCard index={2} icon={Shield} title="Verified Users" description="Secure onboarding with NIC validation ensures only genuine government employees can apply." />
            <FeatureCard index={3} icon={Users} title="Professional Profiles" description="List your Job Category, Grade, and Preferences with professional clarity." />
            <FeatureCard index={4} icon={Search} title="District Scouting" description="Browse vacancies and potential partners by district, province, or hospital hierarchy." />
            <FeatureCard index={5} icon={CheckCircle2} title="One-Click Accept" description="Express interest or accept a match instantly. We handle the communication chain." />
          </motion.div>
        </div>
      </section>

      {/* ─── PRICING SECTION ─── */}
      <section className="snap-section relative perspective-2000" id="pricing">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
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
            className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto"
          >
            <PricingCard
              name="Basic"
              price="0"
              description="Ideal for simple direct swaps."
              features={[
                "2-Way Mutual Transfers Only",
                "NIC Verification",
                "Includes Advertisements",
                "Basic Support"
              ]}
              highlighted={false}
            />
            <PricingCard
              name="Premium"
              price="1,500"
              description="For complex circular transfers."
              features={[
                "2-Way & 3-Way Transfers",
                "Priority Matching",
                "Advertisement-Free",
                "Detailed Station Analytics",
                "Priority Support"
              ]}
              highlighted={true}
            />
          </motion.div>
        </div>
      </section>

      {/* ─── CTA BANNER ─── */}
      <section className="snap-section relative overflow-hidden perspective-2000">
        <div className="absolute inset-0 bg-linear-to-r from-blue-50 via-violet-50/60 to-cyan-50" />
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
            <Sparkles className="w-10 h-10 text-blue-500 mx-auto mb-6" />
            <h2 className="text-2xl sm:text-4xl font-bold text-slate-900 mb-6 tracking-tight">
              Ready to Find Your{' '}
              <span className="shimmer-text">Perfect Transfer?</span>
            </h2>
            <p className="text-slate-600 mb-10 max-w-xl mx-auto leading-relaxed">
              Join thousands of government employees who have already found their ideal station match on MutualTransfer.lk.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center px-10 py-4.5 bg-linear-to-r from-blue-500 to-violet-500 text-white font-bold rounded-2xl shadow-2xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-1 transition-all duration-300 group"
            >
              Get Started Now
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
