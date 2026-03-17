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
    ChevronDown,
    Eye,
    EyeOff,
    Phone,
    KeyRound
} from 'lucide-react';
import { isValidNic } from '../../utils/validation';

const RegisterPage = () => {
    const [step, setStep] = useState(1);
    const [fields, setFields] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [districts, setDistricts] = useState<string[]>([]);
    const [stations, setStations] = useState<any[]>([]);
    
    // UI selections
    const [selectedFieldId, setSelectedFieldId] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    // Resend OTP logic
    const [resendTimer, setResendTimer] = useState(0);
    const [canResend, setCanResend] = useState(false);


    const navigate = useNavigate();
    const { login } = useAuth();

    const [formData, setFormData] = useState({
        username: '', // Using NIC as username
        password: '',
        confirmPassword: '',
        fullName: '',
        email: '',
        nic: '',
        phoneNumber: '',
        jobCategoryId: '',
        currentStationId: ''
    });

    const [otp, setOtp] = useState('');

    useEffect(() => {
        const fetchInitialMetadata = async () => {
            try {
                const [fieldRes, districtRes] = await Promise.all([
                    apiClient.get('/public/fields'),
                    apiClient.get('/public/districts')
                ]);
                setFields(fieldRes.data);
                setDistricts(districtRes.data);
            } catch (err) {
                console.error("Failed to fetch initial metadata", err);
            }
        };
        fetchInitialMetadata();
    }, []);

    useEffect(() => {
        const fetchCategories = async () => {
            if (!selectedFieldId) {
                setCategories([]);
                return;
            }
            try {
                const res = await apiClient.get(`/public/job-categories?fieldId=${selectedFieldId}`);
                setCategories(res.data);
            } catch (err) {
                console.error("Failed to fetch categories", err);
            }
        };
        fetchCategories();
    }, [selectedFieldId]);

    useEffect(() => {
        const fetchStations = async () => {
            if (!selectedFieldId || !selectedDistrict) {
                setStations([]);
                return;
            }
            try {
                // Ensure fieldId is included in the query to filter stations by both district AND field
                const res = await apiClient.get(`/public/stations?district=${encodeURIComponent(selectedDistrict)}&fieldId=${selectedFieldId}`);
                setStations(res.data);
            } catch (err) {
                console.error("Failed to fetch stations", err);
            }
        };
        fetchStations();
    }, [selectedFieldId, selectedDistrict]);

    useEffect(() => {
        let interval: any;
        if (resendTimer > 0) {
            interval = setInterval(() => {
                setResendTimer((prev) => prev - 1);
            }, 1000);
        } else if (resendTimer === 0) {
            setCanResend(true);
        }
        return () => clearInterval(interval);
    }, [resendTimer]);

    const getStationLabel = () => {
        const field = fields.find(f => f.id === Number(selectedFieldId));
        if (!field) return "Station";
        if (field.name === 'Health') return "Hospital / Institution";
        if (field.name === 'Education') return "School / College";
        if (field.name === 'Postal') return "Post Office / Center";
        return "Station";
    };

    const handleRegister = async (e: any) => {
        e.preventDefault();
        setError('');

        if (step === 1) {
            if (!isValidNic(formData.nic)) {
                setError("Please enter a valid Sri Lankan NIC number (9 digits + V or 12 digits)");
                return;
            }
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
                phoneNumber: formData.phoneNumber,
                jobCategoryId: Number(formData.jobCategoryId),
                currentStationId: Number(formData.currentStationId)
            });

            setStep(3);
            setResendTimer(60);
            setCanResend(false);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (!canResend) return;
        
        setError('');
        setLoading(true);
        try {
            await apiClient.post('/auth/signup', {
                username: formData.nic,
                password: formData.password,
                fullName: formData.fullName,
                email: formData.email,
                nic: formData.nic,
                phoneNumber: formData.phoneNumber,
                jobCategoryId: Number(formData.jobCategoryId),
                currentStationId: Number(formData.currentStationId)
            });
            setResendTimer(60);
            setCanResend(false);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to resend OTP.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: any) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await apiClient.post('/auth/verify-registration', {
                phoneNumber: formData.phoneNumber,
                otpCode: otp
            });

            // Automatically login after phone verification
            const loginRes = await apiClient.post('/auth/signin', {
                username: formData.nic,
                password: formData.password
            });

            login(loginRes.data);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'OTP verification failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };



    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 relative overflow-hidden pt-24">
            {/* Abstract Background */}
            <div className="absolute top-0 right-0 w-full h-full pointer-events-none opacity-20">
                <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-400 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-purple-400 blur-[120px] rounded-full"></div>
            </div>

            <div className="w-full max-w-5xl relative z-10">
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
                                    <div className={`flex items-center space-x-3 ${step === 3 ? 'opacity-100' : 'opacity-40'} transition-opacity`}>
                                        <div className={`w-8 h-8 rounded-full ${step === 3 ? 'bg-blue-600' : 'bg-slate-700'} flex items-center justify-center text-xs font-medium`}>3</div>
                                        <span className="text-sm font-bold">Verification</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-12 text-xs text-slate-500 font-bold uppercase tracking-wider leading-loose">
                                Verified by <br /> Government Systems
                            </div>
                        </div>

                        <div className="md:w-2/3 p-10 bg-white">
                            <form onSubmit={step === 3 ? handleVerifyOtp : handleRegister} className="space-y-6">
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
                                                        placeholder="Amal Perera"
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
                                                        placeholder="891005567V"
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
                                                        placeholder="amalperera@gmail.com"
                                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:bg-white outline-none transition-all font-medium"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 ml-1 block">Phone Number</label>
                                                <div className="relative group flex items-center">
                                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center space-x-2 text-slate-400">
                                                        <Phone size={18} />
                                                        <span className="font-bold text-slate-600 border-r border-slate-200 pr-2">+94</span>
                                                    </div>
                                                    <input
                                                        type="tel"
                                                        value={formData.phoneNumber.startsWith('94') ? formData.phoneNumber.substring(2) : formData.phoneNumber}
                                                        placeholder="7XXXXXXXX"
                                                        maxLength={9}
                                                        onChange={(e) => {
                                                            const value = e.target.value.replace(/\D/g, '');
                                                            if (value.length <= 9) {
                                                                setFormData({ ...formData, phoneNumber: value ? `94${value}` : '' });
                                                            }
                                                        }}
                                                        className="w-full pl-24 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:bg-white outline-none transition-all font-medium tracking-widest"
                                                        required
                                                    />
                                                </div>
                                                {formData.phoneNumber && formData.phoneNumber.length > 2 && !formData.phoneNumber.startsWith('947') && (
                                                    <p className="text-xs text-rose-500 mt-1 ml-1 font-medium">Mobile numbers must start with 7</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ) : step === 2 ? (
                                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                        <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-6">Step 2: Professional Service</h3>
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 ml-1 block">Field</label>
                                                    <div className="relative group">
                                                        <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                        <select
                                                            value={selectedFieldId}
                                                            onChange={(e) => {
                                                                setSelectedFieldId(e.target.value);
                                                                setFormData({ ...formData, jobCategoryId: '', currentStationId: '' });
                                                            }}
                                                            className="w-full pl-12 pr-10 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:bg-white outline-none transition-all font-medium appearance-none"
                                                            required
                                                        >
                                                            <option value="">Select Field</option>
                                                            {fields.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                                                        </select>
                                                        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                                                            <ChevronDown className="w-5 h-5 text-slate-400" />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 ml-1 block">Job Category</label>
                                                    <div className="relative group">
                                                        <select
                                                            value={formData.jobCategoryId}
                                                            onChange={(e) => setFormData({ ...formData, jobCategoryId: e.target.value })}
                                                            className="w-full pl-4 pr-10 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:bg-white outline-none transition-all font-medium appearance-none disabled:opacity-50"
                                                            required
                                                            disabled={!selectedFieldId}
                                                        >
                                                            <option value="">Select Category</option>
                                                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                                        </select>
                                                        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                                                            <ChevronDown className="w-5 h-5 text-slate-400" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 ml-1 block">District</label>
                                                    <div className="relative group">
                                                        <Hospital className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                        <select
                                                            value={selectedDistrict}
                                                            onChange={(e) => {
                                                                setSelectedDistrict(e.target.value);
                                                                setFormData({ ...formData, currentStationId: '' });
                                                            }}
                                                            className="w-full pl-12 pr-10 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:bg-white outline-none transition-all font-medium appearance-none"
                                                            required
                                                        >
                                                            <option value="">Select District</option>
                                                            {districts.map(d => <option key={d} value={d}>{d}</option>)}
                                                        </select>
                                                        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                                                            <ChevronDown className="w-5 h-5 text-slate-400" />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 ml-1 block">Current {getStationLabel()}</label>
                                                    <div className="relative group">
                                                        <select
                                                            value={formData.currentStationId}
                                                            onChange={(e) => setFormData({ ...formData, currentStationId: e.target.value })}
                                                            className="w-full pl-4 pr-10 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:bg-white outline-none transition-all font-medium appearance-none disabled:opacity-50"
                                                            required
                                                            disabled={!selectedDistrict || !selectedFieldId}
                                                        >
                                                            <option value="">
                                                                {!selectedFieldId ? 'Select Field first' : !selectedDistrict ? 'Select District first' : `Select ${getStationLabel()}`}
                                                            </option>
                                                            {stations.map(s => <option key={s.id} value={s.id}>{s.name} ({s.hierarchyLevel})</option>)}
                                                        </select>
                                                        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                                                            <ChevronDown className="w-5 h-5 text-slate-400" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 ml-1 block">Password</label>
                                                    <div className="relative group">
                                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                        <input
                                                            type={showPassword ? "text" : "password"}
                                                            value={formData.password}
                                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                            className="w-full pl-12 pr-12 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:bg-white outline-none transition-all font-medium"
                                                            required
                                                        />
                                                        {formData.password && (
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowPassword(!showPassword)}
                                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                                                            >
                                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 ml-1 block">Confirm Password</label>
                                                    <div className="relative group">
                                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                        <input
                                                            type={showConfirmPassword ? "text" : "password"}
                                                            value={formData.confirmPassword}
                                                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                                            className="w-full pl-12 pr-12 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:bg-white outline-none transition-all font-medium"
                                                            required
                                                        />
                                                        {formData.confirmPassword && (
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                                                            >
                                                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                        <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-6">Step 3: Phone Verification</h3>
                                        <p className="text-sm text-slate-500 mb-6">
                                            We've sent a 6-digit verification code to <span className="font-bold text-slate-900">+{formData.phoneNumber}</span>. 
                                            Please enter it below to verify your account.
                                        </p>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 ml-1 block">Verification Code</label>
                                                <div className="relative group">
                                                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                    <input
                                                        type="text"
                                                        maxLength={6}
                                                        value={otp}
                                                        placeholder="000000"
                                                        onChange={(e) => setOtp(e.target.value)}
                                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:bg-white outline-none transition-all font-medium text-center tracking-[1em] text-lg uppercase"
                                                        required
                                                    />
                                                </div>
                                                <div className="flex justify-center mt-4">
                                                    <button
                                                        type="button"
                                                        onClick={handleResendOtp}
                                                        disabled={!canResend || loading}
                                                        className="text-sm font-bold text-blue-600 hover:text-blue-700 disabled:text-slate-400 transition-colors flex items-center space-x-1"
                                                    >
                                                        <span>Resend OTP</span>
                                                        {!canResend && (
                                                            <span className="text-slate-400 font-medium ml-1">
                                                                (in {resendTimer}s)
                                                            </span>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}


                                <div className="pt-6 flex items-center space-x-4">
                                    {(step === 2 || (step === 3 && !loading)) && (
                                        <button
                                            type="button"
                                            onClick={() => setStep(step - 1)}
                                            className="px-6 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all"
                                        >
                                            Back
                                        </button>
                                    )}
                                    <button
                                        disabled={loading}
                                        className="grow py-4 bg-blue-600 text-white font-medium rounded-2xl shadow-xl shadow-blue-500/20 hover:bg-blue-700 hover:-translate-y-1 transition-all flex items-center justify-center disabled:opacity-50"
                                    >
                                        {loading ? (step >= 3 ? "Verifying..." : "Registering...") : 
                                         (step === 1 ? "Next Step" : step === 2 ? "Complete Registration" : "Verify Phone")}
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
