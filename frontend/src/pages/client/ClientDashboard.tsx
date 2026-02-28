import {
    MapPin,
    UserCircle,
    ShieldCheck,
    Zap,
    ChevronRight,
    TrendingUp,
    Clock
} from 'lucide-react';
import { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const MatchCard = ({ match, currentUserId }: any) => {
    // Find the partner (the other person in 2-way, or others in 3-way)
    const partner = match.participants.find((p: any) => p.userId !== currentUserId) || match.participants[0];

    return (
        <div className="glass-card p-6 rounded-[32px] group hover:scale-[1.02] transition-all duration-500 cursor-pointer">
            <div className="flex justify-between items-start mb-6">
                <div className={`px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider border ${match.type === 'Triple' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-primary-50 text-primary-600 border-primary-100'
                    }`}>
                    {match.type} Match
                </div>
                <div className="p-2 bg-slate-900 rounded-xl text-white opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 group-hover:duration-500">
                    <ChevronRight size={16} />
                </div>
            </div>

            <div className="flex items-center space-x-4 mb-6">
                <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center font-medium text-slate-800 border-2 border-white shadow-sm overflow-hidden">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${partner.name}`} alt="avatar" />
                </div>
                <div>
                    <h4 className="font-semibold text-slate-900">{partner.name}</h4>
                    <p className="text-xs font-bold text-slate-400 flex items-center mt-0.5">
                        <MapPin size={12} className="mr-1" />
                        {partner.stationName}
                    </p>
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-400 uppercase tracking-wider">Compatibility</span>
                    <span className="font-medium text-emerald-500">98% Match</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-linear-to-r from-emerald-400 to-emerald-500 w-[98%] rounded-full shadow-lg shadow-emerald-200"></div>
                </div>
            </div>
        </div>
    );
};

const ClientDashboard = () => {
    const { user } = useAuth();
    const [matches, setMatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await apiClient.get('/matches');
                setMatches(response.data);
            } catch (err) {
                console.error("Dashboard fetch error", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    const tripleMatch = matches.find(m => m.type === 'Triple');

    return (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-8">
            <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-semibold text-slate-950 tracking-tight leading-none">
                        Welcome, {user?.username}
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium">Your mutual transfer overview for <span className="text-primary-600 font-bold">March 2026</span>.</p>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="flex -space-x-3">
                        {matches.slice(0, 3).map((m, i) => (
                            <div key={i} className="w-10 h-10 rounded-full border-4 border-slate-50 overflow-hidden bg-slate-200">
                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${m.participants[1]?.name}`} alt="user" />
                            </div>
                        ))}
                        {matches.length > 3 && (
                            <div className="w-10 h-10 rounded-full border-4 border-slate-50 bg-slate-900 flex items-center justify-center text-xs font-medium text-white">
                                +{matches.length - 3}
                            </div>
                        )}
                    </div>
                    <p className="text-xs font-bold text-slate-400 leading-tight">
                        Potential matches<br />in your sector
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-8">
                    {tripleMatch && (
                        <div className="premium-gradient rounded-[40px] p-10 text-white relative overflow-hidden shadow-2xl shadow-slate-900/40 animate-in zoom-in-95 duration-500">
                            <div className="relative z-10 max-w-lg">
                                <div className="flex items-center space-x-2 text-primary-400 mb-6">
                                    <Zap size={20} fill="currentColor" />
                                    <span className="text-xs font-medium uppercase tracking-wider opacity-80">High Priority Match</span>
                                </div>
                                <h2 className="text-3xl font-medium mb-4 tracking-tight leading-tight">3-Way Match Detected</h2>
                                <p className="text-white/60 text-base font-medium leading-relaxed mb-8">
                                    A potential cycle has been closed between <b>{tripleMatch.participants[1]?.stationName}</b>, <b>{tripleMatch.participants[2]?.stationName}</b>, and your current station. Unlock to contact participants.
                                </p>
                                <button className="px-8 py-4 bg-white text-slate-950 font-medium rounded-2xl hover:bg-primary-50 transition-all hover:scale-105 active:scale-95 text-sm shadow-xl">
                                    Unlock Match Chain
                                </button>
                            </div>

                            <div className="absolute top-0 right-0 w-80 h-80 bg-primary-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4"></div>
                            <div className="absolute bottom-0 left-1/4 w-40 h-40 bg-indigo-500/20 rounded-full blur-[80px]"></div>
                        </div>
                    )}

                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-semibold text-slate-900 tracking-tight">Personalized Matches</h3>
                            <button className="text-xs font-medium text-primary-600 uppercase tracking-wider hover:text-primary-800 transition-colors">See All</button>
                        </div>
                        {loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="h-64 glass-card rounded-[32px] animate-pulse"></div>
                                <div className="h-64 glass-card rounded-[32px] animate-pulse shadow-sm"></div>
                            </div>
                        ) : matches.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {matches.map((m, i) => <MatchCard key={i} match={m} currentUserId={user?.id} />)}
                            </div>
                        ) : (
                            <div className="p-12 glass-card rounded-[32px] text-center">
                                <MapPin size={48} className="mx-auto text-slate-200 mb-4" />
                                <p className="text-slate-500 font-medium">No matches found yet. Keep your preferences updated!</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="glass-card rounded-[40px] p-8 border border-white">
                        <div className="flex items-center space-x-3 mb-8">
                            <div className="p-3 bg-slate-950 rounded-2xl text-white shadow-lg">
                                <UserCircle size={24} />
                            </div>
                            <div>
                                <h4 className="font-semibold text-slate-900 leading-tight tracking-tight">Verification Status</h4>
                                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Active Level 2</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {[
                                { label: 'Identity Verified', icon: ShieldCheck, status: 'Completed', color: 'text-emerald-500' },
                                { label: 'Service Letter', icon: Clock, status: 'Reviewing', color: 'text-amber-500' },
                                { label: 'Biometrics', icon: Zap, status: 'Pending', color: 'text-slate-400' }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <item.icon size={18} className="text-slate-400" />
                                        <span className="text-sm font-bold text-slate-700">{item.label}</span>
                                    </div>
                                    <span className={`text-xs font-medium uppercase tracking-wider ${item.color}`}>{item.status}</span>
                                </div>
                            ))}
                        </div>

                        <button className="w-full mt-10 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] font-semibold text-slate-900 uppercase tracking-wider hover:bg-slate-100 transition-all active:scale-95">
                            Complete Profile
                        </button>
                    </div>

                    <div className="bg-slate-950 rounded-[40px] p-8 text-white relative overflow-hidden group">
                        <div className="relative z-10 flex flex-col h-full">
                            <TrendingUp size={32} className="text-emerald-500 mb-6 group-hover:scale-110 transition-transform duration-500" />
                            <h4 className="text-lg font-semibold tracking-tight mb-2">Upgrade to Pro</h4>
                            <p className="text-white/50 text-xs font-medium leading-relaxed mb-6">
                                Get instant notifications for new matches and priority sorting.
                            </p>
                            <div className="mt-auto">
                                <div className="flex items-baseline space-x-1 mb-4">
                                    <span className="text-2xl font-medium">Rs. 450</span>
                                    <span className="text-xs font-medium text-white/40 uppercase tracking-wider">/ month</span>
                                </div>
                                <button className="w-full py-3 bg-white text-slate-950 rounded-xl text-xs font-medium shadow-lg shadow-white/5 hover:bg-primary-50 transition-all">
                                    Get Unlimited
                                </button>
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClientDashboard;
