import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
    ShieldCheck,
    Users,
    Hospital,
    BarChart3,
    LogOut,
    RefreshCw,
    Settings,
    Bell,
    AlertTriangle,
    Layers
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SidebarItem = ({ icon: Icon, label, to, active }: any) => (
    <Link
        to={to}
        className={`flex items-center space-x-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative ${active
            ? 'bg-slate-950 text-white shadow-2xl shadow-slate-950/20'
            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-950'
            }`}
    >
        <Icon size={18} strokeWidth={2.5} className={active ? 'text-white' : 'text-slate-400 group-hover:text-slate-950 transition-colors'} />
        <span className="font-medium text-[12px] uppercase tracking-wider">{label}</span>
        {active && (
            <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-primary-500 shadow-[0_0_10px_rgba(14,165,233,0.8)]"></div>
        )}
    </Link>
);

const AdminLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);

    const confirmSignOut = () => {
        setIsSignOutModalOpen(true);
    };

    const executeSignOut = () => {
        logout();
        navigate('/admin/login');
    };

    return (
        <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans selection:bg-primary-500/30">
            {/* Sidebar */}
            <aside className="w-72 bg-white border-r border-slate-100 flex flex-col z-30 shadow-[4px_0_24px_rgba(0,0,0,0.02)] translate-x-0 transition-transform lg:translate-x-0 duration-500">
                <div className="p-8">
                    <Link to="/" className="flex items-center space-x-3 group">
                        <div className="bg-slate-950 p-2.5 rounded-[14px] shadow-lg shadow-slate-900/20 group-hover:scale-110 transition-transform duration-500">
                            <ShieldCheck className="text-white w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-lg font-semibold text-slate-950 tracking-tighter leading-none">
                                MUTUAL<span className="text-primary-600">T</span>
                            </span>
                            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider mt-1">Admin Portal</span>
                        </div>
                    </Link>
                </div>

                <nav className="grow px-6 space-y-1.5 mt-4">
                    <SidebarItem
                        icon={BarChart3}
                        label="Overview"
                        to="/admin"
                        active={location.pathname === '/admin'}
                    />
                    <SidebarItem
                        icon={Users}
                        label="Users"
                        to="/admin/users"
                        active={location.pathname === '/admin/users'}
                    />
                    <SidebarItem
                        icon={Layers}
                        label="Fields"
                        to="/admin/fields"
                        active={location.pathname === '/admin/fields'}
                    />
                    <SidebarItem
                        icon={ShieldCheck}
                        label="Categories"
                        to="/admin/categories"
                        active={location.pathname === '/admin/categories'}
                    />
                    <SidebarItem
                        icon={Hospital}
                        label="Stations"
                        to="/admin/stations"
                        active={location.pathname === '/admin/stations'}
                    />
                </nav>

                <div className="p-6">
                    <button
                        onClick={confirmSignOut}
                        className="flex items-center space-x-3 px-4 py-4 w-full text-slate-500 hover:bg-rose-50 hover:text-rose-600 rounded-2xl transition-all duration-300 font-medium text-[11px] uppercase tracking-wider group cursor-pointer"
                    >
                        <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="grow flex flex-col min-w-0 overflow-hidden relative">
                {/* Header */}
                <header className="h-20 bg-white/70 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-10 shrink-0 z-20">
                    <div className="flex items-center space-x-3">
                        <div className="h-10 w-1 bg-slate-100 rounded-full mr-4 hidden md:block"></div>
                        <div>
                            <div className="flex items-center space-x-2 text-xs font-medium text-slate-400 uppercase tracking-wider">
                                <span>Platform</span>
                                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                <span>{location.pathname.split('/')[1] || 'Core'}</span>
                            </div>
                            <h2 className="text-sm font-semibold text-slate-900 tracking-tight mt-0.5 capitalize">
                                {location.pathname.split('/').pop()?.replace(/-/g, ' ') || 'Dashboard'}
                            </h2>
                        </div>
                    </div>

                    <div className="flex items-center space-x-6">
                        <button className="relative p-2.5 text-slate-400 hover:bg-slate-50 hover:text-slate-950 rounded-2xl transition-all group">
                            <Bell size={20} />
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary-500 rounded-full border-2 border-white animate-slow-ping"></span>
                        </button>

                        <div className="flex items-center space-x-4 cursor-pointer group bg-slate-50 hover:bg-slate-100 p-1.5 pr-4 rounded-2xl transition-all">
                            <div className="w-9 h-9 bg-slate-950 rounded-[12px] flex items-center justify-center text-white shadow-lg shadow-slate-900/10 font-medium text-xs uppercase">
                                {user?.username?.substring(0, 2) || 'AD'}
                            </div>
                            <div className="hidden sm:block">
                                <p className="text-[11px] font-semibold text-slate-900 leading-none">{user?.username || 'Administrator'}</p>
                                <p className="text-[11px] font-medium text-primary-600 leading-none mt-1.5 uppercase tracking-wider">Root Access</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="grow overflow-auto p-10 relative">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
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
                            Are you sure you want to sign out of the Admin portal? You will need to log in again.
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

export default AdminLayout;
