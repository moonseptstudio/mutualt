import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import {
    ArrowRight,
    Lock,
    Phone,
    KeyRound,
    AlertCircle,
    Eye,
    EyeOff,
    Check,
    CheckCircle2,
    ShieldCheck
} from 'lucide-react';
import apiClient from '../../api/client';
import { isValidNic } from '../../utils/validation';
import { useTranslation } from 'react-i18next';
import logoImg from '../../assets/logos/logo.jpg';
import loginBg from '../../assets/auth/login-bg.webp';
import NetworkMeshBackground from '../../components/hero/NetworkMeshBackground';

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

const ForgotPasswordPage = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();

    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Resend OTP countdown
    const [resendTimer, setResendTimer] = useState(0);
    const [canResend, setCanResend] = useState(false);

    // Phone hint & NIC from query string
    const [phoneHint, setPhoneHint] = useState('');
    const [nic, setNic] = useState('');

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const queryNic = queryParams.get('nic');
        if (queryNic && isValidNic(queryNic)) {
            setNic(queryNic);
            const fetchHint = async () => {
                try {
                    const res = await apiClient.get(`/auth/phone-hint?nic=${queryNic}`);
                    if (res.data.message && res.data.message !== "??") {
                        setPhoneHint(res.data.message);
                    }
                } catch (err) {
                    console.error("Failed to fetch phone hint", err);
                }
            };
            fetchHint();
        } else {
            // Redirect back to login if NIC is missing from query param
            navigate('/login');
        }
    }, [location, navigate]);

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

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const cleanPhone = phoneNumber.startsWith('94') ? phoneNumber : `94${phoneNumber}`;
        if (cleanPhone.length !== 11) {
            setError('Please enter a valid 9-digit Sri Lankan mobile number');
            setLoading(false);
            return;
        }

        try {
            await apiClient.post('/auth/forgot-password', { phoneNumber: cleanPhone });
            setStep(2);
            setResendTimer(60);
            setCanResend(false);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to send OTP. Please check the phone number.');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (!canResend) return;

        setError('');
        setLoading(true);
        const cleanPhone = phoneNumber.startsWith('94') ? phoneNumber : `94${phoneNumber}`;
        try {
            await apiClient.post('/auth/forgot-password', { phoneNumber: cleanPhone });
            setResendTimer(60);
            setCanResend(false);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to resend OTP.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (otp.length !== 6) {
            setError('Please enter the 6-digit OTP code sent to your phone');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError(t('register.error_password_mismatch') || 'Passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        const cleanPhone = phoneNumber.startsWith('94') ? phoneNumber : `94${phoneNumber}`;

        try {
            await apiClient.post('/auth/reset-password', {
                phoneNumber: cleanPhone,
                otpCode: otp,
                newPassword
            });
            setStep(3);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to reset password. Please check the OTP or try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 mesh-gradient-bg relative overflow-hidden pt-24 pb-12">
            <NetworkMeshBackground />
            <FloatingShapes />

            <motion.div 
                initial={{ opacity: 0, y: 16, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4, ease: [0.21, 0.45, 0.32, 0.9] }}
                className="w-full max-w-4xl relative z-10"
            >
                <div className="bg-white rounded-[28px] shadow-2xl shadow-blue-900/10 border border-slate-100 overflow-hidden relative">
                    <div className="flex flex-col md:flex-row items-stretch relative">

                        {/* ========================================================= */}
                        {/* FORM PANEL (Left on desktop, bottom on mobile)            */}
                        {/* ========================================================= */}
                        <div className="w-full md:w-7/12 p-5 sm:p-6 md:p-8 bg-white flex flex-col justify-between z-10 order-2 md:order-1">
                            <AnimatePresence mode="wait">
                                {step === 1 && (
                                    /* STEP 1: ENTER PHONE NUMBER */
                                    <motion.div
                                        key="step-1"
                                        initial={{ opacity: 0, x: -16 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 16 }}
                                        transition={{ duration: 0.25 }}
                                        className="h-full flex flex-col justify-between"
                                    >
                                        <div>
                                            <div className="mb-4 sm:mb-5">
                                                <div className="flex items-center justify-between mb-1.5">
                                                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
                                                        {t('forgot_password.title', 'Forgot Password')}
                                                    </h1>
                                                    {nic && (
                                                        <span className="text-[11px] font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200/60 px-2.5 py-1 rounded-lg">
                                                            NIC: {nic}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
                                                    {phoneHint 
                                                        ? t('forgot_password.subtitle_hint', { hint: phoneHint })
                                                        : t('forgot_password.subtitle_no_hint', 'Enter your registered mobile number to receive a verification OTP.')}
                                                </p>
                                            </div>

                                            <form onSubmit={handleSendOtp} className="space-y-4">
                                                {error && (
                                                    <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-center space-x-3 text-rose-600 text-xs font-medium">
                                                        <AlertCircle size={18} />
                                                        <p>{error}</p>
                                                    </div>
                                                )}

                                                <div>
                                                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                                                        {t('forgot_password.phone_label', 'Registered Mobile Number')}
                                                    </label>
                                                    <div className="relative group flex items-center">
                                                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center space-x-1.5 text-slate-400">
                                                            <Phone size={16} />
                                                            <span className="font-bold text-xs text-slate-600 border-r border-slate-200 pr-1.5">+94</span>
                                                        </div>
                                                        <input
                                                            type="tel"
                                                            value={phoneNumber.startsWith('94') ? phoneNumber.substring(2) : phoneNumber}
                                                            placeholder="7XXXXXXXX"
                                                            maxLength={9}
                                                            onChange={(e) => {
                                                                const value = e.target.value.replace(/\D/g, '');
                                                                if (value.length <= 9) {
                                                                    setPhoneNumber(value ? `94${value}` : '');
                                                                }
                                                            }}
                                                            className="w-full pl-22 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-blue-500 focus:bg-white outline-none transition-all text-sm font-medium tracking-wider text-slate-900"
                                                            required
                                                            autoFocus
                                                        />
                                                    </div>
                                                    {phoneNumber && phoneNumber.length > 2 && !phoneNumber.startsWith('947') && (
                                                        <p className="text-[11px] text-rose-500 mt-1 ml-1 font-medium">{t('register.error_mobile_start')}</p>
                                                    )}
                                                </div>

                                                <button
                                                    disabled={loading}
                                                    className="w-full py-3.5 bg-blue-600 text-white font-medium rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 hover:-translate-y-0.5 transition-all text-sm sm:text-base flex items-center justify-center disabled:opacity-50 disabled:translate-y-0 cursor-pointer"
                                                >
                                                    {loading ? t('forgot_password.btn_sending_otp', 'Sending Verification Code...') : t('forgot_password.btn_send_otp', 'Send Verification Code')}
                                                    {!loading && <ArrowRight className="ml-2" size={18} />}
                                                </button>
                                            </form>
                                        </div>

                                        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
                                            <p className="text-slate-500 text-xs sm:text-sm">
                                                {t('forgot_password.remember_pwd', 'Remember your password?')}{' '}
                                                <Link to="/login" className="text-blue-600 font-bold hover:underline">
                                                    {t('login.sign_in', 'Sign In')}
                                                </Link>
                                            </p>
                                        </div>
                                    </motion.div>
                                )}

                                {step === 2 && (
                                    /* STEP 2: VERIFY OTP & SET NEW PASSWORD */
                                    <motion.div
                                        key="step-2"
                                        initial={{ opacity: 0, x: 16 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -16 }}
                                        transition={{ duration: 0.25 }}
                                        className="h-full flex flex-col justify-between"
                                    >
                                        <div>
                                            <div className="mb-4 sm:mb-5">
                                                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
                                                    {t('forgot_password.step2_title', 'Set New Password')}
                                                </h1>
                                                <p className="text-slate-500 text-xs sm:text-sm mt-0.5 sm:mt-1 leading-relaxed">
                                                    {t('forgot_password.step2_subtitle', { phone: `+${phoneNumber}` })}
                                                </p>
                                            </div>

                                            <form onSubmit={handleResetPassword} className="space-y-3.5">
                                                {error && (
                                                    <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-center space-x-3 text-rose-600 text-xs font-medium">
                                                        <AlertCircle size={18} />
                                                        <p>{error}</p>
                                                    </div>
                                                )}

                                                {/* OTP Code */}
                                                <div>
                                                    <div className="flex items-center justify-between mb-1.5 ml-1">
                                                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                                                            {t('forgot_password.otp_label', 'Verification Code (OTP)')}
                                                        </label>
                                                        <button
                                                            type="button"
                                                            onClick={handleResendOtp}
                                                            disabled={!canResend || loading}
                                                            className="text-xs font-bold text-blue-600 hover:text-blue-700 disabled:text-slate-400 transition-colors cursor-pointer"
                                                        >
                                                            {t('register.resend_otp', 'Resend OTP')} {!canResend && t('register.resend_in', { seconds: resendTimer })}
                                                        </button>
                                                    </div>
                                                    <div className="relative group">
                                                        <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                                                        <input
                                                            type="text"
                                                            maxLength={6}
                                                            value={otp}
                                                            onChange={(e) => {
                                                                const val = e.target.value.replace(/\D/g, '');
                                                                setOtp(val);
                                                                if (val.length === 6) setError('');
                                                            }}
                                                            placeholder="000000"
                                                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-blue-500 focus:bg-white outline-none transition-all font-medium text-center tracking-[0.5em] text-base uppercase text-slate-900"
                                                            required
                                                            autoFocus
                                                        />
                                                    </div>
                                                </div>

                                                {/* Passwords in 2-column on desktop */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                                    <div>
                                                        <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                                                            {t('forgot_password.new_password_label', 'New Password')}
                                                        </label>
                                                        <div className="relative group">
                                                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                                                            <input
                                                                type={showNewPassword ? "text" : "password"}
                                                                value={newPassword}
                                                                onChange={(e) => setNewPassword(e.target.value)}
                                                                placeholder="••••••••"
                                                                className="w-full pl-11 pr-11 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-blue-500 focus:bg-white outline-none transition-all text-sm font-medium text-slate-900"
                                                                required
                                                            />
                                                            {newPassword && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                                                                >
                                                                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                                                            {t('forgot_password.confirm_password_label', 'Confirm Password')}
                                                        </label>
                                                        <div className="relative group">
                                                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                                                            <input
                                                                type={showConfirmPassword ? "text" : "password"}
                                                                value={confirmPassword}
                                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                                placeholder="••••••••"
                                                                className="w-full pl-11 pr-11 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-blue-500 focus:bg-white outline-none transition-all text-sm font-medium text-slate-900"
                                                                required
                                                            />
                                                            {confirmPassword && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                                                                >
                                                                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="pt-2 flex items-center space-x-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => setStep(1)}
                                                        className="px-5 py-3.5 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all text-sm cursor-pointer"
                                                    >
                                                        {t('register.back', 'Back')}
                                                    </button>
                                                    <button
                                                        disabled={loading || otp.length !== 6 || !newPassword || !confirmPassword}
                                                        className="grow py-3.5 bg-blue-600 text-white font-medium rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 hover:-translate-y-0.5 transition-all text-sm sm:text-base flex items-center justify-center disabled:opacity-50 disabled:translate-y-0 cursor-pointer"
                                                    >
                                                        {loading ? t('forgot_password.btn_resetting', 'Updating Password...') : t('forgot_password.btn_reset', 'Reset Password')}
                                                        {!loading && <ArrowRight className="ml-2" size={18} />}
                                                    </button>
                                                </div>
                                            </form>
                                        </div>

                                        <div className="mt-4 pt-3 border-t border-slate-100 text-center">
                                            <p className="text-slate-500 text-xs sm:text-sm">
                                                {t('forgot_password.remember_pwd', 'Remember your password?')}{' '}
                                                <Link to="/login" className="text-blue-600 font-bold hover:underline">
                                                    {t('login.sign_in', 'Sign In')}
                                                </Link>
                                            </p>
                                        </div>
                                    </motion.div>
                                )}

                                {step === 3 && (
                                    /* STEP 3: SUCCESS STATE */
                                    <motion.div
                                        key="step-3"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.35, ease: [0.21, 0.45, 0.32, 0.9] }}
                                        className="h-full flex flex-col justify-center items-center text-center py-6"
                                    >
                                        <div className="w-16 h-16 bg-emerald-50 border border-emerald-200/80 rounded-2xl flex items-center justify-center text-emerald-600 shadow-lg shadow-emerald-500/10 mb-4 animate-in zoom-in-75 duration-300">
                                            <CheckCircle2 size={32} />
                                        </div>

                                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
                                            {t('forgot_password.step3_title', 'Password Reset Successful!')}
                                        </h2>
                                        <p className="text-slate-500 text-sm max-w-sm mb-6 leading-relaxed">
                                            {t('forgot_password.step3_desc', 'Your password has been updated securely. You can now sign in with your new password.')}
                                        </p>

                                        <button
                                            onClick={() => navigate('/login')}
                                            className="w-full max-w-xs py-3.5 bg-blue-600 text-white font-medium rounded-xl shadow-lg shadow-blue-500/25 hover:bg-blue-700 hover:-translate-y-0.5 transition-all flex items-center justify-center text-sm sm:text-base cursor-pointer"
                                        >
                                            <span>{t('forgot_password.btn_proceed_login', 'Proceed to Sign In')}</span>
                                            <ArrowRight className="ml-2" size={18} />
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* ========================================================= */}
                        {/* DARK SHOWCASE PANEL (Right on desktop, top on mobile)     */}
                        {/* ========================================================= */}
                        <div className="w-full md:w-5/12 bg-slate-900 p-4 sm:p-6 md:p-8 text-white flex flex-col justify-between relative overflow-hidden z-20 shadow-xl md:shadow-2xl md:shadow-slate-950/20 group order-1 md:order-2">
                            {/* Background Image */}
                            <img 
                                src={loginBg} 
                                alt="Security Portal" 
                                className="absolute inset-0 w-full h-full object-cover object-center opacity-35 group-hover:scale-105 transition-transform duration-1000 ease-out pointer-events-none" 
                            />
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

                                <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-1 md:mb-2 leading-snug tracking-tight text-white">
                                    {t('forgot_password.sidebar_title', 'Account Recovery')}
                                </h2>
                                <p className="text-slate-300 text-xs leading-relaxed mb-2 md:mb-5">
                                    {t('forgot_password.sidebar_subtitle', 'Secure password reset via verified mobile OTP.')}
                                </p>

                                {/* Stepper Highlights - Desktop */}
                                <div className="hidden md:block space-y-2.5 bg-white/5 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-inner">
                                    {/* Step 1 indicator */}
                                    <div className={`flex items-center space-x-3 transition-all duration-300 ${step === 1 ? 'opacity-100' : step > 1 ? 'opacity-90' : 'opacity-40'}`}>
                                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                                            step > 1 
                                                ? 'bg-emerald-500/20 border border-emerald-400/40 text-emerald-400' 
                                                : step === 1 
                                                    ? 'bg-blue-600 border border-blue-400/50 text-white shadow-md shadow-blue-500/30' 
                                                    : 'bg-white/5 border border-white/10 text-slate-400'
                                        }`}>
                                            {step > 1 ? <Check size={14} className="stroke-[2.5]" /> : <Phone size={14} />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <p className="text-xs font-semibold text-slate-100">{t('forgot_password.step1_nav', 'Phone Verification')}</p>
                                                {step === 1 && (
                                                    <span className="text-[9px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-400/20">{t('common.active', 'Active')}</span>
                                                )}
                                                {step > 1 && (
                                                    <span className="text-[10px] font-bold text-emerald-400">{t('common.done', 'Done')}</span>
                                                )}
                                            </div>
                                            <p className="text-[11px] text-slate-400 truncate">
                                                {step > 1 ? t('forgot_password.step1_nav_done', 'OTP dispatched') : t('forgot_password.step1_nav_hint', 'SMS code to verified mobile')}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Step 2 indicator */}
                                    <div className={`flex items-center space-x-3 pt-2.5 border-t border-white/5 transition-all duration-300 ${step === 2 ? 'opacity-100' : step > 2 ? 'opacity-90' : 'opacity-40'}`}>
                                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                                            step > 2 
                                                ? 'bg-emerald-500/20 border border-emerald-400/40 text-emerald-400' 
                                                : step === 2 
                                                    ? 'bg-blue-600 border border-blue-400/50 text-white shadow-md shadow-blue-500/30' 
                                                    : 'bg-white/5 border border-white/10 text-slate-400'
                                        }`}>
                                            {step > 2 ? <Check size={14} className="stroke-[2.5]" /> : <Lock size={14} />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <p className="text-xs font-semibold text-slate-100">{t('forgot_password.step2_nav', 'Set New Password')}</p>
                                                {step === 2 && (
                                                    <span className="text-[9px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-400/20">{t('common.active', 'Active')}</span>
                                                )}
                                                {step > 2 && (
                                                    <span className="text-[10px] font-bold text-emerald-400">{t('common.done', 'Done')}</span>
                                                )}
                                            </div>
                                            <p className="text-[11px] text-slate-400 truncate">
                                                {step > 2 ? t('forgot_password.step2_nav_done', 'Password updated') : t('forgot_password.step2_nav_hint', 'Create strong credentials')}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Step 3 indicator */}
                                    <div className={`flex items-center space-x-3 pt-2.5 border-t border-white/5 transition-all duration-300 ${step === 3 ? 'opacity-100' : 'opacity-40'}`}>
                                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                                            step === 3 
                                                ? 'bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 shadow-md shadow-emerald-500/30' 
                                                : 'bg-white/5 border border-white/10 text-slate-400'
                                        }`}>
                                            <ShieldCheck size={14} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <p className="text-xs font-semibold text-slate-100">{t('forgot_password.step3_nav', 'Access Restored')}</p>
                                                {step === 3 && (
                                                    <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-400/20">{t('forgot_password.ready', 'Ready')}</span>
                                                )}
                                            </div>
                                            <p className="text-[11px] text-slate-400 truncate">
                                                {t('forgot_password.step3_nav_hint', 'Sign in to your dashboard')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Sidebar Footer - Desktop Only */}
                            <div className="relative z-10 mt-6 pt-4 border-t border-white/10 hidden md:flex items-center justify-between text-[11px] text-slate-400">
                                <span>{t('login.verified_network', 'Verified Network')}</span>
                                <span>{t('common.sri_lanka', 'Sri Lanka')}</span>
                            </div>
                        </div>

                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPasswordPage;
