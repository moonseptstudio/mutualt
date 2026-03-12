import { useState } from 'react';
import {
    Bell,
    ShieldCheck,
    Lock,
    Eye,
    Globe,
    Moon,
    Sun,
    Smartphone,
    ChevronRight,
    Zap,
    RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import ChangePasswordModal from '../../components/modals/ChangePasswordModal';
import { useTheme } from '../../context/ThemeContext';

const SettingToggle = ({ icon: Icon, title, description, enabled, onToggle }: any) => {
    return (
        <div
            onClick={onToggle}
            className="flex items-center justify-between p-6 bg-[var(--bg-card)] border border-[var(--border-main)] rounded-[24px] hover:border-primary-100 dark:hover:border-primary-900 transition-all group cursor-pointer"
        >
            <div className="flex items-center space-x-5">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/40 group-hover:text-primary-600 dark:group-hover:text-primary-400 rounded-2xl transition-all">
                    <Icon size={20} />
                </div>
                <div>
                    <p className="font-semibold text-[var(--text-main)] text-sm">{title}</p>
                    <p className="text-xs text-[var(--text-muted)] font-medium mt-0.5">{description}</p>
                </div>
            </div>
            <div className={`w-12 h-6 rounded-full relative transition-all ${enabled ? 'bg-primary-500' : 'bg-slate-200 dark:bg-slate-800'}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white dark:bg-slate-100 rounded-full transition-all ${enabled ? 'right-1' : 'left-1'}`}></div>
            </div>
        </div>
    );
};

import { useEffect } from 'react';
import apiClient from '../../api/client';

const Settings = () => {
    const { theme, toggleTheme, setTheme } = useTheme();
    const [settings, setSettings] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

    useEffect(() => {
        if (settings) {
            setSettings({ ...settings, darkMode: theme === 'dark' });
        }
    }, [theme]);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await apiClient.get('/settings');
                setSettings(response.data);
                // Sync theme context with backend setting on load
                if (response.data.darkMode !== (theme === 'dark')) {
                    setTheme(response.data.darkMode ? 'dark' : 'light');
                }
            } catch (err) {
                console.error("Failed to fetch settings", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const toggleSetting = async (key: string) => {
        try {
            const newValue = !settings[key];
            const updated = { ...settings, [key]: newValue };
            
            // If it's darkMode, also update context
            if (key === 'darkMode') {
                toggleTheme();
            }

            const response = await apiClient.put('/settings', updated);
            setSettings(response.data);
            toast.success('Setting updated');
        } catch (err) {
            console.error("Update failed", err);
            toast.error('Failed to update setting');
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center p-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
    );

    return (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-10">
            <div>
                <h1 className="text-4xl font-semibold text-[var(--text-main)] tracking-tight leading-none">Account Settings</h1>
                <p className="text-[var(--text-muted)] mt-2 font-medium">Manage your security preferences and automated notifications.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="space-y-8">
                    <div>
                        <h3 className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-6 px-2">Notifications & Alerts</h3>
                        <div className="space-y-4">
                            <SettingToggle
                                icon={Zap}
                                title="Instant Match Alerts"
                                description="Notify me immediately when a direct match is found."
                                enabled={settings.instantMatchAlerts}
                                onToggle={() => toggleSetting('instantMatchAlerts')}
                            />
                            <SettingToggle
                                icon={RefreshCw}
                                title="Cycle Detection"
                                description="Alert me when I part of a detected multi-way loop."
                                enabled={settings.cycleDetectionAlerts}
                                onToggle={() => toggleSetting('cycleDetectionAlerts')}
                            />
                            <SettingToggle
                                icon={Bell}
                                title="System Updates"
                                description="Receive news regarding regional station changes."
                                enabled={settings.systemUpdatesAlerts}
                                onToggle={() => toggleSetting('systemUpdatesAlerts')}
                            />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-6 px-2">Privacy & Visibility</h3>
                        <div className="space-y-4">
                            <SettingToggle
                                icon={Eye}
                                title="Public Profile"
                                description="Allow other medical officers to see my current station."
                                enabled={settings.publicProfile}
                                onToggle={() => toggleSetting('publicProfile')}
                            />
                            <SettingToggle
                                icon={Globe}
                                title="Regional Discovery"
                                description="Show my profile in local station-based searches."
                                enabled={settings.regionalDiscovery}
                                onToggle={() => toggleSetting('regionalDiscovery')}
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="glass-card rounded-[32px] p-8 border-[var(--border-main)] bg-[var(--bg-card)]/40 relative overflow-hidden">
                        <h3 className="text-lg font-semibold text-[var(--text-main)] tracking-tight mb-8">Security & Access</h3>
                        <div className="space-y-6">
                            <div
                                onClick={() => toggleSetting('twoFactorEnabled')}
                                className="flex items-center justify-between group cursor-pointer"
                            >
                                <div className="flex items-center space-x-4">
                                    <div className={`p-2 bg-slate-50 dark:bg-slate-800 rounded-xl transition-all ${settings.twoFactorEnabled ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' : 'text-slate-400 group-hover:text-primary-600 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/40'}`}>
                                        <ShieldCheck size={18} />
                                    </div>
                                    <span className="text-sm font-bold text-[var(--text-main)]">Two-Factor Authentication</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <span className={`text-[10px] font-bold uppercase tracking-wider ${settings.twoFactorEnabled ? 'text-emerald-500' : 'text-[var(--text-muted)]'}`}>
                                        {settings.twoFactorEnabled ? 'Active' : 'Disabled'}
                                    </span>
                                    <div className={`w-8 h-4 rounded-full relative transition-all ${settings.twoFactorEnabled ? 'bg-primary-500' : 'bg-slate-200 dark:bg-slate-800'}`}>
                                        <div className={`absolute top-0.5 w-3 h-3 bg-white dark:bg-slate-100 rounded-full transition-all ${settings.twoFactorEnabled ? 'right-0.5' : 'left-0.5'}`}></div>
                                    </div>
                                </div>
                            </div>

                            <div
                                onClick={() => setIsPasswordModalOpen(true)}
                                className="flex items-center justify-between group cursor-pointer"
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400 group-hover:text-primary-600 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/40 transition-all">
                                        <Lock size={18} />
                                    </div>
                                    <span className="text-sm font-bold text-[var(--text-main)]">Login Password</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Update Now</span>
                                    <ChevronRight size={14} className="text-slate-300 dark:text-slate-600" />
                                </div>
                            </div>

                            <div
                                onClick={() => toast("Biometric settings protected by system level authentication", { icon: '🛡️' })}
                                className="flex items-center justify-between group cursor-pointer"
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400 group-hover:text-amber-600 group-hover:bg-amber-50 dark:group-hover:bg-amber-900/40 transition-all">
                                        <Smartphone size={18} />
                                    </div>
                                    <span className="text-sm font-bold text-[var(--text-main)]">Biometric Access</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500">Not Linked</span>
                                    <ChevronRight size={14} className="text-slate-300 dark:text-slate-600" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div
                        onClick={() => toggleSetting('darkMode')}
                        className={`group relative overflow-hidden rounded-[32px] p-8 transition-all duration-500 cursor-pointer border-2 ${
                            settings.darkMode 
                                ? 'bg-indigo-950 border-indigo-500/30' 
                                : 'bg-slate-50 border-slate-200 hover:border-primary-200'
                        }`}
                    >
                        <div className="relative z-10 flex items-center justify-between">
                            <div className="flex items-center space-x-5">
                                <div className={`p-4 rounded-[22px] transition-all duration-500 ${
                                    settings.darkMode 
                                        ? 'bg-indigo-500/20 text-amber-400 shadow-[0_0_20px_rgba(99,102,241,0.2)]' 
                                        : 'bg-white text-slate-400 shadow-sm group-hover:bg-primary-50 group-hover:text-primary-600'
                                }`}>
                                    {settings.darkMode ? <Moon size={24} fill="currentColor" /> : <Sun size={24} />}
                                </div>
                                <div>
                                    <h4 className={`text-lg font-bold tracking-tight transition-colors ${
                                        settings.darkMode ? 'text-white' : 'text-slate-900'
                                    }`}>Dark Appearance</h4>
                                    <p className={`text-sm font-medium transition-colors ${
                                        settings.darkMode ? 'text-indigo-300/60' : 'text-slate-500'
                                    }`}>
                                        {settings.darkMode ? 'Light out. High contrast mode active.' : 'Standard light presentation.'}
                                    </p>
                                </div>
                            </div>
                            
                            <div className={`w-14 h-7 rounded-full p-1 transition-all duration-500 ${
                                settings.darkMode ? 'bg-indigo-500' : 'bg-slate-200'
                            }`}>
                                <div className={`h-5 w-5 rounded-full bg-white shadow-lg transition-all duration-500 transform ${
                                    settings.darkMode ? 'translate-x-7' : 'translate-x-0'
                                }`}></div>
                            </div>
                        </div>
                        
                        {/* Decorative background element */}
                        <div className={`absolute -right-6 -bottom-6 w-32 h-32 rounded-full blur-3xl transition-all duration-700 ${
                            settings.darkMode ? 'bg-indigo-500/20 scale-125' : 'bg-primary-500/5 scale-0'
                        }`}></div>
                    </div>
                </div>
            </div>

            <ChangePasswordModal 
                isOpen={isPasswordModalOpen} 
                onClose={() => setIsPasswordModalOpen(false)} 
            />
        </div>
    );
};

export default Settings;
