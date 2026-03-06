import { useState, useEffect, useRef } from 'react';
import { Search, Bell, User, Settings, LogOut, Command, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

interface HeaderProps {
    globalSearchQuery: string;
    setGlobalSearchQuery: (query: string) => void;
}

const Header = ({ globalSearchQuery, setGlobalSearchQuery }: HeaderProps) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const notificationsDropdownRef = useRef<HTMLDivElement>(null);
    const profileDropdownRef = useRef<HTMLDivElement>(null);

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            const res = await fetch('http://localhost:8080/api/notifications', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
            }
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        }
    };

    useEffect(() => {
        if (user) {
            fetchNotifications();
            // Poll every 30 seconds
            const interval = setInterval(fetchNotifications, 30000);
            return () => clearInterval(interval);
        }
    }, [user]);

    const markAsRead = async (id: number) => {
        try {
            const token = localStorage.getItem('token');
            await fetch(`http://localhost:8080/api/notifications/${id}/read`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
        } catch (error) {
            console.error('Failed to mark as read', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const token = localStorage.getItem('token');
            await fetch(`http://localhost:8080/api/notifications/read-all`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
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

    const handleSignOut = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 flex items-center justify-between px-8 shrink-0 z-40 sticky top-0">
            {/* Search Bar - Command Palette Style */}
            <div className="relative group w-full max-w-md">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center space-x-2 text-slate-400 group-focus-within:text-primary-600 transition-colors pointer-events-none">
                    <Search size={18} strokeWidth={2.5} />
                </div>
                <input
                    ref={searchInputRef}
                    type="text"
                    value={globalSearchQuery}
                    onChange={(e) => setGlobalSearchQuery(e.target.value)}
                    placeholder="Search anything..."
                    className="w-full pl-12 pr-20 py-3 bg-slate-100/50 border border-transparent rounded-[20px] text-sm font-medium focus:bg-white focus:border-primary-500/30 focus:ring-4 focus:ring-primary-500/5 transition-all outline-none placeholder:text-slate-400 tracking-tight"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 items-center space-x-1 px-2 py-1 bg-white border border-slate-200 rounded-lg shadow-sm pointer-events-none hidden sm:flex">
                    <Command size={10} className="text-slate-400 font-bold" />
                    <span className="text-[10px] font-bold text-slate-500">K</span>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-4">
                <div className="relative" ref={notificationsDropdownRef}>
                    <button
                        onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                        className={`p-3 rounded-2xl transition-all duration-300 relative group ${isNotificationsOpen ? 'bg-primary-50 text-primary-600' : 'text-slate-500 hover:bg-slate-100'
                            }`}
                    >
                        <Bell size={20} />
                        {notifications.some(n => !n.isRead) && (
                            <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white animate-pulse"></span>
                        )}
                    </button>

                    {isNotificationsOpen && (
                        <div className="absolute right-0 mt-3 w-80 bg-white rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <h3 className="font-bold text-sm text-slate-900">Notifications</h3>
                                {notifications.some(n => !n.isRead) && (
                                    <span className="bg-primary-100 text-primary-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter">
                                        {notifications.filter(n => !n.isRead).length} New
                                    </span>
                                )}
                            </div>
                            <div className="p-2 max-h-80 overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="p-6 text-center text-slate-400 text-xs font-medium">No notifications yet.</div>
                                ) : (
                                    notifications.map(notification => (
                                        <div
                                            key={notification.id}
                                            onClick={() => !notification.isRead && markAsRead(notification.id)}
                                            className={`p-4 rounded-2xl transition-colors cursor-pointer group mb-1 ${notification.isRead ? 'hover:bg-slate-50 opacity-70' : 'bg-primary-50/50 hover:bg-primary-50'}`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <p className="text-xs font-bold text-slate-900 group-hover:text-primary-600 transition-colors">{notification.title}</p>
                                                {!notification.isRead && <span className="w-2 h-2 rounded-full bg-primary-500 mt-1 shrink-0"></span>}
                                            </div>
                                            <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{notification.message}</p>
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
                                    className="w-full py-4 text-[11px] font-bold text-primary-600 hover:bg-primary-50 transition-colors border-t border-slate-100 uppercase tracking-widest"
                                >
                                    Mark all as read
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Vertical Divider */}
                <div className="h-8 w-px bg-slate-200 hidden md:block"></div>

                {/* User Profile Dropdown */}
                <div className="relative" ref={profileDropdownRef}>
                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className={`flex items-center space-x-3 p-1.5 pr-4 rounded-[22px] transition-all duration-300 border ${isProfileOpen ? 'bg-white border-primary-200 shadow-lg shadow-primary-500/5 ring-4 ring-primary-500/5' : 'bg-slate-50/50 border-transparent hover:border-slate-200'
                            }`}
                    >
                        <div className="w-9 h-9 bg-linear-to-br from-primary-500 to-indigo-600 rounded-[16px] flex items-center justify-center text-white shadow-md shadow-primary-900/10">
                            <span className="font-bold text-xs uppercase">{(user?.fullName || user?.username || 'U').substring(0, 2)}</span>
                        </div>
                        <div className="hidden sm:block text-left">
                            <p className="text-[11px] font-bold text-slate-900 leading-none">{user?.fullName || user?.username || 'User'}</p>
                            <p className="text-[10px] font-bold text-primary-600/60 leading-none mt-1.5 uppercase tracking-widest">Verified Staff</p>
                        </div>
                        <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isProfileOpen && (
                        <div className="absolute right-0 mt-3 w-64 bg-white rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-200 py-3 animate-in fade-in slide-in-from-top-4 duration-300 overflow-hidden">
                            <div className="px-5 py-3 mb-2">
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-1.5">Account Info</p>
                                <p className="text-sm font-bold text-slate-900 truncate">{user?.fullName || user?.username}</p>
                            </div>
                            <div className="px-2 space-y-1">
                                <Link
                                    to="/profile"
                                    onClick={() => setIsProfileOpen(false)}
                                    className="flex items-center space-x-3 px-4 py-3 text-slate-600 hover:bg-primary-50 hover:text-primary-600 rounded-2xl transition-all font-bold text-xs group"
                                >
                                    <div className="p-1.5 bg-slate-100 rounded-xl group-hover:bg-primary-100 transition-colors">
                                        <User size={14} />
                                    </div>
                                    <span>My Profile</span>
                                </Link>
                                <Link
                                    to="/settings"
                                    onClick={() => setIsProfileOpen(false)}
                                    className="flex items-center space-x-3 px-4 py-3 text-slate-600 hover:bg-primary-50 hover:text-primary-600 rounded-2xl transition-all font-bold text-xs group"
                                >
                                    <div className="p-1.5 bg-slate-100 rounded-xl group-hover:bg-primary-100 transition-colors">
                                        <Settings size={14} />
                                    </div>
                                    <span>Settings</span>
                                </Link>
                            </div>
                            <div className="mt-3 pt-3 border-t border-slate-100 px-2">
                                <button
                                    onClick={handleSignOut}
                                    className="flex items-center space-x-3 px-4 py-3 w-full text-rose-500 hover:bg-rose-50 rounded-2xl transition-all font-bold text-xs group"
                                >
                                    <div className="p-1.5 bg-rose-50 rounded-xl group-hover:bg-rose-100 transition-colors">
                                        <LogOut size={14} />
                                    </div>
                                    <span>Sign Out</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
