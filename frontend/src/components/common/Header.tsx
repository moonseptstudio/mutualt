import { useState, useEffect, useRef } from 'react';
import { Bell, User, Settings, LogOut, ChevronDown, Menu, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';

import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../../api/client';
import ConfirmationModal from './ConfirmationModal';
import LanguageSwitcher from '../LanguageSwitcher';
import logoImg from '../../assets/logos/logo.jpg';

interface HeaderProps {
    toggleSidebar: () => void;
    hasPackage?: boolean;
}

const Header = ({ toggleSidebar }: HeaderProps) => {
    const { t } = useTranslation();
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);
    const [profile, setProfile] = useState<any>(null);
    const [notifications, setNotifications] = useState<any[]>([]);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const notificationsDropdownRef = useRef<HTMLDivElement>(null);
    const profileDropdownRef = useRef<HTMLDivElement>(null);

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
            return () => clearInterval(interval);
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
        return `http://localhost:8080${url}`;
    };

    const executeSignOut = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="h-16 sm:h-20 glass-panel-strong border-b border-(--border-main) flex items-center justify-between px-4 sm:px-8 shrink-0 z-40 sticky top-0 transition-all">
            <div className="flex items-center space-x-2 sm:space-x-4 grow max-w-2xl">
                <button 
                    onClick={toggleSidebar}
                    className="lg:hidden p-2 text-slate-500 hover:text-(--text-main) hover:bg-(--bg-main) rounded-xl transition-all border border-transparent hover:border-(--border-main)"
                >
                    <Menu size={20} />
                </button>

                {/* Mobile Logo */}
                <Link to="/" className="lg:hidden flex items-center space-x-2">
                    <img src={logoImg} alt="Mutual Transfer Logo" className="w-8 h-8 rounded-xl object-cover shadow-sm" />
                    <span className="text-[17px] font-bold bg-linear-to-r from-primary-700 to-primary-500 bg-clip-text text-transparent tracking-tighter leading-none uppercase pt-1">
                        Mutual Transfer
                    </span>
                </Link>

                
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2 sm:space-x-4">
                <div className="relative" ref={notificationsDropdownRef}>
                    <button
                        onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                        className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl transition-all duration-300 relative group ${isNotificationsOpen ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                    >
                        <Bell size={20} />
                        {notifications.some(n => !n.isRead) && (
                            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white animate-pulse"></span>
                        )}
                    </button>

                    {isNotificationsOpen && (
                        <div className="absolute -right-16 sm:right-0 mt-3 w-72 sm:w-80 bg-(--bg-card) rounded-2xl sm:rounded-3xl shadow-2xl border border-(--border-main) overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
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
                                    className="w-full py-4 text-[11px] font-bold text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors border-t border-(--border-main) uppercase tracking-widest"
                                >
                                    {t('dashboard.mark_all_read')}
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Language Switcher */}
                <div className="hidden sm:block">
                    <LanguageSwitcher />
                </div>

                {/* Vertical Divider */}
                <div className="h-8 w-px bg-(--border-main) hidden lg:block"></div>

                {/* Theme Toggle Shortcut Haus */}
                <button
                    onClick={toggleTheme}
                    className="hidden sm:flex p-2 sm:p-3 rounded-xl sm:rounded-2xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300 group"
                    title={theme === 'dark' ? t('dashboard.switch_light') : t('dashboard.switch_dark')}
                >
                    {theme === 'dark' ? (
                        <Sun size={20} className="text-amber-400 group-hover:rotate-45 transition-transform duration-500" />
                    ) : (
                        <Moon size={20} className="text-slate-600 group-hover:-rotate-12 transition-transform duration-500" />
                    )}
                </button>

                {/* User Profile Dropdown */}
                <div className="relative" ref={profileDropdownRef}>
                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className={`flex items-center space-x-2 sm:space-x-3 p-1 sm:p-1.5 pr-2 sm:pr-4 rounded-[18px] sm:rounded-[22px] transition-all duration-300 border ${isProfileOpen ? 'bg-(--bg-main) border-primary-200 dark:border-primary-800 shadow-lg ring-4 ring-primary-500/5' : 'bg-(--bg-main) dark:bg-(--bg-main)/50 border-transparent hover:border-(--border-main)'
                            }`}
                    >
                        <div className="w-8 h-8 sm:w-9 sm:h-9 bg-linear-to-br from-primary-500 to-indigo-600 rounded-lg sm:rounded-[14px] overflow-hidden flex items-center justify-center text-white shadow-md shadow-primary-900/10 border-2 border-(--bg-main)">
                            <img
                                src={getAvatarUrl(profile?.profileImageUrl || user?.profileImageUrl, user?.fullName || user?.username || 'User')}
                                alt="profile"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="hidden sm:block text-left">
                            <p className="text-[11px] font-bold text-(--text-main) leading-none">{profile?.fullName || user?.fullName || user?.username || 'User'}</p>
                            <p className="text-[10px] font-bold text-primary-600/60 dark:text-primary-400/60 leading-none mt-1.5 uppercase tracking-widest">{t('dashboard.verified_staff')}</p>
                        </div>
                        <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isProfileOpen && (
                        <div className="absolute right-0 mt-3 w-64 bg-(--bg-card) dark:bg-slate-900 rounded-3xl shadow-2xl border border-(--border-main) py-3 animate-in fade-in slide-in-from-top-4 duration-300">
                            <div className="px-5 py-3 mb-2">
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-1.5">{t('dashboard.account_info')}</p>
                                <p className="text-sm font-bold text-(--text-main) truncate">{profile?.fullName || user?.fullName || user?.username}</p>
                            </div>
                            
                            <div className="sm:hidden px-4 py-2 flex items-center justify-between border-y border-(--border-main) mb-2 bg-slate-50 dark:bg-slate-800">
                                <button
                                    onClick={toggleTheme}
                                    className="p-2 rounded-xl text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-300 border border-(--border-main)"
                                >
                                    {theme === 'dark' ? (
                                        <Sun size={18} className="text-amber-400" />
                                    ) : (
                                        <Moon size={18} className="text-slate-600" />
                                    )}
                                </button>
                                <LanguageSwitcher />
                            </div>

                            <div className="px-2 space-y-1">
                                <Link
                                    to="/profile"
                                    onClick={() => setIsProfileOpen(false)}
                                    className="flex items-center space-x-3 px-4 py-3 text-slate-600 dark:text-slate-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 rounded-2xl transition-all font-bold text-xs group"
                                >
                                    <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl group-hover:bg-primary-100 dark:group-hover:bg-primary-900/40 transition-colors">
                                        <User size={14} />
                                    </div>
                                    <span>{t('dashboard.nav_profile')}</span>
                                </Link>
                                <Link
                                    to="/settings"
                                    onClick={() => setIsProfileOpen(false)}
                                    className="flex items-center space-x-3 px-4 py-3 text-slate-600 dark:text-slate-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 rounded-2xl transition-all font-bold text-xs group"
                                >
                                    <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl group-hover:bg-primary-100 dark:group-hover:bg-primary-900/40 transition-colors">
                                        <Settings size={14} />
                                    </div>
                                    <span>{t('dashboard.nav_settings')}</span>
                                </Link>
                            </div>
                            <div className="mt-3 pt-3 border-t border-(--border-main) px-2">
                                <button
                                    onClick={confirmSignOut}
                                    className="flex items-center space-x-3 px-4 py-3 w-full text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-2xl transition-all font-bold text-xs group"
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
