import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import apiClient from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import {
    Users,
    MapPin,
    ArrowRightLeft,
    Zap,
    ChevronRight,
    CheckCircle2,
    X,
    Loader2,
    MessageSquare,
    Clock
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getAvatarUrl } from '../../api/url';
import UnlockFullAccessModal from '../../components/modals/UnlockFullAccessModal';

const formatName = (name: string) => {
    if (!name) return '';
    const trimmed = name.trim();
    if (trimmed.length <= 2) return trimmed;
    return `${trimmed[0]}***${trimmed[trimmed.length - 1]}`;
};

const MatchRow = ({ match, currentUserId, onViewDetails, hasPackage, onUnlockRequire }: any) => {
    const isTriple = match.type === 'Triple';
    const accentColor = isTriple ? 'indigo' : 'emerald';

    // Perspective-aware sorted participants: You -> Target -> Third
    const currentUserIdx = match.participants.findIndex((p: any) => p.userId === currentUserId);
    const sortedParticipants = currentUserIdx >= 0
        ? [...match.participants.slice(currentUserIdx), ...match.participants.slice(0, currentUserIdx)]
        : match.participants;

    const mainPartner = sortedParticipants[1];
    const otherPartner = isTriple ? sortedParticipants[2] : null;

    const hasActiveRequest = match.participants.some((p: any) => p.requestStatus && p.userId !== currentUserId);

    return (
        <div
            onClick={() => {
                if (!hasPackage) {
                    onUnlockRequire();
                } else {
                    onViewDetails(match);
                }
            }}
            className={`group relative bg-[var(--bg-card)] dark:bg-[var(--bg-card)]/90 rounded-2xl sm:rounded-[32px] p-4 sm:p-6 border border-[var(--border-main)] hover:border-${accentColor}-200/50 dark:hover:border-${accentColor}-800/50 shadow-sm transition-all duration-500 cursor-pointer overflow-hidden active:scale-[0.99]`}
        >
            {/* Background Accent */}
            <div className={`absolute top-0 right-0 w-32 h-32 bg-${accentColor}-50/50 blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-${accentColor}-100/50 transition-colors duration-500`} />

            <div className="relative flex flex-col xl:flex-row xl:items-center gap-8">
                {/* 1. Partner Profile Section */}
                <div className="flex items-center space-x-5 min-w-[280px]">
                    <div className="relative shrink-0">
                        <div className={`w-12 h-12 sm:w-16 sm:h-16 bg-slate-50 dark:bg-slate-800 rounded-xl sm:rounded-3xl overflow-hidden border-2 border-[var(--bg-main)] shadow-sm relative z-10 transition-transform duration-500 group-hover:scale-110 ${otherPartner ? '-translate-x-1' : ''}`}>
                            <img src={getAvatarUrl(hasPackage ? mainPartner.profileImageUrl : null, hasPackage ? mainPartner.name : formatName(mainPartner.name))} alt="avatar" />
                        </div>
                        {otherPartner && (
                            <div className="absolute -bottom-1 -right-1 w-9 h-9 sm:w-12 sm:h-12 bg-slate-100 dark:bg-slate-700 rounded-xl sm:rounded-2xl overflow-hidden border-2 border-[var(--bg-main)] shadow-md z-20 group-hover:translate-x-1 transition-transform duration-500">
                                <img src={getAvatarUrl(hasPackage ? otherPartner.profileImageUrl : null, hasPackage ? otherPartner.name : formatName(otherPartner.name))} alt="avatar" />
                            </div>
                        )}
                        {!otherPartner && match.type === 'Triple' && (
                            <div className="absolute -top-1 -right-1 p-1 bg-amber-400 text-white rounded-lg shadow-md border-2 border-[var(--bg-main)] z-20">
                                <Zap size={10} fill="currentColor" />
                            </div>
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-lg font-bold text-[var(--text-main)] truncate tracking-tight">
                                {hasPackage ? mainPartner.name : formatName(mainPartner.name)}
                                {otherPartner && <span className="text-[var(--text-muted)] font-normal mx-1.5">&</span>}
                                {otherPartner && (hasPackage ? otherPartner.name : formatName(otherPartner.name))}
                            </h4>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${isTriple
                                ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-800'
                                : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800'
                                }`}>
                                {isTriple ? 'Chain Transfer' : 'Mutual Swap'}
                            </span>
                            {hasActiveRequest && (
                                <span className="inline-flex items-center px-2 py-0.5 bg-slate-900 text-white text-[10px] font-bold rounded-lg uppercase tracking-wider">
                                    <CheckCircle2 size={10} className="mr-1" />
                                    Active
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* 2. Route Flow Visualization */}
                <div className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-4 px-1 sm:px-4 mt-4 xl:mt-0 ${isTriple ? 'min-w-[260px]' : 'min-w-[180px]'}`}>
                    {/* Node 1: You */}
                    <div className="flex-1 text-right group/loc min-w-0">
                        <p className={`text-[8px] sm:text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-0.5 sm:mb-1 group-hover/loc:text-${accentColor}-500 transition-colors`}>You</p>
                        <h5 className="text-xs sm:text-sm font-bold text-[var(--text-main)] line-clamp-1 opacity-90">{sortedParticipants[0]?.stationName}</h5>
                        <p className="text-[8px] sm:text-[10px] font-medium text-[var(--text-muted)] truncate">{sortedParticipants[0]?.stationDistrict}</p>
                    </div>

                    {/* Arrow 1 */}
                    <div className="relative flex flex-col items-center shrink-0 w-8 sm:w-12 group/arrow">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-full h-[2px] bg-[var(--border-main)] relative overflow-hidden">
                                <div className={`absolute inset-0 bg-${accentColor}-500/30 -translate-x-full group-hover/arrow:translate-x-full transition-transform duration-1000 ease-in-out`} />
                            </div>
                        </div>
                        <div className={`relative z-10 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-[var(--bg-card)] border border-[var(--border-main)] flex items-center justify-center group-hover/arrow:bg-${accentColor}-50 dark:group-hover/arrow:bg-${accentColor}-900/20 group-hover/arrow:text-${accentColor}-600 dark:group-hover/arrow:text-${accentColor}-400 group-hover/arrow:border-${accentColor}-200 dark:group-hover/arrow:border-${accentColor}-800 transition-all duration-300 text-slate-400 shadow-sm`}>
                            {isTriple ? <ChevronRight size={14} className="sm:w-4 sm:h-4" /> : <ArrowRightLeft size={14} className="sm:w-4 sm:h-4" />}
                        </div>
                    </div>

                    {/* Node 2: Target */}
                    <div className={`flex-1 ${isTriple ? 'text-center' : 'text-left'} group/loc min-w-0`}>
                        <p className={`text-[8px] sm:text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-0.5 sm:mb-1 group-hover/loc:text-${accentColor}-500 transition-colors`}>{isTriple ? 'Target' : 'Partner'}</p>
                        <h5 className="text-xs sm:text-sm font-bold text-[var(--text-main)] line-clamp-1 opacity-90">{sortedParticipants[1]?.stationName}</h5>
                        <p className="text-[8px] sm:text-[10px] font-medium text-[var(--text-muted)] truncate">{sortedParticipants[1]?.stationDistrict}</p>
                    </div>
 
                    {/* Optional Arrow 2 & Node 3 for Triple */}
                    {isTriple && (
                        <>
                            <div className="relative flex flex-col items-center shrink-0 w-8 sm:w-12 group/arrow2">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-full h-[2px] bg-[var(--border-main)] relative overflow-hidden">
                                        <div className="absolute inset-0 bg-indigo-500/30 -translate-x-full group-hover/arrow2:translate-x-full transition-transform duration-1000 ease-in-out delay-150" />
                                    </div>
                                </div>
                                <div className="relative z-10 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-[var(--bg-card)] border border-[var(--border-main)] flex items-center justify-center group-hover/arrow2:bg-indigo-50 dark:group-hover/arrow2:bg-indigo-900/20 group-hover/arrow2:text-indigo-600 dark:group-hover/arrow2:text-indigo-400 group-hover/arrow2:border-indigo-200 dark:group-hover/arrow2:border-indigo-800 transition-all duration-300 text-slate-400 shadow-sm">
                                    <ChevronRight size={14} className="sm:w-4 sm:h-4" />
                                </div>
                            </div>
 
                            <div className="flex-1 text-left group/loc min-w-0">
                                <p className="text-[8px] sm:text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-0.5 sm:mb-1 group-hover/loc:text-indigo-500 transition-colors">Third</p>
                                <h5 className="text-xs sm:text-sm font-bold text-[var(--text-main)] line-clamp-1 opacity-90">{sortedParticipants[2]?.stationName}</h5>
                                <p className="text-[8px] sm:text-[10px] font-medium text-[var(--text-muted)] truncate">{sortedParticipants[2]?.stationDistrict}</p>
                            </div>
                        </>
                    )}
                </div>

                {/* 3. Score & Action Section */}
                <div className="flex items-center justify-between xl:justify-end xl:space-x-10 border-t xl:border-t-0 border-[var(--border-main)] pt-6 xl:pt-0">
                    <div className="flex items-center space-x-6">
                        <div className="hidden sm:block text-right">
                            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">Relocation</p>
                            <div className={`flex items-center gap-1.5 text-${accentColor}-600 dark:text-${accentColor}-400`}>
                                {isTriple ? <Zap size={14} fill="currentColor" /> : <Users size={14} />}
                                <span className="text-xs font-bold uppercase tracking-wider">{isTriple ? 'Chain' : 'Direct'}</span>
                            </div>
                        </div>
                    </div>

                    <button
                        className={`flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-slate-950 dark:bg-primary-600 text-white rounded-2xl shadow-xl shadow-slate-900/10 hover:bg-${accentColor}-600 dark:hover:bg-primary-500 hover:scale-105 active:scale-95 transition-all cursor-pointer overflow-hidden group/btn`}
                    >
                        <ChevronRight size={24} className="group-hover/btn:translate-x-0.5 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    );
};

const Matches = () => {
    const { user } = useAuth();
    const { globalSearchQuery }: any = useOutletContext();
    const navigate = useNavigate();
    const [matches, setMatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [typeFilter, setTypeFilter] = useState('All');
    const { hasPackage }: any = useOutletContext();
    const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);

    // Modal state
    const [selectedMatch, setSelectedMatch] = useState<any>(null);
    const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);

    const fetchMatches = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/matches');
            setMatches(response.data);
        } catch (err) {
            console.error("Failed to fetch matches", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMatches();
    }, []);

    const filteredMatches = matches.filter(m => {
        const matchesType = typeFilter === 'All' || m.type === typeFilter;
        const matchesSearch = globalSearchQuery
            ? m.participants.some((p: any) =>
                p.name?.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
                p.stationName?.toLowerCase().includes(globalSearchQuery.toLowerCase())
            )
            : true;

        return matchesType && matchesSearch;
    });

    const handleViewDetails = (match: any) => {
        setSelectedMatch(match);
        setIsMatchModalOpen(true);
    };

    // Calculate match counts
    const counts = {
        All: matches.length,
        Direct: matches.filter(m => m.type === 'Direct').length,
        Triple: matches.filter(m => m.type === 'Triple').length
    };

    const handleInitiateRequest = async (match: any) => {
        if (hasPackage === false) {
            setIsUnlockModalOpen(true);
            return;
        }

        try {
            setIsSending(true);
            const currentUserIndex = match.participants.findIndex((p: any) => p.userId === user?.id);
            if (currentUserIndex === -1) return;

            const targetPartner = match.participants[(currentUserIndex + 1) % match.participants.length];

            // For triple matches, include all participants' IDs in cycleUserIds
            const cycleUserIds = match.type === 'Triple'
                ? match.participants.map((p: any) => p.userId).join(',')
                : '';

            await apiClient.post('/requests', {
                receiverId: targetPartner.userId,
                matchType: match.type?.toUpperCase() === 'TRIPLE' ? 'TRIPLE' : 'DIRECT',
                cycleUserIds: cycleUserIds
            });

            toast.success(`Request sent to ${hasPackage ? targetPartner.name : formatName(targetPartner.name)}!`, { icon: '🚀' });

            // Refresh matches to get updated statuses
            await fetchMatches();
            setIsMatchModalOpen(false);
        } catch (err: any) {
            console.error("Failed to initiate request", err);
            toast.error(err.response?.data || 'Failed to send request.');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-8 pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
                <div>
                    <h1 className="text-2xl sm:text-4xl font-semibold text-[var(--text-main)] tracking-tight leading-tight">Potential Matches</h1>
                    <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-2 font-medium">All direct and multi-way transfer opportunities found for you.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-primary-600 rounded-[32px] p-8 text-white flex items-center space-x-6 shadow-2xl shadow-primary-900/10">
                    <div className="p-4 bg-white/10 rounded-[22px] backdrop-blur-md">
                        <Users size={32} />
                    </div>
                    <div>
                        <p className="text-2xl font-medium">{filteredMatches.length}</p>
                        <p className="text-xs font-medium uppercase tracking-wider opacity-60">Opportunities</p>
                    </div>
                </div>
                <div className="glass-card rounded-[32px] p-8 flex items-center space-x-6 border-[var(--border-main)] bg-[var(--bg-card)]">
                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-[22px]">
                        <CheckCircle2 size={32} className="text-emerald-500" />
                    </div>
                    <div>
                        <p className="text-2xl font-semibold text-[var(--text-main)]">{filteredMatches.filter(m => m.type === 'Triple').length}</p>
                        <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">Multi-way</p>
                    </div>
                </div>
                <div className="md:col-span-2 glass-card rounded-[32px] p-8 border-[var(--border-main)] bg-[var(--bg-card)] flex items-center justify-between shadow-sm relative overflow-hidden group/pref">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-primary-100/30 blur-3xl -translate-y-1/2 translate-x-1/2 transition-colors duration-500" />
                    <div className="grow relative z-10">
                        <div className="flex items-center gap-2 mb-1.5">
                            <span className="p-1 bg-primary-100/50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-lg"><MapPin size={16} /></span>
                            <h4 className="font-semibold text-[var(--text-main)] tracking-tight text-lg">Transfer Preferences</h4>
                        </div>
                        <p className="text-xs text-[var(--text-muted)] font-medium">Matching your professional profile with active requests.</p>
                    </div>
                    <button onClick={() => navigate('/preferences')} className="relative z-10 text-primary-600 dark:text-primary-400 font-bold text-xs uppercase tracking-wider hover:text-primary-800 dark:hover:text-primary-300 bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/40 px-4 py-2 rounded-xl transition-colors cursor-pointer border border-primary-100 dark:border-primary-800">Adjust</button>
                </div>
            </div>            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-3 sm:px-4 bg-[var(--bg-card)] p-3 sm:p-4 rounded-2xl sm:rounded-3xl border border-[var(--border-main)]">
                    <div className="flex items-center space-x-3">
                        <h3 className="text-[10px] sm:text-sm font-bold text-[var(--text-main)] uppercase tracking-wider">Results</h3>
                        <span className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[9px] sm:text-[10px] font-bold rounded-lg uppercase tracking-tight">
                            {filteredMatches.length} Found
                        </span>
                    </div>
 
                    <div className="bg-slate-200 dark:bg-slate-800/50 p-1 rounded-xl sm:rounded-2xl flex items-center w-full sm:w-fit overflow-x-auto custom-scrollbar-hide">
                        {['All', 'Direct', 'Triple'].map((type) => (
                            <button
                                key={type}
                                onClick={() => setTypeFilter(type)}
                                className={`relative px-4 sm:px-5 py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-[11px] font-bold transition-all duration-300 flex items-center space-x-2 whitespace-nowrap grow sm:grow-0 ${typeFilter === type
                                    ? 'bg-[var(--bg-card)] text-primary-600 dark:text-primary-400 shadow-sm'
                                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                                    }`}
                            >
                                <span>{type}</span>
                                <span className={`px-1.5 py-0.5 rounded-md text-[8px] sm:text-[9px] ${typeFilter === type ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400' : 'bg-slate-300/50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400'
                                    }`}>
                                    {(counts as any)[type]}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
                {loading ? (
                    <div className="p-10 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                    </div>
                ) : filteredMatches.length > 0 ? (
                    filteredMatches.map((m, i) => (
                        <MatchRow key={i} match={m} currentUserId={user?.id} onViewDetails={handleViewDetails} hasPackage={hasPackage} onUnlockRequire={() => setIsUnlockModalOpen(true)} />
                    ))
                ) : (
                    <div className="p-12 glass-card rounded-[32px] text-center border-[var(--border-main)] bg-[var(--bg-card)]">
                        <MapPin size={48} className="mx-auto text-slate-200 dark:text-slate-800 mb-4" />
                        <p className="text-[var(--text-muted)] font-medium">No matches found for current filters.</p>
                        <button onClick={() => navigate('/preferences')} className="mt-4 text-primary-600 dark:text-primary-400 text-xs font-bold uppercase tracking-widest hover:text-primary-800 dark:hover:text-primary-300 transition-all cursor-pointer">Set Preferences</button>
                    </div>
                )}
            </div>            {/* Match Details Modal */}
            {isMatchModalOpen && selectedMatch && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
                    <div className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm" onClick={() => setIsMatchModalOpen(false)}></div>
                    <div className="relative w-full max-w-2xl bg-[var(--bg-card)] dark:backdrop-blur-2xl rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-[var(--border-main)] animate-in zoom-in-95 duration-300">
 
                        <div className="p-6 sm:p-8 flex items-center justify-between border-b border-[var(--border-main)] bg-[var(--bg-card)] dark:bg-[var(--bg-card)]/80 dark:backdrop-blur-xl z-20 sticky top-0">
                            <div>
                                <h2 className="text-2xl font-bold text-[var(--text-main)] tracking-tight">Match Details</h2>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${selectedMatch.type === 'Triple' ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-800' : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800'}`}>
                                        {selectedMatch.type === 'Triple' ? '3-Way Chain' : 'Direct Mutual Swap'}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsMatchModalOpen(false)}
                                className="p-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-[var(--text-main)] rounded-full transition-all cursor-pointer"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 sm:p-8 flex-1 overflow-y-auto custom-scrollbar relative z-10 space-y-6">

                            <div className="space-y-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest pl-3 border-l-2 border-primary-500">Proposed Transfer Cycle</h3>
                                </div>

                                <div className="bg-[var(--bg-main)] dark:bg-[var(--bg-main)]/50 rounded-[24px] border border-[var(--border-main)] p-2 shadow-sm relative overflow-hidden">
                                    <div className="absolute left-10 top-10 bottom-10 w-0.5 bg-[var(--border-main)] z-0 hidden sm:block"></div>
                                    {(() => {
                                        const currentUserIdx = selectedMatch.participants.findIndex((p: any) => p.userId === user?.id);
                                        const sortedParticipants = currentUserIdx >= 0
                                            ? [...selectedMatch.participants.slice(currentUserIdx), ...selectedMatch.participants.slice(0, currentUserIdx)]
                                            : selectedMatch.participants;

                                        return sortedParticipants.map((p: any, index: number) => {
                                            const nextPartner = sortedParticipants[(index + 1) % sortedParticipants.length];
                                            const isCurrentUser = p.userId === user?.id;
                                            const displayName = isCurrentUser ? p.name : (hasPackage ? p.name : formatName(p.name));
                                            const displayImageUrl = isCurrentUser ? p.profileImageUrl : (hasPackage ? p.profileImageUrl : null);

                                            return (
                                                <div key={index} className="flex flex-col relative z-10 mb-2 last:mb-0 p-4">
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                        <div className="flex items-center space-x-4">
                                                            <div className={`w-12 h-12 rounded-xl overflow-hidden shadow-sm shrink-0 border-2 ${isCurrentUser ? 'border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-900/20' : 'border-[var(--border-main)] bg-[var(--bg-card)]'}`}>
                                                                <img src={getAvatarUrl(displayImageUrl, displayName)} alt="avatar" />
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-[var(--text-main)] text-base">
                                                                    {displayName} {isCurrentUser && <span className="text-[8px] ml-2 bg-primary-600 text-white px-2 py-0.5 rounded-full uppercase tracking-widest font-bold align-middle">You</span>}
                                                                </p>
                                                                <p className="text-xs text-[var(--text-muted)] font-medium flex items-center mt-1">
                                                                    <MapPin size={12} className="mr-1 shrink-0" />
                                                                    <span className="truncate max-w-[150px] sm:max-w-xs">{p.stationName}</span>
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className={`flex items-center space-x-3 p-3 rounded-2xl sm:w-auto w-full border ${isCurrentUser ? 'bg-primary-50 dark:bg-primary-900/10 border-primary-100 dark:border-primary-800' : 'bg-[var(--bg-card)] border-[var(--border-main)]/60'}`}>
                                                            <div className={`shrink-0 ${isCurrentUser ? 'text-primary-500' : 'text-slate-400'}`}>
                                                                <ArrowRightLeft size={16} />
                                                            </div>
                                                            <div>
                                                                <p className={`text-[9px] font-bold uppercase tracking-widest leading-none mb-1 ${isCurrentUser ? 'text-primary-400' : 'text-slate-500'}`}>Moves to</p>
                                                                <p className="text-sm font-bold text-[var(--text-main)] truncate max-w-[150px]">{nextPartner.stationName}</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Separation Arrow - Only show if not last item */}
                                                    {index < sortedParticipants.length - 1 && (
                                                        <div className="absolute -bottom-3 left-1/2 sm:left-13 -translate-x-1/2 z-20">
                                                            <div className="bg-[var(--bg-card)] text-slate-300 dark:text-slate-700 p-1 rounded-full border border-[var(--border-main)] shadow-sm hidden sm:flex">
                                                                <ChevronRight size={14} className="rotate-90" />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        });
                                    })()}
                                </div>
                            </div>

                            <div className="bg-slate-900 dark:bg-slate-800/80 text-white p-6 rounded-[24px] shadow-xl shadow-slate-900/10 flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden mt-8">
                                <div className="relative z-10 flex-1">
                                    <p className="text-sm text-slate-400 dark:text-slate-400 font-medium mb-1">
                                        {(() => {
                                            const currentUserIdx = selectedMatch.participants.findIndex((p: any) => p.userId === user?.id);
                                            const target = selectedMatch.participants[(currentUserIdx + 1) % selectedMatch.participants.length];

                                            if (target.requestStatus === 'PENDING') return "Request already sent to move to " + target.stationName;
                                            if (target.requestStatus === 'ACCEPTED') return "Match process established!";
                                            if (target.requestStatus === 'PENDING_INCOMING') return "You have a pending request from " + (hasPackage ? target.name : formatName(target.name));

                                            return "Ready to proceed?";
                                        })()}
                                    </p>
                                    <p className="font-semibold text-lg tracking-tight">
                                        {(() => {
                                            const currentUserIdx = selectedMatch.participants.findIndex((p: any) => p.userId === user?.id);
                                            const target = selectedMatch.participants[(currentUserIdx + 1) % selectedMatch.participants.length];

                                            if (target.requestStatus === 'PENDING') return "Awaiting Response";
                                            if (target.requestStatus === 'ACCEPTED') return "Connected";
                                            if (target.requestStatus === 'PENDING_INCOMING') return "Action Required";

                                            return "Initiate Request";
                                        })()}
                                    </p>
                                </div>

                                {(() => {
                                    const currentUserIdx = selectedMatch.participants.findIndex((p: any) => p.userId === user?.id);
                                    const target = selectedMatch.participants[(currentUserIdx + 1) % selectedMatch.participants.length];

                                    if (target.requestStatus === 'PENDING') {
                                        return (
                                            <div className="flex items-center space-x-2 px-6 py-3.5 bg-white/10 rounded-xl text-slate-300 font-bold text-sm">
                                                <Clock size={16} />
                                                <span>Sent</span>
                                            </div>
                                        );
                                    }

                                    if (target.requestStatus === 'ACCEPTED') {
                                        return (
                                            <button
                                                onClick={() => navigate(`/messages?match=${selectedMatch.id}`)}
                                                className="bg-primary-600 hover:bg-primary-500 text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-primary-600/30 w-full sm:w-auto text-center cursor-pointer flex items-center justify-center space-x-2"
                                            >
                                                <MessageSquare size={18} />
                                                <span>Message</span>
                                            </button>
                                        );
                                    }

                                    if (target.requestStatus === 'PENDING_INCOMING') {
                                        return (
                                            <button
                                                onClick={() => navigate('/requests')}
                                                className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-emerald-600/30 w-full sm:w-auto text-center cursor-pointer"
                                            >
                                                View Request
                                            </button>
                                        );
                                    }

                                    return (
                                        <button
                                            onClick={() => handleInitiateRequest(selectedMatch)}
                                            disabled={isSending}
                                            className="relative z-10 bg-primary-600 hover:bg-primary-500 disabled:bg-primary-800 text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-primary-600/30 w-full sm:w-auto text-center cursor-pointer hover:scale-105 flex items-center justify-center space-x-2"
                                        >
                                            {isSending ? (
                                                <>
                                                    <Loader2 size={18} className="animate-spin" />
                                                    <span>Sending...</span>
                                                </>
                                            ) : (
                                                <span>Send Request</span>
                                            )}
                                        </button>
                                    );
                                })()}
                                <div className="absolute right-0 top-0 w-32 h-32 bg-primary-500/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3"></div>
                            </div>

                            <p className="text-[10px] text-[var(--text-muted)] font-medium text-center px-6">
                                * Note: Contact details will only be visible once the target partner accepts your request.
                            </p>
                        </div>
                    </div>
                </div>
            )}
            {/* Unlock Full Access Modal */}
            <UnlockFullAccessModal 
                isOpen={isUnlockModalOpen} 
                onClose={() => setIsUnlockModalOpen(false)} 
            />
        </div>
    );
};

export default Matches;
