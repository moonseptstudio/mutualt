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
    Filter,
    CheckCircle2,
    X,
    Loader2,
    MessageSquare,
    Clock
} from 'lucide-react';
import toast from 'react-hot-toast';

const MatchRow = ({ match, currentUserId, onViewDetails }: any) => {
    const partner = match.participants.find((p: any) => p.userId !== currentUserId) || match.participants[0];
    const from = partner.stationName;
    const to = match.participants.find((p: any) => p.userId === currentUserId)?.stationName || "Your Station";

    // Check if any partner in this match has a pending or accepted request
    const hasActiveRequest = match.participants.some((p: any) => p.requestStatus && p.userId !== currentUserId);

    return (
        <div
            onClick={() => onViewDetails(match)}
            className="glass-card p-6 rounded-[32px] border-white hover:scale-[1.01] hover:shadow-xl transition-all duration-500 cursor-pointer group"
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center space-x-6">
                    <div className="relative">
                        <div className="w-16 h-16 bg-slate-100 rounded-[22px] overflow-hidden border-2 border-white shadow-md">
                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${partner.name}`} alt="avatar" />
                        </div>
                        {match.type === 'Triple' && (
                            <div className="absolute -top-2 -right-2 p-1.5 bg-primary-500 text-white rounded-lg shadow-lg border-2 border-white animate-bounce-slow">
                                <Zap size={14} fill="currentColor" />
                            </div>
                        )}
                    </div>
                    <div>
                        <div className="flex items-center space-x-2">
                            <h4 className="text-lg font-semibold text-slate-900 group-hover:text-primary-600 transition-colors">{partner.name}</h4>
                            {hasActiveRequest && (
                                <span className="flex items-center px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[9px] font-bold rounded-md uppercase tracking-wider">
                                    <CheckCircle2 size={10} className="mr-1" />
                                    Active Process
                                </span>
                            )}
                        </div>
                        <div className="flex items-center space-x-3 text-xs font-medium uppercase tracking-wider text-slate-400 mt-1">
                            <span className={`flex items-center px-2 py-0.5 rounded-md border ${match.type === 'Triple' ? 'text-indigo-500 bg-indigo-50 border-indigo-100' : 'text-primary-500 bg-primary-50 border-primary-100'}`}>
                                {match.type} Match
                            </span>
                            <span className="flex items-center">
                                <MapPin size={12} className="mr-1" />
                                {from}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex-1 flex items-center justify-center space-x-4 max-w-xs mx-auto">
                    <div className="text-right flex-1">
                        <p className="text-xs font-medium text-slate-400 uppercase tracking-tighter truncate">{from}</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-2xl text-slate-400 group-hover:text-primary-500 group-hover:bg-primary-50 transition-all">
                        <ArrowRightLeft size={18} />
                    </div>
                    <div className="text-left flex-1">
                        <p className="text-xs font-semibold text-slate-900 uppercase tracking-tighter truncate">{to}</p>
                    </div>
                </div>

                <div className="flex items-center justify-between md:justify-end md:space-x-8">
                    <div className="text-right">
                        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Score</p>
                        <p className="text-xl font-medium text-emerald-500">92%</p>
                    </div>
                    <button
                        onClick={(e) => { e.stopPropagation(); onViewDetails(match); }}
                        className="p-3 bg-slate-950 text-white rounded-[18px] shadow-lg shadow-slate-900/10 hover:bg-primary-600 transition-all cursor-pointer"
                    >
                        <ChevronRight size={20} />
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
    const [showFilters, setShowFilters] = useState(false);

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

    const handleInitiateRequest = async (match: any) => {
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

            toast.success(`Request sent to ${targetPartner.name}!`, { icon: '🚀' });

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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative">
                <div>
                    <h1 className="text-4xl font-semibold text-slate-950 tracking-tight leading-none">Potential Matches</h1>
                    <p className="text-slate-500 mt-2 font-medium">All direct and multi-way transfer opportunities found for you.</p>
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center space-x-2 px-6 py-3 border rounded-2xl text-xs font-bold transition-all shadow-sm cursor-pointer ${showFilters ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        <Filter size={16} />
                        <span>{typeFilter === 'All' ? 'Filter' : `Type: ${typeFilter}`}</span>
                    </button>

                    {showFilters && (
                        <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-30 animate-in slide-in-from-top-2 duration-200">
                            <div className="flex justify-between items-center px-4 py-2 border-b border-slate-50 mb-2">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Match Type</span>
                                <button onClick={() => setShowFilters(false)} className="text-slate-300 hover:text-slate-600"><X size={14} /></button>
                            </div>
                            {['All', 'Direct', 'Triple'].map(type => (
                                <button
                                    key={type}
                                    onClick={() => { setTypeFilter(type); setShowFilters(false); }}
                                    className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${typeFilter === type ? 'bg-primary-50 text-primary-600' : 'text-slate-600 hover:bg-slate-50'
                                        }`}
                                >
                                    {type} Matches
                                </button>
                            ))}
                        </div>
                    )}
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
                <div className="glass-card rounded-[32px] p-8 flex items-center space-x-6 border-white">
                    <div className="p-4 bg-slate-50 rounded-[22px]">
                        <CheckCircle2 size={32} className="text-emerald-500" />
                    </div>
                    <div>
                        <p className="text-2xl font-semibold text-slate-900">{filteredMatches.filter(m => m.type === 'Triple').length}</p>
                        <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Multi-way</p>
                    </div>
                </div>
                <div className="md:col-span-2 glass-card rounded-[32px] p-8 border-white flex items-center justify-between">
                    <div className="grow">
                        <h4 className="font-semibold text-slate-900 tracking-tight">Active Preferences</h4>
                        <p className="text-xs text-slate-500 mt-1">Targeting multiple stations in your district.</p>
                    </div>
                    <button onClick={() => navigate('/preferences')} className="text-primary-600 font-medium text-xs uppercase tracking-wider hover:text-primary-800 transition-colors cursor-pointer">Adjust</button>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-center px-4">
                    <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider">Results ({filteredMatches.length})</h3>
                    {globalSearchQuery && (
                        <span className="text-[10px] font-bold text-primary-600 bg-primary-50 px-2 py-1 rounded-md">Searching: "{globalSearchQuery}"</span>
                    )}
                </div>
                {loading ? (
                    <div className="p-10 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                    </div>
                ) : filteredMatches.length > 0 ? (
                    filteredMatches.map((m, i) => (
                        <MatchRow key={i} match={m} currentUserId={user?.id} onViewDetails={handleViewDetails} />
                    ))
                ) : (
                    <div className="p-12 glass-card rounded-[32px] text-center border-white">
                        <MapPin size={48} className="mx-auto text-slate-200 mb-4" />
                        <p className="text-slate-500 font-medium">No matches found for current filters.</p>
                        <button onClick={() => navigate('/preferences')} className="mt-4 text-primary-600 text-xs font-bold uppercase tracking-widest hover:text-primary-800 transition-all cursor-pointer">Set Preferences</button>
                    </div>
                )}
            </div>

            {/* Match Details Modal */}
            {isMatchModalOpen && selectedMatch && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsMatchModalOpen(false)}></div>
                    <div className="relative w-full max-w-2xl bg-slate-50/95 backdrop-blur-2xl rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-white/40 animate-in zoom-in-95 duration-300">

                        <div className="p-6 sm:p-8 flex items-center justify-between border-b border-slate-200/50 bg-white/80 backdrop-blur-xl z-20 sticky top-0">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Match Details</h2>
                                <p className="text-sm font-medium text-slate-500 mt-1">
                                    {selectedMatch.type === 'Triple' ? '3-Way Match' : selectedMatch.type === 'Direct' ? 'Direct Match' : `${selectedMatch.type} Match`}
                                </p>
                            </div>
                            <button
                                onClick={() => setIsMatchModalOpen(false)}
                                className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 rounded-full transition-all cursor-pointer"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 sm:p-8 flex-1 overflow-y-auto custom-scrollbar relative z-10 space-y-6">

                            <div className="space-y-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-3 border-l-2 border-primary-500">Transfer Route</h3>
                                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md uppercase">92% Match Score</span>
                                </div>

                                <div className="bg-white rounded-[24px] border border-slate-100 p-2 shadow-sm relative overflow-hidden">
                                    <div className="absolute left-10 top-10 bottom-10 w-0.5 bg-slate-100 z-0 hidden sm:block"></div>
                                    {selectedMatch.participants.map((p: any, index: number) => {
                                        const nextPartner = selectedMatch.participants[(index + 1) % selectedMatch.participants.length];
                                        const isCurrentUser = p.userId === user?.id;

                                        return (
                                            <div key={index} className="flex flex-col relative z-10 mb-2 last:mb-0 p-4">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                    <div className="flex items-center space-x-4">
                                                        <div className="w-12 h-12 bg-slate-50 rounded-xl overflow-hidden border border-slate-200 shadow-sm shrink-0">
                                                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${p.name}`} alt="avatar" />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-slate-900 text-base">
                                                                {p.name} {isCurrentUser && <span className="text-[10px] ml-2 bg-primary-100 text-primary-700 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-bold">You</span>}
                                                            </p>
                                                            <p className="text-xs text-slate-500 font-medium flex items-center mt-1">
                                                                <MapPin size={12} className="mr-1 shrink-0" />
                                                                <span className="truncate max-w-[150px] sm:max-w-xs">{p.stationName}</span>
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center space-x-3 bg-slate-50/80 p-3 rounded-2xl border border-slate-100/60 sm:w-auto w-full">
                                                        <div className="shrink-0 text-slate-400">
                                                            <ArrowRightLeft size={16} />
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Moves to</p>
                                                            <p className="text-sm font-bold text-slate-900 truncate max-w-[150px]">{nextPartner.stationName}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Separation Arrow - Only show if not last item */}
                                                {index < selectedMatch.participants.length - 1 && (
                                                    <div className="absolute -bottom-3 left-1/2 sm:left-14 -translate-x-1/2 z-20">
                                                        <div className="bg-white text-slate-300 p-1 rounded-full border border-slate-100 shadow-sm hidden sm:flex">
                                                            <ChevronRight size={14} className="rotate-90" />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="bg-slate-900 text-white p-6 rounded-[24px] shadow-xl shadow-slate-900/10 flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden mt-8">
                                <div className="relative z-10 flex-1">
                                    <p className="text-sm text-slate-400 font-medium mb-1">
                                        {(() => {
                                            const currentUserIdx = selectedMatch.participants.findIndex((p: any) => p.userId === user?.id);
                                            const target = selectedMatch.participants[(currentUserIdx + 1) % selectedMatch.participants.length];

                                            if (target.requestStatus === 'PENDING') return "Request already sent to move to " + target.stationName;
                                            if (target.requestStatus === 'ACCEPTED') return "Match process established!";
                                            if (target.requestStatus === 'PENDING_INCOMING') return "You have a pending request from " + target.name;

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

                            <p className="text-[10px] text-slate-400 font-medium text-center px-6">
                                * Note: Contact details will only be visible once the target partner accepts your request.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Matches;
