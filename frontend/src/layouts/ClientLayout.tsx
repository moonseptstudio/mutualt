import { Outlet, Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    MapPin,
    Users,
    UserCircle,
    LogOut,
    RefreshCw,
    Bell,
    Search,
    Settings
} from 'lucide-react';

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
                    <button className="flex items-center space-x-3 px-4 py-4 w-full text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-2xl transition-all duration-300 font-medium text-[11px] uppercase tracking-wider group">
                        <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="grow flex flex-col min-w-0 overflow-hidden relative">
                {/* Header */}
                <header className="h-20 bg-white/70 backdrop-blur-md border-b border-slate-50 flex items-center justify-between px-10 shrink-0 z-20">
                    <div className="relative w-64 lg:w-96 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary-500 transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder="Find stations, matches..."
                            className="w-full pl-12 pr-4 py-3 bg-slate-50/50 border border-transparent rounded-[16px] text-xs font-bold focus:bg-white focus:border-slate-100 focus:shadow-sm transition-all outline-none placeholder:text-slate-400"
                        />
                    </div>

                    <div className="flex items-center space-x-6">
                        <button className="relative p-2.5 text-slate-400 hover:bg-slate-50 rounded-2xl transition-all group">
                            <Bell size={20} />
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
                        </button>

                        <div className="h-10 w-px bg-slate-100 mx-2 hidden md:block"></div>

                        <div className="flex items-center space-x-4 cursor-pointer group hover:bg-slate-50 p-1.5 pr-4 rounded-2xl transition-all">
                            <div className="w-9 h-9 bg-primary-100 rounded-[12px] flex items-center justify-center text-primary-600 shadow-sm border border-primary-200">
                                <span className="font-medium text-xs uppercase">KP</span>
                            </div>
                            <div className="hidden sm:block">
                                <p className="text-[11px] font-semibold text-slate-900 leading-none">Kamal Perera</p>
                                <p className="text-[11px] font-medium text-primary-600/60 leading-none mt-1.5 uppercase tracking-wider">Premium Member</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="grow overflow-auto p-10 relative">
                    <div className="max-w-6xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ClientLayout;
