import {
    Users,
    Activity,
    CheckCircle2,
    AlertCircle,
    TrendingUp,
    ArrowUpRight,
    ShieldCheck,
    Globe
} from 'lucide-react';

const StatCard = ({ title, value, change, icon: Icon, trend }: any) => (
    <div className="glass-card p-6 rounded-[32px] overflow-hidden relative group transition-all hover:scale-[1.02] duration-500">
        <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-slate-900 rounded-2xl text-white group-hover:bg-primary-600 transition-colors duration-500">
                <Icon size={24} />
            </div>
            <div className={`flex items-center space-x-1 text-xs font-medium ${trend === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>
                <span>{change}</span>
                <TrendingUp size={14} className={trend === 'up' ? '' : 'rotate-180'} />
            </div>
        </div>
        <p className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-1">{title}</p>
        <p className="text-3xl font-semibold text-slate-900">{value}</p>

        <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-slate-50 rounded-full opacity-20 blur-2xl group-hover:bg-primary-200 transition-all duration-700"></div>
    </div>
);

const AdminDashboard = () => {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-semibold text-slate-950 tracking-tight leading-none">System Analytics</h1>
                    <p className="text-slate-500 mt-2 font-medium">Real-time infrastructure and user engagement overview.</p>
                </div>
                <div className="flex items-center space-x-2 bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
                    <button className="px-4 py-2 bg-slate-950 text-white text-xs font-medium rounded-xl shadow-lg">Real-time</button>
                    <button className="px-4 py-2 text-slate-500 text-xs font-bold hover:bg-slate-50 rounded-xl transition-all">Historical</button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Active Users" value="1,240" change="+12.5%" icon={Users} trend="up" />
                <StatCard title="Total Revenue" value="Rs. 84.5k" change="+8.2%" icon={CheckCircle2} trend="up" />
                <StatCard title="Pending NIC" value="12" change="-2" icon={AlertCircle} trend="down" />
                <StatCard title="System Load" value="24%" change="Stable" icon={Activity} trend="up" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 glass-card rounded-[40px] p-8 border border-white relative overflow-hidden">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h3 className="text-xl font-semibold text-slate-900 tracking-tight">Matching Velocity</h3>
                            <p className="text-slate-500 text-sm font-medium">Weekly transfer completion rate</p>
                        </div>
                        <button className="p-2 hover:bg-slate-100 rounded-full transition-all">
                            <ArrowUpRight size={20} className="text-slate-400" />
                        </button>
                    </div>

                    <div className="h-64 flex items-end justify-between space-x-3 px-4">
                        {[45, 60, 40, 80, 55, 90, 70, 85, 65, 95].map((h, i) => (
                            <div
                                key={i}
                                className="w-full bg-slate-900/5 rounded-t-2xl relative group cursor-pointer"
                                style={{ height: '100%' }}
                            >
                                <div
                                    className="absolute bottom-0 left-0 right-0 bg-slate-900 rounded-t-2xl transition-all duration-1000 group-hover:bg-primary-500"
                                    style={{ height: `${h}%` }}
                                >
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-950 text-white text-xs font-medium px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                        {h}% Val
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-6 px-4">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed'].map((d, i) => (
                            <span key={i} className="text-xs font-medium text-slate-400 uppercase tracking-wider">{d}</span>
                        ))}
                    </div>
                </div>

                <div className="premium-gradient rounded-[40px] p-8 text-white relative flex flex-col justify-between shadow-2xl shadow-slate-900/40">
                    <div className="relative z-10">
                        <div className="flex items-center space-x-3 mb-8">
                            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md border border-white/20">
                                <Globe size={24} className="text-primary-400" />
                            </div>
                            <span className="text-sm font-medium tracking-wider uppercase opacity-60">Global Status</span>
                        </div>
                        <h2 className="text-3xl font-medium mb-4 tracking-tight leading-tight">System Infrastructure is Optimal</h2>
                        <p className="text-white/60 text-sm font-medium leading-relaxed mb-8">
                            All 14 regional nodes are operational. Latency is within 45ms.
                        </p>
                    </div>

                    <div className="relative z-10 p-6 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-md">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-medium uppercase tracking-wider opacity-60">Encryption</span>
                            <ShieldCheck size={16} className="text-emerald-500" />
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-lg font-semibold tracking-tight">AES-256 Active</span>
                        </div>
                    </div>

                    {/* Decorative elements */}
                    <div className="absolute top-1/2 right-0 w-64 h-64 bg-primary-600/20 rounded-full blur-3xl -translate-y-1/2 pointer-events-none"></div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
