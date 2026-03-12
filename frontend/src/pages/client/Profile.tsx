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
    <div className="flex items-center justify-between p-4 sm:p-6 bg-[var(--bg-card)] dark:bg-[var(--bg-card)]/50 rounded-2xl sm:rounded-[24px] border border-[var(--border-main)] hover:border-primary-100 dark:hover:border-primary-900 group transition-all">
        <div className="flex items-center space-x-3 sm:space-x-5">
            <div className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl ${warning ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-500' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/30 group-hover:text-primary-600 dark:group-hover:text-primary-400'} transition-all`}>
                <Icon size={20} />
            </div>
            <div>
                <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-0.5">{label}</p>
                <p className="text-sm font-semibold text-[var(--text-main)]">{value}</p>
            </div>
        </div>
        <button onClick={onClick} className="text-xs font-medium text-primary-600 uppercase tracking-wider hover:text-primary-800 transition-colors cursor-pointer">
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
    const [verifyingType, setVerifyingType] = useState<'email' | 'phone' | null>(null);
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
            // Mocking the OTP verification by calling the existing doc submission endpoint
            // Level 2 for Email, Level 3 for Phone
            const docType = verifyingType === 'email' ? 'serviceLetter' : 'biometrics';
            const response = await apiClient.put(`/profile/submit-doc/${docType}`, {});

            setProfile(response.data);
            toast.success(`${verifyingType === 'email' ? 'Email' : 'Phone'} verified successfully`);
            setVerifyingType(null);
            setOtpValue('');
        } catch (err) {
            toast.error('Verification failed. Please try again.');
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
        <div className="p-10 text-center glass-card rounded-[32px] bg-[var(--bg-card)] border-[var(--border-main)]">
            <p className="text-[var(--text-muted)] font-medium">Profile not found. Please log in again.</p>
            <button onClick={executeLogout} className="mt-4 px-6 py-2 bg-[var(--text-main)] text-[var(--bg-main)] rounded-xl font-medium">Go to Login</button>
        </div>
    );

    return (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-6 sm:space-y-10 pb-10">
            <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-8 pb-8 sm:pb-10 border-b border-[var(--border-main)]">
                <div className="relative group">
                    <div className="w-32 h-32 sm:w-40 sm:h-40 bg-linear-to-br from-primary-500 to-indigo-600 rounded-[32px] sm:rounded-[48px] p-1 shadow-2xl shadow-primary-900/20">
                        <div className="w-full h-full rounded-[28px] sm:rounded-[44px] overflow-hidden border-4 border-[var(--bg-card)] bg-[var(--bg-card)]">
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
                        <h1 className="text-2xl sm:text-4xl font-semibold text-[var(--text-main)] tracking-tight leading-none">{profile.fullName}</h1>
                        <div className="flex items-center space-x-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full text-[10px] sm:text-xs font-medium uppercase tracking-wider border border-emerald-100 dark:border-emerald-800 w-fit">
                            <ShieldCheck size={14} />
                            <span>Verified Staff</span>
                        </div>
                    </div>
                    <p className="text-xs sm:text-sm text-[var(--text-muted)] font-medium">{profile.gradeName} {profile.jobCategoryName} @ {profile.currentStationName}</p>

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
                            <p className="text-xl sm:text-2xl font-semibold text-[var(--text-main)]">Level {profile.verificationLevel}</p>
                            <p className="text-[10px] sm:text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mt-1">Trust Level</p>
                        </div>
                        <div className="w-px h-8 sm:h-10 bg-[var(--border-main)]/50"></div>
                        <div className="text-center md:text-left">
                            <p className="text-xl sm:text-2xl font-semibold text-[var(--text-main)]">{profile.verificationLevel === 3 ? '100%' : profile.verificationLevel === 2 ? '66%' : '33%'}</p>
                            <p className="text-[10px] sm:text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mt-1">Profile Score</p>
                        </div>
                    </div>
                </div>
                {isEditing ? (
                    <div className="flex gap-2">
                        <button onClick={handleUpdateProfile} className="px-6 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors">Save</button>
                        <button onClick={() => setIsEditing(false)} className="px-6 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Cancel</button>
                    </div>
                ) : (
                    <button onClick={() => setIsEditing(true)} className="px-6 py-2 bg-[var(--text-main)] text-[var(--bg-main)] rounded-xl text-sm font-medium hover:opacity-90 transition-opacity">Edit Profile</button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="space-y-8">
                    <div className="px-2">
                        <h3 className="text-base sm:text-lg font-semibold text-[var(--text-main)] tracking-tight mb-4 sm:mb-6 flex items-center space-x-3">
                            <User size={20} className="text-primary-600" />
                            <span>Personal Configuration</span>
                        </h3>
                        <div className="space-y-4">
                            {isEditing ? (
                                <div className="grow space-y-4 p-6 bg-[var(--bg-card)] dark:bg-[var(--bg-card)]/50 rounded-[24px] border border-primary-100 dark:border-primary-900/30">
                                    <div>
                                        <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1 block">Official Email</label>
                                        <input
                                            type="email"
                                            value={editForm.email}
                                            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                            className="w-full px-4 py-2 bg-[var(--bg-main)] border border-[var(--border-main)] rounded-xl text-sm text-[var(--text-main)] focus:ring-2 focus:ring-primary-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1 block">Contact Number</label>
                                        <input
                                            type="text"
                                            value={editForm.phoneNumber}
                                            onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                                            className="w-full px-4 py-2 bg-[var(--bg-main)] border border-[var(--border-main)] rounded-xl text-sm text-[var(--text-main)] focus:ring-2 focus:ring-primary-500 outline-none"
                                        />
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
                    <h3 className="text-base sm:text-lg font-semibold text-[var(--text-main)] tracking-tight mb-4 sm:mb-6 flex items-center space-x-3">
                        <FileText size={20} className="text-primary-600" />
                        <span>Verification Pipeline</span>
                    </h3>
                    <div className="glass-card rounded-2xl sm:rounded-[32px] p-6 sm:p-8 space-y-8 border-[var(--border-main)] bg-[var(--bg-card)] dark:bg-[var(--bg-card)]/40">
                        <div className="relative pl-10 border-l-2 border-[var(--border-main)]/50 space-y-12">
                            <div className="relative">
                                <div className="absolute -left-[51px] top-0 p-2 bg-emerald-500 text-white rounded-full border-4 border-[var(--bg-main)]">
                                    <ShieldCheck size={16} />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-[var(--text-main)] text-sm">NIC Authentication</h4>
                                    <p className="text-xs text-[var(--text-muted)] mt-1 font-medium leading-relaxed">System-level identification completed via Department for Registration of Persons.</p>
                                    <p className="text-xs font-medium text-emerald-500 uppercase tracking-wider mt-3">Completed</p>
                                </div>
                            </div>

                            <div className="relative">
                                <div className={`absolute -left-[51px] top-0 p-2 ${profile.serviceLetterStatus === 'COMPLETED' ? 'bg-emerald-500' : profile.serviceLetterStatus === 'REVIEWING' ? 'bg-indigo-500' : 'bg-amber-500'} text-white rounded-full border-4 border-[var(--bg-main)]`}>
                                    <AlertCircle size={16} />
                                </div>
                                <div>
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-semibold text-[var(--text-main)] text-sm">Email OTP Verification (Level 2)</h4>
                                        {profile.verificationLevel < 2 && (
                                            <button
                                                onClick={() => setVerifyingType('email')}
                                                className="text-[10px] font-bold text-primary-600 dark:text-primary-400 uppercase hover:text-primary-800 dark:hover:text-primary-300 transition-colors"
                                            >
                                                Verify Email
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-xs text-[var(--text-muted)] mt-1 font-medium leading-relaxed">
                                        {profile.verificationLevel >= 2
                                            ? `Official email address (${profile.email}) has been successfully verified.`
                                            : 'Verify your official email address to secure your account and reach Level 2.'}
                                    </p>
                                    <p className={`text-xs font-medium uppercase tracking-wider mt-3 ${profile.verificationLevel >= 2 ? 'text-emerald-500' : 'text-amber-500'}`}>
                                        {profile.verificationLevel >= 2 ? 'Verified' : 'Pending'}
                                    </p>
                                </div>
                            </div>

                            <div className="relative">
                                <div className={`absolute -left-[51px] top-0 p-2 ${profile.verificationLevel >= 3 ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'} text-white rounded-full border-4 border-[var(--bg-main)]`}>
                                    <Smartphone size={16} />
                                </div>
                                <div>
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-semibold text-[var(--text-main)] text-sm">Phone SMS Verification (Level 3)</h4>
                                        {profile.verificationLevel === 2 && (
                                            <button
                                                onClick={() => setVerifyingType('phone')}
                                                className="text-[10px] font-bold text-primary-600 dark:text-primary-400 uppercase hover:text-primary-800 dark:hover:text-primary-300 transition-colors"
                                            >
                                                Verify Phone
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">
                                        {profile.verificationLevel >= 3
                                            ? `Mobile number (${profile.phoneNumber}) verified via secure SMS OTP.`
                                            : 'Complete Level 3 by verifying your mobile number to enable real-time match alerts.'}
                                    </p>
                                    <p className={`text-xs font-medium uppercase tracking-wider mt-3 ${profile.verificationLevel >= 3 ? 'text-emerald-500' : 'text-slate-400 dark:text-slate-600'}`}>
                                        {profile.verificationLevel >= 3 ? 'Verified' : 'Pending'}
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
                    <div className="relative w-full max-w-sm bg-[var(--bg-card)] rounded-3xl shadow-2xl p-6 sm:p-8 border border-[var(--border-main)] animate-in zoom-in-95 duration-300">
                        <div className="mx-auto w-16 h-16 bg-primary-50 dark:bg-primary-900/30 rounded-full flex items-center justify-center mb-6">
                            {verifyingType === 'email' ? <Mail className="text-primary-600 dark:text-primary-400" size={32} /> : <Smartphone className="text-primary-600 dark:text-primary-400" size={32} />}
                        </div>
                        <h3 className="text-xl font-bold text-center text-[var(--text-main)] mb-2">
                            Verify {verifyingType === 'email' ? 'Email' : 'Phone'}
                        </h3>
                        <p className="text-[var(--text-muted)] text-center text-sm mb-6">
                            We've sent a 6-digit verification code to your {verifyingType}. Please enter it below.
                        </p>
                        <div className="space-y-6">
                            <input
                                type="text"
                                maxLength={6}
                                value={otpValue}
                                onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ''))}
                                placeholder="000000"
                                className="w-full text-center text-3xl font-bold tracking-[0.5em] py-4 bg-[var(--bg-main)] dark:bg-[var(--bg-main)]/50 border-2 border-[var(--border-main)] dark:border-[var(--border-main)]/50 rounded-2xl focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 text-[var(--text-main)] outline-none transition-all"
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
