import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Bell,
    Lock,
    MessageSquare,
    Eye,
    Globe,
    Moon,
    Sun,
    ChevronRight,
    Zap,
    RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import ChangePasswordModal from '../../components/modals/ChangePasswordModal';
import { useTheme } from '../../context/ThemeContext';
import apiClient from '../../api/client';
import PageLoader from '../../components/common/PageLoader';

const SettingToggle = ({ icon: Icon, title, description, enabled, onToggle }: any) => {
    return (
        <div
            onClick={onToggle}
            className="flex items-center justify-between p-6 bg-(--bg-card) border border-(--border-main) rounded-[24px] hover:border-primary-100 dark:hover:border-primary-900 transition-all group cursor-pointer"
        >
            <div className="flex items-center space-x-5">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/40 group-hover:text-primary-600 dark:group-hover:text-primary-400 rounded-2xl transition-all">
                    <Icon size={20} />
                </div>
                <div>
                    <p className="font-semibold text-(--text-main) text-sm">{title}</p>
                    <p className="text-xs text-(--text-muted) font-medium mt-0.5">{description}</p>
                </div>
            </div>
            <div className={`w-12 h-6 rounded-full relative transition-all ${enabled ? 'bg-primary-500' : 'bg-slate-200 dark:bg-slate-800'}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white dark:bg-slate-100 rounded-full transition-all ${enabled ? 'right-1' : 'left-1'}`}></div>
            </div>
        </div>
    );
};

const Settings = () => {
    const { t } = useTranslation();
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
            toast.success(t('settings.toast_updated'));
        } catch (err) {
            console.error("Update failed", err);
            toast.error(t('settings.toast_update_failed'));
        }
    };

    if (loading) return <PageLoader />;

    return (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-10">
            <div>
                <h1 className="text-4xl font-semibold text-(--text-main) tracking-tight leading-none">{t('settings.title')}</h1>
                <p className="text-(--text-muted) mt-2 font-medium">{t('settings.subtitle')}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="space-y-8">
                    <div>
                        <h3 className="text-xs font-medium text-(--text-muted) uppercase tracking-wider mb-6 px-2">{t('settings.section_notifications')}</h3>
                        <div className="space-y-4">
                            <SettingToggle
                                icon={Zap}
                                title={t('settings.instant_match_title')}
                                description={t('settings.instant_match_desc')}
                                enabled={settings.instantMatchAlerts}
                                onToggle={() => toggleSetting('instantMatchAlerts')}
                            />
                            <SettingToggle
                                icon={MessageSquare}
                                title={t('settings.instant_message_title')}
                                description={t('settings.instant_message_desc')}
                                enabled={settings.instantMessageAlerts}
                                onToggle={() => toggleSetting('instantMessageAlerts')}
                            />
                            <SettingToggle
                                icon={RefreshCw}
                                title={t('settings.cycle_detection_title')}
                                description={t('settings.cycle_detection_desc')}
                                enabled={settings.cycleDetectionAlerts}
                                onToggle={() => toggleSetting('cycleDetectionAlerts')}
                            />
                            <SettingToggle
                                icon={Bell}
                                title={t('settings.system_updates_title')}
                                description={t('settings.system_updates_desc')}
                                enabled={settings.systemUpdatesAlerts}
                                onToggle={() => toggleSetting('systemUpdatesAlerts')}
                            />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xs font-medium text-(--text-muted) uppercase tracking-wider mb-6 px-2">{t('settings.section_privacy')}</h3>
                        <div className="space-y-4">
                            <SettingToggle
                                icon={Eye}
                                title={t('settings.public_profile_title')}
                                description={t('settings.public_profile_desc')}
                                enabled={settings.publicProfile}
                                onToggle={() => toggleSetting('publicProfile')}
                            />
                            <SettingToggle
                                icon={Globe}
                                title={t('settings.regional_discovery_title')}
                                description={t('settings.regional_discovery_desc')}
                                enabled={settings.regionalDiscovery}
                                onToggle={() => toggleSetting('regionalDiscovery')}
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="glass-card rounded-[32px] p-8 border-(--border-main) bg-(--bg-card)/40 relative overflow-hidden">
                        <h3 className="text-lg font-semibold text-(--text-main) tracking-tight mb-8">{t('settings.section_security')}</h3>
                        <div className="space-y-6">
                            <div
                                onClick={() => setIsPasswordModalOpen(true)}
                                className="flex items-center justify-between group cursor-pointer"
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400 group-hover:text-primary-600 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/40 transition-all">
                                        <Lock size={18} />
                                    </div>
                                    <span className="text-sm font-bold text-(--text-main)">{t('settings.login_password_title')}</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-(--text-muted)">{t('settings.update_now')}</span>
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
                                    }`}>{t('settings.dark_mode_title')}</h4>
                                    <p className={`text-sm font-medium transition-colors ${
                                        settings.darkMode ? 'text-indigo-300/60' : 'text-slate-500'
                                    }`}>
                                        {settings.darkMode ? t('settings.dark_mode_on_desc') : t('settings.dark_mode_off_desc')}
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
