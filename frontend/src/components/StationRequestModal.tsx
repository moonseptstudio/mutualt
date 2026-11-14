import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    X, 
    Sparkles, 
    Briefcase, 
    Building2, 
    MapPin, 
    Compass, 
    Layers, 
    User, 
    Phone, 
    Mail 
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import apiClient from '../api/client';
import toast from 'react-hot-toast';
import SearchableSelect, { type SearchableOption } from './common/SearchableSelect';

export const SRI_LANKA_DISTRICT_PROVINCE_MAP: Record<string, string> = {
    'Colombo': 'Western',
    'Gampaha': 'Western',
    'Kalutara': 'Western',
    'Kandy': 'Central',
    'Matale': 'Central',
    'Nuwara Eliya': 'Central',
    'Galle': 'Southern',
    'Matara': 'Southern',
    'Hambantota': 'Southern',
    'Jaffna': 'Northern',
    'Kilinochchi': 'Northern',
    'Mannar': 'Northern',
    'Vavuniya': 'Northern',
    'Mullaitivu': 'Northern',
    'Batticaloa': 'Eastern',
    'Ampara': 'Eastern',
    'Trincomalee': 'Eastern',
    'Kurunegala': 'North Western',
    'Puttalam': 'North Western',
    'Anuradhapura': 'North Central',
    'Polonnaruwa': 'North Central',
    'Badulla': 'Uva',
    'Monaragala': 'Uva',
    'Ratnapura': 'Sabaragamuwa',
    'Kegalle': 'Sabaragamuwa'
};

export const SRI_LANKA_PROVINCES = [
    'Western',
    'Central',
    'Southern',
    'Northern',
    'Eastern',
    'North Western',
    'North Central',
    'Uva',
    'Sabaragamuwa'
];

export const HIERARCHY_LEVELS = [
    'National Hospital',
    'Teaching Hospital',
    'Provincial General Hospital',
    'District General Hospital',
    'Base Hospital',
    'Divisional Hospital',
    'Primary Medical Care Unit (PMCU)',
    'MOH Office',
    'Specialized Institute',
    'Department / Ministry Office',
    'Other'
];

interface StationRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (station: any) => void;
    defaultFieldId?: string | number;
    defaultDistrict?: string;
    requesterName?: string;
    requesterPhone?: string;
    requesterEmail?: string;
    fields?: Array<{ id: number; name: string }>;
}

