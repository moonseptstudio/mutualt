import { Outlet, Link } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const WebLayout = () => {
    return (
        <div className="flex flex-col min-h-screen">
            <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center space-x-2">
                        <div className="bg-blue-600 p-1.5 rounded-lg">
                            <RefreshCw className="text-white w-5 h-5" />
                        </div>
                        <span className="text-xl font-bold bg-linear-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent">
                            MutualTransfer.lk
                        </span>
                    </Link>
                    <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-600">
                        <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
                        <Link to="/about" className="hover:text-blue-600 transition-colors">About Us</Link>
                        <Link to="/pricing" className="hover:text-blue-600 transition-colors">Packages</Link>
                    </nav>
                    <div className="flex items-center space-x-3">
                        <Link to="/login" className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors">
                            Login
                        </Link>
                        <Link to="/register" className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200">
                            Register
                        </Link>
                    </div>
                </div>
            </header>
            <main className="grow">
                <Outlet />
            </main>
            <footer className="bg-slate-900 text-slate-300 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <div className="flex items-center space-x-2 mb-4">
                            <RefreshCw className="text-blue-400 w-5 h-5" />
                            <span className="text-lg font-bold text-white">MutualTransfer.lk</span>
                        </div>
                        <p className="text-sm leading-relaxed text-slate-400">
                            Empowering government employees in Sri Lanka to find mutual transfers securely and efficiently.
                        </p>
                    </div>
                    <div>
                        <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Quick Links</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/" className="hover:text-blue-400">Home</Link></li>
                            <li><Link to="/about" className="hover:text-blue-400">About Us</Link></li>
                            <li><Link to="/pricing" className="hover:text-blue-400">Packages</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Legal</h4>
                        <ul className="space-y-2 text-sm">
                            <li><button onClick={() => toast('Privacy Policy will be updated soon', { icon: '📄' })} className="hover:text-blue-400 cursor-pointer">Privacy Policy</button></li>
                            <li><button onClick={() => toast('Terms of Service will be updated soon', { icon: '⚖️' })} className="hover:text-blue-400 cursor-pointer">Terms of Service</button></li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
                    &copy; {new Date().getFullYear()} MutualTransfer.lk. All rights reserved. Made for Sri Lanka.
                </div>
            </footer>
        </div>
    );
};

export default WebLayout;
