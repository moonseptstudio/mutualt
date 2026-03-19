import { useState, useEffect, useRef } from 'react';
import apiClient from '../../api/client';
import { useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router-dom';
import {
    Search,
    GripVertical,
    Trash2,
    Plus,
    Info,
    Filter,
    X,
    MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import PageLoader from '../../components/common/PageLoader';
import ConfirmationModal from '../../components/common/ConfirmationModal';

const Preferences = () => {
    const { t } = useTranslation();
    const { globalSearchQuery }: any = useOutletContext();
    const [allStations, setAllStations] = useState<any[]>([]);
    const [preferences, setPreferences] = useState<any[]>([]);
    const [currentStationId, setCurrentStationId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDistrictDropdownOpen, setIsDistrictDropdownOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [districtFilter, setDistrictFilter] = useState('');
    const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
    const districtDropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (districtDropdownRef.current && !districtDropdownRef.current.contains(event.target as Node)) {
                setIsDistrictDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Delete Confirmation Modal state
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [preferenceToDelete, setPreferenceToDelete] = useState<number | null>(null);

    useEffect(() => {
        const loadPageData = async () => {
            setLoading(true);
            try {
                // Fetch user profile to get current station and field string
                const profileRes = await apiClient.get('/profile/me');
                let userFieldId: number | null = null;

                if (profileRes.data) {
                    if (profileRes.data.currentStationId) {
                        setCurrentStationId(profileRes.data.currentStationId);
                    }
                    if (profileRes.data.fieldId) {
                        userFieldId = profileRes.data.fieldId;
                    }
                }

                // Fetch stations filtered by the user's field
                const stationsUrl = userFieldId ? `/public/stations?fieldId=${userFieldId}` : '/public/stations';
                const stationsRes = await apiClient.get(stationsUrl);
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
            toast.success(t('preferences.toast_added'));
        } catch (err) {
            console.error("Error adding preference", err);
            toast.error(t('preferences.toast_add_failed'));
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
            toast.success(t('preferences.toast_removed'));
        } catch (err: any) {
            console.error("Error removing preference", err);
            const errMsg = err.response?.data?.message || err.response?.data || err.message || 'Unknown error';
            toast.error(t('preferences.toast_remove_failed', { error: errMsg }));
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

    const districts = Array.from(new Set(allStations.map(s => s.district).filter(Boolean))).sort();

    if (loading) return <PageLoader />;

    return (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-8 pb-32 sm:pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-4xl font-semibold text-[var(--text-main)] tracking-tight leading-tight">{t('preferences.title')}</h1>
                    <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-2 font-medium">{t('preferences.subtitle')}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass-card rounded-[32px] p-6 sm:p-8 border-[var(--border-main)] bg-[var(--bg-card)]/40 shadow-xl shadow-slate-200/40">
                        <div className="flex  flex-row sm:items-center justify-between mb-6 sm:mb-8 px-1 sm:px-2 border-b border-[var(--border-main)]/50 pb-4">
                            <div className="flex items-center space-x-2.5 mt-4 sm:mt-0">
                                <h3 className="font-bold text-[var(--text-main)] text-base sm:text-xl tracking-tight">{t('preferences.ranked_selection')}</h3>
                            </div>
                            <div className="flex items-center space-x-2.5 mt-4 sm:mt-0">
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="flex items-center justify-center space-x-2 px-6 py-4 bg-primary-600 text-white rounded-xl font-bold text-xs sm:text-sm hover:bg-primary-700 hover:shadow-lg hover:shadow-primary-500/30 transition-all cursor-pointer active:scale-95"
                                >
                                    <Plus size={16} />
                                    <span>{t('preferences.add_button')}</span>
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4" onDragOver={(e) => e.preventDefault()}>
                            {preferences.length > 0 ? (
                                <AnimatePresence mode="popLayout" initial={false}>
                                    {preferences.map((item, i) => (
                                        <motion.div
                                            key={item.id}
                                            layout
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
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
                                                title={t('preferences.remove_tooltip')}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            ) : (
                                <div className="text-center py-16 px-6 glass-card rounded-[24px] border-dashed border-2 border-slate-200 dark:border-slate-800 bg-[var(--bg-card)]/50">
                                    <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <MapPin size={24} className="text-slate-300 dark:text-slate-700" />
                                    </div>
                                    <h4 className="text-[var(--text-main)] font-semibold mb-2">{t('preferences.no_prefs_title')}</h4>
                                    <p className="text-sm text-[var(--text-muted)] max-w-sm mx-auto mb-6">{t('preferences.no_prefs_subtitle')}</p>
                                    <button
                                        onClick={() => setIsModalOpen(true)}
                                        className="inline-flex items-center justify-center space-x-2 px-6 py-3 bg-[var(--text-main)] text-[var(--bg-main)] rounded-xl font-medium text-sm hover:opacity-90 hover:shadow-lg transition-all cursor-pointer"
                                    >
                                        <Plus size={16} />
                                        <span>{t('preferences.add_first')}</span>
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
                            <h4 className="text-xl font-semibold tracking-tight mb-3">{t('preferences.info_title')}</h4>
                            <p className="text-white/60 text-sm font-medium leading-relaxed mb-6">
                                {t('preferences.info_desc')}
                            </p>
                            <div className="w-full h-px bg-white/10 mb-6"></div>
                            <ul className="space-y-3">
                                <li className="flex items-start space-x-3 text-sm text-white/80 font-medium">
                                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></div>
                                    <span>{t('preferences.prob_hint')}</span>
                                </li>
                                <li className="flex items-start space-x-3 text-sm text-white/80 font-medium">
                                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0"></div>
                                    <span>{t('preferences.exclude_hint')}</span>
                                </li>
                            </ul>
                        </div>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                        <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-500/20 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4"></div>
                    </div>
                </div>
            </div>

            {/* Discovery Discovery Section (Modal/Bottom Sheet) */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-slate-900/40 dark:bg-black/80 backdrop-blur-sm"
                        ></motion.div>

                        <motion.div
                            initial={{ y: "100%", opacity: 0.5 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: "100%", opacity: 0.5 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="relative w-full sm:max-w-4xl h-[90vh] sm:h-auto sm:max-h-[90vh] bg-[var(--bg-card)] rounded-t-[32px] sm:rounded-[32px] shadow-2xl overflow-hidden flex flex-col border border-[var(--border-main)]"
                        >
                            {/* Drag Indicator for Mobile */}
                            <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto my-3 sm:hidden shrink-0"></div>

                            {/* Modal Header - Sticky */}
                            <div className="px-6 py-4 sm:p-8 flex items-center justify-between border-b border-[var(--border-main)]/50 bg-[var(--bg-card)]/95 backdrop-blur-xl z-30 sticky top-0">
                                <div>
                                    <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-main)] tracking-tight">{t('preferences.discover_title')}</h2>
                                    <p className="text-xs sm:text-sm font-medium text-[var(--text-muted)] mt-0.5 sm:mt-1">{t('preferences.discover_subtitle')}</p>
                                </div>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-2 sm:p-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-[var(--text-main)] rounded-full transition-all cursor-pointer"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-8 relative z-10">
                                {/* Search & Filter - Nested Sticky */}
                                <div className="sticky top-0 z-20 bg-[var(--bg-card)] pb-4 -mx-1 px-1">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                                        <div className="relative md:col-span-2">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <input
                                                type="text"
                                                placeholder={t('preferences.search_placeholder')}
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="w-full pl-12 pr-4 py-3 sm:py-4 bg-[var(--bg-main)]/50 border border-[var(--border-main)] rounded-2xl text-sm font-medium text-[var(--text-main)] focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none shadow-sm"
                                            />
                                        </div>

                                        <div className="relative" ref={districtDropdownRef}>
                                            <button
                                                onClick={() => setIsDistrictDropdownOpen(!isDistrictDropdownOpen)}
                                                className={`w-full flex items-center justify-between pl-12 pr-6 py-3 sm:py-4 bg-[var(--bg-main)]/50 border ${isDistrictDropdownOpen ? 'border-primary-500 ring-4 ring-primary-500/10' : 'border-[var(--border-main)]'} rounded-2xl text-sm font-bold text-[var(--text-main)] hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer shadow-sm text-left`}
                                            >
                                                <Filter size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDistrictDropdownOpen ? 'text-primary-500' : 'text-slate-400'} transition-colors`} />
                                                <span className={!districtFilter ? 'text-slate-400 font-medium' : ''}>
                                                    {districtFilter || t('preferences.all_districts')}
                                                </span>
                                                <motion.div
                                                    animate={{ rotate: isDistrictDropdownOpen ? 180 : 0 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                    </svg>
                                                </motion.div>
                                            </button>

                                            <AnimatePresence>
                                                {isDistrictDropdownOpen && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: -10, scale: 0.98 }}
                                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                                        exit={{ opacity: 0, y: -10, scale: 0.98 }}
                                                        className="absolute top-full left-0 right-0 mt-2 z-50 bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl"
                                                    >
                                                        <div className="max-h-60 overflow-y-auto custom-scrollbar py-2">
                                                            <button
                                                                onClick={() => { setDistrictFilter(''); setIsDistrictDropdownOpen(false); }}
                                                                className={`w-full text-left px-6 py-3 text-sm font-bold transition-colors ${!districtFilter ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                                                            >
                                                                {t('preferences.all_districts')}
                                                            </button>
                                                            {districts.map(d => (
                                                                <button
                                                                    key={d}
                                                                    onClick={() => { setDistrictFilter(d); setIsDistrictDropdownOpen(false); }}
                                                                    className={`w-full text-left px-6 py-3 text-sm font-bold transition-colors ${districtFilter === d ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400' : 'text-[var(--text-main)] hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                                                                >
                                                                    {d}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between mt-6">
                                        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest pl-2 border-l-2 border-primary-500">{t('preferences.available_results', { count: filteredStations.length })}</p>
                                        {(searchQuery || districtFilter || globalSearchQuery) && (
                                            <button
                                                onClick={() => { setSearchQuery(''); setDistrictFilter(''); }}
                                                className="text-[10px] font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 px-3 py-1.5 rounded-lg uppercase hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-colors"
                                            >
                                                {t('preferences.clear_filters')}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4 pt-2">
                                    {filteredStations.length > 0 ? (
                                        <div className="space-y-3">
                                            {filteredStations.map(station => {
                                                const isCurrentStation = station.id == currentStationId;
                                                return (
                                                    <motion.div
                                                        key={station.id}
                                                        layout
                                                        initial={{ opacity: 0, scale: 0.98 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        whileHover={!isCurrentStation ? { scale: 1.01 } : {}}
                                                        whileTap={!isCurrentStation ? { scale: 0.98 } : {}}
                                                        className={`p-4 bg-[var(--bg-card)] rounded-2xl border border-[var(--border-main)]/60 ${!isCurrentStation ? 'hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-md group' : 'opacity-70'} transition-all flex flex-row items-center justify-between gap-4`}
                                                    >
                                                        <div className="min-w-0">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <p className={`font-bold text-sm sm:text-[15px] leading-tight transition-colors truncate ${isCurrentStation ? 'text-slate-500' : 'text-[var(--text-main)] group-hover:text-primary-600 dark:group-hover:text-primary-400'}`}>{station.name}</p>
                                                                {isCurrentStation && (
                                                                    <span className="shrink-0 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[9px] font-bold rounded-md uppercase tracking-wide">{t('preferences.current_label')}</span>
                                                                )}
                                                            </div>
                                                            <p className="text-[10px] sm:text-xs text-[var(--text-muted)] font-medium truncate flex items-center">
                                                                <MapPin size={10} className="mr-1 sm:size-[12px]" />
                                                                {station.district} • {station.province}
                                                            </p>
                                                        </div>
                                                        <button
                                                            onClick={() => !isCurrentStation && handleAddPreference(station.id)}
                                                            disabled={isCurrentStation}
                                                            className={`shrink-0 flex items-center justify-center space-x-1 sm:space-x-2 px-3 sm:px-5 py-2 sm:py-2.5 border rounded-xl text-[11px] sm:text-sm font-semibold transition-all shadow-sm ${isCurrentStation ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-50 hover:bg-primary-600 border-slate-100 hover:border-transparent text-slate-700 hover:text-white cursor-pointer'}`}
                                                        >
                                                            <Plus size={14} className="sm:size-[16px]" />
                                                            <span className="hidden xs:inline">{isCurrentStation ? t('preferences.your_station') : t('preferences.add_label')}</span>
                                                            <span className="xs:hidden">{isCurrentStation ? '' : t('preferences.add_label')}</span>
                                                        </button>
                                                    </motion.div>
                                                )
                                            })}
                                        </div>
                                    ) : (
                                        <div className="py-16 text-center bg-[var(--bg-card)] rounded-[24px] border border-[var(--border-main)] shadow-sm">
                                            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <Search size={24} className="text-slate-300 dark:text-slate-700" />
                                            </div>
                                            <p className="text-[var(--text-main)] font-semibold mb-1">{t('preferences.no_results_title')}</p>
                                            <p className="text-[var(--text-muted)] text-sm max-w-xs mx-auto">{t('preferences.no_results_subtitle')}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={executeRemovePreference}
                title={t('preferences.remove_confirm_title')}
                message={t('preferences.remove_confirm_msg')}
                confirmText={t('preferences.remove_label')}
                type="danger"
            />
        </div>
    );
};

export default Preferences;