const StationRequestModal: React.FC<StationRequestModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    defaultFieldId,
    defaultDistrict,
    requesterName = '',
    requesterPhone = '',
    requesterEmail = '',
    fields: propFields = []
}) => {
    const { t } = useTranslation();
    const [fields, setFields] = useState<Array<{ id: number; name: string }>>(propFields);
    const [fieldId, setFieldId] = useState<string>(defaultFieldId ? String(defaultFieldId) : '');
    const [name, setName] = useState('');
    const [district, setDistrict] = useState(defaultDistrict || '');
    const [province, setProvince] = useState('');
    const [hierarchyLevel, setHierarchyLevel] = useState(HIERARCHY_LEVELS[4]); // Base Hospital
    const [reqName, setReqName] = useState(requesterName);
    const [reqPhone, setReqPhone] = useState(requesterPhone);
    const [reqEmail, setReqEmail] = useState(requesterEmail);
    const [loading, setLoading] = useState(false);

    // Fetch fields if not provided
    useEffect(() => {
        if (propFields && propFields.length > 0) {
            setFields(propFields);
        } else {
            apiClient.get('/public/fields')
                .then(res => setFields(res.data))
                .catch(err => console.error('Failed to load fields for request modal', err));
        }
    }, [propFields]);

    useEffect(() => {
        if (defaultDistrict) {
            setDistrict(defaultDistrict);
            if (SRI_LANKA_DISTRICT_PROVINCE_MAP[defaultDistrict]) {
                setProvince(SRI_LANKA_DISTRICT_PROVINCE_MAP[defaultDistrict]);
            }
        }
    }, [defaultDistrict]);

    useEffect(() => {
        if (defaultFieldId) {
            setFieldId(String(defaultFieldId));
        }
    }, [defaultFieldId]);

    useEffect(() => {
        if (requesterName) setReqName(requesterName);
        if (requesterPhone) setReqPhone(requesterPhone);
        if (requesterEmail) setReqEmail(requesterEmail);
    }, [requesterName, requesterPhone, requesterEmail]);

    // Format options for SearchableSelect
    const fieldOptions: SearchableOption[] = useMemo(() => {
        return fields.map(f => ({
            value: String(f.id),
            label: t(`fields.${f.name.toLowerCase().replace(/\s+/g, '_')}`, f.name)
        }));
    }, [fields, t]);

    const districtOptions: SearchableOption[] = useMemo(() => {
        return Object.keys(SRI_LANKA_DISTRICT_PROVINCE_MAP).sort().map(d => ({
            value: d,
            label: t(`districts.${d.toLowerCase().replace(/\s+/g, '_')}`, d),
            subLabel: SRI_LANKA_DISTRICT_PROVINCE_MAP[d] 
                ? t(`provinces.${SRI_LANKA_DISTRICT_PROVINCE_MAP[d].toLowerCase().replace(/\s+/g, '_')}`, SRI_LANKA_DISTRICT_PROVINCE_MAP[d])
                : undefined
        }));
    }, [t]);

    const provinceOptions: SearchableOption[] = useMemo(() => {
        return SRI_LANKA_PROVINCES.map(p => ({
            value: p,
            label: t(`provinces.${p.toLowerCase().replace(/\s+/g, '_')}`, p)
        }));
    }, [t]);

    const hierarchyOptions: SearchableOption[] = useMemo(() => {
        return HIERARCHY_LEVELS.map(level => ({
            value: level,
            label: level
        }));
    }, []);

    const handleDistrictChange = (d: string) => {
        setDistrict(d);
        if (SRI_LANKA_DISTRICT_PROVINCE_MAP[d]) {
            setProvince(SRI_LANKA_DISTRICT_PROVINCE_MAP[d]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 1. Mandatory Field validation
        if (!fieldId) {
            toast.error(t('station_request.field_required', 'Please select a field'));
            return;
        }

        // 2. Mandatory Name validation
        if (!name.trim()) {
            toast.error(t('station_request.name_required', 'Station name is required'));
            return;
        }

        // 3. Mandatory District validation
        if (!district) {
            toast.error(t('station_request.district_required', 'Please select a district'));
            return;
        }

        // 4. Mandatory Province validation
        if (!province) {
            toast.error(t('station_request.province_required', 'Please select a province'));
            return;
        }

        try {
            setLoading(true);
            const payload = {
                name: name.trim(),
                district,
                province,
                hierarchyLevel,
                fieldId: parseInt(fieldId),
                requestedByName: reqName.trim(),
                requestedByPhone: reqPhone.trim(),
                requestedByEmail: reqEmail.trim()
            };

            const res = await apiClient.post('/public/stations/request', payload);
            toast.success(t('station_request.success', 'Station request submitted! Pending admin approval.'), { duration: 4000 });
            onSuccess(res.data);
            onClose();
            setName('');
        } catch (err: any) {
            console.error('Failed to request station', err);
            const msg = err.response?.data?.message || 'Failed to submit station request';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6">
                {/* Backdrop matching Discover Stations */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-900/40 dark:bg-black/80 backdrop-blur-sm"
                />

                {/* Modal Container matching Discover Stations dimensions & styling */}
                <motion.div
                    initial={{ y: "100%", opacity: 0.5 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: "100%", opacity: 0.5 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="relative w-full sm:max-w-4xl h-[90vh] sm:h-auto sm:max-h-[90vh] bg-[var(--bg-card)] rounded-t-[32px] sm:rounded-[32px] shadow-2xl overflow-hidden flex flex-col border border-[var(--border-main)]"
                >
                    {/* Drag handle for mobile */}
                    <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto my-3 sm:hidden shrink-0" />

                    {/* Modal Header - Fixed at top matching Discover Stations */}
                    <div className="px-6 py-4 sm:px-8 sm:py-5 border-b border-[var(--border-main)]/50 bg-[var(--bg-card)]/95 backdrop-blur-xl z-30 shrink-0">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-main)] tracking-tight">
                                    {t('station_request.title', 'Request New Station')}
                                </h2>
                                <p className="text-xs sm:text-sm font-medium text-[var(--text-muted)] mt-0.5 sm:mt-1">
                                    {t('station_request.subtitle', 'Add a facility that is not currently in our database')}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={onClose}
                                className="p-2 sm:p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-[var(--text-main)] rounded-full transition-all cursor-pointer"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Scrollable Form Body */}
                    <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-8 space-y-5">
                        {/* Notice Banner */}
                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 text-xs font-medium text-amber-800 dark:text-amber-300 flex items-start space-x-3">
                            <Sparkles size={16} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                            <span>
                                {t('station_request.notice', 'This station will be temporarily selected with "Pending Verification" status. It will become officially active platform-wide once approved by administrators.')}
                            </span>
                        </div>

                        {/* Domain & Station Name in Responsive Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-40">
                            {/* Professional Domain (Mandatory SearchableSelect) */}
                            <div>
                                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 ml-1 block">
                                    {t('station_request.field_label', 'Professional Domain / Field *')}
                                </label>
                                <SearchableSelect
                                    value={fieldId}
                                    onChange={(val) => setFieldId(val)}
                                    options={fieldOptions}
                                    placeholder={t('station_request.select_field', 'Select Domain')}
                                    icon={Briefcase}
                                />
                            </div>

                            {/* Official Station Name (Mandatory Text Input with Icon) */}
                            <div>
                                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 ml-1 block">
                                    {t('station_request.name_label', 'Official Station Name *')}
                                </label>
                                <div className="relative">
                                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder={t('station_request.name_placeholder', 'e.g. Base Hospital Balangoda, MOH Homagama')}
                                        required
                                        className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/80 border-2 border-slate-100 dark:border-slate-700/80 rounded-xl focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all text-sm font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* District & Province Dropdowns */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-30">
                            {/* District (Mandatory SearchableSelect) */}
                            <div>
                                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 ml-1 block">
                                    {t('station_request.district_label', 'District *')}
                                </label>
                                <SearchableSelect
                                    value={district}
                                    onChange={(val) => handleDistrictChange(val)}
                                    options={districtOptions}
                                    placeholder={t('station_request.select_district', 'Select District')}
                                    icon={MapPin}
                                />
                            </div>

                            {/* Province (Mandatory SearchableSelect) */}
                            <div>
                                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 ml-1 block">
                                    {t('station_request.province_label', 'Province *')}
                                </label>
                                <SearchableSelect
                                    value={province}
                                    onChange={(val) => setProvince(val)}
                                    options={provinceOptions}
                                    placeholder={t('station_request.select_province', 'Select Province')}
                                    icon={Compass}
                                />
                            </div>
                        </div>

                        {/* Classification Level (SearchableSelect) */}
                        <div className="relative z-20">
                            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 ml-1 block">
                                {t('station_request.hierarchy_label', 'Classification / Level')}
                            </label>
                            <SearchableSelect
                                value={hierarchyLevel}
                                onChange={(val) => setHierarchyLevel(val)}
                                options={hierarchyOptions}
                                placeholder={t('station_request.select_hierarchy', 'Select Level')}
                                icon={Layers}
                            />
                        </div>

                        {/* Requester Contact Details with visible labels and icons */}
                        <div className="relative z-10 p-4 sm:p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3.5">
                            <div className="flex items-center space-x-2 mb-1">
                                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                                    {t('station_request.contact_title', 'Requester Contact Information')}
                                </h4>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                                {/* Full Name Field */}
                                <div>
                                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 ml-1 block">
                                        {t('station_request.fullname_label', 'Full Name')}
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                                        <input
                                            type="text"
                                            value={reqName}
                                            onChange={(e) => setReqName(e.target.value)}
                                            placeholder={t('station_request.fullname_placeholder', 'Your Full Name')}
                                            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900/90 border-2 border-slate-100 dark:border-slate-700/80 rounded-xl focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all text-sm font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                        />
                                    </div>
                                </div>

                                {/* Phone Number Field */}
                                <div>
                                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 ml-1 block">
                                        {t('station_request.phone_label', 'Phone Number')}
                                    </label>
                                    <div className="relative">
                                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                                        <input
                                            type="tel"
                                            value={reqPhone}
                                            onChange={(e) => setReqPhone(e.target.value)}
                                            placeholder={t('station_request.phone_placeholder', 'Phone Number (077...)')}
                                            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900/90 border-2 border-slate-100 dark:border-slate-700/80 rounded-xl focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all text-sm font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                        />
                                    </div>
                                </div>

                                {/* Email Address Field */}
                                <div>
                                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 ml-1 block">
                                        {t('station_request.email_label', 'Email Address')}
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                                        <input
                                            type="email"
                                            value={reqEmail}
                                            onChange={(e) => setReqEmail(e.target.value)}
                                            placeholder={t('station_request.email_placeholder', 'Email Address')}
                                            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900/90 border-2 border-slate-100 dark:border-slate-700/80 rounded-xl focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all text-sm font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Actions Bar */}
                        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-[var(--border-main)]/50">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={loading}
                                className="px-6 py-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-2xl text-xs uppercase tracking-wider transition-all cursor-pointer"
                            >
                                {t('common.cancel', 'Cancel')}
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-8 py-3.5 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-primary-500/25 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                            >
                                {loading ? t('station_request.submitting', 'Submitting...') : t('station_request.submit', 'Submit Station Request')}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default StationRequestModal;
