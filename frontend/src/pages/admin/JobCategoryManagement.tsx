import { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import {
    Briefcase,
    Plus,
    Trash2,
    Loader2,
    AlertCircle,
    Edit2,
    X,
    Save
} from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/ConfirmModal';

const JobCategoryManagement = () => {
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, categoryId: null as number | null });
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingName, setEditingName] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await apiClient.get('/public/job-categories');
            setCategories(response.data);
        } catch (err) {
            console.error("Failed to fetch categories", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCategoryName.trim()) return;

        try {
            const response = await apiClient.post('/public/job-categories', { name: newCategoryName });
            setCategories([...categories, response.data]);
            setNewCategoryName('');
            setError('');
            toast.success('Category added successfully');
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to add category");
            toast.error('Failed to add category');
        }
    };

    const handleStartEdit = (category: any) => {
        setEditingId(category.id);
        setEditingName(category.name);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditingName('');
    };

    const handleSaveEdit = async (id: number) => {
        if (!editingName.trim()) return;
        try {
            await apiClient.put(`/public/job-categories/${id}`, { name: editingName });
            setCategories(categories.map(c => c.id === id ? { ...c, name: editingName } : c));
            setEditingId(null);
            setEditingName('');
            toast.success('Category updated successfully');
        } catch (err) {
            toast.error('Failed to update category');
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

    return (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-8">
            <div>
                <h1 className="text-4xl font-semibold text-slate-950 tracking-tight leading-none">Job Categories</h1>
                <p className="text-slate-500 mt-2 font-medium">Manage the professional categories available for mutual transfers.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <div className="glass-card rounded-[40px] border-white">
                        <div className="overflow-x-auto">
                            {loading ? (
                                <div className="p-20 text-center">
                                    <Loader2 className="animate-spin text-primary-600 mx-auto" size={40} />
                                </div>
                            ) : (
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/50">
                                            <th className="px-8 py-5 text-xs font-medium text-slate-400 uppercase tracking-wider">Category Name</th>
                                            <th className="px-8 py-5 text-xs font-medium text-slate-400 uppercase tracking-wider text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {categories.map((category) => (
                                            <tr key={category.id} className="group hover:bg-slate-50/50 transition-colors">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center space-x-4">
                                                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                                                            <Briefcase size={20} />
                                                        </div>
                                                        {editingId === category.id ? (
                                                            <input
                                                                type="text"
                                                                value={editingName}
                                                                onChange={(e) => setEditingName(e.target.value)}
                                                                className="px-4 py-2 bg-white border border-primary-300 rounded-xl outline-none focus:ring-4 focus:ring-primary-50 font-semibold text-slate-900"
                                                                autoFocus
                                                            />
                                                        ) : (
                                                            <p className="font-semibold text-slate-900 uppercase tracking-tight">{category.name}</p>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <div className="flex items-center justify-end space-x-2">
                                                        {editingId === category.id ? (
                                                            <>
                                                                <button
                                                                    onClick={() => handleSaveEdit(category.id)}
                                                                    className="p-2.5 bg-slate-950 text-white rounded-xl hover:bg-primary-600 transition-all cursor-pointer"
                                                                >
                                                                    <Save size={18} />
                                                                </button>
                                                                <button
                                                                    onClick={handleCancelEdit}
                                                                    className="p-2.5 hover:bg-slate-100 text-slate-400 rounded-xl transition-all cursor-pointer"
                                                                >
                                                                    <X size={18} />
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <button
                                                                    onClick={() => handleStartEdit(category)}
                                                                    className="p-2.5 hover:bg-slate-100 rounded-xl transition-all text-slate-400 hover:text-primary-600 cursor-pointer"
                                                                >
                                                                    <Edit2 size={18} />
                                                                </button>
                                                                <button
                                                                    onClick={() => setDeleteModal({ isOpen: true, categoryId: category.id })}
                                                                    className="p-2.5 hover:bg-rose-50 rounded-xl transition-all text-slate-200 hover:text-rose-600 cursor-pointer"
                                                                >
                                                                    <Trash2 size={18} />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="glass-card rounded-[32px] p-8 border-white bg-white/60 backdrop-blur-md sticky top-8">
                        <h3 className="text-xl font-semibold text-slate-900 mb-6">Add New Category</h3>
                        <form onSubmit={handleAddCategory} className="space-y-4">
                            {error && (
                                <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl flex items-center space-x-3 text-sm font-medium">
                                    <AlertCircle size={18} />
                                    <p>{error}</p>
                                </div>
                            )}
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Category Name</label>
                                <input
                                    type="text"
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    placeholder="e.g. Health Informatics Officer"
                                    className="w-full px-5 py-4 bg-white border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary-50 focus:border-primary-500 transition-all font-medium text-slate-900 shadow-sm"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full py-4 bg-slate-950 text-white rounded-2xl font-bold shadow-xl shadow-slate-900/20 hover:bg-primary-600 transition-all flex items-center justify-center space-x-2"
                            >
                                <Plus size={20} />
                                <span>Save Category</span>
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            <ConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, categoryId: null })}
                onConfirm={handleDeleteCategory}
                title="Delete Category"
                message="Are you sure you want to delete this job category? This will affect transfer listings using this category."
                confirmText="Delete Category"
                type="danger"
            />
        </div>
    );
};

export default JobCategoryManagement;
