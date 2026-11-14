import { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import {
    Hospital,
    MapPin,
    Search,
    Plus,
    Globe,
    Trash2,
    Edit2,
    X,
    Filter,
    ChevronDown,
    Map,
    Check,
    Clock,
    User,
    Phone,
    Mail,
    AlertTriangle,
    ShieldCheck,
    MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const StationManagement = () => {
    const [activeTab, setActiveTab] = useState<'APPROVED' | 'PENDING'>('APPROVED');
    const [stations, setStations] = useState<any[]>([]);
    const [pendingStations, setPendingStations] = useState<any[]>([]);
    const [fields, setFields] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedField, setSelectedField] = useState('ALL');
    const [selectedProvince, setSelectedProvince] = useState('ALL');

    // Create / Edit Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStation, setEditingStation] = useState<any>(null);
    const [formData, setFormData] = useState({
        name: '',
        district: '',
        province: '',
        hierarchyLevel: 'Base Hospital',
        fieldId: ''
    });

    // Delete / Reject Modal with Reassignment & Contact
    const [rejectModal, setRejectModal] = useState<{
        isOpen: boolean;
        station: any | null;
        affectedUsers: any[];
        loadingUsers: boolean;
        reassignStationId: string;
        isSubmitting: boolean;
    }>({
        isOpen: false,
        station: null,
        affectedUsers: [],
        loadingUsers: false,
        reassignStationId: '',
        isSubmitting: false
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [approvedRes, pendingRes, fieldRes] = await Promise.all([
                apiClient.get('/public/stations?status=APPROVED'),
                apiClient.get('/public/stations?status=PENDING'),
                apiClient.get('/public/fields')
            ]);
            setStations(approvedRes.data);
            setPendingStations(pendingRes.data);
            setFields(fieldRes.data);
        } catch (err) {
            console.error("Failed to fetch data", err);
            toast.error("Failed to load management data");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (station: any = null) => {
        if (station) {
            setEditingStation(station);
            setFormData({
                name: station.name,
                district: station.district,
                province: station.province,
                hierarchyLevel: station.hierarchyLevel,
                fieldId: station.field?.id?.toString() || ''
            });
        } else {
            setEditingStation(null);
            setFormData({
                name: '',
                district: '',
                province: '',
                hierarchyLevel: 'Base Hospital',
                fieldId: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                field: formData.fieldId ? { id: parseInt(formData.fieldId) } : null
            };
            if (editingStation) {
                await apiClient.put(`/public/stations/${editingStation.id}`, payload);
                toast.success("Station updated successfully");
            } else {
                await apiClient.post('/public/stations', payload);
                toast.success("Station added successfully");
            }
            setIsModalOpen(false);
            fetchData();
        } catch (err) {
            toast.error("Failed to save station");
        }
    };

    const handleApprove = async (stationId: number) => {
        try {
            await apiClient.put(`/public/stations/${stationId}/approve`);
            toast.success("Station approved! It is now active across the platform.");
            fetchData();
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to approve station");
        }
    };

    const handleOpenRejectModal = async (station: any) => {
        setRejectModal({
            isOpen: true,
            station,
            affectedUsers: [],
            loadingUsers: true,
            reassignStationId: '',
            isSubmitting: false
        });

        try {
            const res = await apiClient.get(`/public/stations/${station.id}/affected-users`);
            setRejectModal(prev => ({
                ...prev,
                affectedUsers: res.data || [],
                loadingUsers: false
            }));
        } catch (err) {
            console.error("Failed to load affected users", err);
            setRejectModal(prev => ({ ...prev, loadingUsers: false }));
        }
    };

    const handleConfirmReject = async () => {
        if (!rejectModal.station) return;
        try {
            setRejectModal(prev => ({ ...prev, isSubmitting: true }));
            const payload = {
                reassignStationId: rejectModal.reassignStationId ? parseInt(rejectModal.reassignStationId) : null
            };
            await apiClient.post(`/public/stations/${rejectModal.station.id}/reject`, payload);
            toast.success("Station removed successfully. Reassignments updated.");
            setRejectModal({
                isOpen: false,
                station: null,
                affectedUsers: [],
                loadingUsers: false,
                reassignStationId: '',
                isSubmitting: false
            });
            fetchData();
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to remove station");
            setRejectModal(prev => ({ ...prev, isSubmitting: false }));
        }
    };

    const currentList = activeTab === 'APPROVED' ? stations : pendingStations;

    const filteredStations = currentList.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.district.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesField = selectedField === 'ALL' || s.field?.id?.toString() === selectedField;
        const matchesProvince = selectedProvince === 'ALL' || s.province === selectedProvince;
        return matchesSearch && matchesField && matchesProvince;
    });

    const provinces = Array.from(new Set([...stations, ...pendingStations].map(s => s.province))).filter(Boolean).sort();

    const SkeletonRow = () => (
        <tr className="animate-pulse">
            <td className="px-8 py-6">
                <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-2xl"></div>
                    <div className="space-y-2">
                        <div className="h-4 w-64 bg-slate-100 rounded-md"></div>
                        <div className="h-3 w-40 bg-slate-50 rounded-md"></div>
                    </div>
                </div>
            </td>
            <td className="px-8 py-6 flex justify-end space-x-2">
                <div className="h-9 w-9 bg-slate-100 rounded-xl"></div>
                <div className="h-9 w-9 bg-slate-100 rounded-xl"></div>
            </td>
        </tr>
    );

    return (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-semibold text-slate-950 tracking-tight leading-none">Station Registry</h1>
                    <p className="text-slate-500 mt-2 font-medium">Manage facilities, review pending station requests, and monitor capacity.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center justify-center space-x-2 bg-slate-950 text-white px-8 py-3.5 rounded-2xl font-medium shadow-xl shadow-slate-900/20 hover:bg-primary-600 transition-all active:scale-95 text-sm cursor-pointer"
                >
                    <Plus size={18} />
                    <span>Register Station</span>
                </button>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card rounded-[32px] p-6 border-white bg-white/60 shadow-sm flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                            <ShieldCheck size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none">Active Units</p>
                            <p className="text-3xl font-black text-slate-900 mt-1">{stations.length}</p>
                        </div>
                    </div>
                </div>

                <div className={`glass-card rounded-[32px] p-6 border-white bg-white/60 shadow-sm flex items-center justify-between cursor-pointer transition-all hover:scale-[1.02] ${pendingStations.length > 0 ? 'ring-2 ring-amber-400' : ''}`}
                     onClick={() => setActiveTab('PENDING')}>
                    <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-2xl ${pendingStations.length > 0 ? 'bg-amber-100 text-amber-700 animate-pulse' : 'bg-slate-100 text-slate-500'}`}>
                            <Clock size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none">Pending Requests</p>
                            <p className="text-3xl font-black text-amber-600 mt-1">{pendingStations.length}</p>
                        </div>
                    </div>
                    {pendingStations.length > 0 && (
                        <span className="px-3 py-1 bg-amber-500 text-white rounded-full text-xs font-black uppercase tracking-wider shadow-sm">
                            Needs Review
                        </span>
                    )}
                </div>

                <div className="glass-card rounded-[32px] p-6 border-white bg-white/60 flex items-center justify-between shadow-sm">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-primary-50 text-primary-600 rounded-2xl">
                            <Globe size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none">Coverage</p>
                            <p className="text-xl font-bold text-slate-900 mt-1">25 Districts</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs & Content */}
            <div className="glass-card rounded-[40px] overflow-hidden border-white shadow-2xl shadow-slate-200/50">
                {/* Tab Navigation */}
                <div className="px-8 pt-6 pb-2 border-b border-slate-100 bg-white/60 flex items-center space-x-4">
                    <button
                        onClick={() => setActiveTab('APPROVED')}
                        className={`pb-4 px-3 text-sm font-black uppercase tracking-wider relative transition-colors ${activeTab === 'APPROVED' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Active Stations ({stations.length})
                        {activeTab === 'APPROVED' && (
                            <motion.div layoutId="tabLine" className="absolute bottom-0 left-0 right-0 h-1 bg-slate-950 rounded-full" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('PENDING')}
                        className={`pb-4 px-3 text-sm font-black uppercase tracking-wider relative flex items-center space-x-2 transition-colors ${activeTab === 'PENDING' ? 'text-amber-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <span>Pending Requests</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${pendingStations.length > 0 ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
                            {pendingStations.length}
                        </span>
                        {activeTab === 'PENDING' && (
                            <motion.div layoutId="tabLine" className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500 rounded-full" />
                        )}
                    </button>
                </div>

                {/* Filters */}
                <div className="p-8 border-b border-slate-100 bg-white/50 backdrop-blur-md flex flex-col lg:flex-row gap-6 items-center">
                    <div className="relative flex-1 group w-full">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Search station by name or district..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-3xl text-sm font-medium focus:ring-4 focus:ring-primary-100 transition-all outline-none placeholder:text-slate-400 shadow-sm"
                        />
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                        <div className="flex items-center space-x-2 bg-slate-50 p-2 rounded-2xl border border-slate-100 flex-1 lg:flex-none">
                            <div className="p-2 bg-white rounded-xl shadow-sm"><Filter size={14} className="text-slate-400" /></div>
                            <select 
                                className="bg-transparent border-none text-xs font-bold text-slate-600 outline-none pr-8 cursor-pointer"
                                value={selectedField}
                                onChange={(e) => setSelectedField(e.target.value)}
                            >
                                <option value="ALL">All Fields</option>
                                {fields.map(f => <option key={f.id} value={f.id.toString()}>{f.name}</option>)}
                            </select>
                        </div>

                        <div className="flex items-center space-x-2 bg-slate-50 p-2 rounded-2xl border border-slate-100 flex-1 lg:flex-none">
                            <div className="p-2 bg-white rounded-xl shadow-sm"><Map size={14} className="text-slate-400" /></div>
                            <select 
                                className="bg-transparent border-none text-xs font-bold text-slate-600 outline-none pr-8 cursor-pointer"
                                value={selectedProvince}
                                onChange={(e) => setSelectedProvince(e.target.value)}
                            >
                                <option value="ALL">All Provinces</option>
                                {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                    Station & Geospatial Details
                                </th>
                                {activeTab === 'PENDING' && (
                                    <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                        Requested By / User Details
                                    </th>
                                )}
                                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
                            ) : (
                                <AnimatePresence mode="popLayout">
                                    {filteredStations.map((station) => (
                                        <motion.tr 
                                            layout
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            key={station.id} 
                                            className="group hover:bg-slate-50/50 transition-colors"
                                        >
                                            <td className="px-8 py-6">
                                                <div className="flex items-center space-x-5">
                                                    <div className={`w-14 h-14 rounded-[22px] flex items-center justify-center text-white shadow-xl ${activeTab === 'PENDING' ? 'bg-amber-500 shadow-amber-500/20' : 'bg-slate-900 shadow-slate-900/10 group-hover:from-primary-600 group-hover:to-primary-500'} transition-all`}>
                                                        <Hospital size={22} />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center space-x-2">
                                                            <p className="font-bold text-slate-900 text-base tracking-tight mb-1">{station.name}</p>
                                                            {station.status === 'PENDING' && (
                                                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-300">
                                                                    PENDING APPROVAL
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-wrap items-center gap-3">
                                                            <div className="flex items-center space-x-1.5 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                                                                <MapPin size={10} className="text-slate-400" />
                                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">{station.district}, {station.province}</span>
                                                            </div>
                                                            <span className="text-[9px] px-2 py-0.5 bg-purple-50 text-purple-600 rounded-lg border border-purple-100 font-black uppercase tracking-widest">
                                                                {station.hierarchyLevel}
                                                            </span>
                                                            <span className="text-[9px] px-2 py-0.5 bg-primary-100/50 text-primary-700 rounded-lg border border-primary-200/50 font-black uppercase tracking-widest">
                                                                {station.field?.name || 'General Field'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {activeTab === 'PENDING' && (
                                                <td className="px-8 py-6">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-900">
                                                            <User size={13} className="text-slate-400" />
                                                            <span>{station.requestedByName || 'User Registration'}</span>
                                                        </div>
                                                        {station.requestedByPhone && (
                                                            <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-medium">
                                                                <Phone size={13} className="text-slate-400" />
                                                                <a href={`tel:${station.requestedByPhone}`} className="hover:underline text-blue-600">
                                                                    {station.requestedByPhone}
                                                                </a>
                                                            </div>
                                                        )}
                                                        {station.requestedByEmail && (
                                                            <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-medium">
                                                                <Mail size={13} className="text-slate-400" />
                                                                <a href={`mailto:${station.requestedByEmail}`} className="hover:underline text-blue-600 truncate max-w-[200px]">
                                                                    {station.requestedByEmail}
                                                                </a>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            )}

                                            <td className="px-8 py-6 text-right">
                                                <div className="flex items-center justify-end space-x-2">
                                                    {activeTab === 'PENDING' && (
                                                        <button
                                                            onClick={() => handleApprove(station.id)}
                                                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center space-x-1.5 transition active:scale-95 cursor-pointer"
                                                            title="Approve this station request"
                                                        >
                                                            <Check size={14} />
                                                            <span>Approve</span>
                                                        </button>
                                                    )}

                                                    <button
                                                        onClick={() => handleOpenModal(station)}
                                                        className="p-3 hover:bg-white rounded-2xl transition-all text-slate-400 hover:text-primary-600 shadow-sm border border-transparent hover:border-slate-100 cursor-pointer"
                                                        title="Edit Station"
                                                    >
                                                        <Edit2 size={18} />
                                                    </button>

                                                    <button
                                                        onClick={() => handleOpenRejectModal(station)}
                                                        className="p-3 hover:bg-rose-50 rounded-2xl transition-all text-slate-300 hover:text-rose-600 cursor-pointer"
                                                        title={activeTab === 'PENDING' ? "Reject / Delete Request" : "Delete Station"}
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            )}
                        </tbody>
                    </table>
                </div>

                {!loading && filteredStations.length === 0 && (
                    <div className="py-20 text-center bg-slate-50/30">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
                            <Hospital size={24} className="text-slate-200" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900">
                            {activeTab === 'PENDING' ? 'No pending station requests' : 'No units discovered'}
                        </h3>
                        <p className="text-slate-400 text-sm mt-1">
                            {activeTab === 'PENDING' ? 'All user requested stations have been processed.' : 'Try refined search or broader filters.'}
                        </p>
                    </div>
                )}

                <div className="p-8 border-t border-slate-100 bg-slate-50/20 text-xs font-black text-slate-400 uppercase tracking-widest">
                    Showing {filteredStations.length} of {currentList.length} Units ({activeTab})
                </div>
            </div>

            {/* Create / Edit Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-sm">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-[40px] w-full max-w-lg shadow-2xl border border-white overflow-hidden"
                        >
                            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <div>
                                    <h2 className="text-2xl font-semibold text-slate-900 leading-tight">
                                        {editingStation ? 'Modify Unit' : 'New Registration'}
                                    </h2>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1"> Configure healthcare facility details </p>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-white rounded-2xl transition-all shadow-sm border border-slate-100 cursor-pointer text-slate-400">
                                    <X size={20} />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-8 space-y-5 overflow-y-auto max-h-[75vh] custom-scrollbar">
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Professional Domain</label>
                                    <div className="relative">
                                        <select
                                            value={formData.fieldId}
                                            onChange={(e) => setFormData({...formData, fieldId: e.target.value})}
                                            className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-primary-50 transition-all outline-none font-bold text-slate-900 appearance-none shadow-inner"
                                            required
                                        >
                                            <option value="">Select Domain</option>
                                            {fields.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                                        </select>
                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                            <ChevronDown size={16} />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Official Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-primary-50 transition-all outline-none font-bold text-slate-900 shadow-inner"
                                        placeholder="e.g. National Hospital Colombo"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">District</label>
                                        <input
                                            type="text"
                                            value={formData.district}
                                            onChange={(e) => setFormData({...formData, district: e.target.value})}
                                            className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-primary-50 transition-all outline-none font-bold text-slate-900 shadow-inner"
                                            placeholder="District"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Province</label>
                                        <input
                                            type="text"
                                            value={formData.province}
                                            onChange={(e) => setFormData({...formData, province: e.target.value})}
                                            className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-primary-100 transition-all outline-none font-bold text-slate-900 shadow-inner"
                                            placeholder="Province"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Classification Pool</label>
                                    <div className="relative">
                                        <select
                                            value={formData.hierarchyLevel}
                                            onChange={(e) => setFormData({...formData, hierarchyLevel: e.target.value})}
                                            className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-primary-50 transition-all outline-none font-bold text-slate-900 appearance-none shadow-inner"
                                        >
                                            <option>National Hospital</option>
                                            <option>Teaching Hospital</option>
                                            <option>General Hospital</option>
                                            <option>Base Hospital</option>
                                            <option>District General Hospital</option>
                                            <option>Divisional Hospital</option>
                                            <option>MOH Office</option>
                                            <option>Primary Medical Care Unit</option>
                                            <option>Other</option>
                                        </select>
                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                            <ChevronDown size={16} />
                                        </div>
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    className="w-full py-5 bg-slate-950 text-white rounded-[24px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 hover:bg-primary-600 transition-all mt-4 text-sm active:scale-[0.98]"
                                >
                                    {editingStation ? 'Commit Changes' : 'Finalize Registration'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Reject / Delete Modal with Reassignment & Contact User */}
            <AnimatePresence>
                {rejectModal.isOpen && rejectModal.station && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-3xl w-full max-w-xl shadow-2xl border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col"
                        >
                            <div className="p-6 bg-gradient-to-r from-rose-600 to-red-700 text-white flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2.5 bg-white/20 rounded-2xl">
                                        <AlertTriangle className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black">
                                            {rejectModal.station.status === 'PENDING' ? 'Reject Station Request' : 'Delete Station'}
                                        </h3>
                                        <p className="text-xs text-white/80 font-medium">{rejectModal.station.name} ({rejectModal.station.district})</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setRejectModal(prev => ({ ...prev, isOpen: false, station: null }))}
                                    className="p-2 hover:bg-white/20 rounded-xl transition text-white"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6 space-y-5 overflow-y-auto flex-1">
                                {/* Requester Details & Contact */}
                                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                    <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-2 flex items-center space-x-1.5">
                                        <User size={13} />
                                        <span>User Contact Options (Direct Contact)</span>
                                    </h4>
                                    
                                    <div className="space-y-2">
                                        <div className="text-sm font-bold text-slate-800">
                                            {rejectModal.station.requestedByName || (rejectModal.affectedUsers[0]?.fullName) || 'User / Requester'}
                                        </div>

                                        {/* Contact Links */}
                                        <div className="flex flex-wrap gap-2 pt-1">
                                            {/* Phone Call */}
                                            {(rejectModal.station.requestedByPhone || rejectModal.affectedUsers[0]?.phoneNumber) && (
                                                <>
                                                    <a
                                                        href={`tel:${rejectModal.station.requestedByPhone || rejectModal.affectedUsers[0]?.phoneNumber}`}
                                                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition"
                                                    >
                                                        <Phone size={13} />
                                                        <span>Call ({rejectModal.station.requestedByPhone || rejectModal.affectedUsers[0]?.phoneNumber})</span>
                                                    </a>
                                                    <a
                                                        href={`https://wa.me/${(rejectModal.station.requestedByPhone || rejectModal.affectedUsers[0]?.phoneNumber || '').replace(/[^0-9]/g, '')}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 rounded-xl text-xs font-bold transition"
                                                    >
                                                        <MessageSquare size={13} />
                                                        <span>WhatsApp</span>
                                                    </a>
                                                </>
                                            )}

                                            {/* Email */}
                                            {(rejectModal.station.requestedByEmail || rejectModal.affectedUsers[0]?.email) && (
                                                <a
                                                    href={`mailto:${rejectModal.station.requestedByEmail || rejectModal.affectedUsers[0]?.email}`}
                                                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition"
                                                >
                                                    <Mail size={13} />
                                                    <span>Send Email ({rejectModal.station.requestedByEmail || rejectModal.affectedUsers[0]?.email})</span>
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Reassignment Option */}
                                <div>
                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
                                        Reassign Affected Users to Another Station (Optional)
                                    </label>
                                    <p className="text-xs text-slate-400 mb-2">
                                        මෙම Station එක තෝරාගෙන සිටින User ලාව පවතින නිවැරදි Station එකකට මාරු කිරීමට අවශ්‍ය නම් පහතින් Station එකක් තෝරන්න (හිස්ව තැබුවහොත් Station reference එක ඉවත් වේ).
                                    </p>
                                    <div className="relative">
                                        <select
                                            value={rejectModal.reassignStationId}
                                            onChange={(e) => setRejectModal(prev => ({ ...prev, reassignStationId: e.target.value }))}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 outline-none focus:ring-4 focus:ring-rose-500/10 appearance-none"
                                        >
                                            <option value="">-- No Reassignment (Clear User Station) --</option>
                                            {stations
                                                .filter(s => s.id !== rejectModal.station.id)
                                                .map(s => (
                                                    <option key={s.id} value={s.id}>
                                                        {s.name} ({s.district} - {s.hierarchyLevel})
                                                    </option>
                                                ))}
                                        </select>
                                        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                                    </div>
                                </div>

                                {/* Affected Users count */}
                                <div className="text-xs text-slate-500 bg-amber-50 border border-amber-100 rounded-2xl p-3 flex items-start space-x-2">
                                    <AlertTriangle size={15} className="text-amber-600 shrink-0 mt-0.5" />
                                    <span>
                                        {rejectModal.loadingUsers ? 'Loading affected users...' : (
                                            <>
                                                මෙම station එක දැනට user(s) <strong>{rejectModal.affectedUsers.length}</strong> දෙනෙකුගේ Profile හෝ Preferences තුළ භාවිතා වේ.
                                            </>
                                        )}
                                    </span>
                                </div>
                            </div>

                            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setRejectModal(prev => ({ ...prev, isOpen: false, station: null }))}
                                    disabled={rejectModal.isSubmitting}
                                    className="px-5 py-2.5 rounded-2xl font-bold text-xs text-slate-600 hover:bg-slate-200 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleConfirmReject}
                                    disabled={rejectModal.isSubmitting}
                                    className="px-6 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition flex items-center space-x-2 disabled:opacity-50"
                                >
                                    <Trash2 size={14} />
                                    <span>{rejectModal.isSubmitting ? 'Deleting...' : 'Confirm Delete / Reject'}</span>
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default StationManagement;
