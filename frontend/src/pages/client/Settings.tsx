import { useState } from 'react';
import {
    Bell,
    ShieldCheck,
    Lock,
    Eye,
    Globe,
    Moon,
    Smartphone,
    ChevronRight,
    Zap,
    RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

const SettingToggle = ({ icon: Icon, title, description, enabled, onToggle }: any) => {
    return (
        <div
            onClick={onToggle}
            className="flex items-center justify-between p-6 bg-white border border-slate-100 rounded-[24px] hover:border-primary-100 transition-all group cursor-pointer"
        >
            <div className="flex items-center space-x-5">
                <div className="p-3 bg-slate-50 text-slate-400 group-hover:bg-primary-50 group-hover:text-primary-600 rounded-2xl transition-all">
                    <Icon size={20} />
                </div>
                <div>
                    <p className="font-semibold text-slate-900 text-sm">{title}</p>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">{description}</p>
                </div>
            </div>
            <div className={`w-12 h-6 rounded-full relative transition-all ${enabled ? 'bg-primary-500' : 'bg-slate-200'}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${enabled ? 'right-1' : 'left-1'}`}></div>
            </div>
        </div>
    );
};

import { useEffect } from 'react';
import apiClient from '../../api/client';

const Settings = () => {
    const [settings, setSettings] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await apiClient.get('/settings');
                setSettings(response.data);
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
            const updated = { ...settings, [key]: !settings[key] };
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
                <h1 className="text-4xl font-semibold text-slate-950 tracking-tight leading-none">Account Settings</h1>
                <p className="text-slate-500 mt-2 font-medium">Manage your security preferences and automated notifications.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="space-y-8">
                    <div>
                        <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-6 px-2">Notifications & Alerts</h3>
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
                        <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-6 px-2">Privacy & Visibility</h3>
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
                    <div className="glass-card rounded-[32px] p-8 border-white">
                        <h3 className="text-lg font-semibold text-slate-900 tracking-tight mb-8">Security & Access</h3>
                        <div className="space-y-6">
                            {[
                                { label: 'Two-Factor Authentication', icon: ShieldCheck, status: 'Active', color: 'text-emerald-500' },
                                { label: 'Login Password', icon: Lock, status: 'Updated 2m ago', color: 'text-slate-400' },
                                { label: 'Biometric Access', icon: Smartphone, status: 'Not Configured', color: 'text-amber-500' }
                            ].map((item, i) => (
                                <div
                                    key={i}
                                    onClick={() => toast(`${item.label} settings coming soon`, { icon: '🔐' })}
                                    className="flex items-center justify-between group cursor-pointer"
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className="p-2 bg-slate-50 rounded-xl text-slate-400 group-hover:text-primary-600 group-hover:bg-primary-50 transition-all">
                                            <item.icon size={18} />
                                        </div>
                                        <span className="text-sm font-bold text-slate-700">{item.label}</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <span className={`text-xs font-medium uppercase tracking-wider ${item.color}`}>{item.status}</span>
                                        <ChevronRight size={14} className="text-slate-300" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div
                        onClick={() => toggleSetting('darkMode')}
                        className={`rounded-[32px] p-8 text-white relative overflow-hidden cursor-pointer transition-all ${settings.darkMode ? 'bg-indigo-900' : 'bg-slate-900'}`}
                    >
                        <div className="relative z-10 flex items-center justify-between">
                            <div>
                                <h4 className="font-semibold tracking-tight mb-1">Dark Mode</h4>
                                <p className="text-white/40 text-xs font-bold uppercase tracking-wider">{settings.darkMode ? 'Active' : 'Experimental'}</p>
                            </div>
                            <div className="p-3 bg-white/10 rounded-2xl">
                                <Moon size={20} className={settings.darkMode ? "text-primary-400 fill-primary-400" : "text-slate-400"} />
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-2xl"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
