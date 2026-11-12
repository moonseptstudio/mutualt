import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import {
    ArrowRight,
    Lock,
    Fingerprint,
    AlertCircle,
    Eye,
    EyeOff,
    Users,
    GitMerge,
    User,
    Mail,
    Briefcase,
    Hospital,
    ChevronDown,
    Phone,
    KeyRound,
    Check
} from 'lucide-react';
import apiClient from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { isValidNic } from '../../utils/validation';
import { useTranslation } from 'react-i18next';
import loginBg from '../../assets/auth/login-bg.webp';
import registerBg from '../../assets/auth/register-bg.webp';
import logoImg from '../../assets/logos/logo.jpg';
import NetworkMeshBackground from '../../components/hero/NetworkMeshBackground';
import SEO from '../../components/SEO';
import { breadcrumbSchema } from '../../config/seo';

/* ─── Floating Shapes Component (for parallax & ambient motion) ─── */
const FloatingShapes = () => {
    const { scrollYProgress } = useScroll();
    const y1 = useTransform(scrollYProgress, [0, 1], [0, -150]);
    const y2 = useTransform(scrollYProgress, [0, 1], [0, 100]);
  
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
            <motion.div 
                style={{ y: y1 }}
                animate={{
                    scale: [1, 1.08, 1],
                    x: [0, 15, 0],
                    opacity: [0.35, 0.55, 0.35]
                }}
                transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-blue-100/50 blur-3xl" 
            />
            <motion.div 
                style={{ y: y2 }}
                animate={{
                    scale: [1, 1.12, 1],
                    x: [0, -20, 0],
                    opacity: [0.3, 0.5, 0.3]
                }}
                transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute top-1/2 -right-20 w-96 h-96 rounded-full bg-violet-100/40 blur-3xl" 
            />
            <motion.div 
                animate={{
                    scale: [1, 1.06, 1],
                    y: [0, -15, 0],
                    opacity: [0.25, 0.45, 0.25]
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                className="absolute -bottom-20 left-1/4 w-80 h-80 rounded-full bg-sky-100/40 blur-3xl" 
            />
        </div>
    );
};

const AuthPage = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const { login } = useAuth();

    const isRegister = location.pathname.startsWith('/register');

    // ----------------------------------------------------
    // Login States
    // ----------------------------------------------------
    const [loginNic, setLoginNic] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [loginError, setLoginError] = useState('');
    const [showLoginPassword, setShowLoginPassword] = useState(false);
    const [loginLoading, setLoginLoading] = useState(false);

    // ----------------------------------------------------
    // Register States
    // ----------------------------------------------------
    const [registerStep, setRegisterStep] = useState(1);
    const [fields, setFields] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [districts, setDistricts] = useState<string[]>([]);
    const [stations, setStations] = useState<any[]>([]);

    const [selectedFieldId, setSelectedFieldId] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [registerError, setRegisterError] = useState('');
    const [registerLoading, setRegisterLoading] = useState(false);
    const [showRegisterPassword, setShowRegisterPassword] = useState(false);
    const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] = useState(false);

    const [resendTimer, setResendTimer] = useState(0);
    const [canResend, setCanResend] = useState(false);

    const [registerFormData, setRegisterFormData] = useState({
        username: '',
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

    // Fetch initial metadata for register
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
        if (!field) return t('register.station');
        if (field.name === 'Health') return t('register.hospital');
        if (field.name === 'Education') return t('register.school');
        if (field.name === 'Postal') return t('register.post_office');
        return t('register.station');
    };

    // ----------------------------------------------------
    // Login Submit Handler
    // ----------------------------------------------------
    const handleLogin = async (e: any) => {
        e.preventDefault();
        setLoginError('');
        setLoginLoading(true);

        if (!isValidNic(loginNic)) {
            setLoginError(t('login.error_invalid_nic'));
            setLoginLoading(false);
            return;
        }

        try {
            const response = await apiClient.post('/auth/signin', {
                username: loginNic,
                password: loginPassword
            });

            if (response.data.role === 'ADMIN') {
                setLoginError(t('login.error_admin_portal'));
                return;
            }

            login(response.data, rememberMe);
            navigate('/dashboard');
        } catch (err: any) {
            setLoginError(err.response?.data?.message || t('login.error_failed'));
        } finally {
            setLoginLoading(false);
        }
    };

    // ----------------------------------------------------
    // Register Submit Handlers
    // ----------------------------------------------------
    const handleRegister = async (e: any) => {
        e.preventDefault();
        setRegisterError('');

        if (registerStep === 1) {
            if (!isValidNic(registerFormData.nic)) {
                setRegisterError(t('register.error_invalid_nic'));
                return;
            }
            setRegisterStep(2);
            return;
        }

        if (registerFormData.password !== registerFormData.confirmPassword) {
            setRegisterError(t('register.error_password_mismatch'));
            return;
        }

        setRegisterLoading(true);
        try {
            await apiClient.post('/auth/signup', {
                username: registerFormData.nic,
                password: registerFormData.password,
                fullName: registerFormData.fullName,
                email: registerFormData.email,
                nic: registerFormData.nic,
                phoneNumber: registerFormData.phoneNumber,
                jobCategoryId: Number(registerFormData.jobCategoryId),
                currentStationId: Number(registerFormData.currentStationId)
            });

            setRegisterStep(3);
            setResendTimer(60);
            setCanResend(false);
        } catch (err: any) {
            setRegisterError(err.response?.data?.message || t('register.error_failed'));
        } finally {
            setRegisterLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (!canResend) return;

        setRegisterError('');
        setRegisterLoading(true);
        try {
            await apiClient.post('/auth/signup', {
                username: registerFormData.nic,
                password: registerFormData.password,
                fullName: registerFormData.fullName,
                email: registerFormData.email,
                nic: registerFormData.nic,
                phoneNumber: registerFormData.phoneNumber,
                jobCategoryId: Number(registerFormData.jobCategoryId),
                currentStationId: Number(registerFormData.currentStationId)
            });
            setResendTimer(60);
            setCanResend(false);
        } catch (err: any) {
            setRegisterError(err.response?.data?.message || t('register.error_resend_failed'));
        } finally {
            setRegisterLoading(false);
        }
    };

    const handleVerifyOtp = async (e: any) => {
        e.preventDefault();
        setRegisterError('');
        setRegisterLoading(true);

        try {
            await apiClient.post('/auth/verify-registration', {
                phoneNumber: registerFormData.phoneNumber,
                otpCode: otp
            });

            const loginRes = await apiClient.post('/auth/signin', {
                username: registerFormData.nic,
                password: registerFormData.password
            });

            login(loginRes.data);
            navigate('/dashboard');
        } catch (err: any) {
            setRegisterError(err.response?.data?.message || t('register.error_verify_failed'));
        } finally {
            setRegisterLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 mesh-gradient-bg relative overflow-hidden pt-24 pb-12">
            <SEO
                title={isRegister ? 'Create Your Free Account' : 'Login'}
                description={
                    isRegister
                        ? 'Register free on MutualTransfer.lk to find mutual transfer partners across Sri Lanka. NIC-verified profiles, no agents, no middlemen.'
                        : 'Log in to your MutualTransfer.lk account to manage station preferences, view matches and send mutual transfer requests.'
                }
                path={isRegister ? '/register' : '/login'}
                noindex={!isRegister}
                structuredData={isRegister ? breadcrumbSchema([['Register', '/register']]) : undefined}
            />
            <NetworkMeshBackground />
            <FloatingShapes />

            <motion.div 
                layout
                transition={{ type: "spring", stiffness: 220, damping: 26, mass: 0.8 }}
                className="w-full max-w-4xl relative z-10"
            >
                <div className="bg-white rounded-[28px] shadow-2xl shadow-blue-900/10 border border-slate-100 overflow-hidden relative">
                    <div className="flex flex-col md:flex-row items-stretch relative">

                        {/* ========================================================= */}
                        {/* THE DARK SHOWCASE PANEL (Smoothly slides between left & right) */}
                        {/* ========================================================= */}
                        <motion.div 
                            layout="position"
                            transition={{ 
                                type: "spring", 
                                stiffness: 220, 
                                damping: 26, 
                                mass: 0.85 
                            }}
                            className={`w-full md:w-5/12 bg-slate-900 p-4 sm:p-6 md:p-8 text-white flex flex-col justify-between relative overflow-hidden z-20 shadow-xl md:shadow-2xl md:shadow-slate-950/20 group order-1 ${
                                isRegister ? 'md:order-1' : 'md:order-2'
                            }`}
                        >
                            {/* Background Image with cross-fade */}
                            <AnimatePresence mode="popLayout">
                                <motion.img 
                                    key={isRegister ? 'register-bg' : 'login-bg'}
                                    src={isRegister ? registerBg : loginBg} 
                                    alt="Auth Portal" 
                                    initial={{ opacity: 0, scale: 1.05 }}
                                    animate={{ opacity: 0.35, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.98 }}
                                    transition={{ duration: 0.35 }}
                                    className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none" 
                                />
                            </AnimatePresence>

                            {/* Soft gradient overlay */}
                            <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/85 to-slate-900/70 pointer-events-none" />
                            <div className="absolute -top-10 -right-10 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

                            <div className="relative z-10">
                                {/* Header / Official Brand Logo */}
                                <Link to="/" className="inline-flex items-center space-x-2.5 sm:space-x-3 mb-3 md:mb-5 group cursor-pointer">
                                    <img 
                                        src={logoImg} 
                                        alt="Mutual Transfer Logo" 
                                        className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-xl object-cover shadow-lg shadow-black/30 border border-white/10 group-hover:scale-105 transition-transform duration-300" 
                                    />
                                    <div>
                                        <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-widest text-blue-400 block leading-tight">MutualTransfer.lk</span>
                                        <p className="text-slate-300 text-[10px] sm:text-[11px] font-medium leading-tight">{t('common.public_service_network', 'Public Service Network')}</p>
                                    </div>
                                </Link>

                                {/* Dynamic Content cross-fading */}
                                <AnimatePresence mode="wait">
                                    {isRegister ? (
                                        <motion.div
                                            key="register-sidebar-content"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.25 }}
                                        >
                                            <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-1 md:mb-2 leading-snug tracking-tight text-white">
                                                {t('register.sidebar_title')}
                                            </h2>
                                            <p className="text-slate-300 text-xs leading-relaxed mb-2 md:mb-5">
                                                {t('register.sidebar_subtitle')}
                                            </p>

                                            {/* Register Step Tracker - Mobile Compact Progress Pills */}
                                            <div className="flex md:hidden items-center space-x-2 mt-1 mb-1">
                                                <div className={`h-1.5 rounded-full transition-all duration-300 ${registerStep >= 1 ? 'w-6 bg-blue-500' : 'w-2.5 bg-slate-700'}`} />
                                                <div className={`h-1.5 rounded-full transition-all duration-300 ${registerStep >= 2 ? 'w-6 bg-blue-500' : 'w-2.5 bg-slate-700'}`} />
                                                <div className={`h-1.5 rounded-full transition-all duration-300 ${registerStep >= 3 ? 'w-6 bg-blue-500' : 'w-2.5 bg-slate-700'}`} />
                                                <span className="text-[10px] font-semibold text-blue-400 ml-1">
                                                    {registerStep === 1 ? t('register.step1_label') : registerStep === 2 ? t('register.step2_label') : t('register.step3_label')}
                                                </span>
                                            </div>

                                            {/* Register Step Tracker - Modern Icon-based Stepper (No crude numbers) */}
                                            <div className="hidden md:block space-y-2.5 bg-white/5 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-inner">
                                                {/* Step 1: Personal Info */}
                                                <div className={`flex items-center space-x-3 transition-all duration-300 ${registerStep === 1 ? 'opacity-100' : registerStep > 1 ? 'opacity-90' : 'opacity-40'}`}>
                                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                                                        registerStep > 1 
                                                            ? 'bg-emerald-500/20 border border-emerald-400/40 text-emerald-400' 
                                                            : registerStep === 1 
                                                                ? 'bg-blue-600 border border-blue-400/50 text-white shadow-md shadow-blue-500/30' 
                                                                : 'bg-white/5 border border-white/10 text-slate-400'
                                                    }`}>
                                                        {registerStep > 1 ? <Check size={14} className="stroke-[2.5]" /> : <User size={14} />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between">
                                                            <p className="text-xs font-semibold text-slate-100">{t('register.step1_label')}</p>
                                                            {registerStep === 1 && (
                                                                <span className="text-[9px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-400/20">{t('common.active', 'Active')}</span>
                                                            )}
                                                            {registerStep > 1 && (
                                                                <span className="text-[10px] font-bold text-emerald-400">{t('common.done', 'Done')}</span>
                                                            )}
                                                        </div>
                                                        <p className="text-[11px] text-slate-400 truncate">
                                                            {registerStep > 1 ? t('register.step1_done_hint') : t('register.step1_hint')}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Step 2: Service Info */}
                                                <div className={`flex items-center space-x-3 pt-2.5 border-t border-white/5 transition-all duration-300 ${registerStep === 2 ? 'opacity-100' : registerStep > 2 ? 'opacity-90' : 'opacity-40'}`}>
                                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                                                        registerStep > 2 
                                                            ? 'bg-emerald-500/20 border border-emerald-400/40 text-emerald-400' 
                                                            : registerStep === 2 
                                                                ? 'bg-blue-600 border border-blue-400/50 text-white shadow-md shadow-blue-500/30' 
                                                                : 'bg-white/5 border border-white/10 text-slate-400'
                                                    }`}>
                                                        {registerStep > 2 ? <Check size={14} className="stroke-[2.5]" /> : <Briefcase size={14} />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between">
                                                            <p className="text-xs font-semibold text-slate-100">{t('register.step2_label')}</p>
                                                            {registerStep === 2 && (
                                                                <span className="text-[9px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-400/20">{t('common.active', 'Active')}</span>
                                                            )}
                                                            {registerStep > 2 && (
                                                                <span className="text-[10px] font-bold text-emerald-400">{t('common.done', 'Done')}</span>
                                                            )}
                                                        </div>
                                                        <p className="text-[11px] text-slate-400 truncate">
                                                            {registerStep > 2 ? t('register.step2_done_hint') : t('register.step2_hint')}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Step 3: Verification */}
                                                <div className={`flex items-center space-x-3 pt-2.5 border-t border-white/5 transition-all duration-300 ${registerStep === 3 ? 'opacity-100' : 'opacity-40'}`}>
                                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                                                        registerStep === 3 
                                                            ? 'bg-blue-600 border border-blue-400/50 text-white shadow-md shadow-blue-500/30' 
                                                            : 'bg-white/5 border border-white/10 text-slate-400'
                                                    }`}>
                                                        <KeyRound size={14} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between">
                                                            <p className="text-xs font-semibold text-slate-100">{t('register.step3_label')}</p>
                                                            {registerStep === 3 && (
                                                                <span className="text-[9px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-400/20">{t('common.active', 'Active')}</span>
                                                            )}
                                                        </div>
                                                        <p className="text-[11px] text-slate-400 truncate">
                                                            {registerStep === 3 ? t('register.step3_active_hint') : t('register.step3_hint')}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="login-sidebar-content"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.25 }}
                                        >
                                            <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-1 md:mb-2 leading-snug tracking-tight text-white">
                                                {t('login.welcome')}
                                            </h2>
                                            <p className="text-slate-300 text-xs leading-relaxed mb-0 md:mb-5">
                                                {t('login.sidebar_subtitle')}
                                            </p>

                                            {/* Login Feature Highlights - Desktop Only */}
                                            <div className="hidden md:block space-y-2.5 bg-white/5 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-inner">
                                                <div className="flex items-center space-x-2.5">
                                                    <div className="w-7 h-7 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 shrink-0">
                                                        <GitMerge size={15} />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-semibold text-slate-100">{t('login.feat_matching_title')}</p>
                                                        <p className="text-[11px] text-slate-400">{t('login.feat_matching_desc')}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2.5 pt-2 border-t border-white/5">
                                                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0">
                                                        <Users size={15} />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-semibold text-slate-100">{t('login.feat_users_title')}</p>
                                                        <p className="text-[11px] text-slate-400">{t('login.feat_users_desc')}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Sidebar Footer - Desktop Only */}
                            <div className="relative z-10 mt-6 pt-4 border-t border-white/10 hidden md:flex items-center justify-between text-[11px] text-slate-400">
                                <span>{isRegister ? t('register.verified_by_text') : t('login.verified_network')}</span>
                                <span>{t('common.sri_lanka')}</span>
                            </div>
                        </motion.div>

                        {/* ========================================================= */}
                        {/* THE FORM PANEL (Smoothly slides between right & left)    */}
                        {/* ========================================================= */}
                        <motion.div 
                            layout="position"
                            transition={{ 
                                type: "spring", 
                                stiffness: 220, 
                                damping: 26, 
                                mass: 0.85 
                            }}
                            className={`w-full md:w-7/12 p-5 sm:p-6 md:p-8 bg-white flex flex-col justify-between z-10 order-2 ${
                                isRegister ? 'md:order-2' : 'md:order-1'
                            }`}
                        >
                            <AnimatePresence mode="wait">
                                {isRegister ? (
                                    /* ---------------- REGISTER FORM ---------------- */
                                    <motion.div
                                        key="register-form-view"
                                        initial={{ opacity: 0, x: 16 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -16 }}
                                        transition={{ duration: 0.25 }}
                                        className="h-full flex flex-col justify-between"
                                    >
                                        <form onSubmit={registerStep === 3 ? handleVerifyOtp : handleRegister} className="space-y-4">
                                            {registerError && (
                                                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-center space-x-3 text-rose-600 text-xs font-medium">
                                                    <AlertCircle size={18} />
                                                    <p>{registerError}</p>
                                                </div>
                                            )}

                                            {registerStep === 1 ? (
                                                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                                    <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-4">{t('register.step1_title')}</h3>
                                                    <div className="space-y-3.5">
                                                        <div>
                                                            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5 ml-1 block">{t('register.full_name_label')}</label>
                                                            <div className="relative group">
                                                                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                                <input
                                                                    type="text"
                                                                    value={registerFormData.fullName}
                                                                    placeholder={t('register.name_placeholder', 'Amal Perera')}
                                                                    onChange={(e) => setRegisterFormData({ ...registerFormData, fullName: e.target.value })}
                                                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-blue-500 focus:bg-white outline-none transition-all text-sm font-medium"
                                                                    required
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* NIC and Phone in one row on desktop */}
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                                            <div>
                                                                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5 ml-1 block">{t('register.nic_label')}</label>
                                                                <div className="relative group">
                                                                    <Fingerprint className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                                    <input
                                                                        type="text"
                                                                        value={registerFormData.nic}
                                                                        placeholder="891005567V"
                                                                        onChange={(e) => setRegisterFormData({ ...registerFormData, nic: e.target.value })}
                                                                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-blue-500 focus:bg-white outline-none transition-all text-sm font-medium"
                                                                        required
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5 ml-1 block">{t('register.phone_label')}</label>
                                                                <div className="relative group flex items-center">
                                                                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center space-x-1.5 text-slate-400">
                                                                        <Phone size={16} />
                                                                        <span className="font-bold text-xs text-slate-600 border-r border-slate-200 pr-1.5">+94</span>
                                                                    </div>
                                                                    <input
                                                                        type="tel"
                                                                        value={registerFormData.phoneNumber.startsWith('94') ? registerFormData.phoneNumber.substring(2) : registerFormData.phoneNumber}
                                                                        placeholder="7XXXXXXXX"
                                                                        maxLength={9}
                                                                        onChange={(e) => {
                                                                            const value = e.target.value.replace(/\D/g, '');
                                                                            if (value.length <= 9) {
                                                                                setRegisterFormData({ ...registerFormData, phoneNumber: value ? `94${value}` : '' });
                                                                            }
                                                                        }}
                                                                        className="w-full pl-22 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-blue-500 focus:bg-white outline-none transition-all text-sm font-medium tracking-wider"
                                                                        required
                                                                    />
                                                                </div>
                                                                {registerFormData.phoneNumber && registerFormData.phoneNumber.length > 2 && !registerFormData.phoneNumber.startsWith('947') && (
                                                                    <p className="text-[11px] text-rose-500 mt-1 ml-1 font-medium">{t('register.error_mobile_start')}</p>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5 ml-1 block">{t('register.email_label')}</label>
                                                            <div className="relative group">
                                                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                                <input
                                                                    type="email"
                                                                    value={registerFormData.email}
                                                                    placeholder="amalperera@gmail.com"
                                                                    onChange={(e) => setRegisterFormData({ ...registerFormData, email: e.target.value })}
                                                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-blue-500 focus:bg-white outline-none transition-all text-sm font-medium"
                                                                    required
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : registerStep === 2 ? (
                                                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                                    <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-4">{t('register.step2_title')}</h3>
                                                    <div className="space-y-3.5">
                                                        <div className="grid grid-cols-2 gap-3.5">
                                                            <div>
                                                                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5 ml-1 block">{t('register.field_label')}</label>
                                                                <div className="relative group">
                                                                    <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                                    <select
                                                                        value={selectedFieldId}
                                                                        onChange={(e) => {
                                                                            setSelectedFieldId(e.target.value);
                                                                            setRegisterFormData({ ...registerFormData, jobCategoryId: '', currentStationId: '' });
                                                                        }}
                                                                        className="w-full pl-11 pr-9 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-blue-500 focus:bg-white outline-none transition-all text-sm font-medium appearance-none"
                                                                        required
                                                                    >
                                                                        <option value="">{t('register.select_field')}</option>
                                                                        {fields.map(f => (
                                                                            <option key={f.id} value={f.id}>
                                                                                {String(t(`fields.${f.name.toLowerCase()}`, f.name))}
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                                                        <ChevronDown className="w-4 h-4 text-slate-400" />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5 ml-1 block">{t('register.job_category_label')}</label>
                                                                <div className="relative group">
                                                                    <select
                                                                        value={registerFormData.jobCategoryId}
                                                                        onChange={(e) => setRegisterFormData({ ...registerFormData, jobCategoryId: e.target.value })}
                                                                        className="w-full pl-3.5 pr-9 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-blue-500 focus:bg-white outline-none transition-all text-sm font-medium appearance-none disabled:opacity-50"
                                                                        required
                                                                        disabled={!selectedFieldId}
                                                                    >
                                                                        <option value="">{t('register.select_category')}</option>
                                                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                                                    </select>
                                                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                                                        <ChevronDown className="w-4 h-4 text-slate-400" />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-3.5">
                                                            <div>
                                                                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5 ml-1 block">{t('register.district_label')}</label>
                                                                <div className="relative group">
                                                                    <Hospital className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                                    <select
                                                                        value={selectedDistrict}
                                                                        onChange={(e) => {
                                                                            setSelectedDistrict(e.target.value);
                                                                            setRegisterFormData({ ...registerFormData, currentStationId: '' });
                                                                        }}
                                                                        className="w-full pl-11 pr-9 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-blue-500 focus:bg-white outline-none transition-all text-sm font-medium appearance-none"
                                                                        required
                                                                    >
                                                                        <option value="">{t('register.select_district')}</option>
                                                                        {districts.map(d => (
                                                                            <option key={d} value={d}>
                                                                                {String(t(`districts.${d.toLowerCase().replace(/\s+/g, '_')}`, d))}
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                                                        <ChevronDown className="w-4 h-4 text-slate-400" />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5 ml-1 block">{t('register.current_station_label', { label: getStationLabel() })}</label>
                                                                <div className="relative group">
                                                                    <select
                                                                        value={registerFormData.currentStationId}
                                                                        onChange={(e) => setRegisterFormData({ ...registerFormData, currentStationId: e.target.value })}
                                                                        className="w-full pl-3.5 pr-9 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-blue-500 focus:bg-white outline-none transition-all text-sm font-medium appearance-none disabled:opacity-50"
                                                                        required
                                                                        disabled={!selectedDistrict || !selectedFieldId}
                                                                    >
                                                                        <option value="">
                                                                            {!selectedFieldId ? t('register.select_field_first') : !selectedDistrict ? t('register.select_district_first') : t('register.select_station', { label: getStationLabel() })}
                                                                        </option>
                                                                        {stations.map(s => <option key={s.id} value={s.id}>{s.name} ({s.hierarchyLevel})</option>)}
                                                                    </select>
                                                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                                                        <ChevronDown className="w-4 h-4 text-slate-400" />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-3.5">
                                                            <div>
                                                                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5 ml-1 block">{t('register.password_label')}</label>
                                                                <div className="relative group">
                                                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                                    <input
                                                                        type={showRegisterPassword ? "text" : "password"}
                                                                        value={registerFormData.password}
                                                                        onChange={(e) => setRegisterFormData({ ...registerFormData, password: e.target.value })}
                                                                        className="w-full pl-11 pr-11 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-blue-500 focus:bg-white outline-none transition-all text-sm font-medium"
                                                                        required
                                                                    />
                                                                    {registerFormData.password && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                                                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                                                                        >
                                                                            {showRegisterPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5 ml-1 block">{t('register.confirm_password_label')}</label>
                                                                <div className="relative group">
                                                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                                    <input
                                                                        type={showRegisterConfirmPassword ? "text" : "password"}
                                                                        value={registerFormData.confirmPassword}
                                                                        onChange={(e) => setRegisterFormData({ ...registerFormData, confirmPassword: e.target.value })}
                                                                        className="w-full pl-11 pr-11 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-blue-500 focus:bg-white outline-none transition-all text-sm font-medium"
                                                                        required
                                                                    />
                                                                    {registerFormData.confirmPassword && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => setShowRegisterConfirmPassword(!showRegisterConfirmPassword)}
                                                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                                                                        >
                                                                            {showRegisterConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                                    <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">{t('register.step3_title')}</h3>
                                                    <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                                                        {t('register.otp_sent_to', { phone: `+${registerFormData.phoneNumber}` })} {t('register.otp_instruction')}
                                                    </p>
                                                    <div className="space-y-3">
                                                        <div>
                                                            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5 ml-1 block">{t('register.otp_label')}</label>
                                                            <div className="relative group">
                                                                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                                <input
                                                                    type="text"
                                                                    maxLength={6}
                                                                    value={otp}
                                                                    placeholder="000000"
                                                                    onChange={(e) => setOtp(e.target.value)}
                                                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-blue-500 focus:bg-white outline-none transition-all font-medium text-center tracking-[0.5em] text-base uppercase"
                                                                    required
                                                                />
                                                            </div>
                                                            <div className="flex justify-center mt-3">
                                                                <button
                                                                    type="button"
                                                                    onClick={handleResendOtp}
                                                                    disabled={!canResend || registerLoading}
                                                                    className="text-xs font-bold text-blue-600 hover:text-blue-700 disabled:text-slate-400 transition-colors flex items-center space-x-1 cursor-pointer"
                                                                >
                                                                    <span>{t('register.resend_otp')}</span>
                                                                    {!canResend && (
                                                                        <span className="text-slate-400 font-medium ml-1">
                                                                            {t('register.resend_in', { seconds: resendTimer })}
                                                                        </span>
                                                                    )}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="pt-2 flex items-center space-x-3">
                                                {(registerStep === 2 || (registerStep === 3 && !registerLoading)) && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setRegisterStep(registerStep - 1)}
                                                        className="px-5 py-3.5 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all text-sm cursor-pointer"
                                                    >
                                                        {t('register.back')}
                                                    </button>
                                                )}
                                                <button
                                                    disabled={registerLoading}
                                                    className="grow py-3.5 bg-blue-600 text-white font-medium rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 hover:-translate-y-0.5 transition-all text-sm sm:text-base flex items-center justify-center disabled:opacity-50 disabled:translate-y-0 cursor-pointer"
                                                >
                                                    {registerLoading ? (registerStep >= 3 ? t('register.verifying') : t('register.registering')) : 
                                                     (registerStep === 1 ? t('register.next_step') : registerStep === 2 ? t('register.complete_registration') : t('register.verify_phone'))}
                                                    {!registerLoading && <ArrowRight className="ml-2" size={18} />}
                                                </button>
                                            </div>
                                        </form>

                                        <div className="mt-4 pt-3 border-t border-slate-100 text-center">
                                            <p className="text-slate-500 text-xs sm:text-sm">
                                                {t('register.already_have_account')}{' '}
                                                <Link to="/login" className="text-blue-600 font-bold hover:underline">
                                                    {t('register.sign_in')}
                                                </Link>
                                            </p>
                                        </div>
                                    </motion.div>
                                ) : (
                                    /* ---------------- LOGIN FORM ---------------- */
                                    <motion.div
                                        key="login-form-view"
                                        initial={{ opacity: 0, x: -16 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 16 }}
                                        transition={{ duration: 0.25 }}
                                        className="h-full flex flex-col justify-between"
                                    >
                                        <div>
                                            <div className="mb-4 sm:mb-5">
                                                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">{t('login.sign_in')}</h1>
                                                <p className="text-slate-500 text-xs sm:text-sm mt-0.5 sm:mt-1">{t('login.subtitle')}</p>
                                            </div>

                                            <form onSubmit={handleLogin} className="space-y-4">
                                                {loginError && (
                                                    <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-center space-x-3 text-rose-600 text-xs font-medium">
                                                        <AlertCircle size={18} />
                                                        <p>{loginError}</p>
                                                    </div>
                                                )}

                                                <div>
                                                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                                                        {t('login.nic_label')}
                                                    </label>
                                                    <div className="relative group">
                                                        <Fingerprint className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                                                        <input
                                                            type="text"
                                                            value={loginNic}
                                                            onChange={(e) => setLoginNic(e.target.value)}
                                                            placeholder="891005567V"
                                                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-900 text-sm font-medium"
                                                            required
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <div className="flex justify-between items-center mb-1.5 ml-1">
                                                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                                                            {t('login.password_label')}
                                                        </label>
                                                        {loginNic ? (
                                                            <button
                                                                type="button"
                                                                onClick={async () => {
                                                                    if (!isValidNic(loginNic)) {
                                                                        setLoginError(t('login.error_nic_required'));
                                                                        setLoginLoading(false);
                                                                        return;
                                                                    }
                                                                    try {
                                                                        await apiClient.get(`/auth/phone-hint?nic=${loginNic}`);
                                                                        navigate(`/forgot-password?nic=${loginNic}`);
                                                                    } catch (err: any) {
                                                                        setLoginError(err.response?.data?.message || t('login.error_not_registered'));
                                                                    } finally {
                                                                        setLoginLoading(false);
                                                                    }
                                                                }}
                                                                className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                                                            >
                                                                {t('login.forgot_password')}
                                                            </button>
                                                        ) : (
                                                            <span 
                                                                title={t('login.enter_nic_first', 'Enter NIC first')}
                                                                className="text-xs font-bold text-slate-300 cursor-not-allowed"
                                                            >
                                                                {t('login.forgot_password')}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="relative group">
                                                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                                                        <input
                                                            type={showLoginPassword ? "text" : "password"}
                                                            value={loginPassword}
                                                            onChange={(e) => setLoginPassword(e.target.value)}
                                                            placeholder="••••••••"
                                                            className="w-full pl-11 pr-11 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-900 text-sm font-medium"
                                                            required
                                                        />
                                                        {loginPassword && (
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowLoginPassword(!showLoginPassword)}
                                                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                                                            >
                                                                {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between pt-1">
                                                    <label className="flex items-center space-x-2 cursor-pointer group">
                                                        <div className="relative flex items-center justify-center w-4.5 h-4.5 rounded border-2 border-slate-200 bg-white group-hover:border-blue-500 transition-colors">
                                                            <input
                                                                type="checkbox"
                                                                checked={rememberMe}
                                                                onChange={(e) => setRememberMe(e.target.checked)}
                                                                className="peer sr-only"
                                                            />
                                                            <div className="hidden peer-checked:block w-2 h-2 bg-blue-600 rounded-xs"></div>
                                                        </div>
                                                        <span className="text-xs font-medium text-slate-500 group-hover:text-slate-700 transition-colors">{t('login.remember_me')}</span>
                                                    </label>
                                                </div>

                                                <button
                                                    disabled={loginLoading}
                                                    className="w-full py-3.5 bg-blue-600 text-white font-medium rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 hover:-translate-y-0.5 transition-all text-base flex items-center justify-center disabled:opacity-50 disabled:translate-y-0 cursor-pointer"
                                                >
                                                    {loginLoading ? t('login.signing_in') : t('login.sign_in')}
                                                    {!loginLoading && <ArrowRight className="ml-2" size={18} />}
                                                </button>
                                            </form>
                                        </div>

                                        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
                                            <p className="text-slate-500 text-xs sm:text-sm">
                                                {t('login.no_account')}{' '}
                                                <Link to="/register" className="text-blue-600 font-bold hover:underline">
                                                    {t('login.register_now')}
                                                </Link>
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>

                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default AuthPage;

