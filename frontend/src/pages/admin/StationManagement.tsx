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
    Map
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/ConfirmModal';

const StationManagement = () => {
    const [stations, setStations] = useState<any[]>([]);
    const [fields, setFields] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedField, setSelectedField] = useState('ALL');
    const [selectedProvince, setSelectedProvince] = useState('ALL');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, stationId: null as number | null });
    const [editingStation, setEditingStation] = useState<any>(null);
    const [formData, setFormData] = useState({
        name: '',
        district: '',
        province: '',
        hierarchyLevel: 'Base Hospital',
        fieldId: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [stationRes, fieldRes] = await Promise.all([
                apiClient.get('/public/stations'),
                apiClient.get('/public/fields')
            ]);
            setStations(stationRes.data);
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

    const handleDelete = async () => {
        if (!deleteModal.stationId) return;
        try {
            await apiClient.delete(`/public/stations/${deleteModal.stationId}`);
            toast.success("Station deleted successfully");
            setStations(stations.filter(s => s.id !== deleteModal.stationId));
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to delete station");
        } finally {
            setDeleteModal({ isOpen: false, stationId: null });
        }
    };

    const filteredStations = stations.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.district.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesField = selectedField === 'ALL' || s.field?.id?.toString() === selectedField;
        const matchesProvince = selectedProvince === 'ALL' || s.province === selectedProvince;

        return matchesSearch && matchesField && matchesProvince;
    });

    const provinces = Array.from(new Set(stations.map(s => s.province))).filter(Boolean).sort();

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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-semibold text-slate-950 tracking-tight leading-none">Station Registry</h1>
                    <p className="text-slate-500 mt-2 font-medium">Manage healthcare facilities and monitor transfer capacity.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center justify-center space-x-2 bg-slate-950 text-white px-8 py-3.5 rounded-2xl font-medium shadow-xl shadow-slate-900/20 hover:bg-primary-600 transition-all active:scale-95 text-sm cursor-pointer"
                >
                    <Plus size={18} />
                    <span>Register Station</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="glass-card rounded-[32px] p-6 border-white bg-white/60 shadow-sm">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-primary-50 text-primary-600 rounded-2xl">
                            <Globe size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none">Coverage</p>
                            <p className="text-xl font-bold text-slate-900 mt-1">Active Network</p>
                        </div>
                    </div>
                </div>

                <div className="glass-card rounded-[32px] p-6 border-white bg-white/60 flex items-center justify-between shadow-sm">
                    <div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none">Total Units</p>
                        <p className="text-3xl font-black text-slate-900 mt-1">{stations.length}</p>
                    </div>
                    <div className="w-14 h-14 bg-slate-950 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-slate-900/20">
                        <Hospital size={24} />
                    </div>
                </div>
            </div>

            <div className="glass-card rounded-[40px] overflow-hidden border-white shadow-2xl shadow-slate-200/50">
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

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Station & Geospatial Details</th>
                                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
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
                                                    <div className="w-14 h-14 bg-linear-to-br from-slate-900 to-slate-800 rounded-[22px] flex items-center justify-center text-white shadow-xl shadow-slate-900/10 group-hover:from-primary-600 group-hover:to-primary-500 transition-all">
                                                        <Hospital size={22} />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900 text-base tracking-tight mb-1">{station.name}</p>
                                                        <div className="flex flex-wrap items-center gap-3">
                                                            <div className="flex items-center space-x-1.5 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                                                                <MapPin size={10} className="text-slate-400" />
                                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">{station.district}, {station.province}</span>
                                                            </div>
                                                            <span className="text-[9px] px-2 py-0.5 bg-purple-50 text-purple-600 rounded-lg border border-purple-100 font-black uppercase tracking-widest">
                                                                {station.hierarchyLevel}
                                                            </span>
                                                            <span className="text-[9px] px-2 py-0.5 bg-primary-100/50 text-primary-700 rounded-lg border border-primary-200/50 font-black uppercase tracking-widest">
                                                                {station.field?.name || 'No Field'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex items-center justify-end space-x-1">
                                                    <button
                                                        onClick={() => handleOpenModal(station)}
                                                        className="p-3 hover:bg-white rounded-2xl transition-all text-slate-400 hover:text-primary-600 shadow-sm border border-transparent hover:border-slate-100 cursor-pointer"
                                                        title="Edit Station"
                                                    >
                                                        <Edit2 size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteModal({ isOpen: true, stationId: station.id })}
                                                        className="p-3 hover:bg-rose-50 rounded-2xl transition-all text-slate-200 hover:text-rose-600 cursor-pointer"
                                                        title="Delete Station"
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
                        <h3 className="text-lg font-semibold text-slate-900">No units discovered</h3>
                        <p className="text-slate-400 text-sm mt-1">Try refined search or broader filters.</p>
                    </div>
                )}

                <div className="p-8 border-t border-slate-100 bg-slate-50/20 text-xs font-black text-slate-400 uppercase tracking-widest">
                    Fleet Count: {filteredStations.length} Registered Units
                </div>
            </div>

            {/* Modal */}
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

            <ConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, stationId: null })}
                onConfirm={handleDelete}
                title="Critical Action: Purge Station"
                message="Purging this healthcare facility will remove it from the system registry permanently. This may disconnect users assigned here."
                confirmText="Purge System Unit"
                type="danger"
            />
        </div>
    );
};

export default StationManagement;
