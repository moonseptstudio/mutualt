import { useState, useEffect } from 'react';
import {
    Users,
    Activity,
    CheckCircle2,
    AlertCircle,
    TrendingUp,
    ArrowUpRight,
    ShieldCheck,
    Globe,
    RefreshCw,
    Clock,
    Zap
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import apiClient from '../../api/client';

const StatCard = ({ title, value, change, icon: Icon, trend, delay }: any) => (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
        className="glass-card p-6 rounded-[32px] overflow-hidden relative group transition-all hover:scale-[1.02] duration-500"
    >
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
    </motion.div>
);

const AdminDashboard = () => {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setRefreshing(true);
            const response = await apiClient.get('/admin/users/stats');
            setStats(response.data);
        } catch (err) {
            console.error("Failed to fetch stats", err);
            toast.error("Failed to load dashboard statistics");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-slate-200 border-t-primary-600 rounded-full animate-spin"></div>
                    <div className="mt-4 text-slate-500 font-medium animate-pulse">Loading Analytics...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-semibold text-slate-950 tracking-tight leading-none">System Analytics</h1>
                    <p className="text-slate-500 mt-2 font-medium">Real-time infrastructure and user engagement overview.</p>
                </div>
                <div className="flex items-center space-x-2 bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
                    <button 
                        onClick={fetchStats}
                        disabled={refreshing}
                        className="flex items-center space-x-2 px-4 py-2 bg-slate-950 text-white text-xs font-medium rounded-xl shadow-lg cursor-pointer hover:bg-slate-800 transition-all disabled:opacity-50"
                    >
                        <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
                        <span>{refreshing ? 'Refreshing...' : 'Live Sync'}</span>
                    </button>
                    <button
                        onClick={() => toast('Historical data view coming soon', { icon: '📊' })}
                        className="px-4 py-2 text-slate-500 text-xs font-bold hover:bg-slate-50 rounded-xl transition-all cursor-pointer"
                    >
                        Historical
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Active Users" 
                    value={stats?.totalUsers?.toLocaleString() || '0'} 
                    change="+12.5%" 
                    icon={Users} 
                    trend="up" 
                    delay={0.1}
                />
                <StatCard 
                    title="Premium Accounts" 
                    value={stats?.activePremiumUsers?.toLocaleString() || '0'} 
                    change="+8.2%" 
                    icon={CheckCircle2} 
                    trend="up" 
                    delay={0.2}
                />
                <StatCard 
                    title="Pending NIC" 
                    value={stats?.pendingVerifications || '0'} 
                    change={stats?.pendingVerifications > 10 ? 'Action Required' : 'Optimal'} 
                    icon={AlertCircle} 
                    trend={stats?.pendingVerifications > 10 ? 'down' : 'up'} 
                    delay={0.3}
                />
                <StatCard 
                    title="System Load" 
                    value={`${stats?.systemLoad}%`} 
                    change="Stable" 
                    icon={Activity} 
                    trend="up" 
                    delay={0.4}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="lg:col-span-2 glass-card rounded-[40px] p-8 border border-white relative overflow-hidden"
                >
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h3 className="text-xl font-semibold text-slate-900 tracking-tight">Matching Velocity</h3>
                            <p className="text-slate-500 text-sm font-medium">Daily transfer completion engagement</p>
                        </div>
                        <button
                            onClick={() => toast('Detailed velocity report coming soon', { icon: '📈' })}
                            className="p-2 hover:bg-slate-100 rounded-full transition-all cursor-pointer"
                        >
                            <ArrowUpRight size={20} className="text-slate-400" />
                        </button>
                    </div>

                    <div className="h-64 flex items-end justify-between space-x-3 px-4 mt-6">
                        {stats?.recentActivity?.map((activity: any, i: number) => (
                            <div
                                key={i}
                                className="w-full bg-slate-900/5 rounded-t-2xl relative group cursor-pointer"
                                style={{ height: '100%' }}
                            >
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${activity.value}%` }}
                                    transition={{ duration: 1, delay: 0.6 + (i * 0.1) }}
                                    className="absolute bottom-0 left-0 right-0 bg-slate-900 rounded-t-2xl transition-all duration-300 group-hover:bg-primary-500"
                                >
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-950 text-white text-xs font-medium px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                        {activity.value} reqs
                                    </div>
                                </motion.div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-6 px-4">
                        {stats?.recentActivity?.map((activity: any, i: number) => (
                            <span key={i} className="text-xs font-medium text-slate-400 uppercase tracking-wider">{activity.day}</span>
                        ))}
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.7 }}
                    className="premium-gradient rounded-[40px] p-8 text-white relative flex flex-col justify-between shadow-2xl shadow-slate-900/40"
                >
                    <div className="relative z-10">
                        <div className="flex items-center space-x-3 mb-8">
                            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md border border-white/20 text-primary-400">
                                <Globe size={24} />
                            </div>
                            <span className="text-sm font-medium tracking-wider uppercase opacity-60">System Core</span>
                        </div>
                        <h2 className="text-3xl font-medium mb-4 tracking-tight leading-tight">Infrastructure is Optimal</h2>
                        <p className="text-white/60 text-sm font-medium leading-relaxed mb-8">
                            Total matches processed: <span className="text-white">{stats?.totalMatchRequests}</span>. 
                            Security protocols are active and monitoring for threats.
                        </p>
                    </div>

                    <div className="relative z-10 p-6 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-md">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-medium uppercase tracking-wider opacity-60">Status Check</span>
                            <ShieldCheck size={16} className="text-emerald-400" />
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></div>
                            <span className="text-lg font-semibold tracking-tight">Active & Secure</span>
                        </div>
                    </div>

                    {/* Decorative elements */}
                    <div className="absolute top-1/2 right-0 w-64 h-64 bg-primary-600/20 rounded-full blur-3xl -translate-y-1/2 pointer-events-none"></div>
                </motion.div>
            </div>
            
            {/* System Activity Feed */}
            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="glass-card rounded-[40px] p-8 border border-white"
            >
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-xl font-semibold text-slate-900 tracking-tight">System Events</h3>
                        <p className="text-slate-500 text-sm font-medium">Recent critical operations and alerts</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {stats?.systemEvents?.length > 0 ? stats.systemEvents.map((event: any, i: number) => {
                        const Icon = event.icon === 'Users' ? Users : (event.icon === 'Zap' ? Zap : ShieldCheck);
                        return (
                            <div key={i} className="flex items-center justify-between p-4 rounded-3xl hover:bg-white transition-all group border border-transparent hover:border-slate-100 hover:shadow-sm">
                                <div className="flex items-center space-x-4">
                                    <div className={`p-3 bg-${event.color === 'slate' ? 'slate-100' : event.color + '-50'} text-${event.color === 'slate' ? 'slate-500' : event.color + '-600'} rounded-2xl group-hover:scale-110 transition-transform`}>
                                        <Icon size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900">{event.type}</p>
                                        <p className="text-xs text-slate-500 font-medium">{event.msg}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2 text-slate-400">
                                    <Clock size={14} />
                                    <span className="text-xs font-semibold">{event.time}</span>
                                </div>
                            </div>
                        );
                    }) : (
                        <div className="text-center py-10">
                            <Activity size={32} className="mx-auto text-slate-200 mb-3" />
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">No recent events</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default AdminDashboard;
