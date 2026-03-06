import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ShieldCheck,
    ArrowRight,
    Lock,
    UserCircle,
    AlertCircle
} from 'lucide-react';
import apiClient from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const AdminLoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { login } = useAuth();

    const handleLogin = async (e: any) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await apiClient.post('/auth/signin', {
                username: username,
                password: password
            });

            // Enforce Admin role
            if (response.data.role !== 'ADMIN') {
                setError('Access Denied. Administrator privileges required.');
                return;
            }

            login(response.data, rememberMe);
            navigate('/admin');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed. Please check your admin credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950 relative overflow-hidden">
            {/* Abstract Background for Admin */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600 blur-[150px] rounded-full"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-600 blur-[150px] rounded-full"></div>
            </div>

            <div className="w-full max-w-md relative z-10">
                <div className="bg-slate-900 rounded-[32px] shadow-2xl border border-slate-800 overflow-hidden">
                    <div className="p-10 pt-12 text-center border-b border-slate-800 bg-slate-800/50">
                        <div className="w-16 h-16 bg-slate-950 rounded-[18px] flex items-center justify-center mb-6 mx-auto shadow-inner shadow-white/10 border border-slate-700">
                            <ShieldCheck size={32} className="text-white" />
                        </div>
                        <h1 className="text-2xl font-semibold text-white tracking-tight">Admin Portal</h1>
                        <p className="text-slate-400 text-sm mt-2">Restricted Access</p>
                    </div>

                    <div className="p-10">
                        <form onSubmit={handleLogin} className="space-y-6">
                            {error && (
                                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center space-x-3 text-rose-400 animate-in fade-in slide-in-from-top-2">
                                    <AlertCircle size={20} />
                                    <p className="text-sm font-medium">{error}</p>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 ml-1">
                                    Admin Username
                                </label>
                                <div className="relative group">
                                    <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-white transition-colors" size={20} />
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="Enter admin username"
                                        className="w-full pl-12 pr-4 py-4 bg-slate-800 border-2 border-slate-700 rounded-2xl outline-none focus:border-white focus:bg-slate-900 transition-all text-white font-medium placeholder:text-slate-600"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 ml-1">
                                    Password
                                </label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-white transition-colors" size={20} />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full pl-12 pr-4 py-4 bg-slate-800 border-2 border-slate-700 rounded-2xl outline-none focus:border-white focus:bg-slate-900 transition-all text-white font-medium placeholder:text-slate-600"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <label className="flex items-center space-x-2 cursor-pointer group">
                                    <div className="relative flex items-center justify-center w-5 h-5 rounded border border-slate-600 bg-slate-800 group-hover:border-slate-400 transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={rememberMe}
                                            onChange={(e) => setRememberMe(e.target.checked)}
                                            className="peer sr-only"
                                        />
                                        <div className="hidden peer-checked:block w-3 h-3 bg-white rounded-sm"></div>
                                    </div>
                                    <span className="text-sm font-medium text-slate-400 group-hover:text-slate-200 transition-colors">Remember me</span>
                                </label>
                            </div>

                            <button
                                disabled={loading}
                                className="w-full py-4 bg-white text-slate-950 font-bold rounded-2xl hover:bg-slate-100 hover:-translate-y-0.5 transition-all text-lg flex items-center justify-center disabled:opacity-50 disabled:translate-y-0 mt-8 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                            >
                                {loading ? 'Authenticating...' : 'Secure Login'}
                                {!loading && <ArrowRight className="ml-2" size={20} />}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLoginPage;
