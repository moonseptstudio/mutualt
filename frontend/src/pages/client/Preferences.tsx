import { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import { useOutletContext } from 'react-router-dom';
import {
    Search,
    GripVertical,
    Trash2,
    Plus,
    Info,
    Loader2,
    Filter
} from 'lucide-react';

const Preferences = () => {
    const { globalSearchQuery }: any = useOutletContext();
    const [allStations, setAllStations] = useState<any[]>([]);
    const [preferences, setPreferences] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [districtFilter, setDistrictFilter] = useState('');

    useEffect(() => {
        const loadPageData = async () => {
            setLoading(true);
            try {
                // Fetch stations (Public)
                const stationsRes = await apiClient.get('/public/stations');
                setAllStations(stationsRes.data);

                // Fetch preferences (Protected) - if this fails, we still have stations
                try {
                    const prefsRes = await apiClient.get('/preferences');
                    setPreferences(prefsRes.data);
                } catch (prefErr) {
                    console.warn("Could not load user preferences", prefErr);
                }
            } catch (err) {
                console.error("Error loading stations data", err);
            } finally {
                setLoading(false);
            }
        };
        loadPageData();
    }, []);

    const handleAddPreference = async (stationId: number) => {
        try {
            const response = await apiClient.post('/preferences', { stationId });
            setPreferences([...preferences, response.data]);
        } catch (err) {
            console.error("Error adding preference", err);
        }
    };

    const handleRemovePreference = async (prefId: number) => {
        try {
            await apiClient.delete(`/preferences/${prefId}`);
            setPreferences(preferences.filter(p => p.id !== prefId));
        } catch (err) {
            console.error("Error removing preference", err);
        }
    };

    const filteredStations = allStations.filter(s => {
        const matchesGlobal = globalSearchQuery
            ? (s.name?.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
                s.district?.toLowerCase().includes(globalSearchQuery.toLowerCase()))
            : true;

        const matchesLocal = searchQuery
            ? (s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.district?.toLowerCase().includes(searchQuery.toLowerCase()))
            : true;

        const matchesDistrict = districtFilter ? s.district === districtFilter : true;

        return matchesGlobal && matchesLocal && matchesDistrict;
    });

    const districts = Array.from(new Set(allStations.map(s => s.district))).sort();

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <Loader2 className="animate-spin text-primary-600" size={40} />
            </div>
        );
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-8">
            <div>
                <h1 className="text-4xl font-semibold text-slate-950 tracking-tight leading-none">Transfer Preferences</h1>
                <p className="text-slate-500 mt-2 font-medium">Rank your target stations by priority to optimize matching.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass-card rounded-[32px] p-6 border-white bg-white/40">
                        <div className="flex items-center justify-between mb-6 px-2">
                            <h3 className="font-semibold text-slate-900 uppercase text-xs tracking-wider">Ranked Selection</h3>
                            <span className="text-xs font-bold text-slate-400">Your prioritized list</span>
                        </div>

                        <div className="space-y-3">
                            {preferences.length > 0 ? (
                                preferences.map((item, i) => (
                                    <div key={item.id} className="flex items-center space-x-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm group hover:border-primary-200 transition-all">
                                        <div className="text-slate-300 group-hover:text-primary-400 transition-colors">
                                            <GripVertical size={20} />
                                        </div>
                                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center font-medium text-xs text-slate-400 group-hover:bg-primary-50 group-hover:text-primary-600 transition-all">
                                            {i + 1}
                                        </div>
                                        <div className="grow">
                                            <p className="font-semibold text-slate-900 leading-tight">{item.preferredStation.name}</p>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-0.5">{item.preferredStation.district}</p>
                                        </div>
                                        <button
                                            onClick={() => handleRemovePreference(item.id)}
                                            className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-10 text-slate-400 italic">
                                    No preferences added yet.
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-slate-900 rounded-[32px] p-8 text-white relative overflow-hidden">
                        <div className="relative z-10 flex items-start space-x-4">
                            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md">
                                <Info size={20} className="text-primary-400" />
                            </div>
                            <div>
                                <h4 className="font-semibold tracking-tight mb-2">Priority Matching Logic</h4>
                                <p className="text-white/50 text-xs font-medium leading-relaxed max-w-md">
                                    Our algorithm prioritizes matches for your #1 ranked station. Increasing your list to 5 stations improves match probability by 40%.
                                </p>
                            </div>
                        </div>
                        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-primary-500/10 rounded-full blur-3xl"></div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="glass-card rounded-[32px] p-8 border-white">
                        <h3 className="text-lg font-semibold text-slate-900 tracking-tight mb-6">Discovery</h3>

                        <div className="space-y-4 mb-8">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search stations..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-4 focus:ring-primary-100 transition-all outline-none"
                                />
                            </div>

                            <div className="relative">
                                <Filter size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <select
                                    value={districtFilter}
                                    onChange={(e) => setDistrictFilter(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-4 focus:ring-primary-100 transition-all outline-none appearance-none cursor-pointer"
                                >
                                    <option value="">All Districts</option>
                                    {districts.map(d => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider border-l-2 border-primary-500 pl-3">Results ({filteredStations.length})</p>
                                {(searchQuery || districtFilter || globalSearchQuery) && (
                                    <button
                                        onClick={() => { setSearchQuery(''); setDistrictFilter(''); }}
                                        className="text-[10px] font-bold text-primary-600 uppercase hover:text-primary-800"
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>

                            {filteredStations.map(station => (
                                <div key={station.id} className="p-4 bg-slate-50/50 rounded-2xl border border-transparent hover:border-slate-100 hover:bg-white transition-all cursor-pointer group">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold text-slate-900 text-sm group-hover:text-primary-600 transition-colors">{station.name}</p>
                                            <p className="text-xs text-slate-400 font-medium mt-0.5">{station.district} • {station.province}</p>
                                        </div>
                                        <button
                                            disabled={preferences.some(p => p.preferredStation.id === station.id)}
                                            onClick={() => handleAddPreference(station.id)}
                                            className="p-1.5 bg-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-sm border border-slate-100 disabled:opacity-30"
                                        >
                                            <Plus size={14} className="text-primary-600" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {filteredStations.length === 0 && (
                                <div className="py-10 text-center text-slate-400 text-xs italic">
                                    No stations match your filters.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Preferences;
