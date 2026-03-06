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
    X
} from 'lucide-react';
import toast from 'react-hot-toast';

const MatchRow = ({ match, currentUserId }: any) => {
    const partner = match.participants.find((p: any) => p.userId !== currentUserId) || match.participants[0];
    const from = partner.stationName;
    const to = match.participants.find((p: any) => p.userId === currentUserId)?.stationName || "Your Station";

    return (
        <div className="glass-card p-6 rounded-[32px] border-white hover:scale-[1.01] transition-all duration-500 cursor-pointer group">
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
                        <h4 className="text-lg font-semibold text-slate-900 group-hover:text-primary-600 transition-colors">{partner.name}</h4>
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
                        onClick={() => toast('Match details coming soon', { icon: '📄' })}
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
    const [typeFilter, setTypeFilter] = useState('All');
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        const fetchMatches = async () => {
            try {
                const response = await apiClient.get('/matches');
                setMatches(response.data);
            } catch (err) {
                console.error("Failed to fetch matches", err);
            } finally {
                setLoading(false);
            }
        };
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

    return (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-8">
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
                        <MatchRow key={i} match={m} currentUserId={user?.id} />
                    ))
                ) : (
                    <div className="p-12 glass-card rounded-[32px] text-center">
                        <MapPin size={48} className="mx-auto text-slate-200 mb-4" />
                        <p className="text-slate-500 font-medium">No matches found for current filters.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Matches;
