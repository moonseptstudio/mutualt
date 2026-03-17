import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    ShieldCheck,
    ArrowRight,
    Lock,
    Phone,
    KeyRound,
    AlertCircle,
    Eye,
    EyeOff
} from 'lucide-react';
import apiClient from '../../api/client';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { isValidNic } from '../../utils/validation';

const ForgotPasswordPage = () => {
    const [step, setStep] = useState(1);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    
    // Resend OTP logic
    const [resendTimer, setResendTimer] = useState(0);
    const [canResend, setCanResend] = useState(false);
    
    // Phone hint logic
    const [phoneHint, setPhoneHint] = useState('');
    const location = useLocation();

    const navigate = useNavigate();

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const nic = queryParams.get('nic');
        if (nic && isValidNic(nic)) {
            const fetchHint = async () => {
                try {
                    const res = await apiClient.get(`/auth/phone-hint?nic=${nic}`);
                    if (res.data.message !== "??") {
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
        } else {
            setCanResend(true);
            if (interval) clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [resendTimer]);

    const handleSendOtp = async (e: any) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await apiClient.post('/auth/forgot-password', { phoneNumber });
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
        try {
            await apiClient.post('/auth/forgot-password', { phoneNumber });
            setResendTimer(60);
            setCanResend(false);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to resend OTP.');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenPasswordModal = (e: any) => {
        e.preventDefault();
        if (otp.length !== 6) {
            setError("Please enter the 6-digit OTP code");
            return;
        }
        setError('');
        setIsPasswordModalOpen(true);
    };

    const handleResetPassword = async (e: any) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);
        try {
            await apiClient.post('/auth/reset-password', {
                phoneNumber: phoneNumber.startsWith('94') ? phoneNumber : `94${phoneNumber}`,
                otpCode: otp,
                newPassword
            });
            setIsPasswordModalOpen(false);
            setIsSuccessModalOpen(true);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to reset password. Please check the OTP or try again.');
            setIsPasswordModalOpen(false);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 relative overflow-hidden pt-24">
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-400 blur-[120px] rounded-full"></div>
            </div>

            <div className="w-full max-w-md relative z-10">
                <div className="bg-white rounded-[32px] shadow-2xl shadow-blue-900/10 border border-slate-100 overflow-hidden">
                    <div className="p-10 pt-12 text-center border-b border-slate-50 bg-slate-50/50">
                        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg shadow-blue-500/30">
                            <ShieldCheck size={32} className="text-white" />
                        </div>
                        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
                            {step === 1 ? 'Forgot Password' : 'Reset Password'}
                        </h1>
                        <p className="text-slate-500 text-[13px] mt-3 font-medium leading-relaxed max-w-[280px] mx-auto">
                            {step === 1 
                                ? (phoneHint 
                                    ? `Enter your registered phone number +947XXXXXX${phoneHint} to receive an OTP` 
                                    : 'Enter your registered phone number to receive an OTP')
                                : 'Enter the OTP sent to your phone and your new password'}
                        </p>
                    </div>

                    <div className="p-10">
                        <form onSubmit={step === 1 ? handleSendOtp : handleResetPassword} className="space-y-6">
                            {error && (
                                <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center space-x-3 text-rose-600 animate-in fade-in slide-in-from-top-2">
                                    <AlertCircle size={20} />
                                    <p className="text-sm font-medium">{error}</p>
                                </div>
                            )}

                            {step === 1 ? (
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 ml-1">
                                        Phone Number
                                    </label>
                                    <div className="relative group flex items-center">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center space-x-2 text-slate-400">
                                            <Phone size={18} />
                                            <span className="font-bold text-slate-600 border-r border-slate-200 pr-2">+94</span>
                                        </div>
                                        <input
                                            type="tel"
                                            value={phoneNumber.startsWith('94') ? phoneNumber.substring(2) : phoneNumber}
                                            maxLength={9}
                                            onChange={(e) => {
                                                const value = e.target.value.replace(/\D/g, '');
                                                if (value.length <= 9) {
                                                    setPhoneNumber(value ? `94${value}` : '');
                                                }
                                            }}
                                            placeholder="7XXXXXXXX"
                                            className="w-full pl-24 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-900 font-medium tracking-widest"
                                            required
                                        />
                                    </div>
                                    {phoneNumber && phoneNumber.length > 2 && !phoneNumber.startsWith('947') && (
                                        <p className="text-xs text-rose-500 mt-1 ml-1 font-medium">Mobile numbers must start with 7</p>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 ml-1">
                                            Verification Code (OTP)
                                        </label>
                                        <div className="relative group">
                                            <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                                            <input
                                                type="text"
                                                maxLength={6}
                                                value={otp}
                                                onChange={(e) => {
                                                    const value = e.target.value.replace(/\D/g, '');
                                                    setOtp(value);
                                                    if (value.length === 6) setError('');
                                                }}
                                                placeholder="000000"
                                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-900 font-bold tracking-[0.5em] text-center text-xl"
                                                required
                                            />
                                        </div>
                                        <p className="text-center text-xs text-slate-400 mt-4">
                                            We've sent a 6-digit code to <span className="font-bold text-slate-600">+{phoneNumber}</span>
                                        </p>
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
                                </>
                            )}

                            <button
                                type={step === 1 ? "submit" : "button"}
                                onClick={step === 1 ? undefined : handleOpenPasswordModal}
                                disabled={loading || (step === 2 && otp.length !== 6)}
                                className="w-full py-4 bg-blue-600 text-white font-medium rounded-2xl shadow-xl shadow-blue-500/20 hover:bg-blue-700 hover:-translate-y-0.5 transition-all text-lg flex items-center justify-center disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none"
                            >
                                {loading ? 'Processing...' : (step === 1 ? 'Send OTP' : 'Verify & Change Password')}
                                {!loading && <ArrowRight className="ml-2" size={20} />}
                            </button>
                        </form>

                        <div className="mt-10 pt-8 border-t border-slate-100 text-center">
                            <p className="text-slate-500 text-sm">
                                Remember your password? <Link to="/login" className="text-blue-600 font-bold hover:underline">Sign In</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Password Entry Modal */}
            {isPasswordModalOpen && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-white rounded-[32px] shadow-2xl p-8 space-y-6 animate-in zoom-in-95 duration-300">
                        <div className="text-center">
                            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4 mx-auto">
                                <Lock size={24} />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900">Create New Password</h2>
                            <p className="text-slate-500 text-sm mt-1">Almost there! Set your new secure password.</p>
                        </div>

                        <form onSubmit={handleResetPassword} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">New Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full pl-12 pr-12 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all font-medium"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Confirm Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all font-medium"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex space-x-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsPasswordModalOpen(false)}
                                    className="flex-1 py-4 text-slate-600 font-bold hover:bg-slate-50 rounded-2xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-2 py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all disabled:opacity-50"
                                >
                                    {loading ? 'Resetting...' : 'Change Password'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Success Modal */}
            {isSuccessModalOpen && (
                <div className="fixed inset-0 z-110 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
                    <div className="w-full max-w-sm bg-white rounded-[32px] shadow-2xl p-10 text-center space-y-6 animate-in zoom-in-95 duration-300">
                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2 animate-bounce">
                            <ShieldCheck size={40} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">Success!</h2>
                            <p className="text-slate-500 mt-2 font-medium">Your password has been reset successfully.</p>
                        </div>
                        <button
                            onClick={() => navigate('/login')}
                            className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl shadow-xl hover:bg-slate-800 transition-all"
                        >
                            Go to Login
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ForgotPasswordPage;
