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
    Filter,
    X,
    MapPin
} from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmationModal from '../../components/common/ConfirmationModal';

const Preferences = () => {
    const { globalSearchQuery }: any = useOutletContext();
    const [allStations, setAllStations] = useState<any[]>([]);
    const [preferences, setPreferences] = useState<any[]>([]);
    const [currentStationId, setCurrentStationId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [districtFilter, setDistrictFilter] = useState('');
    const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);

    // Delete Confirmation Modal state
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [preferenceToDelete, setPreferenceToDelete] = useState<number | null>(null);

    useEffect(() => {
        const loadPageData = async () => {
            setLoading(true);
            try {
                // Fetch user profile to get current station
                const profileRes = await apiClient.get('/profile/me');
                if (profileRes.data && profileRes.data.currentStationId) {
                    setCurrentStationId(profileRes.data.currentStationId);
                }

                // Fetch stations (Public)
                const stationsRes = await apiClient.get('/public/stations');
                setAllStations(stationsRes.data);

                // Fetch preferences (Protected)
                try {
                    const prefsRes = await apiClient.get('/preferences');
                    setPreferences(prefsRes.data);
                } catch (prefErr) {
                    console.warn("Could not load user preferences", prefErr);
                }
            } catch (err) {
                console.error("Error loading data", err);
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
            toast.success('Station added to preferences!');
        } catch (err) {
            console.error("Error adding preference", err);
            toast.error('Failed to add station.');
        }
    };

    const confirmRemovePreference = (prefId: number) => {
        setPreferenceToDelete(prefId);
        setIsDeleteModalOpen(true);
    };

    const executeRemovePreference = async () => {
        if (preferenceToDelete === null) return;
        try {
            await apiClient.delete(`/preferences/${preferenceToDelete}`);
            setPreferences(preferences.filter(p => p.id !== preferenceToDelete));
            toast.success('Preference removed successfully.');
        } catch (err: any) {
            console.error("Error removing preference", err);
            const errMsg = err.response?.data?.message || err.response?.data || err.message || 'Unknown error';
            toast.error(`Failed to remove preference: ${errMsg}`);
        } finally {
            setIsDeleteModalOpen(false);
            setPreferenceToDelete(null);
        }
    };

    const handleDragStart = (index: number) => {
        setDraggedItemIndex(index);
    };

    const handleDragEnter = (index: number) => {
        if (draggedItemIndex === null || draggedItemIndex === index) return;

        const newPreferences = [...preferences];
        const draggedItemContext = newPreferences[draggedItemIndex];

        newPreferences.splice(draggedItemIndex, 1);
        newPreferences.splice(index, 0, draggedItemContext);

        setDraggedItemIndex(index);
        setPreferences(newPreferences);
    };

    const handleDragEnd = async () => {
        setDraggedItemIndex(null);
        try {
            const preferenceIds = preferences.map(p => p.id);
            await apiClient.post('/preferences/reorder', preferenceIds);
        } catch (error) {
            console.error("Failed to save reordered preferences", error);
        }
    };

    // Filter logic for stations in Modal
    const availableStations = allStations.filter(s => {
        // Exclude already added preferences
        if (preferences.some(p => p.preferredStation.id === s.id)) return false;

        return true;
    });

    const filteredStations = availableStations.filter(s => {
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
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-8 pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-4xl font-semibold text-[var(--text-main)] tracking-tight leading-tight">Transfer Preferences</h1>
                    <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-2 font-medium">Rank your target stations by priority to optimize matching.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center justify-center space-x-2 px-6 py-3 sm:py-3.5 bg-primary-600 text-white rounded-xl sm:rounded-2xl font-semibold text-xs sm:text-sm hover:bg-primary-700 transition-all cursor-pointer"
                >
                    <Plus size={18} />
                    <span>Add Preference</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass-card rounded-[32px] p-6 sm:p-8 border-[var(--border-main)] bg-[var(--bg-card)]/40 shadow-xl shadow-slate-200/40">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 px-1 sm:px-2 border-b border-[var(--border-main)]/50 pb-4">
                            <div>
                                <h3 className="font-bold text-[var(--text-main)] text-base sm:text-lg tracking-tight">Ranked Selection</h3>
                                <p className="text-[10px] sm:text-xs font-medium text-[var(--text-muted)] mt-1">Drag and drop to reorder your prioritized list</p>
                            </div>
                            <span className="mt-3 sm:mt-0 w-fit px-3 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-[10px] sm:text-xs font-bold rounded-lg border border-primary-100 dark:border-primary-800">
                                {preferences.length} Selected
                            </span>
                        </div>

                        <div className="space-y-4" onDragOver={(e) => e.preventDefault()}>
                            {preferences.length > 0 ? (
                                preferences.map((item, i) => (
                                    <div
                                        key={item.id}
                                        draggable
                                        onDragStart={() => handleDragStart(i)}
                                        onDragEnter={() => handleDragEnter(i)}
                                        onDragEnd={handleDragEnd}
                                        onDragOver={(e) => e.preventDefault()}
                                        className={`flex items-center space-x-3 sm:space-x-4 p-4 sm:p-5 bg-[var(--bg-card)] rounded-2xl sm:rounded-[24px] border shadow-sm group hover:border-primary-300 dark:hover:border-primary-700 transition-all ${draggedItemIndex === i ? 'opacity-50 border-primary-400 scale-[0.98]' : 'border-[var(--border-main)]'}`}
                                    >
                                        <div className="text-slate-300 dark:text-slate-600 hover:text-primary-500 transition-colors cursor-grab active:cursor-grabbing p-1 -ml-1 sm:p-2 sm:-ml-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                            <GripVertical size={24} />
                                        </div>
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center font-bold text-xs sm:text-sm text-slate-400 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/30 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-all border border-slate-100 dark:border-slate-700 group-hover:border-primary-200 dark:group-hover:border-primary-800 shrink-0">
                                            {i + 1}
                                        </div>
                                        <div className="grow min-w-0">
                                            <p className="font-bold text-[var(--text-main)] text-base sm:text-lg leading-tight truncate">{item.preferredStation.name}</p>
                                            <div className="flex items-center text-[10px] sm:text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mt-1 sm:mt-1.5 space-x-3">
                                                <span className="flex items-center">
                                                    <MapPin size={12} className="mr-1" />
                                                    {item.preferredStation.district}
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => confirmRemovePreference(item.id)}
                                            className="p-2 sm:p-3 text-slate-300 hover:text-white hover:bg-rose-500 rounded-lg sm:rounded-xl transition-all cursor-pointer shrink-0"
                                            title="Remove Preference"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-16 px-6 glass-card rounded-[24px] border-dashed border-2 border-slate-200 dark:border-slate-800 bg-[var(--bg-card)]/50">
                                    <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <MapPin size={24} className="text-slate-300 dark:text-slate-700" />
                                    </div>
                                    <h4 className="text-[var(--text-main)] font-semibold mb-2">No preferences added yet</h4>
                                    <p className="text-sm text-[var(--text-muted)] max-w-sm mx-auto mb-6">You haven't added any hospitals to your transfer preferences. Click the button below to start building your list.</p>
                                    <button
                                        onClick={() => setIsModalOpen(true)}
                                        className="inline-flex items-center justify-center space-x-2 px-6 py-3 bg-[var(--text-main)] text-[var(--bg-main)] rounded-xl font-medium text-sm hover:opacity-90 hover:shadow-lg transition-all cursor-pointer"
                                    >
                                        <Plus size={16} />
                                        <span>Add First Station</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-slate-900 dark:bg-slate-800/80 rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl shadow-slate-900/20">
                        <div className="relative z-10 flex flex-col items-start">
                            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md mb-6 inline-flex border border-white/10">
                                <Info size={24} className="text-primary-400" />
                            </div>
                            <h4 className="text-xl font-semibold tracking-tight mb-3">Priority Matching Logic</h4>
                            <p className="text-white/60 text-sm font-medium leading-relaxed mb-6">
                                Our algorithm heavily prioritizes finding matches for your #1 ranked station. It will look for direct, 3-way, and complex routes.
                            </p>
                            <div className="w-full h-px bg-white/10 mb-6"></div>
                            <ul className="space-y-3">
                                <li className="flex items-start space-x-3 text-sm text-white/80 font-medium">
                                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></div>
                                    <span>Selecting multiple stations increases match probability by up to 45%.</span>
                                </li>
                                <li className="flex items-start space-x-3 text-sm text-white/80 font-medium">
                                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0"></div>
                                    <span>Your current station is automatically excluded from Discovery.</span>
                                </li>
                            </ul>
                        </div>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                        <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-500/20 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4"></div>
                    </div>
                </div>
            </div>

            {/* Discovery Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
                    <div className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
                    <div className="relative w-full max-w-4xl bg-[var(--bg-card)]/95 backdrop-blur-2xl rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-[var(--border-main)] animate-in zoom-in-95 duration-300">

                        {/* Modal Header */}
                        <div className="p-6 sm:p-8 flex items-center justify-between border-b border-[var(--border-main)]/50 bg-[var(--bg-card)]/80 backdrop-blur-xl z-20 sticky top-0">
                            <div>
                                <h2 className="text-2xl font-bold text-[var(--text-main)] tracking-tight">Discover Stations</h2>
                                <p className="text-sm font-medium text-[var(--text-muted)] mt-1">Find and add hospitals to your preference list</p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-[var(--text-main)] rounded-full transition-all cursor-pointer"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 sm:p-8 flex-1 overflow-y-auto custom-scrollbar relative z-10">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                <div className="relative md:col-span-2">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search station name or district..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 bg-[var(--bg-main)]/50 border border-[var(--border-main)] rounded-2xl text-sm font-medium text-[var(--text-main)] focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none shadow-sm"
                                    />
                                </div>

                                <div className="relative">
                                    <Filter size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <select
                                        value={districtFilter}
                                        onChange={(e) => setDistrictFilter(e.target.value)}
                                        className="w-full pl-12 pr-10 py-4 bg-[var(--bg-main)]/50 border border-[var(--border-main)] rounded-2xl text-sm font-medium text-[var(--text-main)] focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none appearance-none cursor-pointer shadow-sm"
                                    >
                                        <option value="" className="bg-[var(--bg-card)]">All Districts</option>
                                        {districts.map(d => (
                                            <option key={d} value={d} className="bg-[var(--bg-card)]">{d}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <div className="w-2 h-2 border-r-2 border-b-2 border-slate-400 rotate-45 transform origin-center"></div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest pl-2 border-l-2 border-primary-500">Available Results ({filteredStations.length})</p>
                                    {(searchQuery || districtFilter || globalSearchQuery) && (
                                        <button
                                            onClick={() => { setSearchQuery(''); setDistrictFilter(''); }}
                                            className="text-[10px] font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 px-3 py-1.5 rounded-lg uppercase hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-colors"
                                        >
                                            Clear Filters
                                        </button>
                                    )}
                                </div>

                                {filteredStations.length > 0 ? (
                                    <div className="space-y-3">
                                        {filteredStations.map(station => {
                                            const isCurrentStation = station.id == currentStationId;
                                            return (
                                                <div key={station.id} className={`p-4 bg-[var(--bg-card)] rounded-2xl border border-[var(--border-main)]/60 ${!isCurrentStation ? 'hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-md group' : 'opacity-70'} transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <p className={`font-bold text-[15px] leading-tight transition-colors ${isCurrentStation ? 'text-slate-500' : 'text-[var(--text-main)] group-hover:text-primary-600 dark:group-hover:text-primary-400'}`}>{station.name}</p>
                                                            {isCurrentStation && (
                                                                <span className="shrink-0 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-bold rounded-md uppercase tracking-wide">Current</span>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-[var(--text-muted)] font-medium truncate flex items-center">
                                                            <MapPin size={12} className="mr-1" />
                                                            {station.district} • {station.province}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() => !isCurrentStation && handleAddPreference(station.id)}
                                                        disabled={isCurrentStation}
                                                        className={`shrink-0 flex items-center justify-center space-x-2 px-5 py-2.5 border rounded-xl text-sm font-semibold transition-all shadow-sm ${isCurrentStation ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-50 hover:bg-primary-600 border-slate-100 hover:border-transparent text-slate-700 hover:text-white cursor-pointer'}`}
                                                    >
                                                        <Plus size={16} />
                                                        <span>{isCurrentStation ? 'Your Station' : 'Add'}</span>
                                                    </button>
                                                </div>
                                            )
                                        })}
                                    </div>
                                ) : (
                                    <div className="py-16 text-center bg-[var(--bg-card)] rounded-[24px] border border-[var(--border-main)] shadow-sm">
                                        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Search size={24} className="text-slate-300 dark:text-slate-700" />
                                        </div>
                                        <p className="text-[var(--text-main)] font-semibold mb-1">No stations found</p>
                                        <p className="text-[var(--text-muted)] text-sm max-w-xs mx-auto">We couldn't find any stations matching your search criteria.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={executeRemovePreference}
                title="Remove Preference?"
                message="Are you sure you want to remove this station from your preferences? This action cannot be undone."
                confirmText="Remove"
                type="danger"
            />
        </div>
    );
};

export default Preferences;
