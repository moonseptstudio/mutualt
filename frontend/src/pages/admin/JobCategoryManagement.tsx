import { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import {
    Briefcase,
    Plus,
    Trash2,
    AlertCircle,
    Edit2,
    X,
    Search,
    Filter,
    Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/ConfirmModal';

const JobCategoryManagement = () => {
    const [categories, setCategories] = useState<any[]>([]);
    const [fields, setFields] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedField, setSelectedField] = useState('ALL');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<any>(null);
    const [formData, setFormData] = useState({
        name: '',
        fieldId: ''
    });
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, categoryId: null as number | null });
    const [error, setError] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [catRes, fieldRes] = await Promise.all([
                apiClient.get('/public/job-categories'),
                apiClient.get('/public/fields')
            ]);
            setCategories(catRes.data);
            setFields(fieldRes.data);
        } catch (err) {
            console.error("Failed to fetch data", err);
            toast.error("Failed to load management data");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (category: any = null) => {
        if (category) {
            setEditingCategory(category);
            setFormData({
                name: category.name,
                fieldId: category.field?.id?.toString() || ''
            });
        } else {
            setEditingCategory(null);
            setFormData({
                name: '',
                fieldId: ''
            });
        }
        setError('');
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.fieldId) {
            toast.error("Please provide both name and field");
            return;
        }

        try {
            const payload = {
                name: formData.name.trim(),
                field: { id: parseInt(formData.fieldId) }
            };

            if (editingCategory) {
                const response = await apiClient.put(`/public/job-categories/${editingCategory.id}`, payload);
                setCategories(categories.map(c => c.id === editingCategory.id ? response.data : c));
                toast.success('Category updated successfully');
            } else {
                const response = await apiClient.post('/public/job-categories', payload);
                setCategories([...categories, response.data]);
                toast.success('Category added successfully');
            }
            setIsModalOpen(false);
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to save category");
            toast.error('Operation failed');
        }
    };

    const handleDeleteCategory = async () => {
        if (!deleteModal.categoryId) return;
        try {
            await apiClient.delete(`/public/job-categories/${deleteModal.categoryId}`);
            setCategories(categories.filter(c => c.id !== deleteModal.categoryId));
            toast.success('Category deleted successfully');
        } catch (err: any) {
            console.error("Failed to delete category", err);
            toast.error(err.response?.data?.message || 'Failed to delete category');
        } finally {
            setDeleteModal({ isOpen: false, categoryId: null });
        }
    };

    const filteredCategories = categories.filter(category => {
        const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesField = selectedField === 'ALL' || category.field?.id?.toString() === selectedField;
        return matchesSearch && matchesField;
    });

    const SkeletonRow = () => (
        <tr className="animate-pulse">
            <td className="px-8 py-6">
                <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl"></div>
                    <div className="space-y-2">
                        <div className="h-4 w-48 bg-slate-100 rounded-md"></div>
                        <div className="h-3 w-24 bg-slate-50 rounded-md"></div>
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
                    <h1 className="text-4xl font-semibold text-slate-950 tracking-tight leading-none">Job Categories</h1>
                    <p className="text-slate-500 mt-2 font-medium">Manage the professional categories available for mutual transfers.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center justify-center space-x-2 bg-slate-950 text-white px-8 py-3.5 rounded-2xl font-medium shadow-xl shadow-slate-900/20 hover:bg-primary-600 transition-all active:scale-95 text-sm cursor-pointer"
                >
                    <Plus size={18} />
                    <span>Add New Category</span>
                </button>
            </div>

            <div className="glass-card rounded-[40px] border-white overflow-hidden shadow-2xl shadow-slate-200/50">
                <div className="p-8 border-b border-slate-100 bg-white/50 backdrop-blur-md flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 group w-full">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Search categories..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-3xl text-sm font-medium focus:ring-4 focus:ring-primary-100 transition-all outline-none placeholder:text-slate-400 shadow-sm"
                        />
                    </div>
                    
                    <div className="flex items-center space-x-2 bg-slate-50 p-2 rounded-2xl border border-slate-100 w-full md:w-auto">
                        <div className="p-2 bg-white rounded-xl shadow-sm"><Filter size={14} className="text-slate-400" /></div>
                        <select 
                            className="bg-transparent border-none text-xs font-bold text-slate-600 outline-none pr-8 cursor-pointer flex-1"
                            value={selectedField}
                            onChange={(e) => setSelectedField(e.target.value)}
                        >
                            <option value="ALL">All Fields</option>
                            {fields.map(f => <option key={f.id} value={f.id.toString()}>{f.name}</option>)}
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Category Name & Field Association</th>
                                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
                            ) : (
                                <AnimatePresence mode="popLayout">
                                    {filteredCategories.map((category) => (
                                        <motion.tr 
                                            layout
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            key={category.id} 
                                            className="group hover:bg-slate-50/50 transition-colors"
                                        >
                                            <td className="px-8 py-6">
                                                <div className="flex items-center space-x-5">
                                                    <div className="w-12 h-12 bg-linear-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center text-slate-500 group-hover:from-primary-50 group-hover:to-primary-100 group-hover:text-primary-600 transition-all border border-white shadow-sm">
                                                        <Briefcase size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900 uppercase tracking-tight text-base">{category.name}</p>
                                                        <div className="flex items-center space-x-2 mt-1">
                                                            <Layers size={10} className="text-slate-300" />
                                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                                {category.field?.name || 'Unassigned Field'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex items-center justify-end space-x-1">
                                                    <button
                                                        onClick={() => handleOpenModal(category)}
                                                        className="p-3 hover:bg-white rounded-2xl transition-all text-slate-400 hover:text-primary-600 shadow-sm border border-transparent hover:border-slate-100 cursor-pointer"
                                                        title="Edit Category"
                                                    >
                                                        <Edit2 size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteModal({ isOpen: true, categoryId: category.id })}
                                                        className="p-3 hover:bg-rose-50 rounded-2xl transition-all text-slate-200 hover:text-rose-600 cursor-pointer"
                                                        title="Delete Category"
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

                {!loading && filteredCategories.length === 0 && (
                    <div className="py-20 text-center bg-slate-50/30">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
                            <Briefcase size={24} className="text-slate-200" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900">No categories found</h3>
                        <p className="text-slate-400 text-sm mt-1">Try adjusting your filters or search terms.</p>
                    </div>
                )}

                <div className="p-8 border-t border-slate-100 bg-slate-50/20 text-xs font-black text-slate-400 uppercase tracking-widest">
                    Total: {filteredCategories.length} Categories
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
                                        {editingCategory ? 'Edit Category' : 'New Category'}
                                    </h2>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">
                                        Define job role and field association
                                    </p>
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
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Field Association</label>
                                    <div className="relative">
                                        <select
                                            value={formData.fieldId}
                                            onChange={(e) => setFormData({...formData, fieldId: e.target.value})}
                                            className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-primary-50 transition-all outline-none font-bold text-slate-900 appearance-none shadow-inner"
                                            required
                                        >
                                            <option value="">Select Professional Field</option>
                                            {fields.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                                        </select>
                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                            <Filter size={16} />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Category Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        placeholder="e.g. Health Informatics Officer"
                                        className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-primary-50 transition-all outline-none font-bold text-slate-900 placeholder:text-slate-300 shadow-inner"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full py-5 bg-slate-950 text-white rounded-[24px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 hover:bg-primary-600 transition-all mt-4 text-sm active:scale-[0.98]"
                                >
                                    {editingCategory ? 'Save Changes' : 'Confirm & Create'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <ConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, categoryId: null })}
                onConfirm={handleDeleteCategory}
                title="Critical Action: Delete Category"
                message="Are you sure you want to delete this job category? This will affect transfer listings and user profiles associated with it."
                confirmText="Delete Category"
                type="danger"
            />
        </div>
    );
};

export default JobCategoryManagement;
