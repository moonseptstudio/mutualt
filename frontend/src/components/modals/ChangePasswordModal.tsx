import { useState } from 'react';
import { X, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import apiClient from '../../api/client';
import toast from 'react-hot-toast';

interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ChangePasswordModal = ({ isOpen, onClose }: ChangePasswordModalProps) => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPasswords, setShowPasswords] = useState(false);
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match!");
            return;
        }

        if (newPassword.length < 6) {
            toast.error("New password must be at least 6 characters long.");
            return;
        }

        setLoading(true);
        try {
            await apiClient.post('/auth/change-password', {
                oldPassword,
                newPassword
            });
            toast.success("Password changed successfully!");
            onClose();
            // Clear fields
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err: any) {
            console.error("Failed to change password", err);
            const errMsg = err.response?.data?.message || "Failed to change password";
            toast.error(errMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
            <div className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative w-full max-w-md bg-[var(--bg-card)] rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-[var(--border-main)]">
                <div className="p-6 sm:p-8 flex items-center justify-between border-b border-[var(--border-main)]/50">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-xl">
                            <Lock size={20} />
                        </div>
                        <h2 className="text-xl font-bold text-[var(--text-main)] tracking-tight">Change Password</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-[var(--bg-main)] rounded-full transition-colors">
                        <X size={20} className="text-[var(--text-muted)]" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
                    <div className="space-y-4">
                        <div className="relative">
                            <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1.5 block ml-1">Current Password</label>
                            <input
                                type={showPasswords ? "text" : "password"}
                                required
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                className="w-full px-4 py-3.5 bg-[var(--bg-main)]/50 border border-[var(--border-main)]/50 rounded-2xl text-sm font-medium text-[var(--text-main)] focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none"
                                placeholder="••••••••"
                            />
                        </div>

                        <div className="relative">
                            <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1.5 block ml-1">New Password</label>
                            <input
                                type={showPasswords ? "text" : "password"}
                                required
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full px-4 py-3.5 bg-[var(--bg-main)]/50 border border-[var(--border-main)]/50 rounded-2xl text-sm font-medium text-[var(--text-main)] focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none"
                                placeholder="••••••••"
                            />
                        </div>

                        <div className="relative">
                            <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1.5 block ml-1">Confirm New Password</label>
                            <input
                                type={showPasswords ? "text" : "password"}
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-3.5 bg-[var(--bg-main)]/50 border border-[var(--border-main)]/50 rounded-2xl text-sm font-medium text-[var(--text-main)] focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => setShowPasswords(!showPasswords)}
                        className="flex items-center space-x-2 text-xs font-bold text-[var(--text-muted)] hover:text-primary-600 dark:hover:text-primary-400 transition-colors ml-1"
                    >
                        {showPasswords ? <EyeOff size={14} /> : <Eye size={14} />}
                        <span>{showPasswords ? 'Hide' : 'Show'} Passwords</span>
                    </button>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-[var(--text-main)] text-[var(--bg-main)] rounded-2xl font-bold text-sm hover:opacity-90 transition-all flex items-center justify-center space-x-3 shadow-xl shadow-black/10 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading && <Loader2 size={20} className="animate-spin" />}
                        <span>Update Password</span>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChangePasswordModal;
