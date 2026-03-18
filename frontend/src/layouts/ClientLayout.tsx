import Header from '../components/common/Header';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import apiClient from '../api/client';
import {
    MapPin,
    UserCircle,
    LogOut,
    Settings,
    Inbox,
    MessageSquare,
    Zap,
    Lock,
    Activity,
    Search,
    X as CloseIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import logoImg from '../assets/logos/logo.jpg';
import NotificationListener from '../components/common/NotificationListener';

const SidebarItem = ({ icon: Icon, label, to, active, badgeCount, locked, onClick }: any) => (
    <Link
        to={locked ? '#' : to}
        className={`flex items-center justify-between p-3 rounded-2xl transition-all duration-300 relative group overflow-hidden ${active
            ? 'bg-slate-900 text-white dark:bg-primary-600 shadow-xl shadow-slate-900/10 dark:shadow-primary-900/20'
            : locked
                ? 'text-slate-400 cursor-not-allowed opacity-60'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
            }`}
        onClick={(e) => {
            if (locked) {
                e.preventDefault();
                // We'll pass t() to toast in the component or use it here if we refactor SidebarItem to be inside ClientLayout
                // For now, I'll pass it as a prop or just use a generic message if it's too much.
                // Actually, I'll just refactor SidebarItem to use useTranslation internally if possible, 
                // but it's outside. I'll just pass 't' as a prop.
            } else if (onClick) {
                onClick();
            }
        }}
    >
        <div className={`absolute inset-0 bg-linear-to-r from-primary-500/10 to-transparent -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ${active || locked ? 'hidden' : ''}`} />
        <div className="flex items-center space-x-3 relative z-10">
            <Icon size={20} className={active ? 'text-primary-400' : ''} />
            <span className="font-semibold text-sm">{label}</span>
        </div>
        <div className="flex items-center space-x-2">
            {locked && <Lock size={14} className="text-slate-400" />}
            {badgeCount > 0 && !locked && (
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-lg relative z-10 ${active ? 'bg-primary-500 text-white' : 'bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400'}`}>
                    {badgeCount > 99 ? '99+' : badgeCount}
                </span>
            )}
        </div>
    </Link>
);

const ClientLayout = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [globalSearchQuery, setGlobalSearchQuery] = useState('');
    const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    // Restore preferred theme for dashboard
    useEffect(() => {
        const root = window.document.documentElement;
        const savedTheme = localStorage.getItem('theme') || 'light';
        root.classList.remove('light', 'dark');
        root.classList.add(savedTheme);
    }, []);
    
    // Notification states
    const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
    const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
    
    const hasPackage = user?.packageName === 'PREMIUM';

    // Fetch counts
    useEffect(() => {

        const fetchCounts = async () => {
            try {
                const roomsRes = await apiClient.get('/messages/rooms');
                const unreadMsgs = roomsRes.data.reduce((acc: number, room: any) => acc + (room.unreadCount || 0), 0);
                setUnreadMessagesCount(unreadMsgs);

                const reqsRes = await apiClient.get('/requests/me');
                const pendingReqs = reqsRes.data.incoming?.filter((req: any) => req.status === 'PENDING').length || 0;
                setPendingRequestsCount(pendingReqs);
            } catch (err) {
                console.error("Failed to fetch notification counts", err);
            }
        };

        fetchCounts(); // Initial fetch
        
        // Poll every 30 seconds
        const interval = setInterval(fetchCounts, 30000);
        return () => clearInterval(interval);
    }, []);

    const confirmSignOut = () => {
        setIsSignOutModalOpen(true);
    };

    const executeSignOut = () => {
        logout();
        navigate('/login');
    };

    // Route Protection Logic
    useEffect(() => {
        if (hasPackage === false) {
            const allowedPaths = ['/preferences', '/pricing', '/dashboard', '/matches', '/profile', '/settings'];
            const isAllowed = allowedPaths.some(path => location.pathname === path || location.pathname.startsWith(path + '/'));
            if (!isAllowed) {
                toast.error(t('dashboard.package_required'));
                navigate('/preferences');
            }
        }
    }, [location.pathname, hasPackage, navigate]);

    return (
        <div className="flex h-screen bg-[var(--bg-main)] overflow-hidden font-sans selection:bg-primary-500/30">
            <NotificationListener />
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-300"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar (Desktop & Mobile Drawer) */}
            <aside className={`fixed inset-y-0 left-0 w-72 bg-[var(--bg-card)] dark:bg-[var(--bg-card)]/80 dark:backdrop-blur-xl border-r border-[var(--border-main)] flex flex-col z-50 shadow-2xl transition-transform duration-300 lg:static lg:translate-x-0 lg:shadow-none ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-8 flex items-center justify-between">
                    <Link to="/" className="flex items-center space-x-3 group" onClick={() => setIsSidebarOpen(false)}>
                        <img src={logoImg} alt="Mutual Transfer Logo" className="w-10 h-10 rounded-[14px] object-cover shadow-lg shadow-primary-900/20 group-hover:scale-110 transition-transform duration-500" />
                        <div className="flex flex-col">
                            <span className="text-lg font-medium bg-linear-to-r from-primary-700 to-primary-500 bg-clip-text text-transparent tracking-tighter leading-none uppercase">
                                Mutual Transfer
                            </span>
                            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mt-1">{t('dashboard.user_dashboard')}</span>
                        </div>
                    </Link>
                    <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-slate-400 hover:text-[var(--text-main)] hover:bg-[var(--bg-main)] rounded-xl transition-all border border-transparent hover:border-[var(--border-main)]">
                        <CloseIcon size={20} />
                    </button>
                </div>

                <nav className="grow px-6 space-y-1.5 mt-4 overflow-y-auto custom-scrollbar">
                    <SidebarItem icon={Activity} label={t('dashboard.nav_dashboard')} to="/dashboard" active={location.pathname === '/dashboard'} onClick={() => setIsSidebarOpen(false)} />
                    <SidebarItem icon={MapPin} label={t('dashboard.nav_preferences')} to="/preferences" active={location.pathname === '/preferences'} onClick={() => setIsSidebarOpen(false)} />
                    <SidebarItem icon={Search} label={t('dashboard.nav_matches')} to="/matches" active={location.pathname === '/matches'} onClick={() => setIsSidebarOpen(false)} />
                    <SidebarItem icon={Inbox} label={t('dashboard.nav_requests')} to="/requests" active={location.pathname.startsWith('/requests')} badgeCount={pendingRequestsCount} locked={hasPackage === false} onClick={() => { setIsSidebarOpen(false); if(hasPackage === false) toast.error(t('dashboard.package_required')); }} />
                    <SidebarItem icon={MessageSquare} label={t('dashboard.nav_messages')} to="/messages" active={location.pathname.startsWith('/messages')} badgeCount={unreadMessagesCount} locked={hasPackage === false} onClick={() => { setIsSidebarOpen(false); if(hasPackage === false) toast.error(t('dashboard.package_required')); }} />
                    <div className="h-px bg-slate-50 dark:bg-slate-800 my-6 mx-4"></div>
                    <SidebarItem
                        icon={UserCircle}
                        label={t('dashboard.nav_profile')}
                        to="/profile"
                        active={location.pathname === '/profile'}
                        onClick={() => setIsSidebarOpen(false)}
                    />
                    <SidebarItem
                        icon={Settings}
                        label={t('dashboard.nav_settings')}
                        to="/settings"
                        active={location.pathname === '/settings'}
                        onClick={() => setIsSidebarOpen(false)}
                    />
                </nav>

                <div className="p-6">
                    <button
                        onClick={confirmSignOut}
                        className="flex items-center space-x-3 px-4 py-4 w-full text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-900/10 hover:text-rose-600 dark:hover:text-rose-400 rounded-2xl transition-all duration-300 font-medium text-[11px] uppercase tracking-wider group cursor-pointer"
                    >
                        <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                        <span>{t('dashboard.sign_out')}</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="grow flex flex-col min-w-0 overflow-hidden relative">
                <Header 
                    hasPackage={!!hasPackage} 
                    toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                />

                {/* Page Content */}
                <main className="grow overflow-auto p-3 sm:p-6 md:p-10 relative bg-[var(--bg-main)] pb-20 lg:pb-10">
                    {hasPackage === false && location.pathname !== '/pricing' && (
                        <div className="max-w-6xl mx-auto mb-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 px-4 sm:px-6 py-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                            <div className="flex items-center space-x-3 text-center sm:text-left">
                                <span className="p-1.5 bg-amber-100 dark:bg-amber-900/40 rounded-lg shrink-0"><Zap size={16} className="text-amber-600" /></span>
                                <p className="text-xs sm:text-sm font-semibold">{t('dashboard.unlock_full_access')}</p>
                            </div>
                            <Link to="/pricing" className="text-[10px] sm:text-xs font-bold uppercase tracking-widest bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl transition-colors whitespace-nowrap">{t('dashboard.view_packages')}</Link>
                        </div>
                    )}
                    <div className="max-w-6xl mx-auto">
                        <Outlet context={{ globalSearchQuery, setGlobalSearchQuery, hasPackage }} />
                    </div>
                </main>
            </div>

            {/* Sign Out Confirmation Modal */}
            {isSignOutModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
                    <div className="absolute inset-0 bg-slate-900/60 transition-opacity" onClick={() => setIsSignOutModalOpen(false)}></div>
                    <div className="relative w-full max-w-sm bg-[var(--bg-card)] rounded-3xl shadow-2xl p-6 sm:p-8 border border-[var(--border-main)] animate-in zoom-in-95 duration-300">
                    <div className="mx-auto w-16 h-16 bg-rose-50 dark:bg-rose-900/30 rounded-full flex items-center justify-center mb-6">
                        <LogOut className="text-rose-500 dark:text-rose-400" size={32} />
                    </div>
                        <h3 className="text-xl font-bold text-center text-[var(--text-main)] mb-2">{t('dashboard.logout_confirm_title')}</h3>
                        <p className="text-[var(--text-muted)] text-center text-sm mb-8">
                            {t('dashboard.logout_confirm_msg')}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={() => setIsSignOutModalOpen(false)}
                                className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-sm transition-all cursor-pointer"
                            >
                                {t('common.cancel')}
                            </button>
                            <button
                                onClick={executeSignOut}
                                className="flex-1 px-4 py-3 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-xl text-sm transition-all shadow-sm hover:shadow-rose-500/20 cursor-pointer"
                            >
                                {t('dashboard.sign_out')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClientLayout;
