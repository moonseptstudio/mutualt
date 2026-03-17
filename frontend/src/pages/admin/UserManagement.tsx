import { useState, useEffect } from 'react';
import {
    Search,
    CheckCircle2,
    Clock,
    Trash2,
    Filter,
    X,
    ChevronDown,
    ShieldCheck,
    ShieldAlert,
    CheckSquare,
    Square
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../../api/client';
import ConfirmModal from '../../components/ConfirmModal';

const StatusBadge = ({ verified }: { verified: boolean }) => {
    return (
        <span className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${verified ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
            {verified ? <CheckCircle2 size={14} /> : <Clock size={14} />}
            <span>{verified ? 'Verified' : 'Pending'}</span>
        </span>
    );
};

const UserManagement = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [fields, setFields] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, userId: null as number | null });
    const [bulkDeleteModal, setBulkDeleteModal] = useState(false);
    
    // Filters
    const [selectedField, setSelectedField] = useState('ALL');
    const [selectedPackage, setSelectedPackage] = useState('ALL');
    const [selectedRole] = useState('ALL');
    
    // Selection for bulk actions
    const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const [usersRes, fieldsRes] = await Promise.all([
                    apiClient.get('/admin/users'),
                    apiClient.get('/public/fields')
                ]);
                setUsers(usersRes.data);
                setFields(fieldsRes.data);
            } catch (err) {
                console.error("Failed to fetch data", err);
                toast.error("Failed to load user directory data");
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const handleToggleVerification = async (userId: number) => {
        try {
            await apiClient.put(`/admin/users/${userId}/verify`);
            setUsers(users.map(u => u.id === userId ? { ...u, verified: !u.verified } : u));
            toast.success("User verification status updated");
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to update verification status");
        }
    };

    const handleDeleteUser = async () => {
        if (!deleteModal.userId) return;
        try {
            await apiClient.delete(`/admin/users/${deleteModal.userId}`);
            setUsers(users.filter(u => u.id !== deleteModal.userId));
            toast.success("User deleted successfully");
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to delete user");
        } finally {
            setDeleteModal({ isOpen: false, userId: null });
        }
    };

    const handleBulkDelete = async () => {
        try {
            // Sequential deletion for now if no bulk endpoint
            await Promise.all(selectedUserIds.map(id => apiClient.delete(`/admin/users/${id}`)));
            setUsers(users.filter(u => !selectedUserIds.includes(u.id)));
            setSelectedUserIds([]);
            toast.success(`Deleted ${selectedUserIds.length} users successfully`);
        } catch (err) {
            toast.error("Bulk deletion partially or fully failed");
        } finally {
            setBulkDeleteModal(false);
        }
    };

    const handleBulkVerify = async () => {
        try {
            await Promise.all(selectedUserIds.map(id => apiClient.put(`/admin/users/${id}/verify`)));
            setUsers(users.map(u => selectedUserIds.includes(u.id) ? { ...u, verified: true } : u));
            setSelectedUserIds([]);
            toast.success(`Verified ${selectedUserIds.length} users successfully`);
        } catch (err) {
            toast.error("Bulk verification failed");
        }
    };

    const toggleSelectAll = () => {
        if (selectedUserIds.length === filteredUsers.length) {
            setSelectedUserIds([]);
        } else {
            setSelectedUserIds(filteredUsers.map(u => u.id));
        }
    };

    const toggleSelectUser = (id: number) => {
        if (selectedUserIds.includes(id)) {
            setSelectedUserIds(selectedUserIds.filter(userId => userId !== id));
        } else {
            setSelectedUserIds([...selectedUserIds, id]);
        }
    };

    const filteredUsers = users.filter(user => {
        const username = user.username || '';
        const fullName = user.fullName || '';
        const role = user.role || '';
        const fieldName = user.fieldName || 'N/A';
        const userTier = user.role === 'ADMIN' ? 'ADMIN' : (user.packageName || 'FREE');
        
        const matchesSearch = username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (fullName && fullName.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesField = selectedField === 'ALL' || fieldName === selectedField;
        const matchesPackage = selectedPackage === 'ALL' || userTier === selectedPackage;
        const matchesRole = selectedRole === 'ALL' || role === selectedRole;
        
        return matchesSearch && matchesField && matchesPackage && matchesRole;
    });

    const SkeletonRow = () => (
        <tr className="animate-pulse">
            <td className="px-8 py-6"><div className="h-12 w-48 bg-slate-100 rounded-2xl"></div></td>
            <td className="px-8 py-6"><div className="h-4 w-32 bg-slate-100 rounded-lg"></div></td>
            <td className="px-8 py-6"><div className="h-4 w-24 bg-slate-100 rounded-lg"></div></td>
            <td className="px-8 py-6"><div className="h-4 w-20 bg-slate-100 rounded-lg"></div></td>
            <td className="px-8 py-6"><div className="h-4 w-24 bg-slate-100 rounded-lg"></div></td>
            <td className="px-8 py-6"><div className="h-8 w-16 bg-slate-100 rounded-xl"></div></td>
        </tr>
    );

    return (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-semibold text-slate-950 tracking-tight leading-none">User Directory</h1>
                    <p className="text-slate-500 mt-2 font-medium">Manage and verify system accounts and access levels.</p>
                </div>
            </div>

            <div className="glass-card rounded-[40px] border-white overflow-hidden">
                {/* Advanced Filters Bar */}
                <div className="p-8 border-b border-slate-100 bg-white/50 backdrop-blur-md">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                            <input
                                type="text"
                                placeholder="Search by name, username..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-3xl text-sm font-medium focus:ring-4 focus:ring-primary-100 transition-all outline-none placeholder:text-slate-400 shadow-sm"
                            />
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center space-x-2 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                                <div className="p-2 bg-white rounded-xl shadow-sm"><Filter size={14} className="text-slate-400" /></div>
                                <select 
                                    className="bg-transparent border-none text-xs font-bold text-slate-600 outline-none pr-8 cursor-pointer"
                                    value={selectedField}
                                    onChange={(e) => setSelectedField(e.target.value)}
                                >
                                    <option value="ALL">All Fields</option>
                                    {fields.map(f => <option key={f.id} value={f.name}>{f.name}</option>)}
                                </select>
                            </div>

                            <div className="flex items-center space-x-2 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                                <div className="p-2 bg-white rounded-xl shadow-sm"><ChevronDown size={14} className="text-slate-400" /></div>
                                <select 
                                    className="bg-transparent border-none text-xs font-bold text-slate-600 outline-none pr-8 cursor-pointer"
                                    value={selectedPackage}
                                    onChange={(e) => setSelectedPackage(e.target.value)}
                                >
                                    <option value="ALL">All Tiers</option>
                                    <option value="FREE">Free</option>
                                    <option value="PREMIUM">Premium</option>
                                    <option value="ADMIN">Admin</option>
                                </select>
                            </div>

                            <button 
                                onClick={() => { setSearchTerm(''); setSelectedField('ALL'); setSelectedPackage('ALL'); }}
                                className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-rose-50 hover:text-rose-600 transition-all border border-slate-100"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Selection Action Bar */}
                <AnimatePresence>
                    {selectedUserIds.length > 0 && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="bg-slate-950 text-white px-8 py-4 flex items-center justify-between"
                        >
                            <div className="flex items-center space-x-4">
                                <span className="text-sm font-bold">{selectedUserIds.length} users selected</span>
                                <div className="h-4 w-px bg-white/20"></div>
                                <button 
                                    onClick={handleBulkVerify}
                                    className="text-xs font-bold hover:text-emerald-400 transition-colors flex items-center space-x-2"
                                >
                                    <ShieldCheck size={14} />
                                    <span>Verify All</span>
                                </button>
                                <button 
                                    onClick={() => setBulkDeleteModal(true)}
                                    className="text-xs font-bold hover:text-rose-400 transition-colors flex items-center space-x-2"
                                >
                                    <Trash2 size={14} />
                                    <span>Delete Selected</span>
                                </button>
                            </div>
                            <button 
                                onClick={() => setSelectedUserIds([])}
                                className="text-xs font-bold bg-white/10 px-3 py-1 rounded-lg hover:bg-white/20 transition-colors"
                            >
                                Cancel
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-5 text-center w-20">
                                    <button onClick={toggleSelectAll} className="p-2 hover:bg-slate-200 rounded-xl transition-all">
                                        {selectedUserIds.length === filteredUsers.length && filteredUsers.length > 0 ? (
                                            <CheckSquare className="text-primary-600" size={20} />
                                        ) : (
                                            <Square className="text-slate-300" size={20} />
                                        )}
                                    </button>
                                </th>
                                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Directory Name</th>
                                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Account ID</th>
                                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Field</th>
                                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Tier</th>
                                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
                            ) : (
                                filteredUsers.map((user) => (
                                    <motion.tr 
                                        layout
                                        key={user.id} 
                                        className={`group transition-colors ${selectedUserIds.includes(user.id) ? 'bg-primary-50/30' : 'hover:bg-slate-50/50'}`}
                                    >
                                        <td className="px-8 py-6 text-center">
                                            <button onClick={() => toggleSelectUser(user.id)} className="p-2 hover:bg-white rounded-xl transition-all shadow-sm">
                                                {selectedUserIds.includes(user.id) ? (
                                                    <CheckSquare className="text-primary-600" size={20} />
                                                ) : (
                                                    <Square className="text-slate-200" size={20} />
                                                )}
                                            </button>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center space-x-5">
                                                <div className="w-14 h-14 bg-linear-to-br from-slate-100 to-slate-200 rounded-[22px] flex items-center justify-center text-slate-600 font-bold border border-white shadow-sm group-hover:from-primary-50 group-hover:to-primary-100 transition-all text-lg">
                                                    {user.username.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 uppercase tracking-tight text-base leading-none mb-1">
                                                        {user.fullName || 'Unnamed Account'}
                                                    </p>
                                                    <p className="text-xs text-slate-400 font-semibold italic">User ID: {user.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="font-mono text-sm text-slate-500 font-bold">@{user.username}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border ${user.fieldName ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                                                {user.fieldName || 'Pending'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col space-y-1">
                                                <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border w-fit ${user.role === 'ADMIN' ? 'bg-purple-50 text-purple-600 border-purple-100' : (user.packageName === 'PREMIUM' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-slate-100 text-slate-500')}`}>
                                                    {user.role === 'ADMIN' ? 'ADMIN' : (user.packageName || 'FREE')}
                                                </span>
                                                {user.role !== 'ADMIN' && user.packageName === 'PREMIUM' && user.subscriptionEndDate && (
                                                    <div className="flex items-center text-[10px] text-amber-600 font-bold bg-amber-50/50 px-2 py-0.5 rounded-lg border border-amber-100/30 w-fit">
                                                        <Clock size={10} className="mr-1" />
                                                        <span>Exp: {new Date(user.subscriptionEndDate).toLocaleDateString()}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <StatusBadge verified={user.verified} />
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end space-x-1">
                                                <button
                                                    onClick={() => handleToggleVerification(user.id)}
                                                    className={`p-3 rounded-2xl transition-all ${user.verified ? 'text-amber-500 hover:bg-amber-50' : 'text-emerald-500 hover:bg-emerald-50'}`}
                                                    title={user.verified ? "Set to Pending" : "Verify User"}
                                                >
                                                    {user.verified ? <ShieldAlert size={20} /> : <ShieldCheck size={20} />}
                                                </button>
                                                <button
                                                    onClick={() => setDeleteModal({ isOpen: true, userId: user.id })}
                                                    className="p-3 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all"
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {!loading && filteredUsers.length === 0 && (
                    <div className="p-20 text-center bg-slate-50/50">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-100">
                            <Search size={32} className="text-slate-200" />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900">No matching users found</h3>
                        <p className="text-slate-500 mt-2 font-medium">Try adjusting your filters or search keywords.</p>
                    </div>
                )}

                <div className="p-8 border-t border-slate-100 bg-slate-50/30 flex justify-between items-center">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                        Total Match: {filteredUsers.length} of {users.length} Records
                    </p>
                    <div className="flex space-x-2">
                         <button className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-white rounded-xl transition-all">Previous</button>
                         <button className="px-4 py-2 text-xs font-bold text-primary-600 bg-white shadow-sm rounded-xl transition-all">1</button>
                         <button className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-white rounded-xl transition-all">Next</button>
                    </div>
                </div>
            </div>

            <ConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, userId: null })}
                onConfirm={handleDeleteUser}
                title="Critical Action: Delete Account"
                message="This will permanently purge this user account and all associated transfers/messages. This operation is irreversible."
                confirmText="Delete Account"
                type="danger"
            />

            <ConfirmModal
                isOpen={bulkDeleteModal}
                onClose={() => setBulkDeleteModal(false)}
                onConfirm={handleBulkDelete}
                title={`Delete ${selectedUserIds.length} Accounts?`}
                message={`You are about to permanently delete ${selectedUserIds.length} selected accounts and all their data. Continue?`}
                confirmText="Delete All Selected"
                type="danger"
            />
        </div>
    );
};

export default UserManagement;
;
