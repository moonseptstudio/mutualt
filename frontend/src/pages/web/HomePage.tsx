import { 
  CheckCircle2, 
  ArrowRight, 
  Shield, 
  RefreshCw, 
  Zap, 
  Users, 
  Search,
  Check
} from 'lucide-react';
import { Link } from 'react-router-dom';

const FeatureCard = ({ icon: Icon, title, description }: any) => (
  <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 group">
    <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
      <Icon size={28} className="text-blue-600 transition-colors duration-300 group-hover:text-white" />
    </div>
    <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
    <p className="text-slate-600 leading-relaxed text-sm">{description}</p>
  </div>
);

const PricingCard = ({ name, price, description, features, highlighted }: any) => (
  <div className={`p-8 rounded-3xl border transition-all duration-300 ${
    highlighted 
      ? 'bg-slate-900 text-white border-slate-900 shadow-2xl shadow-slate-200 scale-105 z-10' 
      : 'bg-white text-slate-900 border-slate-200 shadow-sm'
  }`}>
    <h3 className="text-xl font-bold mb-2">{name}</h3>
    <p className={`text-sm mb-6 ${highlighted ? 'text-slate-400' : 'text-slate-500'}`}>{description}</p>
    <div className="flex items-baseline mb-8">
      <span className="text-4xl font-bold tracking-tight">Rs. {price}</span>
      <span className={`text-sm ml-2 ${highlighted ? 'text-slate-400' : 'text-slate-500'}`}>{price === "0" ? "/ forever" : "/ one-time"}</span>
    </div>
    <ul className="space-y-4 mb-10">
      {features.map((feature: any, idx: number) => (
        <li key={idx} className="flex items-center space-x-3 text-sm font-medium">
          <Check size={18} className={highlighted ? 'text-blue-400' : 'text-blue-600'} />
          <span>{feature}</span>
        </li>
      ))}
    </ul>
    <Link 
      to="/register" 
      className={`block text-center py-3 rounded-xl font-bold transition-all ${
        highlighted 
          ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20' 
          : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
      }`}
    >
      {price === "0" ? "Start for Free" : "Upgrade to Premium"}
    </Link>
  </div>
);

const HomePage = () => {
  return (
    <div className="relative overflow-hidden pt-10 pb-20">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-16 pb-24 relative overflow-hidden">
        <div className="inline-flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-full mb-8 border border-blue-100">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          <span className="text-blue-700 text-xs font-bold uppercase tracking-wider">New: Circular 3-Way Matches</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-semibold text-slate-900 mb-8 tracking-tighter leading-tight max-w-4xl mx-auto">
          Simplifying Mutual Transfers for <span className="text-blue-600">Government Employees.</span>
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-12 leading-relaxed">
          The ultimate platform for teachers, nurses, and doctors in Sri Lanka. Find your ideal station swap using our intelligent graph matching algorithm.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
          <Link to="/register" className="w-full sm:w-auto px-10 py-5 bg-blue-600 text-white font-medium rounded-2xl shadow-2xl shadow-blue-500/30 hover:bg-blue-700 hover:-translate-y-1 transition-all flex items-center justify-center">
            Register for Free
            <ArrowRight className="ml-2" size={20} />
          </Link>
          <Link to="/about" className="w-full sm:w-auto px-10 py-5 bg-white text-slate-900 font-bold rounded-2xl border-2 border-slate-100 hover:border-blue-100 hover:text-blue-600 transition-all flex items-center justify-center">
            How it works
          </Link>
        </div>
        
        {/* Abstract Background Elements */}
        <div className="absolute top-0 -left-64 w-96 h-96 bg-blue-400/10 blur-3xl rounded-full"></div>
        <div className="absolute bottom-0 -right-64 w-96 h-96 bg-purple-400/10 blur-3xl rounded-full"></div>
      </section>

      {/* Stats/Social Proof */}
      <section className="bg-slate-900 py-16 text-white mb-24 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center space-y-12 md:space-y-0">
          <div className="text-center md:text-left">
            <p className="text-5xl font-medium mb-2 tracking-tight">1500+</p>
            <p className="text-slate-400 text-sm font-bold uppercase tracking-wider">Registered Employees</p>
          </div>
          <div className="text-center md:text-left">
            <p className="text-5xl font-medium mb-2 tracking-tight">450+</p>
            <p className="text-slate-400 text-sm font-bold uppercase tracking-wider">Successful Transfers</p>
          </div>
          <div className="text-center md:text-left">
            <p className="text-5xl font-medium mb-2 tracking-tight">25+</p>
            <p className="text-slate-400 text-sm font-bold uppercase tracking-wider">Hospital Networks</p>
          </div>
          <div className="text-center md:text-left">
            <p className="text-5xl font-medium mb-2 tracking-tight">98%</p>
            <p className="text-slate-400 text-sm font-bold uppercase tracking-wider">Matching Accuracy</p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-32">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-semibold text-slate-900 mb-6 tracking-tight">Why Choose MutualTransfer.lk?</h2>
          <p className="text-slate-600">We replace traditional notice boards and social media groups with a data-driven matching engine tailored for Sri Lanka.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard 
            icon={Zap} 
            title="Instant Matching" 
            description="Our DFS engine scans thousands of preferences to find direct and circular shifts in milliseconds." 
          />
          <FeatureCard 
            icon={RefreshCw} 
            title="Circular Cycles" 
            description="Unlock 3-way matches (A -> B -> C -> A) that you would never find manually." 
          />
          <FeatureCard 
            icon={Shield} 
            title="Verified Users" 
            description="Secure onboarding with NIC validation ensures only genuine government employees can apply." 
          />
          <FeatureCard 
            icon={Users} 
            title="Professional Profiles" 
            description="List your Job Category, Grade, and Preferences with professional clarity." 
          />
          <FeatureCard 
            icon={Search} 
            title="District Scouting" 
            description="Browse vacancies and potential partners by district, province, or hospital hierarchy." 
          />
          <FeatureCard 
            icon={CheckCircle2} 
            title="One-Click Accept" 
            description="Express interest or accept a match instantly. We handle the communication chain." 
          />
        </div>
      </section>

      {/* Pricing Section */}
      <section className="bg-slate-50 py-24 border-y border-slate-200" id="pricing">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl font-semibold text-slate-900 mb-6 tracking-tight">Pricing & Packages</h2>
            <p className="text-slate-600">Select the plan that best fits your transfer goals.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
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
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
