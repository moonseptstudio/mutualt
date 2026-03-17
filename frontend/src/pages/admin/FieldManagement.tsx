import { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import {
    Layers,
    Plus,
    Trash2,
    AlertCircle,
    Edit2,
    X,
    Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/ConfirmModal';

const FieldManagement = () => {
    const [fields, setFields] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingField, setEditingField] = useState<any>(null);
    const [formData, setFormData] = useState({
        name: ''
    });
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, fieldId: null as number | null });
    const [error, setError] = useState('');

    useEffect(() => {
        fetchFields();
    }, []);

    const fetchFields = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/public/fields');
            setFields(response.data);
        } catch (err) {
            console.error("Failed to fetch fields", err);
            toast.error("Failed to load professional fields");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (field: any = null) => {
        if (field) {
            setEditingField(field);
            setFormData({
                name: field.name
            });
        } else {
            setEditingField(null);
            setFormData({
                name: ''
            });
        }
        setError('');
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) return;

        try {
            if (editingField) {
                const response = await apiClient.put(`/public/fields/${editingField.id}`, formData);
                setFields(fields.map(f => f.id === editingField.id ? response.data : f));
                toast.success('Field updated successfully');
            } else {
                const response = await apiClient.post('/public/fields', formData);
                setFields([...fields, response.data]);
                toast.success('Field added successfully');
            }
            setIsModalOpen(false);
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to save field");
            toast.error('Operation failed');
        }
    };

    const handleDeleteField = async () => {
        if (!deleteModal.fieldId) return;
        try {
            await apiClient.delete(`/public/fields/${deleteModal.fieldId}`);
            setFields(fields.filter(f => f.id !== deleteModal.fieldId));
            toast.success('Field deleted successfully');
        } catch (err: any) {
            console.error("Failed to delete field", err);
            toast.error(err.response?.data?.message || 'Failed to delete field');
        } finally {
            setDeleteModal({ isOpen: false, fieldId: null });
        }
    };

    const filteredFields = fields.filter(field => 
        field.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const SkeletonRow = () => (
        <tr className="animate-pulse">
            <td className="px-8 py-6">
                <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl"></div>
                    <div className="h-4 w-48 bg-slate-100 rounded-md"></div>
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
                    <h1 className="text-4xl font-semibold text-slate-950 tracking-tight leading-none">Professional Fields</h1>
                    <p className="text-slate-500 mt-2 font-medium">Manage broad professional sectors that group job categories and stations.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center justify-center space-x-2 bg-slate-950 text-white px-8 py-3.5 rounded-2xl font-medium shadow-xl shadow-slate-900/20 hover:bg-primary-600 transition-all active:scale-95 text-sm cursor-pointer"
                >
                    <Plus size={18} />
                    <span>Add New Field</span>
                </button>
            </div>

            <div className="glass-card rounded-[40px] border-white overflow-hidden shadow-2xl shadow-slate-200/50">
                <div className="p-8 border-b border-slate-100 bg-white/50 backdrop-blur-md">
                    <div className="relative group max-w-md">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Search fields..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-3xl text-sm font-medium focus:ring-4 focus:ring-primary-100 transition-all outline-none placeholder:text-slate-400 shadow-sm"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Field Name</th>
                                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
                            ) : (
                                <AnimatePresence mode="popLayout">
                                    {filteredFields.map((field) => (
                                        <motion.tr 
                                            layout
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            key={field.id} 
                                            className="group hover:bg-slate-50/50 transition-colors"
                                        >
                                            <td className="px-8 py-6">
                                                <div className="flex items-center space-x-5">
                                                    <div className="w-12 h-12 bg-linear-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center text-slate-500 group-hover:from-primary-50 group-hover:to-primary-100 group-hover:text-primary-600 transition-all border border-white shadow-sm">
                                                        <Layers size={20} />
                                                    </div>
                                                    <p className="font-bold text-slate-900 uppercase tracking-tight text-base">{field.name}</p>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex items-center justify-end space-x-1">
                                                    <button
                                                        onClick={() => handleOpenModal(field)}
                                                        className="p-3 hover:bg-white rounded-2xl transition-all text-slate-400 hover:text-primary-600 shadow-sm border border-transparent hover:border-slate-100 cursor-pointer"
                                                        title="Edit Field"
                                                    >
                                                        <Edit2 size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteModal({ isOpen: true, fieldId: field.id })}
                                                        className="p-3 hover:bg-rose-50 rounded-2xl transition-all text-slate-200 hover:text-rose-600 cursor-pointer"
                                                        title="Delete Field"
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
                
                {!loading && filteredFields.length === 0 && (
                    <div className="py-20 text-center bg-slate-50/30">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
                            <Layers size={24} className="text-slate-200" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900">No fields found</h3>
                        <p className="text-slate-400 text-sm mt-1">Try broadening your search.</p>
                    </div>
                )}

                <div className="p-8 border-t border-slate-100 bg-slate-50/20 text-xs font-black text-slate-400 uppercase tracking-widest">
                    Total: {filteredFields.length} Domains
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
                                        {editingField ? 'Edit Field' : 'New Domain'}
                                    </h2>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1"> define a new professional sector </p>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-white rounded-2xl transition-all shadow-sm border border-slate-100 cursor-pointer text-slate-400">
                                    <X size={20} />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                                {error && (
                                    <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl flex items-center space-x-3 text-sm font-bold">
                                        <AlertCircle size={18} />
                                        <p>{error}</p>
                                    </div>
                                )}
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Field Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ name: e.target.value })}
                                        placeholder="e.g. MOH, Nursing, Allied Health"
                                        className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-primary-50 transition-all outline-none font-bold text-slate-900 placeholder:text-slate-300 shadow-inner"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full py-5 bg-slate-950 text-white rounded-[24px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 hover:bg-primary-600 transition-all mt-4 text-sm active:scale-[0.98]"
                                >
                                    {editingField ? 'Save Changes' : 'Confirm & Create'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <ConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, fieldId: null })}
                onConfirm={handleDeleteField}
                title="Critical Action: Delete Field"
                message="Are you sure you want to delete this professional field? This action cannot be undone if job categories are associated."
                confirmText="Delete Field"
                type="danger"
            />
        </div>
    );
};

export default FieldManagement;
