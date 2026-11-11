import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';
import SEO from '../../components/SEO';

/**
 * Real 404 page. Previously every unknown URL was redirected to "/", which
 * made the site return a soft 404: crawlers saw HTTP 200 + homepage content
 * for broken or outdated links, so those URLs competed with the real homepage.
 */
const NotFoundPage = () => {
    return (
        <div className="relative min-h-screen flex items-center justify-center px-4 py-24 bg-[#f8fafc] overflow-hidden">
            <SEO
                title="Page Not Found"
                description="The page you are looking for does not exist or has been moved."
                noindex
            />

            {/* Ambient background */}
            <div className="absolute inset-0 pointer-events-none opacity-20" aria-hidden="true">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400 blur-[120px] rounded-full" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-400 blur-[120px] rounded-full" />
            </div>

            <div className="relative z-10 text-center max-w-xl mx-auto">
                <p className="text-[110px] sm:text-[150px] font-black leading-none shimmer-text select-none">
                    404
                </p>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-2 mb-4">
                    This page doesn&apos;t exist
                </h1>
                <p className="text-lg text-slate-600 leading-relaxed mb-10">
                    The link may be broken or the page may have been moved. Let&apos;s get you back
                    to finding your transfer match.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Link
                        to="/"
                        className="inline-flex items-center justify-center w-full sm:w-auto px-7 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all duration-300"
                    >
                        <Home size={18} className="mr-2" />
                        Back to Home
                    </Link>
                    <button
                        type="button"
                        onClick={() => window.history.back()}
                        className="inline-flex items-center justify-center w-full sm:w-auto px-7 py-3.5 text-slate-700 font-semibold rounded-2xl border border-slate-200 bg-white hover:border-blue-300 hover:text-blue-600 transition-all duration-300"
                    >
                        <ArrowLeft size={18} className="mr-2" />
                        Go Back
                    </button>
                </div>

                <nav className="mt-12 pt-8 border-t border-slate-200/80" aria-label="Helpful links">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
                        Popular pages
                    </p>
                    <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm font-semibold">
                        <li>
                            <Link to="/about" className="text-slate-600 hover:text-blue-600 transition-colors">
                                About Us
                            </Link>
                        </li>
                        <li>
                            <Link to="/pricing" className="text-slate-600 hover:text-blue-600 transition-colors">
                                Packages
                            </Link>
                        </li>
                        <li>
                            <Link to="/register" className="text-slate-600 hover:text-blue-600 transition-colors">
                                Create an Account
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/login"
                                className="inline-flex items-center text-slate-600 hover:text-blue-600 transition-colors"
                            >
                                <Search size={14} className="mr-1.5" />
                                Find Matches
                            </Link>
                        </li>
                    </ul>
                </nav>
            </div>
        </div>
    );
};

export default NotFoundPage;
