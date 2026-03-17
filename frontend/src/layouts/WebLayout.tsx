import { Outlet, Link, useLocation } from 'react-router-dom';
import { RefreshCw, Menu, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

const WebLayout = () => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenu, setMobileMenu] = useState(false);
    const location = useLocation();

    useEffect(() => {
        // Force light mode for web pages
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
        
        // Initialize Lenis for smooth scrolling on the window
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 1,
            touchMultiplier: 2,
            infinite: false,
        });

        function raf(time: number) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);

        // Sync scroller for header
        lenis.on('scroll', (e: any) => {
            setScrolled(e.scroll > 20);
        });

        return () => {
            lenis.destroy();
        };
    }, []);
    
    // Global Scroll Progress
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    // Close mobile menu on route change & reset scroll
    useEffect(() => {
        setMobileMenu(false);
        window.scrollTo(0, 0);
    }, [location.pathname]);

    const navLinks = [
        { to: '/', label: 'Home' },
        { to: '/about', label: 'About Us' },
        { to: '/pricing', label: 'Packages' },
    ];

    return (
        <div id="snap-root" className="bg-[#f8fafc] min-h-screen">
            {/* Global Scroll Progress Bar */}
            <motion.div
                className="fixed top-0 left-0 right-0 h-1 bg-linear-to-r from-blue-500 to-violet-500 z-60 origin-left"
                style={{ scaleX }}
            />
            {/* ─── HEADER ─── */}
            <header
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
                    scrolled
                        ? 'glass-panel-strong shadow-lg shadow-blue-500/5 py-3'
                        : 'bg-transparent py-4'
                }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2.5 group">
                        <div className="w-9 h-9 bg-linear-to-br from-blue-500 to-violet-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-shadow duration-300">
                            <RefreshCw className="text-white w-4.5 h-4.5" />
                        </div>
                        <span className="text-xl font-bold shimmer-text">
                            MutualTransfer.lk
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center space-x-8">
                        {navLinks.map(link => (
                            <Link
                                key={link.to}
                                to={link.to}
                                className={`relative text-sm font-semibold transition-colors duration-300 py-1 ${
                                    location.pathname === link.to
                                        ? 'text-blue-600'
                                        : 'text-slate-600 hover:text-blue-600'
                                }`}
                            >
                                {link.label}
                                <span
                                    className={`absolute bottom-0 left-0 h-0.5 bg-linear-to-r from-blue-500 to-violet-500 rounded-full transition-all duration-300 ${
                                        location.pathname === link.to ? 'w-full' : 'w-0'
                                    }`}
                                />
                            </Link>
                        ))}
                    </nav>

                    {/* Auth Buttons */}
                    <div className="hidden md:flex items-center space-x-3">
                        <Link
                            to="/login"
                            className="px-5 py-2.5 text-sm font-semibold text-slate-700 hover:text-blue-600 rounded-xl transition-colors duration-300"
                        >
                            Login
                        </Link>
                        <Link
                            to="/register"
                            className="px-5 py-2.5 text-sm font-bold bg-linear-to-r from-blue-500 to-violet-500 text-white rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all duration-300"
                        >
                            Register
                        </Link>
                    </div>

                    {/* Mobile menu button */}
                    <button
                        onClick={() => setMobileMenu(!mobileMenu)}
                        className="md:hidden p-2 rounded-xl hover:bg-slate-100 transition-colors"
                    >
                        {mobileMenu ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>

                {/* Mobile Nav */}
                {mobileMenu && (
                    <div className="md:hidden glass-panel-strong mt-2 mx-4 rounded-2xl p-4 animate-reveal-up">
                        <nav className="flex flex-col space-y-2">
                            {navLinks.map(link => (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    className={`px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                                        location.pathname === link.to
                                            ? 'bg-blue-50 text-blue-600'
                                            : 'text-slate-700 hover:bg-slate-50'
                                    }`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                            <div className="border-t border-slate-100 pt-3 mt-2 flex flex-col space-y-2">
                                <Link to="/login" className="px-4 py-3 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 text-center">
                                    Login
                                </Link>
                                <Link to="/register" className="px-4 py-3 rounded-xl text-sm font-bold bg-linear-to-r from-blue-500 to-violet-500 text-white text-center shadow-lg shadow-blue-500/20">
                                    Register
                                </Link>
                            </div>
                        </nav>
                    </div>
                )}
            </header>

            {/* ─── MAIN ─── */}
            <Outlet />

            {/* ─── FOOTER ─── */}
            <footer className="relative overflow-hidden">
                {/* Top gradient border */}
                <div className="h-px bg-linear-to-r from-transparent via-blue-200/60 to-transparent" />
                
                <div className="bg-linear-to-b from-slate-50/80 to-white py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-10">
                        {/* Brand */}
                        <div>
                            <div className="flex items-center space-x-2.5 mb-5">
                                <div className="w-8 h-8 bg-linear-to-br from-blue-500 to-violet-500 rounded-xl flex items-center justify-center">
                                    <RefreshCw className="text-white w-4 h-4" />
                                </div>
                                <span className="text-lg font-bold shimmer-text">MutualTransfer.lk</span>
                            </div>
                            <p className="text-sm leading-relaxed text-slate-500 max-w-xs">
                                Empowering government employees in Sri Lanka to find mutual transfers securely and efficiently.
                            </p>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h4 className="text-slate-800 font-bold mb-5 text-xs uppercase tracking-widest">Quick Links</h4>
                            <ul className="space-y-3 text-sm">
                                <li><Link to="/" className="text-slate-500 hover:text-blue-600 transition-colors duration-300">Home</Link></li>
                                <li><Link to="/about" className="text-slate-500 hover:text-blue-600 transition-colors duration-300">About Us</Link></li>
                                <li><Link to="/pricing" className="text-slate-500 hover:text-blue-600 transition-colors duration-300">Packages</Link></li>
                            </ul>
                        </div>

                        {/* Legal */}
                        <div>
                            <h4 className="text-slate-800 font-bold mb-5 text-xs uppercase tracking-widest">Legal</h4>
                            <ul className="space-y-3 text-sm">
                                <li>
                                    <button onClick={() => toast('Privacy Policy will be updated soon', { icon: '📄' })} className="text-slate-500 hover:text-blue-600 transition-colors duration-300 cursor-pointer">
                                        Privacy Policy
                                    </button>
                                </li>
                                <li>
                                    <button onClick={() => toast('Terms of Service will be updated soon', { icon: '⚖️' })} className="text-slate-500 hover:text-blue-600 transition-colors duration-300 cursor-pointer">
                                        Terms of Service
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Bottom bar */}
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-slate-100 text-center">
                        <p className="text-xs text-slate-400">
                            &copy; {new Date().getFullYear()} MutualTransfer.lk by MoonSept. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default WebLayout;
