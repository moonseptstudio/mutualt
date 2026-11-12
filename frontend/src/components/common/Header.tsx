import { useState, useEffect, useRef } from 'react';
import { 
    Bell, 
    User, 
    Settings, 
    LogOut, 
    ChevronDown, 
    Sun, 
    Moon,
    Activity,
    MapPin,
    Search,
    Inbox,
    MessageSquare,
    Lock,
    Globe
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import apiClient from '../../api/client';
import ConfirmationModal from './ConfirmationModal';
import LanguageSwitcher from '../LanguageSwitcher';
import logoImg from '../../assets/logos/logo.jpg';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface HeaderProps {
    hasPackage?: boolean;
}

const Header = ({ hasPackage }: HeaderProps) => {
    const { t } = useTranslation();
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);
    const [profile, setProfile] = useState<any>(null);
    const [notifications, setNotifications] = useState<any[]>([]);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const notificationsDropdownRef = useRef<HTMLDivElement>(null);
    const profileDropdownRef = useRef<HTMLDivElement>(null);

    const navTabs = [
        {
            key: 'dashboard',
            label: t('dashboard.nav_dashboard'),
            icon: Activity,
            to: '/dashboard',
            isActive: location.pathname === '/dashboard',
        },
        {
            key: 'preferences',
            label: t('dashboard.nav_preferences'),
            icon: MapPin,
            to: '/preferences',
            isActive: location.pathname === '/preferences',
        },
        {
            key: 'matches',
            label: t('dashboard.nav_matches'),
            icon: Search,
            to: '/matches',
            isActive: location.pathname === '/matches',
        },
        {
            key: 'requests',
            label: t('dashboard.nav_requests'),
            icon: Inbox,
            to: '/requests',
            isActive: location.pathname.startsWith('/requests'),
            locked: hasPackage === false,
        },
        {
            key: 'messages',
            label: t('dashboard.nav_messages'),
            icon: MessageSquare,
            to: '/messages',
            isActive: location.pathname.startsWith('/messages'),
            locked: hasPackage === false,
        },
    ];

    const fetchNotifications = async () => {
        try {
            const res = await apiClient.get('/notifications');
            setNotifications(res.data);
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        }
    };

    const fetchProfile = async () => {
        try {
            const response = await apiClient.get('/profile/me');
            setProfile(response.data);
        } catch (err) {
            console.error("Failed to fetch profile in header", err);
        }
    };

    useEffect(() => {
        if (user) {
            fetchNotifications();
            fetchProfile();
            // Poll every 30 seconds
            const interval = setInterval(() => {
                fetchNotifications();
                fetchProfile();
            }, 30000);

            const handleNotificationReceived = () => {
                fetchNotifications();
            };
            window.addEventListener('notification-received', handleNotificationReceived);

            return () => {
                clearInterval(interval);
                window.removeEventListener('notification-received', handleNotificationReceived);
            };
        }
    }, [user]);

    const markAsRead = async (id: number) => {
        try {
            await apiClient.put(`/notifications/${id}/read`);
            setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
        } catch (error) {
            console.error('Failed to mark as read', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await apiClient.put('/notifications/read-all');
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error('Failed to mark all as read', error);
        }
    };

    // Keyboard shortcut for search (Ctrl+K)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notificationsDropdownRef.current && !notificationsDropdownRef.current.contains(event.target as Node)) {
                setIsNotificationsOpen(false);
            }
            if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const confirmSignOut = () => {
        setIsProfileOpen(false);
        setIsSignOutModalOpen(true);
    };

    const getAvatarUrl = (url: string | null | undefined, name: string) => {
        if (!url) return `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`;
        if (url.startsWith('http') || url.startsWith('data:')) return url;
        const baseUrl = import.meta.env.VITE_BASE_URL.replace(/\/$/, "");
        return `${baseUrl}${url}`;
    };

    const executeSignOut = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="relative h-16 sm:h-20 glass-panel-strong border-b border-(--border-main) shrink-0 z-40 sticky top-0 transition-all px-4 sm:px-6 md:px-8 lg:px-10">
            <div className="max-w-7xl mx-auto w-full h-full flex items-center justify-between">
                {/* Left: Brand Logo */}
                <Link to="/" className="flex items-center space-x-3 shrink-0 group">
                <img 
                    src={logoImg} 
                    alt="Mutual Transfer Logo" 
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-[14px] object-cover shadow-md shadow-primary-900/10 group-hover:scale-105 transition-transform duration-300" 
                />
                <div className="flex flex-col">
                    <span className="text-[17px] sm:text-lg font-bold bg-linear-to-r from-primary-700 to-primary-500 bg-clip-text text-transparent tracking-tighter leading-none uppercase">
                        Mutual Transfer
                    </span>
                    <span className="hidden sm:inline-block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">
                        {t('dashboard.user_dashboard')}
                    </span>
                </div>
            </Link>

            {/* Center: Desktop Navigation Tabs (Centered strictly between Logo and Right Actions) */}
            <div className="flex-1 hidden lg:flex items-center justify-center px-4 min-w-0">
                <nav className="relative flex items-center gap-1 p-1 xl:p-1.5 bg-(--bg-main)/80 dark:bg-(--bg-main)/60 rounded-2xl border border-(--border-main)/80 shadow-xs backdrop-blur-md">
                    {/* Infinity Looped Single Laser Line (Mixed Gradient Beam with Curving Outside Glow) */}
                    <div 
                        className="pointer-events-none absolute inset-0 rounded-2xl overflow-visible z-20"
                        style={{
                            filter: 'drop-shadow(0 0 3px #0ea5e9) drop-shadow(0 0 6px rgba(56, 189, 248, 0.75))',
                        }}
                        aria-hidden="true"
                    >
                        <div className="laser-beam-container">
                            <div className="laser-beam-tracer" />
                        </div>
                    </div>

                    {navTabs.map((tab) => {
                        const Icon = tab.icon;
                        const active = tab.isActive;
                        return (
                            <Link
                                key={tab.key}
                                to={tab.locked ? '#' : tab.to}
                                onClick={(e) => {
                                    if (tab.locked) {
                                        e.preventDefault();
                                        toast.error(t('dashboard.package_required'));
                                    }
                                }}
                                className={`relative z-30 flex items-center justify-center gap-1.5 xl:gap-2 px-3.5 xl:px-4.5 py-1.5 xl:py-2 rounded-xl text-xs font-semibold transition-all duration-200 select-none ${
                                    active
                                        ? 'text-white font-bold'
                                        : tab.locked
                                            ? 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                                            : 'text-slate-600 dark:text-slate-400 hover:text-(--text-main) hover:bg-(--bg-card)/60'
                                }`}
                            >
                                {/* Active Background Pill with Spring Motion */}
                                {active && (
                                    <motion.div
                                        layoutId="desktopHeaderTabPill"
                                        className="absolute inset-0 bg-primary-600 dark:bg-primary-500 rounded-xl shadow-md shadow-primary-500/25 -z-10"
                                        transition={{ type: "spring", stiffness: 450, damping: 32 }}
                                    />
                                )}

                                {/* Tab Icon */}
                                <Icon 
                                    size={16} 
                                    className={`shrink-0 transition-colors ${active ? 'text-white' : ''}`} 
                                />
                                <span className={`transition-colors whitespace-nowrap ${active ? 'text-white' : ''}`}>{tab.label}</span>

                                {tab.locked && (
                                    <Lock size={12} className={`shrink-0 opacity-70 ml-0.5 ${active ? 'text-white/80' : 'text-slate-400'}`} />
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Right: Actions (Notification & User Profile) */}
            <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
                {/* Notification Bell Dropdown */}
                <div className="relative" ref={notificationsDropdownRef}>
                    <button
                        onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                        className={`p-2 sm:p-2.5 rounded-xl sm:rounded-2xl transition-all duration-300 relative group cursor-pointer ${
                            isNotificationsOpen 
                                ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' 
                                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                        aria-label="Notifications"
                    >
                        <Bell size={20} />
                        {notifications.some(n => !n.isRead) && (
                            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-(--bg-card) animate-pulse"></span>
                        )}
                    </button>

                    {isNotificationsOpen && (
                        <div className="absolute -right-16 sm:right-0 mt-3 w-72 sm:w-80 bg-(--bg-card) rounded-2xl sm:rounded-3xl shadow-2xl border border-(--border-main) overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300 z-50">
                            <div className="px-6 py-4 border-b border-(--border-main) flex items-center justify-between bg-slate-50 dark:bg-slate-800">
                                <h3 className="font-bold text-sm text-(--text-main)">{t('dashboard.notifications')}</h3>
                                {notifications.some(n => !n.isRead) && (
                                    <span className="bg-primary-100 text-primary-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter">
                                        {notifications.filter(n => !n.isRead).length} {t('dashboard.new_count')}
                                    </span>
                                )}
                            </div>
                            <div className="p-2 max-h-80 overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="p-6 text-center text-slate-400 text-xs font-medium">{t('dashboard.no_notifications')}</div>
                                ) : (
                                    notifications.map(notification => (
                                        <div
                                            key={notification.id}
                                            onClick={() => !notification.isRead && markAsRead(notification.id)}
                                            className={`p-4 rounded-2xl transition-colors cursor-pointer group mb-1 ${notification.isRead ? 'hover:bg-slate-100 dark:hover:bg-slate-800 opacity-90' : 'bg-primary-50 dark:bg-primary-900 hover:bg-primary-50 dark:hover:bg-primary-900'}`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <p className="text-xs font-bold text-(--text-main) group-hover:text-primary-600 transition-colors">
                                                    {notification.title}
                                                </p>
                                                {!notification.isRead && <span className="w-2 h-2 rounded-full bg-primary-500 mt-1 shrink-0"></span>}
                                            </div>
                                            <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                                                {notification.message}
                                            </p>
                                            <p className="text-[10px] text-slate-400 mt-2 font-medium">
                                                {new Date(notification.createdAt).toLocaleDateString()} at {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>
                            {notifications.some(n => !n.isRead) && (
                                <button
                                    onClick={markAllAsRead}
                                    className="w-full py-4 text-[11px] font-bold text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors border-t border-(--border-main) uppercase tracking-widest cursor-pointer"
                                >
                                    {t('dashboard.mark_all_read')}
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* User Profile Dropdown Button (Name & Verified Badge Removed) */}
                <div className="relative" ref={profileDropdownRef}>
                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className={`flex items-center space-x-1.5 p-1 rounded-2xl transition-all duration-300 border cursor-pointer ${
                            isProfileOpen 
                                ? 'bg-(--bg-main) border-primary-200 dark:border-primary-800 shadow-lg ring-4 ring-primary-500/10' 
                                : 'bg-(--bg-main) dark:bg-(--bg-main)/50 border-transparent hover:border-(--border-main)'
                        }`}
                        aria-label="User profile menu"
                    >
                        <div className="w-8 h-8 sm:w-9 sm:h-9 bg-linear-to-br from-primary-500 to-indigo-600 rounded-xl sm:rounded-[14px] overflow-hidden flex items-center justify-center text-white shadow-xs border border-(--border-main)">
                            <img
                                src={getAvatarUrl(profile?.profileImageUrl || user?.profileImageUrl, user?.fullName || user?.username || 'User')}
                                alt="profile"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 mr-1 ${isProfileOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isProfileOpen && (
                        <div className="absolute right-0 mt-3 w-72 bg-(--bg-card) dark:bg-slate-900 rounded-3xl shadow-2xl border border-(--border-main) py-3 animate-in fade-in slide-in-from-top-4 duration-300 z-50">
                            {/* Account Info Header */}
                            <div className="px-5 py-3 mb-1">
                                <div className="flex items-center justify-between mb-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('dashboard.account_info')}</p>
                                    <span className="text-[9px] font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/50 px-2 py-0.5 rounded-full border border-primary-100 dark:border-primary-900/40 uppercase tracking-wider">
                                        {profile?.verified ? t('profile.verified') : t('profile.under_review')}
                                    </span>
                                </div>
                                <p className="text-sm font-bold text-(--text-main) truncate">{profile?.fullName || user?.fullName || user?.username}</p>
                                <p className="text-[11px] text-(--text-muted) truncate mt-0.5">{user?.username}</p>
                            </div>

                            {/* Quick Settings: Theme Toggle & Language Dropdown */}
                            <div className="px-4 py-3 my-2 border-y border-(--border-main) bg-slate-50/70 dark:bg-slate-800/40 space-y-2.5">
                                {/* Dark Mode Row */}
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-(--text-muted) flex items-center space-x-2">
                                        {theme === 'dark' ? (
                                            <Moon size={14} className="text-primary-400" />
                                        ) : (
                                            <Sun size={14} className="text-amber-500" />
                                        )}
                                        <span>{t('settings.dark_mode_title')}</span>
                                    </span>
                                    <button
                                        onClick={toggleTheme}
                                        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-(--bg-card) hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-all border border-(--border-main) text-(--text-main) cursor-pointer text-xs font-bold shadow-xs"
                                        title={theme === 'dark' ? t('dashboard.switch_light') : t('dashboard.switch_dark')}
                                    >
                                        {theme === 'dark' ? (
                                            <>
                                                <Sun size={13} className="text-amber-400" />
                                                <span>Light</span>
                                            </>
                                        ) : (
                                            <>
                                                <Moon size={13} className="text-slate-600 dark:text-slate-300" />
                                                <span>Dark</span>
                                            </>
                                        )}
                                    </button>
                                </div>

                                {/* Language Dropdown Row */}
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-(--text-muted) flex items-center space-x-2">
                                        <Globe size={14} className="text-primary-500" />
                                        <span>{t('common.language')}</span>
                                    </span>
                                    <LanguageSwitcher />
                                </div>
                            </div>

                            {/* Navigation Links */}
                            <div className="px-2 space-y-1">
                                <Link
                                    to="/profile"
                                    onClick={() => setIsProfileOpen(false)}
                                    className="flex items-center space-x-3 px-4 py-2.5 text-slate-600 dark:text-slate-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 rounded-2xl transition-all font-bold text-xs group"
                                >
                                    <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl group-hover:bg-primary-100 dark:group-hover:bg-primary-900/40 transition-colors">
                                        <User size={14} />
                                    </div>
                                    <span>{t('dashboard.nav_profile')}</span>
                                </Link>
                                <Link
                                    to="/settings"
                                    onClick={() => setIsProfileOpen(false)}
                                    className="flex items-center space-x-3 px-4 py-2.5 text-slate-600 dark:text-slate-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 rounded-2xl transition-all font-bold text-xs group"
                                >
                                    <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl group-hover:bg-primary-100 dark:group-hover:bg-primary-900/40 transition-colors">
                                        <Settings size={14} />
                                    </div>
                                    <span>{t('dashboard.nav_settings')}</span>
                                </Link>
                            </div>

                            {/* Sign Out Button */}
                            <div className="mt-2 pt-2 border-t border-(--border-main) px-2">
                                <button
                                    onClick={confirmSignOut}
                                    className="flex items-center space-x-3 px-4 py-2.5 w-full text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-2xl transition-all font-bold text-xs group cursor-pointer"
                                >
                                    <div className="p-1.5 bg-rose-50 dark:bg-rose-500/10 rounded-xl group-hover:bg-rose-100 transition-colors">
                                        <LogOut size={14} />
                                    </div>
                                    <span>{t('dashboard.sign_out')}</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            </div>

            <ConfirmationModal
                isOpen={isSignOutModalOpen}
                onClose={() => setIsSignOutModalOpen(false)}
                onConfirm={executeSignOut}
                title={t('dashboard.logout_confirm_title')}
                message={t('dashboard.logout_confirm_msg')}
                confirmText={t('dashboard.sign_out')}
                type="logout"
            />
        </header>
    );
};

export default Header;
