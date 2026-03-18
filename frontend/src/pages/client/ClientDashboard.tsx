import {
    MapPin,
    ShieldCheck,
    Zap,
    ChevronRight,
    Clock,
    Activity,
    MessageSquare
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router-dom';
import UserGuideWidget from '../../components/dashboard/UserGuideWidget';
import PageLoader from '../../components/common/PageLoader';

import { getAvatarUrl } from '../../api/url';



const ClientDashboard = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const { globalSearchQuery, hasPackage }: any = useOutletContext();
    const navigate = useNavigate();
    const [matches, setMatches] = useState<any[]>([]);
    const [profile, setProfile] = useState<any>(null);
    const [requests, setRequests] = useState<{ incoming: any[], outgoing: any[] }>({ incoming: [], outgoing: [] });
    const [rooms, setRooms] = useState<any[]>([]);
    const [preferences, setPreferences] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

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



    const StatsCard = ({ title, value, icon: Icon, color, trend, path }: any) => (
        <div 
            onClick={() => path && navigate(path)}
            className="glass-card p-4 sm:p-6 rounded-2xl sm:rounded-[32px] border-(--border-main) bg-(--bg-card) shadow-(--shadow-main) relative overflow-hidden group cursor-pointer hover:scale-[1.02] active:scale-95 transition-all duration-300"
        >
            <div className="relative z-10">
                <div className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl ${color} inline-flex mb-2 sm:mb-4 shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                    <Icon size={20} className="text-white" />
                </div>
                <h4 className="text-[9px] sm:text-[11px] font-bold text-(--text-muted) uppercase tracking-widest mb-1">{title}</h4>
                <div className="flex items-baseline space-x-2">
                    <span className="text-2xl sm:text-3xl font-bold text-(--text-main) tracking-tight">{value}</span>
                    {trend && <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded-md">{trend}</span>}
                </div>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.1] group-hover:-rotate-12 transition-all duration-500">
                <Icon size={120} />
            </div>
        </div>
    );

    if (loading) {
        return <PageLoader />;
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

    const getRemainingDays = () => {
        if (!profile?.subscriptionEndDate) return 0;
        
        let end;
        if (Array.isArray(profile.subscriptionEndDate)) {
            const [y, m, d, h, min] = profile.subscriptionEndDate;
            end = new Date(y, m - 1, d, h || 0, min || 0);
        } else {
            end = new Date(profile.subscriptionEndDate);
        }

        if (isNaN(end.getTime())) return 0;
        
        const diff = end.getTime() - new Date().getTime();
        return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 pb-10">
            <div className="mb-6 lg:mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold text-(--text-main) tracking-tight">
                    {t('dashboard.welcome_heading', { name: profile?.fullName?.split(' ')[0] || user?.username || '' })}
                </h1>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatsCard
                            title={t('dashboard.stats.active_matches')}
                            value={matches.length}
                            icon={Zap}
                            color="bg-indigo-500"
                            trend={matches.length > 0 ? "+High" : null}
                            path="/matches"
                        />
                        <StatsCard
                            title={t('dashboard.stats.match_requests')}
                            value={allRequests.length}
                            icon={Activity}
                            color="bg-primary-500"
                            path="/requests"
                        />
                        <StatsCard
                            title={t('dashboard.stats.messages')}
                            value={rooms.length}
                            icon={MessageSquare}
                            color="bg-emerald-500"
                            trend="Live"
                            path="/messages"
                        />
                        <StatsCard
                            title={t('dashboard.stats.preferences')}
                            value={preferences.length}
                            icon={MapPin}
                            color="bg-amber-500"
                            path="/preferences"
                        />
                    </div>

                    {/* Featured Match Card */}
                    {matches.length > 0 ? (
                        <div className="premium-gradient rounded-3xl sm:rounded-[40px] p-5 sm:p-10 text-white relative overflow-hidden shadow-2xl shadow-slate-900/40 group">
                            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                                <div className="max-w-md">
                                    <div className="flex items-center space-x-2 text-primary-400 mb-4 sm:mb-6 bg-white/10 w-fit px-3 py-1 rounded-full backdrop-blur-md border border-white/10">
                                        <ShieldCheck size={16} fill="currentColor" />
                                        <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest opacity-80">{t('dashboard.featured.verified')}</span>
                                    </div>
                                    <h2 className="text-xl sm:text-3xl font-medium mb-3 sm:mb-4 tracking-tight leading-tight">
                                        {t('dashboard.featured.perfect_match_at')} <br /><span className="text-white font-bold">{matches[0].participants.find((p: any) => p.userId !== user?.id)?.stationName}</span>
                                    </h2>
                                    <h4 className="text-white/80 font-bold mb-4">
                                        {t('dashboard.featured.partner')} {(() => {
                                            const partner = matches[0].participants.find((p: any) => p.userId !== user?.id);
                                            return partner?.name;
                                        })()}
                                    </h4>
                                    <p className="text-white/60 text-sm font-medium leading-relaxed mb-8">
                                        {t('dashboard.featured.compatible_msg')}
                                    </p>
                                    <div className="flex items-center space-x-4">
                                        <button
                                            onClick={() => navigate('/matches')}
                                            className="px-8 py-4 bg-white text-slate-950 font-bold rounded-2xl hover:bg-primary-50 transition-all hover:scale-105 active:scale-95 text-xs uppercase tracking-widest shadow-xl"
                                        >
                                            {t('dashboard.featured.view_details')}
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
                        <div className="glass-card rounded-3xl sm:rounded-[40px] p-6 sm:p-10 text-center border-dashed border-2 border-(--border-main) bg-(--bg-card)">
                            <MapPin size={48} className="mx-auto text-slate-300 dark:text-slate-700 mb-6" />
                            <h3 className="text-xl font-bold text-(--text-main)">{t('dashboard.empty.finding')}</h3>
                            <p className="text-sm text-(--text-muted) mt-2 max-w-sm mx-auto">{t('dashboard.empty.increase_msg')}</p>
                            <button
                                onClick={() => navigate('/preferences')}
                                className="mt-8 px-8 py-4 bg-slate-900 dark:bg-primary-600 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-800 dark:hover:bg-primary-700 transition-all shadow-lg active:scale-95"
                            >
                                {t('dashboard.empty.update_prefs')}
                            </button>
                        </div>
                    )}

                    {/* Recent Activity Feed */}
                    <div className="glass-card rounded-3xl sm:rounded-[40px] p-6 sm:p-8 border-(--border-main) bg-(--bg-card) shadow-(--shadow-main)">
                        <div className="flex items-center justify-between mb-6 sm:mb-8 px-1 sm:px-2 border-b border-(--border-main) pb-4 sm:pb-6">
                            <div>
                                <h3 className="text-lg sm:text-xl font-bold text-(--text-main) tracking-tight">{t('dashboard.activity.title')}</h3>
                                <p className="text-[10px] sm:text-xs font-medium text-(--text-muted) mt-1">{t('dashboard.activity.subtitle')}</p>
                            </div>
                            <button onClick={() => navigate('/requests')} className="text-[9px] sm:text-[10px] font-bold text-primary-600 dark:text-primary-400 uppercase tracking-widest bg-primary-50 dark:bg-primary-900/20 px-2.5 py-1.5 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors">{t('dashboard.activity.see_feed')}</button>
                        </div>
                        <div className="space-y-4">
                            {allRequests.length > 0 ? (
                                allRequests.slice(0, 4).map((req, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-(--bg-main)/50 rounded-[24px] border border-(--border-main) hover:border-primary-200 dark:hover:border-primary-800 transition-all hover:shadow-sm">
                                        <div className="flex items-center space-x-4">
                                            <div className={`p-2.5 rounded-xl ${req.status === 'ACCEPTED' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600' : req.status === 'PENDING' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600' : 'bg-rose-50 dark:bg-rose-500/10 text-rose-600'}`}>
                                                {req.status === 'ACCEPTED' ? <ShieldCheck size={18} /> : <Clock size={18} />}
                                            </div>
                                            <div>
                                                <p className="text-[13px] font-bold text-(--text-main)">
                                                    {req.senderId === user?.id 
                                                        ? t('dashboard.activity.sent_to', { name: req.receiverName })
                                                        : t('dashboard.activity.received_from', { name: req.senderName })}
                                                </p>
                                                <div className="flex items-center mt-1 space-x-2">
                                                    <span className="text-[10px] font-bold text-(--text-muted) uppercase tracking-widest">
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
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{t('dashboard.activity.no_activity')}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Active Chats Quick-Access */}
                    <div className="glass-card rounded-[40px] p-8 border border-(--border-main) bg-(--bg-card)">
                        <div className="flex items-center justify-between mb-8 px-2 border-b border-(--border-main) pb-4">
                            <h3 className="font-bold text-(--text-main) text-lg sm:text-xl">{t('dashboard.conversations.title')}</h3>
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
                                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-100 dark:bg-slate-800 rounded-xl sm:rounded-2xl overflow-hidden shadow-sm border border-(--border-main) shrink-0">
                                                <img src={getAvatarUrl(hasPackage ? partner.avatar : null, partner.name)} alt="avatar" />
                                            </div>
                                            <div className="grow min-w-0">
                                                <p className="text-xs sm:text-sm font-bold text-(--text-main) truncate leading-tight group-hover:text-primary-600 transition-colors">
                                                    {room.type === 'GROUP' ? t('dashboard.conversations.group_chat') : (partner.name)}
                                                </p>
                                                <p className="text-[9px] sm:text-[10px] text-(--text-muted) font-medium truncate mt-1 uppercase tracking-tighter">
                                                    {room.type === 'GROUP' ? `${room.members.length} members` : partner.stationName || 'Staff Member'}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center py-6 bg-slate-50/50 dark:bg-slate-800/30 rounded-3xl border border-dashed border-(--border-main)">
                                    <p className="text-[10px] font-bold text-(--text-muted) uppercase tracking-widest">{t('dashboard.conversations.no_chats')}</p>
                                </div>
                            )}
                        </div>
                        <div className="flex justify-center w-full">
                            <button
                                onClick={() => navigate('/messages')}
                                className="mt-8 px-8 py-4 bg-slate-900 dark:bg-primary-600 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-800 dark:hover:bg-primary-700 transition-all shadow-lg active:scale-95"
                            >
                                {t('dashboard.conversations.open_messenger')}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar Section */}
                <div className="space-y-8">
                    <UserGuideWidget 
                        preferences={preferences} 
                        matches={matches} 
                        requests={requests} 
                        rooms={rooms} 
                    />

                    {/* Verification Panel */}
                    <div className="glass-card rounded-[40px] p-8 border border-(--border-main) bg-(--bg-card)">
                        <div className="flex items-center space-x-4 mb-8">
                            <div className="w-12 h-12 bg-(--bg-main) rounded-2xl shadow-md border border-(--border-main) flex items-center justify-center text-primary-500">
                                <ShieldCheck size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold text-(--text-main) tracking-tight leading-tight">{t('dashboard.verification.title')}</h4>
                                <div className="flex items-center space-x-2 mt-1">
                                    <div className="h-1.5 w-16 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-primary-500/10 dark:bg-primary-500 rounded-full transition-all duration-1000" style={{ width: `${profile?.verificationLevel >= 2 ? 100 : 50}%` }}></div>
                                    </div>
                                    <span className="text-[10px] font-bold text-primary-600 dark:text-primary-400">{profile?.verificationLevel >= 2 ? 100 : 50}% {t('dashboard.verification.score')}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-5">
                            {[
                                { label: t('dashboard.verification.nic'), status: t('dashboard.verification.completed'), icon: ShieldCheck, color: 'text-emerald-500' },
                                { label: t('dashboard.verification.phone'), status: profile?.verificationLevel >= 2 ? t('dashboard.verification.completed') : t('dashboard.verification.pending'), icon: Zap, color: profile?.verificationLevel >= 2 ? 'text-emerald-500' : 'text-amber-500' }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-1.5 bg-(--bg-main) rounded-lg border border-(--border-main) shadow-sm text-slate-400">
                                            <item.icon size={14} />
                                        </div>
                                        <span className="text-xs font-bold text-(--text-main) sm:opacity-80">{item.label}</span>
                                    </div>
                                    <span className={`text-[9px] font-bold uppercase tracking-widest ${item.color}`}>{item.status}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Pro Banner */}
                    <div className="bg-slate-950 rounded-[40px] p-8 text-white relative overflow-hidden group shadow-2xl shadow-slate-900/10">
                        <div className="relative z-10">
                            <Zap size={32} className="text-primary-400 mb-6 group-hover:scale-110 transition-transform duration-500" />
                            {hasPackage ? (
                                <>
                                    <h4 className="text-lg font-bold tracking-tight mb-2">{t('dashboard.pro.package_duration')}</h4>
                                    <div className="flex items-center space-x-2 mb-6 text-white/40 text-[11px] font-medium leading-relaxed">
                                        <Clock size={12} />
                                        <span>{getRemainingDays()} {t('dashboard.pro.days_remaining')}</span>
                                    </div>
                                    <p className="text-white/40 text-[11px] font-medium leading-relaxed mb-6">
                                        {t('dashboard.pro.active_msg')}
                                    </p>
                                    <button
                                        onClick={() => navigate('/pricing')}
                                        className="w-full py-4 bg-white text-slate-950 rounded-[20px] text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg hover:bg-primary-50 transition-all active:scale-95 cursor-pointer"
                                    >
                                        {t('dashboard.pro.extend')}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <h4 className="text-lg font-bold tracking-tight mb-2">{t('dashboard.pro.upgrade_title')}</h4>
                                    <p className="text-white/40 text-[11px] font-medium leading-relaxed mb-6">
                                        {t('dashboard.pro.upgrade_msg')}
                                    </p>
                                    <div className="flex items-baseline space-x-1 mb-6">
                                        <span className="text-2xl font-bold">Rs. 440</span>
                                        <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{t('dashboard.pro.starting_from')}</span>
                                    </div>
                                    <button
                                        onClick={() => navigate('/pricing')}
                                        className="w-full py-4 bg-white text-slate-950 rounded-[20px] text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg hover:bg-primary-50 transition-all active:scale-95 cursor-pointer"
                                    >
                                        {t('dashboard.pro.view_plans')}
                                    </button>
                                </>
                            )}
                        </div>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClientDashboard;
