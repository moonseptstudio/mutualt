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
    Settings
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

    const handleSignOut = () => {
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
                        onClick={handleSignOut}
                        className="flex items-center space-x-3 px-4 py-4 w-full text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-2xl transition-all duration-300 font-medium text-[11px] uppercase tracking-wider group"
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
        </div>
    );
};

export default ClientLayout;
