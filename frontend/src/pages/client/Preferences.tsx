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
import { motion, AnimatePresence, Reorder, useDragControls } from 'framer-motion';
import toast from 'react-hot-toast';
import { PreferencesSkeleton } from '../../components/common/Skeletons';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import StationRequestModal from '../../components/StationRequestModal';

interface PreferenceItemProps {
    item: any;
    index: number;
    onRemove: (id: number) => void;
    onDragEnd: () => void;
}

const PreferenceItem: React.FC<PreferenceItemProps> = ({ item, index, onRemove, onDragEnd }) => {
    const controls = useDragControls();
    const { t } = useTranslation();

    return (
        <Reorder.Item
            value={item}
            dragListener={false}
            dragControls={controls}
            onDragEnd={onDragEnd}
            whileDrag={{
                scale: 1.02,
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.12), 0 8px 10px -6px rgba(0, 0, 0, 0.08)",
                zIndex: 50,
            }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="relative flex items-center space-x-3 sm:space-x-4 p-4 sm:p-5 bg-[var(--bg-card)] rounded-2xl sm:rounded-[24px] border border-[var(--border-main)] shadow-sm group hover:border-primary-300 dark:hover:border-primary-700 transition-colors select-none"
        >
            <div
                onPointerDown={(e) => controls.start(e)}
                className="flex items-center space-x-2 sm:space-x-3 cursor-grab active:cursor-grabbing touch-none select-none"
            >
                <div className="text-slate-300 dark:text-slate-600 hover:text-primary-500 transition-colors p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/80">
                    <GripVertical size={24} />
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center font-bold text-xs sm:text-sm text-slate-400 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/30 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-all border border-slate-100 dark:border-slate-700 group-hover:border-primary-200 dark:group-hover:border-primary-800 shrink-0">
                    {index + 1}
                </div>
            </div>
            <div className="grow min-w-0">
                <div className="flex items-center space-x-2">
                    <p className="font-bold text-[var(--text-main)] text-base sm:text-lg leading-tight truncate">
                        {item.preferredStation?.name}
                    </p>
                    {item.preferredStation?.status === 'PENDING' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-700 shrink-0">
                            ⏳ Pending Approval
                        </span>
                    )}
                </div>
                <div className="flex items-center text-[10px] sm:text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mt-1 sm:mt-1.5 space-x-3">
                    <span className="flex items-center">
                        <MapPin size={12} className="mr-1" />
                        {item.preferredStation?.district}
                    </span>
                </div>
            </div>
            <button
                type="button"
                onClick={() => onRemove(item.id)}
                className="p-2 sm:p-3 text-slate-300 hover:text-white hover:bg-rose-500 rounded-lg sm:rounded-xl transition-all cursor-pointer shrink-0"
                title={t('preferences.remove_tooltip')}
            >
                <Trash2 size={18} />
            </button>
        </Reorder.Item>
    );
};

