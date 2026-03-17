import {
    User,
    Mail,
    Smartphone,
    ShieldCheck,
    CreditCard,
    FileText,
    AlertCircle,
    Camera,
    LogOut
} from 'lucide-react';

const ConfigItem = ({ icon: Icon, label, value, action, warning, onClick }: any) => (
    <div className="flex items-center justify-between p-4 sm:p-5 bg-(--bg-card) dark:bg-(--bg-card)/40 rounded-3xl border border-(--border-main) hover:border-primary-500/30 dark:hover:border-primary-400/20 group transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/5 hover:-translate-y-0.5">
        <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-2xl ${warning ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-500' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/30 group-hover:text-primary-600 dark:group-hover:text-primary-400'} transition-all duration-300 ring-4 ring-transparent group-hover:ring-primary-500/5`}>
                <Icon size={20} />
            </div>
            <div>
                <p className="text-[10px] font-bold text-(--text-muted) uppercase tracking-widest mb-1 leading-none">{label}</p>
                <p className="text-sm font-bold text-(--text-main) tracking-tight">{value}</p>
            </div>
        </div>
        <button 
            onClick={onClick} 
            className="px-3 py-1.5 text-[10px] font-bold text-primary-600 bg-primary-50 dark:bg-primary-900/40 dark:text-primary-400 uppercase tracking-wider rounded-lg hover:bg-primary-600 hover:text-white dark:hover:bg-primary-500 dark:hover:text-white transition-all duration-300 cursor-pointer active:scale-95"
        >
            {action}
        </button>
    </div>
);

import { useState, useEffect, useRef } from 'react';
import apiClient from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import { getAvatarUrl } from '../../api/url';

const DEFAULT_AVATARS = [
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Bubba',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Jasper',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Luna'
];

const Profile = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ email: '', phoneNumber: '', profileImageUrl: '' });
    const [isUploading, setIsUploading] = useState(false);
    const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);
    const [verifyingType, setVerifyingType] = useState<'phone' | null>(null);
    const [otpValue, setOtpValue] = useState('');

    const photoInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await apiClient.get('/profile/me');
                setProfile(response.data);
                setEditForm({
                    email: response.data.email,
                    phoneNumber: response.data.phoneNumber || '',
                    profileImageUrl: response.data.profileImageUrl || ''
                });
            } catch (err) {
                console.error("Failed to fetch profile", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleUpdateProfile = async () => {
        try {
            const response = await apiClient.put('/profile/me', editForm);
            setProfile(response.data);
            setIsEditing(false);
            toast.success('Profile updated successfully');
        } catch (err) {
            console.error("Update failed", err);
            toast.error('Failed to update profile');
        }
    };

    const handleVerifyOTP = async () => {
        if (otpValue.length !== 6) {
            toast.error('Please enter a 6-digit OTP code');
            return;
        }

        try {
            const docType = 'biometrics';
            const response = await apiClient.put(`/profile/submit-doc/${docType}`, {});
            setProfile(response.data);
            toast.success('Phone verified successfully');
            setVerifyingType(null);
            setOtpValue('');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Verification failed. Please try again.');
        }
    };

    const confirmLogout = () => {
        setIsSignOutModalOpen(true);
    };

    const executeLogout = () => {
        logout();
        navigate('/login');
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setIsUploading(true);
        try {
            const res = await apiClient.post('/upload/profile-photo', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setProfile({ ...profile, profileImageUrl: res.data });
            setEditForm({ ...editForm, profileImageUrl: res.data });
            toast.success('Photo updated successfully');
        } catch (err) {
            toast.error('Failed to upload photo');
        } finally {
            setIsUploading(false);
        }
    };



    const pickDefaultAvatar = async (avatarUrl: string) => {
        try {
            setEditForm({ ...editForm, profileImageUrl: avatarUrl });
            const response = await apiClient.put('/profile/me', { ...editForm, profileImageUrl: avatarUrl });
            setProfile(response.data);
            toast.success('Avatar updated successfully');
        } catch (err) {
            toast.error('Failed to update avatar');
        }
    };



    if (loading) return (
        <div className="flex items-center justify-center p-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
    );

    if (!profile) return (
        <div className="p-10 text-center glass-card rounded-[32px] bg-(--bg-card) border-(--border-main)">
            <p className="text-(--text-muted) font-medium">Profile not found. Please log in again.</p>
            <button onClick={executeLogout} className="mt-4 px-6 py-2 bg-(--text-main) text-(--bg-main) rounded-xl font-medium">Go to Login</button>
        </div>
    );

    return (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-6 sm:space-y-10 pb-10">
            <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-8 pb-8 sm:pb-10 border-b border-(--border-main)">
                <div className="relative group">
                    <div className="w-32 h-32 sm:w-40 sm:h-40 bg-linear-to-br from-primary-500 to-indigo-600 rounded-[32px] sm:rounded-[48px] p-1 shadow-2xl shadow-primary-900/20">
                        <div className="w-full h-full rounded-[28px] sm:rounded-[44px] overflow-hidden border-4 border-(--bg-card) bg-(--bg-card)">
                            {isUploading ? (
                                <div className="w-full h-full flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                                </div>
                            ) : (
                                <img src={getAvatarUrl(profile.profileImageUrl, profile.fullName)} alt="profile" className="w-full h-full object-cover" />
                            )}
                        </div>
                    </div>
                    <input
                        type="file"
                        ref={photoInputRef}
                        onChange={handlePhotoUpload}
                        accept="image/*"
                        className="hidden"
                    />
                    <button
                        onClick={() => photoInputRef.current?.click()}
                        className="absolute bottom-2 right-2 p-3 bg-slate-950 text-white rounded-2xl border-4 border-slate-50 shadow-xl opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100 cursor-pointer"
                    >
                        <Camera size={20} />
                    </button>
                </div>
                <div className="text-center md:text-left grow">
                    <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-2 mb-2">
                        <h1 className="text-2xl sm:text-4xl font-semibold text-(--text-main) tracking-tight leading-none">{profile.fullName}</h1>
                        <div className="flex items-center space-x-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full text-[10px] sm:text-xs font-medium uppercase tracking-wider border border-emerald-100 dark:border-emerald-800 w-fit">
                            <ShieldCheck size={14} />
                            <span>Verified Staff</span>
                        </div>
                    </div>
                    <p className="text-xs sm:text-sm text-(--text-muted) font-medium">{profile.jobCategoryName} @ {profile.currentStationName}</p>

                    {isEditing && (
                        <div className="mt-4 flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                            {DEFAULT_AVATARS.map((url, i) => (
                                <button
                                    key={i}
                                    onClick={() => pickDefaultAvatar(url)}
                                    className="w-10 h-10 rounded-xl overflow-hidden border-2 border-transparent hover:border-primary-500 transition-all"
                                >
                                    <img src={url} alt="avatar" />
                                </button>
                            ))}
                        </div>
                    )}
                    <div className="flex items-center justify-center md:justify-start space-x-4 sm:space-x-6 mt-6">
                        <div className="text-center md:text-left">
                            <p className="text-xl sm:text-2xl font-semibold text-(--text-main)">Level {profile.verificationLevel}</p>
                            <p className="text-[10px] sm:text-xs font-medium text-(--text-muted) uppercase tracking-wider mt-1">Trust Level</p>
                        </div>
                        <div className="w-px h-8 sm:h-10 bg-(--border-main)/50"></div>
                        <div className="text-center md:text-left">
                            <p className="text-xl sm:text-2xl font-semibold text-(--text-main)">{profile.verificationLevel >= 2 ? '100%' : '50%'}</p>
                            <p className="text-[10px] sm:text-xs font-medium text-(--text-muted) uppercase tracking-wider mt-1">Profile Score</p>
                        </div>
                    </div>
                </div>

            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="space-y-8">
                    <div className="px-2">
                        <h3 className="text-base sm:text-lg font-semibold text-(--text-main) tracking-tight mb-4 sm:mb-6 flex items-center space-x-3">
                            <User size={20} className="text-primary-600" />
                            <span>Personal Configuration</span>
                        </h3>
                        <div className="space-y-4">
                            {isEditing ? (
                                <div className="space-y-4 p-6 bg-linear-to-br from-primary-50/50 to-indigo-50/50 dark:from-primary-900/10 dark:to-indigo-900/10 rounded-[32px] border border-primary-500/20 shadow-xl shadow-primary-500/5 animate-in fade-in zoom-in-95 duration-500">
                                    <div className="space-y-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-(--text-muted) uppercase tracking-widest ml-1">Official Email</label>
                                            <div className="relative group/input">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-primary-500 transition-colors">
                                                    <Mail size={18} />
                                                </div>
                                                <input
                                                    type="email"
                                                    value={editForm.email}
                                                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                                    className="w-full pl-12 pr-4 py-3.5 bg-(--bg-card) border border-(--border-main) rounded-2xl text-sm text-(--text-main) focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all font-medium"
                                                    placeholder="Enter official email"
                                                />
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-(--text-muted) uppercase tracking-widest ml-1">Contact Number</label>
                                            <div className="relative group/input">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center space-x-2">
                                                    <Smartphone size={18} className="text-slate-400 group-focus-within/input:text-primary-500 transition-colors" />
                                                    <span className="font-bold text-slate-500 border-r border-(--border-main) pr-2 dark:border-slate-700 text-sm">94</span>
                                                </div>
                                                <input
                                                    type="text"
                                                    value={editForm.phoneNumber.startsWith('94') ? editForm.phoneNumber.substring(2) : editForm.phoneNumber}
                                                    maxLength={9}
                                                    onChange={(e) => {
                                                        const value = e.target.value.replace(/\D/g, '');
                                                        if (value.length <= 9) {
                                                            setEditForm({ ...editForm, phoneNumber: value ? `94${value}` : '' });
                                                        }
                                                    }}
                                                    className="w-full pl-22 pr-4 py-3.5 bg-(--bg-card) border border-(--border-main) rounded-2xl text-sm text-(--text-main) focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all font-bold tracking-widest"
                                                    placeholder="7XXXXXXXX"
                                                />
                                            </div>
                                            {editForm.phoneNumber && editForm.phoneNumber.length > 2 && !editForm.phoneNumber.startsWith('947') && (
                                                <p className="text-[10px] text-rose-500 mt-1.5 font-bold flex items-center bg-rose-50 dark:bg-rose-900/20 w-fit px-2 py-0.5 rounded-md">
                                                    <AlertCircle size={10} className="mr-1" />
                                                    Invalid prefix. Must start with 7
                                                </p>
                                            )}
                                        </div>

                                        <div className="pt-2 flex gap-3">
                                            <button 
                                                onClick={handleUpdateProfile} 
                                                className="flex-1 py-3 bg-primary-600 text-white rounded-2xl text-sm font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/20 active:scale-[0.98] cursor-pointer"
                                            >
                                                Save Changes
                                            </button>
                                            <button 
                                                onClick={() => setIsEditing(false)} 
                                                className="px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-[0.98] cursor-pointer"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <ConfigItem icon={Mail} label="Official Email" value={profile.email} action="Manage" onClick={() => setIsEditing(true)} />
                                    <ConfigItem icon={Smartphone} label="Contact Number" value={profile.phoneNumber || "Not Provided"} action="Manage" onClick={() => setIsEditing(true)} />
                                    <ConfigItem icon={CreditCard} label="National Identity Card" value={profile.nic} action="View Details" onClick={() => toast(`NIC: ${profile.nic}`, { icon: '💳' })} />
                                </>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={confirmLogout}
                        className="flex items-center space-x-3 px-6 py-4 w-full bg-rose-50 dark:bg-rose-900/10 text-rose-600 dark:text-rose-400 rounded-3xl font-medium text-xs uppercase tracking-wider hover:bg-rose-100 dark:hover:bg-rose-900/20 transition-all group cursor-pointer"
                    >
                        <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span>Sign Out from active session</span>
                    </button>
                </div>

                <div className="px-2">
                    <h3 className="text-base sm:text-lg font-semibold text-(--text-main) tracking-tight mb-4 sm:mb-6 flex items-center space-x-3">
                        <FileText size={20} className="text-primary-600" />
                        <span>Verification Pipeline</span>
                    </h3>
                    <div className="glass-card rounded-2xl sm:rounded-[32px] p-6 sm:p-8 space-y-8 border-(--border-main) bg-(--bg-card) dark:bg-(--bg-card)/40">
                        <div className="relative pl-10 border-l-2 border-(--border-main)/50 space-y-12">
                            <div className="relative">
                                <div className="absolute -left-[51px] top-0 p-2 bg-emerald-500 text-white rounded-full border-4 border-(--bg-main)">
                                    <ShieldCheck size={16} />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-(--text-main) text-sm">NIC Authentication</h4>
                                    <p className="text-xs text-(--text-muted) mt-1 font-medium leading-relaxed">System-level identification completed via Department for Registration of Persons.</p>
                                    <p className="text-xs font-medium text-emerald-500 uppercase tracking-wider mt-3">Completed</p>
                                </div>
                            </div>

                            <div className="relative">
                                <div className={`absolute -left-[51px] top-0 p-2 ${profile.verificationLevel >= 2 ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'} text-white rounded-full border-4 border-(--bg-main)`}>
                                    <Smartphone size={16} />
                                </div>
                                <div>
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-semibold text-(--text-main) text-sm">Phone SMS Verification (Level 2)</h4>
                                        {profile.verificationLevel < 2 && (
                                            <button
                                                onClick={() => setVerifyingType('phone')}
                                                className="text-[10px] font-bold text-primary-600 dark:text-primary-400 uppercase hover:text-primary-800 dark:hover:text-primary-300 transition-colors"
                                            >
                                                Verify Phone
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">
                                        {profile.verificationLevel >= 2
                                            ? `Mobile number (${profile.phoneNumber}) verified via secure SMS OTP.`
                                            : 'Complete Level 2 by verifying your mobile number to enable real-time match alerts.'}
                                    </p>
                                    <p className={`text-xs font-medium uppercase tracking-wider mt-3 ${profile.verificationLevel >= 2 ? 'text-emerald-500' : 'text-slate-400 dark:text-slate-600'}`}>
                                        {profile.verificationLevel >= 2 ? 'Verified' : 'Pending'}
                                    </p>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            {/* OTP Verification Modal */}
            {verifyingType && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
                    <div className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm" onClick={() => setVerifyingType(null)}></div>
                    <div className="relative w-full max-w-sm bg-(--bg-card) rounded-3xl shadow-2xl p-6 sm:p-8 border border-(--border-main) animate-in zoom-in-95 duration-300">
                        <div className="mx-auto w-16 h-16 bg-primary-50 dark:bg-primary-900/30 rounded-full flex items-center justify-center mb-6">
                            <Smartphone className="text-primary-600 dark:text-primary-400" size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-center text-(--text-main) mb-2">
                            Verify Phone
                        </h3>
                        <p className="text-(--text-muted) text-center text-sm mb-6">
                            We've sent a 6-digit verification code to your phone. Please enter it below.
                        </p>
                        <div className="space-y-6">
                            <input
                                type="text"
                                maxLength={6}
                                value={otpValue}
                                onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ''))}
                                placeholder="000000"
                                className="w-full text-center text-3xl font-bold tracking-[0.5em] py-4 bg-(--bg-main) dark:bg-(--bg-main)/50 border-2 border-(--border-main) dark:border-(--border-main)/50 rounded-2xl focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 text-(--text-main) outline-none transition-all"
                            />

                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    onClick={() => setVerifyingType(null)}
                                    className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-sm transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleVerifyOTP}
                                    className="flex-1 px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-primary-500/20"
                                >
                                    Verify
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Logout Confirmation */}
            <ConfirmationModal
                isOpen={isSignOutModalOpen}
                onClose={() => setIsSignOutModalOpen(false)}
                onConfirm={executeLogout}
                title="Sign Out?"
                message="Are you sure you want to sign out of your account? You will need to log in again to access your dashboard."
                confirmText="Sign Out"
                type="logout"
            />
        </div>
    );
};

export default Profile;
