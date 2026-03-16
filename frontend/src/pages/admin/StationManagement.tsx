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
    X
} from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/ConfirmModal';

const StationManagement = () => {
    const [stations, setStations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, stationId: null as number | null });
    const [editingStation, setEditingStation] = useState<any>(null);
    const [formData, setFormData] = useState({
        name: '',
        district: '',
        province: '',
        hierarchyLevel: 'Base Hospital'
    });

    useEffect(() => {
        fetchStations();
    }, []);

    const fetchStations = async () => {
        try {
            const response = await apiClient.get('/public/stations');
            setStations(response.data);
        } catch (err) {
            console.error("Failed to fetch stations", err);
            toast.error("Failed to load stations");
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
                hierarchyLevel: station.hierarchyLevel
            });
        } else {
            setEditingStation(null);
            setFormData({
                name: '',
                district: '',
                province: '',
                hierarchyLevel: 'Base Hospital'
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingStation) {
                await apiClient.put(`/public/stations/${editingStation.id}`, formData);
                toast.success("Station updated successfully");
            } else {
                await apiClient.post('/public/stations', formData);
                toast.success("Station added successfully");
            }
            setIsModalOpen(false);
            fetchStations();
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

    const filteredStations = stations.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.district.toLowerCase().includes(searchTerm.toLowerCase())
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card rounded-[32px] p-6 border-white bg-white/60">
                    <div className="flex items-center space-x-4 mb-4">
                        <div className="p-3 bg-primary-50 text-primary-600 rounded-2xl">
                            <Globe size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider leading-none">Coverage</p>
                            <p className="text-xl font-semibold text-slate-900 mt-1">Active Network</p>
                        </div>
                    </div>
                </div>

                <div className="glass-card rounded-[32px] p-6 border-white bg-white/60 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider leading-none">Total Units</p>
                        <p className="text-2xl font-semibold text-slate-900 mt-1">{stations.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300">
                        <Hospital size={24} />
                    </div>
                </div>
            </div>

            <div className="glass-card rounded-[40px] overflow-hidden border-white">
                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/50 backdrop-blur-md">
                    <div className="relative w-full md:w-96 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search station by name or district..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-100 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-primary-100 transition-all outline-none shadow-sm"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-20 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-8 py-5 text-xs font-medium text-slate-400 uppercase tracking-wider">Station & Details</th>
                                    <th className="px-8 py-5 text-xs font-medium text-slate-400 uppercase tracking-wider text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredStations.map((station) => (
                                    <tr key={station.id} className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-12 h-12 bg-slate-950 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-slate-900/10 group-hover:bg-primary-600 transition-colors">
                                                    <Hospital size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-900">{station.name}</p>
                                                    <div className="flex items-center space-x-4 text-slate-400 mt-1">
                                                        <div className="flex items-center space-x-1">
                                                            <MapPin size={12} />
                                                            <span className="text-xs font-bold">{station.district}, {station.province}</span>
                                                        </div>
                                                        <span className="text-[10px] px-2 py-0.5 bg-slate-100 rounded-full font-bold text-slate-500 uppercase">{station.hierarchyLevel}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end space-x-2">
                                                <button
                                                    onClick={() => handleOpenModal(station)}
                                                    className="p-2.5 hover:bg-slate-100 rounded-xl transition-all text-slate-400 hover:text-primary-600 cursor-pointer"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteModal({ isOpen: true, stationId: station.id })}
                                                    className="p-2.5 hover:bg-rose-50 rounded-xl transition-all text-slate-300 hover:text-rose-600 cursor-pointer"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[40px] w-full max-w-lg shadow-2xl border border-white overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <h2 className="text-2xl font-semibold text-slate-900">{editingStation ? 'Edit Station' : 'Register Station'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-xl transition-all cursor-pointer text-slate-400">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Station Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-primary-50 transition-all outline-none font-medium"
                                    placeholder="e.g. National Hospital Colombo"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">District</label>
                                    <input
                                        type="text"
                                        value={formData.district}
                                        onChange={(e) => setFormData({...formData, district: e.target.value})}
                                        className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-primary-50 transition-all outline-none font-medium"
                                        placeholder="District"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Province</label>
                                    <input
                                        type="text"
                                        value={formData.province}
                                        onChange={(e) => setFormData({...formData, province: e.target.value})}
                                        className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-primary-100 transition-all outline-none font-medium"
                                        placeholder="Province"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Hierarchy Level</label>
                                <select
                                    value={formData.hierarchyLevel}
                                    onChange={(e) => setFormData({...formData, hierarchyLevel: e.target.value})}
                                    className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-primary-50 transition-all outline-none font-medium appearance-none"
                                >
                                    <option>National Hospital</option>
                                    <option>Teaching Hospital</option>
                                    <option>General Hospital</option>
                                    <option>Base Hospital</option>
                                    <option>District General Hospital</option>
                                </select>
                            </div>
                            <button
                                type="submit"
                                className="w-full py-5 bg-slate-950 text-white rounded-[20px] font-bold shadow-xl shadow-slate-900/20 hover:bg-primary-600 transition-all mt-4"
                            >
                                {editingStation ? 'Save Changes' : 'Confirm Registration'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, stationId: null })}
                onConfirm={handleDelete}
                title="Delete Station"
                message="Are you sure you want to delete this healthcare facility? This action will remove it from the registry permanently."
                confirmText="Delete Station"
                type="danger"
            />
        </div>
    );
};

export default StationManagement;