const Preferences = () => {
    const { t } = useTranslation();
    const { globalSearchQuery }: any = useOutletContext();
    const [allStations, setAllStations] = useState<any[]>([]);
    const [preferences, setPreferences] = useState<any[]>([]);
    const [currentStationId, setCurrentStationId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [userProfile, setUserProfile] = useState<any>(null);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [isDistrictDropdownOpen, setIsDistrictDropdownOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [districtFilter, setDistrictFilter] = useState('');
    const districtDropdownRef = useRef<HTMLDivElement>(null);
    const preferencesRef = useRef(preferences);
    preferencesRef.current = preferences;

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
                    setUserProfile(profileRes.data);
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

    const handleReorder = (newPreferences: any[]) => {
        setPreferences(newPreferences);
    };

    const handleReorderEnd = async () => {
        try {
            const preferenceIds = preferencesRef.current.map(p => p.id);
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

    if (loading) {
        return (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-8 pb-32 sm:pb-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-4xl font-semibold text-[var(--text-main)] tracking-tight leading-tight">{t('preferences.title')}</h1>
                        <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-2 font-medium">{t('preferences.subtitle')}</p>
                    </div>
                </div>
                <PreferencesSkeleton />
            </div>
        );
    }

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

                        <div className="space-y-4">
                            {preferences.length > 0 ? (
                                <Reorder.Group
                                    axis="y"
                                    values={preferences}
                                    onReorder={handleReorder}
                                    className="space-y-4"
                                >
                                    {preferences.map((item, i) => (
                                        <PreferenceItem
                                            key={item.id}
                                            item={item}
                                            index={i}
                                            onRemove={confirmRemovePreference}
                                            onDragEnd={handleReorderEnd}
                                        />
                                    ))}
                                </Reorder.Group>
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

                            {/* Modal Header & Top Search Bar - Fixed at top */}
                            <div className="px-6 py-4 sm:px-8 sm:py-5 border-b border-[var(--border-main)]/50 bg-[var(--bg-card)]/95 backdrop-blur-xl z-30 shrink-0">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-main)] tracking-tight">{t('preferences.discover_title')}</h2>
                                        <p className="text-xs sm:text-sm font-medium text-[var(--text-muted)] mt-0.5 sm:mt-1">{t('preferences.discover_subtitle')}</p>
                                    </div>
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="p-2 sm:p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-[var(--text-main)] rounded-full transition-all cursor-pointer"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                {/* Top Search Bar & District Filter */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div className="relative md:col-span-2">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="text"
                                            placeholder={t('preferences.search_placeholder')}
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-12 pr-10 py-3 sm:py-3.5 bg-[var(--bg-main)]/50 border border-[var(--border-main)] rounded-2xl text-sm font-medium text-[var(--text-main)] focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none shadow-sm"
                                        />
                                        {searchQuery && (
                                            <button
                                                type="button"
                                                onClick={() => setSearchQuery('')}
                                                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                                            >
                                                <X size={14} />
                                            </button>
                                        )}
                                    </div>

                                    <div className="relative" ref={districtDropdownRef}>
                                        <button
                                            onClick={() => setIsDistrictDropdownOpen(!isDistrictDropdownOpen)}
                                            className={`w-full flex items-center justify-between pl-12 pr-4 sm:pr-6 py-3 sm:py-3.5 bg-[var(--bg-main)]/50 border ${isDistrictDropdownOpen ? 'border-primary-500 ring-4 ring-primary-500/10' : 'border-[var(--border-main)]'} rounded-2xl text-sm font-bold text-[var(--text-main)] hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer shadow-sm text-left`}
                                        >
                                            <Filter size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDistrictDropdownOpen ? 'text-primary-500' : 'text-slate-400'} transition-colors`} />
                                            <span className={`truncate mr-2 ${!districtFilter ? 'text-slate-400 font-medium' : ''}`}>
                                                {districtFilter || t('preferences.all_districts')}
                                            </span>
                                            <motion.div
                                                animate={{ rotate: isDistrictDropdownOpen ? 180 : 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="shrink-0"
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
                            </div>

                            {/* Modal Body */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-8 relative z-10 space-y-6">
                                {/* Selected Preferences Section (Directly Below Search Bar) */}
                                {preferences.length > 0 ? (
                                    <div className="p-4 sm:p-5 rounded-2xl bg-primary-50/40 dark:bg-primary-950/20 border border-primary-100 dark:border-primary-900/40">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center space-x-2">
                                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                                <h4 className="text-xs sm:text-sm font-bold text-[var(--text-main)] tracking-tight">
                                                    {t('preferences.selected_preferences')}
                                                </h4>
                                                <span className="px-2 py-0.5 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 text-[10px] sm:text-[11px] font-bold">
                                                    {preferences.length}
                                                </span>
                                            </div>
                                            <span className="text-[10px] text-[var(--text-muted)] font-medium hidden sm:inline">
                                                {t('preferences.selected_hint')}
                                            </span>
                                        </div>

                                        <div className="flex flex-wrap gap-2 sm:gap-2.5 max-h-40 sm:max-h-48 overflow-y-auto custom-scrollbar p-0.5">
                                            <AnimatePresence mode="popLayout">
                                                {preferences.map((item, index) => (
                                                    <motion.div
                                                        key={item.id}
                                                        layout
                                                        initial={{ opacity: 0, scale: 0.9 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        exit={{ opacity: 0, scale: 0.8 }}
                                                        transition={{ duration: 0.15 }}
                                                        className="group flex items-center space-x-2 pl-2.5 pr-1.5 py-1.5 bg-[var(--bg-card)] rounded-xl border border-[var(--border-main)] shadow-sm hover:border-primary-300 dark:hover:border-primary-700 transition-all"
                                                    >
                                                        <span className="w-5 h-5 rounded-lg bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-bold text-[10px] sm:text-[11px] flex items-center justify-center shrink-0 border border-primary-200/50 dark:border-primary-800/50">
                                                            {index + 1}
                                                        </span>
                                                        <div className="flex flex-col min-w-0 pr-1">
                                                            <span className="text-xs font-bold text-[var(--text-main)] truncate max-w-[130px] sm:max-w-[200px]">
                                                                {item.preferredStation?.name}
                                                            </span>
                                                            <span className="text-[9px] text-[var(--text-muted)] font-medium truncate flex items-center">
                                                                <MapPin size={9} className="mr-0.5 shrink-0" />
                                                                {item.preferredStation?.district}
                                                            </span>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => confirmRemovePreference(item.id)}
                                                            className="p-1 text-slate-400 hover:text-white hover:bg-rose-500 rounded-lg transition-all cursor-pointer shrink-0"
                                                            title={t('preferences.remove_tooltip')}
                                                        >
                                                            <X size={13} />
                                                        </button>
                                                    </motion.div>
                                                ))}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-3.5 sm:p-4 rounded-2xl bg-[var(--bg-main)]/40 border border-dashed border-[var(--border-main)] flex items-center justify-between text-xs text-[var(--text-muted)]">
                                        <div className="flex items-center space-x-2">
                                            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                                            <span className="font-semibold text-[var(--text-main)]">{t('preferences.selected_preferences')}:</span>
                                            <span className="italic">{t('preferences.no_preferences_selected')}</span>
                                        </div>
                                    </div>
                                )}

                                {/* Available Results Section */}
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest pl-2 border-l-2 border-primary-500">
                                            {t('preferences.available_results', { count: filteredStations.length })}
                                        </p>
                                        {(searchQuery || districtFilter || globalSearchQuery) && (
                                            <button
                                                onClick={() => { setSearchQuery(''); setDistrictFilter(''); }}
                                                className="text-[10px] font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 px-3 py-1.5 rounded-lg uppercase hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-colors cursor-pointer"
                                            >
                                                {t('preferences.clear_filters')}
                                            </button>
                                        )}
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
                                                            </div>
                                                            <p className="text-[10px] sm:text-xs text-[var(--text-muted)] font-medium truncate flex items-center">
                                                                <MapPin size={10} className="mr-1 sm:size-[12px]" />
                                                                {station.district} • {station.province}
                                                            </p>
                                                        </div>
                                                        {isCurrentStation ? (
                                                            <span className="shrink-0 px-3.5 sm:px-5 py-2 sm:py-2.5 bg-slate-100 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-slate-400 dark:text-slate-500 text-xs sm:text-sm font-semibold rounded-xl select-none">
                                                                {t('preferences.current_label')}
                                                            </span>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleAddPreference(station.id)}
                                                                className="shrink-0 flex items-center justify-center space-x-1.5 sm:space-x-2 px-3.5 sm:px-5 py-2 sm:py-2.5 border rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm bg-slate-50 dark:bg-slate-800 hover:bg-primary-600 dark:hover:bg-primary-600 border-slate-100 dark:border-slate-700 hover:border-transparent text-slate-700 dark:text-slate-200 hover:text-white cursor-pointer"
                                                            >
                                                                <Plus size={14} className="sm:size-[16px]" />
                                                                <span>{t('preferences.add_label')}</span>
                                                            </button>
                                                        )}
                                                    </motion.div>
                                                )
                                            })}

                                            {/* Bottom Station Row (non-sticky) */}
                                            <div className="pt-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setIsRequestModalOpen(true)}
                                                    className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-primary-50/60 dark:hover:bg-primary-950/40 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-primary-400 dark:hover:border-primary-600 transition-all flex items-center justify-center space-x-2 text-xs sm:text-sm font-bold text-primary-600 dark:text-primary-400 cursor-pointer active:scale-[0.99]"
                                                >
                                                    <Plus size={16} />
                                                    <span>{t('station_request.not_in_list_action')}</span>
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="py-16 text-center bg-[var(--bg-card)] rounded-[24px] border border-[var(--border-main)] shadow-sm">
                                            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <Search size={24} className="text-slate-300 dark:text-slate-700" />
                                            </div>
                                            <p className="text-[var(--text-main)] font-semibold mb-1">{t('preferences.no_results_title')}</p>
                                            <p className="text-[var(--text-muted)] text-sm max-w-xs mx-auto mb-4">{t('preferences.no_results_subtitle')}</p>
                                            <button
                                                type="button"
                                                onClick={() => setIsRequestModalOpen(true)}
                                                className="inline-flex items-center space-x-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-primary-600/20 active:scale-95 cursor-pointer"
                                            >
                                                <Plus size={14} />
                                                <span>{t('station_request.not_in_list_action')}</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
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

            <StationRequestModal
                isOpen={isRequestModalOpen}
                onClose={() => setIsRequestModalOpen(false)}
                onSuccess={async (newStation) => {
                    setAllStations(prev => [...prev, newStation]);
                    try {
                        const response = await apiClient.post('/preferences', { stationId: newStation.id });
                        setPreferences(prev => [...prev, response.data]);
                        toast.success("Station added to your preferences (Pending Verification)!");
                    } catch (e) {
                        console.error("Failed to add preference", e);
                    }
                }}
                defaultFieldId={userProfile?.fieldId || (userProfile?.jobCategory?.field?.id)}
                defaultDistrict={districtFilter}
                requesterName={userProfile?.fullName}
                requesterPhone={userProfile?.phoneNumber}
                requesterEmail={userProfile?.email}
            />
        </div>
    );
};

export default Preferences;
