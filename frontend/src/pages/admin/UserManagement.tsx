import { useState, useEffect } from 'react';
import {
    Search,
    CheckCircle2,
    Clock,
    UserPlus,
    Trash2,
    ShieldCheck,
    ShieldAlert
} from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '../../api/client';
import ConfirmModal from '../../components/ConfirmModal';

const StatusBadge = ({ verified }: { verified: boolean }) => {
    return (
        <span className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider border ${verified ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
            {verified ? <CheckCircle2 size={14} /> : <Clock size={14} />}
            <span>{verified ? 'Verified' : 'Pending'}</span>
        </span>
    );
};

const UserManagement = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, userId: null as number | null });
    const [activeTab, setActiveTab] = useState('ALL');

    const tabs = [
        { id: 'ALL', label: 'All Users' },
        { id: 'ADMIN', label: 'Admin' },
        { id: 'FREE', label: 'Free Users' },
        { id: 'PREMIUM', label: 'Premium Users' }
    ];

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/admin/users');
            setUsers(response.data);
        } catch (err) {
            console.error("Failed to fetch users", err);
            toast.error("Failed to load users");
        } finally {
            setLoading(false);
        }
    };

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

    const filteredUsers = users.filter(user => {
        const username = user.username || '';
        const fullName = user.fullName || '';
        const role = user.role || '';
        const packageName = user.packageName || 'FREE';
        
        const matchesSearch = username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (fullName && fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
            role.toLowerCase().includes(searchTerm.toLowerCase());

        if (activeTab === 'ALL') return matchesSearch;
        if (activeTab === 'ADMIN') return matchesSearch && role === 'ADMIN';
        if (activeTab === 'FREE') return matchesSearch && packageName === 'FREE' && role !== 'ADMIN';
        if (activeTab === 'PREMIUM') return matchesSearch && packageName === 'PREMIUM' && role !== 'ADMIN';
        
        return matchesSearch;
    });

    return (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-semibold text-slate-950 tracking-tight leading-none">User Directory</h1>
                    <p className="text-slate-500 mt-2 font-medium">Manage and verify system accounts and access levels.</p>
                </div>
                <button
                    onClick={() => toast('User onboarding wizard coming soon', { icon: '✨' })}
                    className="flex items-center justify-center space-x-2 bg-slate-950 text-white px-8 py-3.5 rounded-2xl font-medium shadow-xl shadow-slate-900/20 hover:bg-primary-600 transition-all active:scale-95 text-sm cursor-pointer"
                >
                    <UserPlus size={18} />
                    <span>Onboard User</span>
                </button>
            </div>

            <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100/50 backdrop-blur-md rounded-[24px] w-fit border border-slate-200/60">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                            activeTab === tab.id
                                ? 'bg-white text-slate-950 shadow-sm border border-slate-200/50'
                                : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="glass-card rounded-[40px] overflow-hidden border border-white overflow-x-auto">
                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/50 backdrop-blur-md">
                    <div className="relative w-full md:w-96 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search by username or role..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-4 focus:ring-primary-100 transition-all outline-none placeholder:text-slate-400"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="p-20 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-5 text-xs font-medium text-slate-400 uppercase tracking-wider">Name</th>
                                <th className="px-8 py-5 text-xs font-medium text-slate-400 uppercase tracking-wider">Account</th>
                                <th className="px-8 py-5 text-xs font-medium text-slate-400 uppercase tracking-wider">Role</th>
                                <th className="px-8 py-5 text-xs font-medium text-slate-400 uppercase tracking-wider">Verification</th>
                                <th className="px-8 py-5 text-xs font-medium text-slate-400 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="group hover:bg-slate-50/50 transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-linear-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center text-slate-600 font-medium border border-white shadow-sm group-hover:from-primary-50 group-hover:to-primary-100 transition-all">
                                                {user.username.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-900 uppercase tracking-tight">{user.fullName || 'N/A'}</p>
                                                <p className="text-xs text-slate-400">ID: #{user.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div>
                                            <p className="font-semibold text-slate-900 group-hover:text-primary-600 transition-colors">{user.username}</p>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${user.role === 'ADMIN' ? 'bg-purple-50 text-purple-600 border border-purple-100' : (user.packageName === 'PREMIUM' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-slate-100 text-slate-600')}`}>
                                            {user.role === 'ADMIN' ? 'ADMIN' : (user.packageName || 'FREE')}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <StatusBadge verified={user.verified} />
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => handleToggleVerification(user.id)}
                                                title={user.verified ? "Set as Pending" : "Verify User"}
                                                className={`p-2.5 rounded-xl transition-all cursor-pointer ${user.verified ? 'text-amber-500 hover:bg-amber-50' : 'text-emerald-500 hover:bg-emerald-50'}`}
                                            >
                                                {user.verified ? <ShieldAlert size={18} /> : <ShieldCheck size={18} />}
                                            </button>
                                            <button
                                                onClick={() => setDeleteModal({ isOpen: true, userId: user.id })}
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

                <div className="p-6 border-t border-slate-100 bg-slate-50/30">
                    <p className="text-xs font-bold text-slate-500 tracking-tight">Total Accounts: {filteredUsers.length}</p>
                </div>
            </div>

            <ConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, userId: null })}
                onConfirm={handleDeleteUser}
                title="Delete User"
                message="Are you sure you want to delete this user? This action cannot be undone and will remove all associated data."
                confirmText="Delete Account"
                type="danger"
            />
        </div>
    );
};

export default UserManagement;
