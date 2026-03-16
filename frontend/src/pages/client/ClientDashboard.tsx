import {
    MapPin,
    ShieldCheck,
    Zap,
    ChevronRight,
    TrendingUp,
    Clock,
    Activity,
    MessageSquare,
    Mail
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useOutletContext } from 'react-router-dom';
import { getAvatarUrl } from '../../api/url';



const ClientDashboard = () => {
    const { user } = useAuth();
    const { globalSearchQuery, hasPackage }: any = useOutletContext();
    const navigate = useNavigate();
    const [matches, setMatches] = useState<any[]>([]);
    const [profile, setProfile] = useState<any>(null);
    const [requests, setRequests] = useState<{ incoming: any[], outgoing: any[] }>({ incoming: [], outgoing: [] });
    const [rooms, setRooms] = useState<any[]>([]);
    const [preferences, setPreferences] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [matchesRes, profileRes, requestsRes, roomsRes, prefsRes] = await Promise.all([
                    apiClient.get('/matches'),
                    apiClient.get('/profile/me'),
                    apiClient.get('/requests/me'),
                    apiClient.get('/messages/rooms'),
                    apiClient.get('/preferences')
                ]);
                setMatches(matchesRes.data);
                setProfile(profileRes.data);
                setRequests(requestsRes.data);
                setRooms(roomsRes.data);
                setPreferences(prefsRes.data);
            } catch (err) {
                console.error("Dashboard fetch error", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    const getGreeting = () => {
        const hour = currentTime.getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 17) return "Good Afternoon";
        return "Good Evening";
    };

    const StatsCard = ({ title, value, icon: Icon, color, trend }: any) => (
        <div className="glass-card p-6 rounded-[32px] border-[var(--border-main)] bg-[var(--bg-card)] shadow-xl shadow-[var(--shadow-main)] relative overflow-hidden group">
            <div className="relative z-10">
                <div className={`p-3 rounded-2xl ${color} inline-flex mb-4 shadow-sm`}>
                    <Icon size={20} className="text-white" />
                </div>
                <h4 className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">{title}</h4>
                <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-bold text-[var(--text-main)] tracking-tight">{value}</span>
                    {trend && <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded-md">{trend}</span>}
                </div>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500">
                <Icon size={120} />
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="animate-in fade-in duration-700 space-y-8">
                <div className="h-20 w-1/3 bg-slate-100 dark:bg-slate-800 rounded-3xl animate-pulse"></div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-40 bg-slate-100 dark:bg-slate-800 rounded-[32px] animate-pulse"></div>)}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 h-96 bg-slate-100 dark:bg-slate-800 rounded-[40px] animate-pulse"></div>
                    <div className="h-96 bg-slate-100 dark:bg-slate-800 rounded-[40px] animate-pulse"></div>
                </div>
            </div>
        );
    }

    const allRequests = [...requests.incoming, ...requests.outgoing]
        .filter(req => {
            if (!globalSearchQuery) return true;
            const term = globalSearchQuery.toLowerCase();
            return (req.senderName?.toLowerCase().includes(term) || req.receiverName?.toLowerCase().includes(term) || req.status?.toLowerCase().includes(term));
        })
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const filteredRooms = rooms.filter(room => {
        if (!globalSearchQuery) return true;
        const term = globalSearchQuery.toLowerCase();
        return room.members.some((m: any) => m.name?.toLowerCase().includes(term));
    });

    return (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-8 pb-10">
            {/* Top Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center space-x-2 text-primary-600 dark:text-primary-400 font-bold text-[10px] sm:text-[11px] uppercase tracking-[0.2em] mb-2">
                        <TrendingUp size={14} />
                        <span>Overview • {currentTime.toLocaleDateString([], { month: 'long', year: 'numeric' })}</span>
                    </div>
                    <h1 className="text-2xl sm:text-4xl font-semibold text-[var(--text-main)] tracking-tight leading-tight">
                        {getGreeting()}, <br className="sm:hidden" /> {profile?.fullName?.split(' ')[0] || user?.username}
                    </h1>
                </div>
                <div className="flex items-center space-x-3 sm:space-x-4 bg-[var(--bg-card)] backdrop-blur-xl p-1.5 sm:p-2 pr-4 sm:pr-6 rounded-2xl sm:rounded-[24px] border border-[var(--border-main)] shadow-sm w-fit">
                    <div className="p-2 sm:p-3 bg-primary-600 text-white rounded-xl sm:rounded-2xl shadow-lg shadow-primary-500/20">
                        <Clock size={20} />
                    </div>
                    <div>
                        <p className="text-[9px] sm:text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest leading-none mb-1">Local Time</p>
                        <p className="text-base sm:text-lg font-bold text-[var(--text-main)] leading-none">
                            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Active Matches"
                    value={matches.length}
                    icon={Zap}
                    color="bg-indigo-500"
                    trend={matches.length > 0 ? "+High" : null}
                />
                <StatsCard
                    title="Match Requests"
                    value={allRequests.length}
                    icon={Activity}
                    color="bg-primary-500"
                />
                <StatsCard
                    title="Messages"
                    value={rooms.length}
                    icon={MessageSquare}
                    color="bg-emerald-500"
                    trend="Live"
                />
                <StatsCard
                    title="Preferences"
                    value={preferences.length}
                    icon={MapPin}
                    color="bg-amber-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Featured Match Card */}
                    {matches.length > 0 ? (
                        <div className="premium-gradient rounded-[40px] p-8 sm:p-10 text-white relative overflow-hidden shadow-2xl shadow-slate-900/40 group">
                            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                                <div className="max-w-md">
                                    <div className="flex items-center space-x-2 text-primary-400 mb-4 sm:mb-6 bg-white/10 w-fit px-3 py-1 rounded-full backdrop-blur-md border border-white/10">
                                        <ShieldCheck size={16} fill="currentColor" />
                                        <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest opacity-80">Verified Match</span>
                                    </div>
                                    <h2 className="text-xl sm:text-3xl font-medium mb-3 sm:mb-4 tracking-tight leading-tight">
                                        Perfect Match at <br /><span className="text-white font-bold">{matches[0].participants.find((p: any) => p.userId !== user?.id)?.stationName}</span>
                                    </h2>
                                    <h4 className="text-white/80 font-bold mb-4">
                                        Partner: {(() => {
                                            const partner = matches[0].participants.find((p: any) => p.userId !== user?.id);
                                            return partner?.name;
                                        })()}
                                    </h4>
                                    <p className="text-white/60 text-sm font-medium leading-relaxed mb-8">
                                        You have a highly compatible mutual transfer match. Start a request to view contact details and initialize the official process.
                                    </p>
                                    <div className="flex items-center space-x-4">
                                        <button
                                            onClick={() => navigate('/matches')}
                                            className="px-8 py-4 bg-white text-slate-950 font-bold rounded-2xl hover:bg-primary-50 transition-all hover:scale-105 active:scale-95 text-xs uppercase tracking-widest shadow-xl"
                                        >
                                            View Match Details
                                        </button>
                                        <div className="hidden sm:flex -space-x-3">
                                            {matches[0].participants.map((p: any, i: number) => {
                                                const isCurrentUser = p.userId === user?.id;
                                                const displayImageUrl = isCurrentUser ? p.profileImageUrl : (hasPackage ? p.profileImageUrl : null);
                                                const displayName = isCurrentUser ? p.name : (hasPackage ? p.name : p.name);
                                                return (
                                                    <div key={i} className="w-10 h-10 rounded-xl border-2 border-white/20 bg-white/10 backdrop-blur-md flex items-center justify-center overflow-hidden">
                                                        <img src={getAvatarUrl(displayImageUrl, displayName)} alt="user" />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                                <div className="hidden md:block relative">
                                    <div className="w-32 h-32 bg-white/10 rounded-[40px] backdrop-blur-md border border-white/20 flex items-center justify-center rotate-6 group-hover:rotate-12 transition-transform duration-700">
                                        <Zap size={64} className="text-primary-400" />
                                    </div>
                                    <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-emerald-500 rounded-[20px] shadow-lg flex items-center justify-center -rotate-12 group-hover:-rotate-6 transition-transform duration-700">
                                        <ShieldCheck size={32} className="text-white" />
                                    </div>
                                </div>
                            </div>
                            <div className="absolute top-0 right-0 w-80 h-80 bg-primary-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4"></div>
                            <div className="absolute bottom-0 left-1/4 w-40 h-40 bg-indigo-500/30 rounded-full blur-[80px]"></div>
                        </div>
                    ) : (
                        <div className="glass-card rounded-[40px] p-10 text-center border-dashed border-2 border-[var(--border-main)] bg-[var(--bg-card)]">
                            <MapPin size={48} className="mx-auto text-slate-300 dark:text-slate-700 mb-6" />
                            <h3 className="text-xl font-bold text-[var(--text-main)]">Finding your perfect match...</h3>
                            <p className="text-sm text-[var(--text-muted)] mt-2 max-w-sm mx-auto">Add more hospital preferences to increase your chances of finding a 2-way or 3-way match.</p>
                            <button
                                onClick={() => navigate('/preferences')}
                                className="mt-8 px-8 py-4 bg-slate-900 dark:bg-primary-600 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-800 dark:hover:bg-primary-700 transition-all shadow-lg active:scale-95"
                            >
                                Update Preferences
                            </button>
                        </div>
                    )}

                    {/* Recent Activity Feed */}
                    <div className="glass-card rounded-3xl sm:rounded-[40px] p-6 sm:p-8 border-[var(--border-main)] bg-[var(--bg-card)] shadow-xl shadow-[var(--shadow-main)]">
                        <div className="flex items-center justify-between mb-6 sm:mb-8 px-1 sm:px-2 border-b border-[var(--border-main)] pb-4 sm:pb-6">
                            <div>
                                <h3 className="text-lg sm:text-xl font-bold text-[var(--text-main)] tracking-tight">Recent Activity</h3>
                                <p className="text-[10px] sm:text-xs font-medium text-[var(--text-muted)] mt-1">Updates on your transfer requests</p>
                            </div>
                            <button onClick={() => navigate('/requests')} className="text-[9px] sm:text-[10px] font-bold text-primary-600 dark:text-primary-400 uppercase tracking-widest bg-primary-50 dark:bg-primary-900/20 px-2.5 py-1.5 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors">See Feed</button>
                        </div>
                        <div className="space-y-4">
                            {allRequests.length > 0 ? (
                                allRequests.slice(0, 4).map((req, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-[var(--bg-main)]/50 rounded-[24px] border border-[var(--border-main)] hover:border-primary-200 dark:hover:border-primary-800 transition-all hover:shadow-sm">
                                        <div className="flex items-center space-x-4">
                                            <div className={`p-2.5 rounded-xl ${req.status === 'ACCEPTED' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600' : req.status === 'PENDING' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600' : 'bg-rose-50 dark:bg-rose-500/10 text-rose-600'}`}>
                                                {req.status === 'ACCEPTED' ? <ShieldCheck size={18} /> : <Clock size={18} />}
                                            </div>
                                            <div>
                                                <p className="text-[13px] font-bold text-[var(--text-main)]">
                                                    {req.senderId === user?.id 
                                                        ? `Request sent to ${req.receiverName}` 
                                                        : `Request from ${req.senderName}`}
                                                </p>
                                                <div className="flex items-center mt-1 space-x-2">
                                                    <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
                                                        {new Date(req.createdAt).toLocaleDateString([], { day: 'numeric', month: 'short' })}
                                                    </span>
                                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-tighter ${req.status === 'ACCEPTED' ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                                                        {req.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <ChevronRight size={14} className="text-slate-300 dark:text-slate-700" />
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-10">
                                    <Activity size={32} className="mx-auto text-slate-200 mb-3" />
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">No recent activity</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Sidebar Section */}
                <div className="space-y-8">
                    {/* Active Chats Quick-Access */}
                    <div className="glass-card rounded-[40px] p-8 border border-[var(--border-main)] bg-[var(--bg-card)]">
                        <div className="flex items-center justify-between mb-8 px-2 border-b border-[var(--border-main)] pb-4">
                            <h4 className="font-bold text-[var(--text-main)] uppercase tracking-widest text-[11px]">Active Conversations</h4>
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                        </div>
                        <div className="space-y-4">
                            {filteredRooms.length > 0 ? (
                                filteredRooms.slice(0, 3).map((room, i) => {
                                    const partner = room.members.find((m: any) => m.id !== user?.id) || room.members[0];
                                    return (
                                        <div
                                            key={i}
                                            onClick={() => navigate(`/messages?room=${room.id}`)}
                                            className="flex items-center space-x-3 sm:space-x-4 p-2 sm:p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl sm:rounded-[20px] transition-all cursor-pointer group"
                                        >
                                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-100 dark:bg-slate-800 rounded-xl sm:rounded-2xl overflow-hidden shadow-sm border border-[var(--border-main)] shrink-0">
                                                <img src={getAvatarUrl(hasPackage ? partner.avatar : null, partner.name)} alt="avatar" />
                                            </div>
                                            <div className="grow min-w-0">
                                                <p className="text-xs sm:text-sm font-bold text-[var(--text-main)] truncate leading-tight group-hover:text-primary-600 transition-colors">
                                                    {room.type === 'GROUP' ? 'Match Group Chat' : (partner.name)}
                                                </p>
                                                <p className="text-[9px] sm:text-[10px] text-[var(--text-muted)] font-medium truncate mt-1 uppercase tracking-tighter">
                                                    {room.type === 'GROUP' ? `${room.members.length} members` : partner.stationName || 'Staff Member'}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center py-6 bg-slate-50/50 dark:bg-slate-800/30 rounded-3xl border border-dashed border-[var(--border-main)]">
                                    <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">No active chats</p>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => navigate('/messages')}
                            className="w-full mt-6 py-4 bg-slate-900 dark:bg-primary-600 text-white rounded-[24px] text-[10px] font-bold uppercase tracking-widest hover:bg-primary-600 dark:hover:bg-primary-700 transition-all shadow-lg active:scale-95"
                        >
                            Open Messenger
                        </button>
                    </div>

                    {/* Verification Panel */}
                    <div className="glass-card rounded-[40px] p-8 border border-[var(--border-main)] bg-[var(--bg-card)]">
                        <div className="flex items-center space-x-4 mb-8">
                            <div className="w-12 h-12 bg-[var(--bg-main)] rounded-2xl shadow-md border border-[var(--border-main)] flex items-center justify-center text-primary-500">
                                <ShieldCheck size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold text-[var(--text-main)] tracking-tight leading-tight">Trust & Verification</h4>
                                <div className="flex items-center space-x-2 mt-1">
                                    <div className="h-1.5 w-16 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-primary-500/10 dark:bg-primary-500 rounded-full transition-all duration-1000" style={{ width: `${((profile?.verificationLevel || 1) / 3) * 100}%` }}></div>
                                    </div>
                                    <span className="text-[10px] font-bold text-primary-600 dark:text-primary-400">{Math.round(((profile?.verificationLevel || 1) / 3) * 100)}% Score</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-5">
                            {[
                                { label: 'Identity Document (NIC)', status: 'Completed', icon: ShieldCheck, color: 'text-emerald-500' },
                                { label: 'Email Address OTP', status: profile?.verificationLevel >= 2 ? 'Completed' : 'Pending', icon: Mail, color: profile?.verificationLevel >= 2 ? 'text-emerald-500' : 'text-amber-500' },
                                { label: 'Phone Number SMS', status: profile?.verificationLevel >= 3 ? 'Completed' : 'Pending', icon: Zap, color: profile?.verificationLevel >= 3 ? 'text-emerald-500' : 'text-amber-500' }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-1.5 bg-[var(--bg-main)] rounded-lg border border-[var(--border-main)] shadow-sm text-slate-400">
                                            <item.icon size={14} />
                                        </div>
                                        <span className="text-xs font-bold text-[var(--text-main)] sm:opacity-80">{item.label}</span>
                                    </div>
                                    <span className={`text-[9px] font-bold uppercase tracking-widest ${item.color}`}>{item.status}</span>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => navigate('/profile')}
                            className="w-full mt-8 py-3.5 bg-[var(--bg-main)] border border-[var(--border-main)] rounded-2xl text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:border-primary-200 hover:text-primary-600 dark:hover:text-primary-400 transition-all shadow-sm"
                        >
                            Boost Trust Score
                        </button>
                    </div>

                    {/* Pro Banner */}
                    <div className="bg-slate-950 rounded-[40px] p-8 text-white relative overflow-hidden group shadow-2xl shadow-slate-900/10">
                        <div className="relative z-10">
                            <Zap size={32} className="text-primary-400 mb-6 group-hover:scale-110 transition-transform duration-500" />
                            <h4 className="text-lg font-bold tracking-tight mb-2">Upgrade to MutualT Pro</h4>
                            <p className="text-white/40 text-[11px] font-medium leading-relaxed mb-6">
                                Experience unlimited matching, real-time alerts, and advanced profile statistics.
                            </p>
                            <div className="flex items-baseline space-x-1 mb-6">
                                <span className="text-2xl font-bold">Rs. 450</span>
                                <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">/ month</span>
                            </div>
                            <button className="w-full py-4 bg-white text-slate-950 rounded-[20px] text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg hover:bg-primary-50 transition-all active:scale-95">
                                Upgrade Now
                            </button>
                        </div>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClientDashboard;
