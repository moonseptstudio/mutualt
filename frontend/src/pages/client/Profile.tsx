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

const ConfigItem = ({ icon: Icon, label, value, action, warning }: any) => (
    <div className="flex items-center justify-between p-6 bg-white/50 rounded-[24px] border border-slate-100 hover:border-primary-100 group transition-all">
        <div className="flex items-center space-x-5">
            <div className={`p-3 rounded-2xl ${warning ? 'bg-amber-50 text-amber-500' : 'bg-slate-50 text-slate-400 group-hover:bg-primary-50 group-hover:text-primary-600'} transition-all`}>
                <Icon size={20} />
            </div>
            <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
                <p className="text-sm font-semibold text-slate-900">{value}</p>
            </div>
        </div>
        <button className="text-xs font-medium text-primary-600 uppercase tracking-wider hover:text-primary-800 transition-colors">
            {action}
        </button>
    </div>
);

import { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await apiClient.get('/profile/me');
                setProfile(response.data);
            } catch (err) {
                console.error("Failed to fetch profile", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (loading) return (
        <div className="flex items-center justify-center p-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
    );

    if (!profile) return (
        <div className="p-10 text-center glass-card rounded-[32px]">
            <p className="text-slate-500 font-medium">Profile not found. Please log in again.</p>
            <button onClick={handleLogout} className="mt-4 px-6 py-2 bg-slate-900 text-white rounded-xl">Go to Login</button>
        </div>
    );

    return (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-10">
            <div className="flex flex-col md:flex-row items-center gap-8 pb-10 border-b border-slate-100">
                <div className="relative group">
                    <div className="w-40 h-40 bg-linear-to-br from-primary-500 to-indigo-600 rounded-[48px] p-1 shadow-2xl shadow-primary-900/20">
                        <div className="w-full h-full rounded-[44px] overflow-hidden border-4 border-white">
                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.fullName}`} alt="profile" />
                        </div>
                    </div>
                    <button className="absolute bottom-2 right-2 p-3 bg-slate-950 text-white rounded-2xl border-4 border-slate-50 shadow-xl opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100">
                        <Camera size={20} />
                    </button>
                </div>
                <div className="text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start space-x-3 mb-2">
                        <h1 className="text-4xl font-semibold text-slate-950 tracking-tight leading-none">{profile.fullName}</h1>
                        <div className="flex items-center space-x-1 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider border border-emerald-100">
                            <ShieldCheck size={14} />
                            <span>Verified Staff</span>
                        </div>
                    </div>
                    <p className="text-slate-500 font-medium">{profile.gradeName} {profile.jobCategoryName} @ {profile.currentStationName}</p>
                    <div className="flex items-center justify-center md:justify-start space-x-6 mt-6">
                        <div className="text-center md:text-left">
                            <p className="text-2xl font-semibold text-slate-900">N/A</p>
                            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mt-1">Exp Service</p>
                        </div>
                        <div className="w-px h-10 bg-slate-100"></div>
                        <div className="text-center md:text-left">
                            <p className="text-2xl font-semibold text-slate-900">100%</p>
                            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mt-1">Profile Score</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="space-y-8">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900 tracking-tight mb-6 flex items-center space-x-3">
                            <User size={20} className="text-primary-600" />
                            <span>Personal Configuration</span>
                        </h3>
                        <div className="space-y-4">
                            <ConfigItem icon={Mail} label="Official Email" value={profile.email} action="Change" />
                            <ConfigItem icon={Smartphone} label="Contact Number" value="Not Provided" action="Update" />
                            <ConfigItem icon={CreditCard} label="National Identity Card" value={profile.nic} action="View Copy" />
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 px-6 py-4 w-full bg-rose-50 text-rose-600 rounded-3xl font-medium text-xs uppercase tracking-wider hover:bg-rose-100 transition-all group"
                    >
                        <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span>Sign Out from active session</span>
                    </button>
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-slate-900 tracking-tight mb-6 flex items-center space-x-3">
                        <FileText size={20} className="text-primary-600" />
                        <span>Verification Pipeline</span>
                    </h3>
                    <div className="glass-card rounded-[32px] p-8 space-y-8 border-white">
                        <div className="relative pl-10 border-l-2 border-slate-100 space-y-12">
                            <div className="relative">
                                <div className="absolute -left-[51px] top-0 p-2 bg-emerald-500 text-white rounded-full border-4 border-slate-50">
                                    <ShieldCheck size={16} />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-slate-900 text-sm">NIC Authentication</h4>
                                    <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">System-level identification completed via Department for Registration of Persons.</p>
                                    <p className="text-xs font-medium text-emerald-500 uppercase tracking-wider mt-3">Completed</p>
                                </div>
                            </div>

                            <div className="relative">
                                <div className="absolute -left-[51px] top-0 p-2 bg-amber-500 text-white rounded-full border-4 border-slate-50">
                                    <AlertCircle size={16} />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-slate-900 text-sm">Service Record (Level 3)</h4>
                                    <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">Official service letter uploaded. Waiting for admin manual verification.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
