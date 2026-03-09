import Header from '../components/common/Header';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
    LayoutDashboard,
    MapPin,
    Users,
    UserCircle,
    LogOut,
    RefreshCw,
    Settings,
    Inbox,
    MessageSquare
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SidebarItem = ({ icon: Icon, label, to, active }: any) => (
    <Link
        to={to}
        className={`flex items-center space-x-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${active
            ? 'bg-primary-600 text-white shadow-xl shadow-primary-200'
            : 'text-slate-500 hover:bg-primary-50 hover:text-primary-700'
            }`}
    >
        <Icon size={18} strokeWidth={2.5} className={active ? 'text-white' : 'text-slate-400 group-hover:text-primary-600 transition-colors'} />
        <span className="font-medium text-[12px] uppercase tracking-wider">{label}</span>
    </Link>
);

const ClientLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [globalSearchQuery, setGlobalSearchQuery] = useState('');
    const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);

    const confirmSignOut = () => {
        setIsSignOutModalOpen(true);
    };

    const executeSignOut = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="flex h-screen bg-[#FDFEFF] overflow-hidden font-sans selection:bg-primary-500/30">
            {/* Sidebar */}
            <aside className="w-72 bg-white border-r border-slate-100 flex flex-col z-30 shadow-[4px_0_24px_rgba(0,0,0,0.01)] transition-transform duration-500">
                <div className="p-8">
                    <Link to="/" className="flex items-center space-x-3 group">
                        <div className="bg-primary-600 p-2.5 rounded-[14px] shadow-lg shadow-primary-900/20 group-hover:scale-110 transition-transform duration-500">
                            <RefreshCw className="text-white w-5 h-5 animate-spin-slow" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-lg font-medium bg-linear-to-r from-primary-700 to-primary-500 bg-clip-text text-transparent tracking-tighter leading-none uppercase">
                                MutualT
                            </span>
                            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mt-1">User Dashboard</span>
                        </div>
                    </Link>
                </div>

                <nav className="grow px-6 space-y-1.5 mt-4">
                    <SidebarItem
                        icon={LayoutDashboard}
                        label="Dashboard"
                        to="/dashboard"
                        active={location.pathname === '/dashboard'}
                    />
                    <SidebarItem
                        icon={MapPin}
                        label="Preferences"
                        to="/preferences"
                        active={location.pathname === '/preferences'}
                    />
                    <SidebarItem
                        icon={Users}
                        label="Matches"
                        to="/matches"
                        active={location.pathname === '/matches'}
                    />
                    <SidebarItem
                        icon={Inbox}
                        label="Requests"
                        to="/requests"
                        active={location.pathname === '/requests'}
                    />
                    <SidebarItem
                        icon={MessageSquare}
                        label="Messages"
                        to="/messages"
                        active={location.pathname === '/messages'}
                    />
                    <div className="h-px bg-slate-50 my-6 mx-4"></div>
                    <SidebarItem
                        icon={UserCircle}
                        label="My Profile"
                        to="/profile"
                        active={location.pathname === '/profile'}
                    />
                    <SidebarItem
                        icon={Settings}
                        label="Settings"
                        to="/settings"
                        active={location.pathname === '/settings'}
                    />
                </nav>

                <div className="p-6">
                    <button
                        onClick={confirmSignOut}
                        className="flex items-center space-x-3 px-4 py-4 w-full text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-2xl transition-all duration-300 font-medium text-[11px] uppercase tracking-wider group cursor-pointer"
                    >
                        <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="grow flex flex-col min-w-0 overflow-hidden relative">
                <Header globalSearchQuery={globalSearchQuery} setGlobalSearchQuery={setGlobalSearchQuery} />

                {/* Page Content */}
                <main className="grow overflow-auto p-10 relative bg-slate-50/20">
                    <div className="max-w-6xl mx-auto">
                        <Outlet context={{ globalSearchQuery, setGlobalSearchQuery }} />
                    </div>
                </main>
            </div>

            {/* Sign Out Confirmation Modal */}
            {isSignOutModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsSignOutModalOpen(false)}></div>
                    <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-slate-100 animate-in zoom-in-95 duration-300">
                        <div className="mx-auto w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mb-6">
                            <LogOut className="text-rose-500" size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-center text-slate-900 mb-2">Sign Out?</h3>
                        <p className="text-slate-500 text-center text-sm mb-8">
                            Are you sure you want to sign out of your account? You will need to log in again to access your dashboard.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={() => setIsSignOutModalOpen(false)}
                                className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition-all cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={executeSignOut}
                                className="flex-1 px-4 py-3 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-xl text-sm transition-all shadow-sm hover:shadow-rose-500/20 cursor-pointer"
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClientLayout;
