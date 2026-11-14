import Header from '../components/common/Header';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
    MapPin,
    Inbox,
    MessageSquare,
    Lock,
    Activity,
    Search
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { RealtimeProvider } from '../context/RealtimeContext';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';

const ClientLayout = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [globalSearchQuery, setGlobalSearchQuery] = useState('');
    
    // Restore preferred theme for dashboard
    useEffect(() => {
        const root = window.document.documentElement;
        const savedTheme = localStorage.getItem('theme') || 'light';
        root.classList.remove('light', 'dark');
        root.classList.add(savedTheme);
    }, []);
    
    const hasPackage = user?.packageName === 'PREMIUM';

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

    const mobileNavItems = [
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

    return (
        <RealtimeProvider>
        <div className="flex flex-col h-screen bg-[var(--bg-main)] overflow-hidden font-sans selection:bg-primary-500/30">
            <SEO
                title="My Dashboard"
                description="Your private MutualTransfer.lk dashboard."
                noindex
            />
            <Header hasPackage={!!hasPackage} />

            {/* Main Content Area */}
            <main className="grow overflow-auto p-4 sm:p-6 md:p-8 lg:p-10 relative bg-[var(--bg-main)] pb-24 lg:pb-12">
                {hasPackage === false && location.pathname !== '/pricing' && (
                    <div className="max-w-7xl mx-auto mb-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 px-4 sm:px-6 py-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                        <div className="text-center sm:text-left">
                            <p className="text-xs sm:text-sm font-semibold">{t('dashboard.unlock_full_access')}</p>
                        </div>
                        <Link 
                            to="/pricing" 
                            className="inline-flex items-center justify-center text-[10px] sm:text-xs font-bold uppercase tracking-widest bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 sm:py-3 rounded-xl transition-all shadow-sm hover:shadow whitespace-nowrap"
                        >
                            {t('dashboard.view_packages')}
                        </Link>
                    </div>
                )}
                <div className="max-w-7xl mx-auto w-full">
                    <Outlet context={{ globalSearchQuery, setGlobalSearchQuery, hasPackage }} />
                </div>
            </main>

            {/* Mobile Bottom Navigation Footer with Top Spotlight Effect */}
            <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-(--bg-card)/95 dark:bg-(--bg-card)/90 backdrop-blur-xl border-t border-(--border-main) px-2 py-1 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.3)]">
                <div className="flex items-center justify-around max-w-lg mx-auto">
                    {mobileNavItems.map((item) => {
                        const Icon = item.icon;
                        const active = item.isActive;
                        return (
                            <Link
                                key={item.key}
                                to={item.locked ? '#' : item.to}
                                onClick={(e) => {
                                    if (item.locked) {
                                        e.preventDefault();
                                        toast.error(t('dashboard.package_required'));
                                    }
                                }}
                                className="relative flex flex-col items-center justify-center flex-1 pt-2.5 pb-1.5 px-1 min-w-0 transition-all select-none cursor-pointer rounded-2xl overflow-hidden"
                            >
                                {/* Active Top Spotlight Effect */}
                                {active && (
                                    <motion.div
                                        layoutId="mobileNavSpotlight"
                                        className="absolute inset-0 pointer-events-none overflow-hidden"
                                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                    >
                                        {/* Spotlight Emitter Lamp Bar at Top Edge */}
                                        <div className="absolute top-0 inset-x-0 flex justify-center">
                                            <div className="w-10 sm:w-12 h-[3px] bg-primary-500 dark:bg-primary-400 rounded-b-full shadow-[0_1px_8px_rgba(59,130,246,0.9),0_0_16px_rgba(59,130,246,0.6)]" />
                                        </div>

                                        {/* Downward Spreading Spotlight Light Cone */}
                                        <div
                                            className="absolute top-0 inset-x-0 h-full pointer-events-none"
                                            style={{
                                                background: 'radial-gradient(ellipse 70% 85% at 50% 0%, rgba(59, 130, 246, 0.22) 0%, rgba(59, 130, 246, 0.06) 45%, transparent 75%)'
                                            }}
                                        />

                                        {/* Ambient Soft Top Bulb Glow */}
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-14 h-6 bg-primary-500/25 dark:bg-primary-400/30 rounded-full blur-md" />
                                    </motion.div>
                                )}

                                {/* Animated Icon with Tap Scale */}
                                <motion.div
                                    whileTap={{ scale: 0.85 }}
                                    animate={active ? { scale: [1, 1.15, 1.05] } : { scale: 1 }}
                                    transition={{ duration: 0.25 }}
                                    className="relative p-1 z-10"
                                >
                                    <Icon
                                        size={20}
                                        className={`transition-colors duration-200 ${
                                            active
                                                ? 'text-primary-600 dark:text-primary-400 stroke-[2.4] drop-shadow-[0_2px_8px_rgba(59,130,246,0.35)]'
                                                : item.locked
                                                    ? 'text-slate-300 dark:text-slate-600'
                                                    : 'text-slate-400 dark:text-slate-500'
                                        }`}
                                    />

                                    {/* Lock Badge */}
                                    {item.locked && (
                                        <span className="absolute -top-0.5 -right-1 bg-(--bg-card) rounded-full p-0.5 text-slate-400">
                                            <Lock size={10} />
                                        </span>
                                    )}
                                </motion.div>

                                {/* Label */}
                                <span
                                    className={`text-[10px] font-semibold tracking-tight truncate max-w-full z-10 transition-colors duration-200 ${
                                        active
                                            ? 'text-primary-600 dark:text-primary-400 font-bold'
                                            : 'text-slate-400 dark:text-slate-500'
                                    }`}
                                >
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </div>
        </RealtimeProvider>
    );
};

export default ClientLayout;
