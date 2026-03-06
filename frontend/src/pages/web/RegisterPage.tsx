import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useEffect, useState } from 'react';
import {
    ShieldCheck,
    User,
    Fingerprint,
    Mail,
    Briefcase,
    Hospital,
    Lock,
    ArrowRight,
    AlertCircle,
    ChevronDown
} from 'lucide-react';

const RegisterPage = () => {
    const [step, setStep] = useState(1);
    const [categories, setCategories] = useState<any[]>([]);
    const [grades, setGrades] = useState<any[]>([]);
    const [stations, setStations] = useState<any[]>([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { login } = useAuth();

    const [formData, setFormData] = useState({
        username: '', // Using NIC as username
        password: '',
        confirmPassword: '',
        fullName: '',
        email: '',
        nic: '',
        jobCategoryId: '',
        gradeId: '',
        currentStationId: ''
    });

    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const [catRes, gradeRes, stationRes] = await Promise.all([
                    apiClient.get('/public/job-categories'),
                    apiClient.get('/public/grades'),
                    apiClient.get('/public/stations')
                ]);
                setCategories(catRes.data);
                setGrades(gradeRes.data);
                setStations(stationRes.data);
            } catch (err) {
                console.error("Failed to fetch metadata", err);
            }
        };
        fetchMetadata();
    }, []);

    const handleRegister = async (e: any) => {
        e.preventDefault();
        setError('');

        if (step === 1) {
            setStep(2);
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);
        try {
            await apiClient.post('/auth/signup', {
                username: formData.nic,
                password: formData.password,
                fullName: formData.fullName,
                email: formData.email,
                nic: formData.nic,
                jobCategoryId: Number(formData.jobCategoryId),
                gradeId: Number(formData.gradeId),
                currentStationId: Number(formData.currentStationId)
            });

            // Automatically login after registration
            const loginRes = await apiClient.post('/auth/signin', {
                username: formData.nic,
                password: formData.password
            });

            login(loginRes.data);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-6 bg-slate-50 relative overflow-hidden">
            {/* Abstract Background */}
            <div className="absolute top-0 right-0 w-full h-full pointer-events-none opacity-20">
                <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-400 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-purple-400 blur-[120px] rounded-full"></div>
            </div>

            <div className="w-full max-w-2xl relative z-10">
                <div className="bg-white rounded-[32px] shadow-2xl shadow-blue-900/10 border border-slate-100 overflow-hidden">
                    <div className="flex flex-col md:flex-row">
                        {/* Sidebar info */}
                        <div className="md:w-1/3 bg-slate-900 p-10 text-white flex flex-col justify-between">
                            <div>
                                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-8">
                                    <ShieldCheck size={28} className="text-white" />
                                </div>
                                <h2 className="text-2xl font-medium mb-4 leading-tight tracking-tight">Join the Network</h2>
                                <p className="text-slate-400 text-sm leading-relaxed mb-10">
                                    Register with your official details to start matching with potential transfer partners.
                                </p>
                                <div className="space-y-6">
                                    <div className="flex items-center space-x-3 opacity-100 transition-opacity">
                                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-medium">1</div>
                                        <span className="text-sm font-bold">Personal Info</span>
                                    </div>
                                    <div className={`flex items-center space-x-3 ${step === 2 ? 'opacity-100' : 'opacity-40'} transition-opacity`}>
                                        <div className={`w-8 h-8 rounded-full ${step === 2 ? 'bg-blue-600' : 'bg-slate-700'} flex items-center justify-center text-xs font-medium`}>2</div>
                                        <span className="text-sm font-bold">Service Info</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-12 text-xs text-slate-500 font-bold uppercase tracking-wider leading-loose">
                                Verified by <br /> Government Systems
                            </div>
                        </div>

                        <div className="md:w-2/3 p-10 bg-white">
                            <form onSubmit={handleRegister} className="space-y-6">
                                {error && (
                                    <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center space-x-3 text-rose-600 animate-in fade-in slide-in-from-top-2">
                                        <AlertCircle size={20} />
                                        <p className="text-sm font-medium">{error}</p>
                                    </div>
                                )}

                                {step === 1 ? (
                                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                        <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-6">Step 1: Personal Details</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 ml-1 block">Full Name</label>
                                                <div className="relative group">
                                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                    <input
                                                        type="text"
                                                        value={formData.fullName}
                                                        placeholder="John Doe"
                                                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:bg-white outline-none transition-all font-medium"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 ml-1 block">NIC Number</label>
                                                <div className="relative group">
                                                    <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                    <input
                                                        type="text"
                                                        value={formData.nic}
                                                        placeholder="991234567V"
                                                        onChange={(e) => setFormData({ ...formData, nic: e.target.value })}
                                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:bg-white outline-none transition-all font-medium"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 ml-1 block">Email Address</label>
                                                <div className="relative group">
                                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                    <input
                                                        type="email"
                                                        value={formData.email}
                                                        placeholder="john@gov.lk"
                                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:bg-white outline-none transition-all font-medium"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                        <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-6">Step 2: Professional Service</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 ml-1 block">Job Category</label>
                                                <div className="relative group">
                                                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                    <select
                                                        value={formData.jobCategoryId}
                                                        onChange={(e) => setFormData({ ...formData, jobCategoryId: e.target.value })}
                                                        className="w-full pl-12 pr-10 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:bg-white outline-none transition-all font-medium appearance-none"
                                                        required
                                                    >
                                                        <option value="">Select Category</option>
                                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                                    </select>
                                                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                                                        <ChevronDown className="w-5 h-5 text-slate-400" />
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 ml-1 block">Current Station</label>
                                                <div className="relative group">
                                                    <Hospital className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                    <select
                                                        value={formData.currentStationId}
                                                        onChange={(e) => setFormData({ ...formData, currentStationId: e.target.value })}
                                                        className="w-full pl-12 pr-10 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:bg-white outline-none transition-all font-medium appearance-none"
                                                        required
                                                    >
                                                        <option value="">Select Station</option>
                                                        {stations.map(s => <option key={s.id} value={s.id}>{s.name} ({s.district})</option>)}
                                                    </select>
                                                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                                                        <ChevronDown className="w-5 h-5 text-slate-400" />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="col-span-2">
                                                    <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 ml-1 block">Grade</label>
                                                    <div className="relative group">
                                                        <select
                                                            value={formData.gradeId}
                                                            onChange={(e) => setFormData({ ...formData, gradeId: e.target.value })}
                                                            className="w-full pl-4 pr-10 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:bg-white outline-none transition-all font-medium appearance-none"
                                                            required
                                                        >
                                                            <option value="">Select Grade</option>
                                                            {grades.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                                                        </select>
                                                        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                                                            <ChevronDown className="w-5 h-5 text-slate-400" />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 ml-1 block">Password</label>
                                                    <div className="relative group">
                                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                        <input
                                                            type="password"
                                                            value={formData.password}
                                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:bg-white outline-none transition-all font-medium"
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 ml-1 block">Confirm Password</label>
                                                    <div className="relative group">
                                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                        <input
                                                            type="password"
                                                            value={formData.confirmPassword}
                                                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:bg-white outline-none transition-all font-medium"
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}


                                <div className="pt-6 flex items-center space-x-4">
                                    {step === 2 && (
                                        <button
                                            type="button"
                                            onClick={() => setStep(1)}
                                            className="px-6 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all"
                                        >
                                            Back
                                        </button>
                                    )}
                                    <button
                                        disabled={loading}
                                        className="grow py-4 bg-blue-600 text-white font-medium rounded-2xl shadow-xl shadow-blue-500/20 hover:bg-blue-700 hover:-translate-y-1 transition-all flex items-center justify-center disabled:opacity-50"
                                    >
                                        {loading ? "Registering..." : (step === 1 ? "Next Step" : "Complete Registration")}
                                        {!loading && <ArrowRight className="ml-2" size={20} />}
                                    </button>
                                </div>

                                <p className="text-center text-slate-500 text-sm mt-8">
                                    Already have an account? <Link to="/login" className="text-blue-600 font-bold hover:underline">Sign In</Link>
                                </p>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
