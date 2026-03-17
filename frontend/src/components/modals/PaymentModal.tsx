import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { X, ShieldCheck, CreditCard, Lock, AlertCircle, Tag, CheckCircle2 } from 'lucide-react';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPaymentSuccess: () => void;
    packageName: string;
    price: string;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onPaymentSuccess, packageName, price }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [cardDetails, setCardDetails] = useState({
        number: '',
        expiry: '',
        cvv: ''
    });
    const [errors, setErrors] = useState({
        number: '',
        expiry: '',
        cvv: ''
    });
    const [isValid, setIsValid] = useState(false);

    // Helper functions defined inside useMemo or outside to avoid closure issues
    const cardType = useMemo(() => {
        const number = cardDetails.number.replace(/\s/g, '');
        const firstDigit = number.charAt(0);
        if (firstDigit === '4') return 'visa';
        if (firstDigit === '5') return 'mastercard';
        if (number.startsWith('34') || number.startsWith('37')) return 'amex';
        return 'unknown';
    }, [cardDetails.number]);

    const formatCardNumber = (value: string) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const matches = v.match(/\d{4,16}/g);
        const match = (matches && matches[0]) || '';
        const parts = [];

        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }

        return parts.length ? parts.join(' ') : v;
    };

    const formatExpiry = (value: string) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        if (v.length >= 2) {
            return v.substring(0, 2) + '/' + v.substring(2, 4);
        }
        return v;
    };

    const luhnCheck = useCallback((num: string) => {
        if (!num) return false;
        let arr = num.split('').reverse().map((x) => parseInt(x));
        let lastDigit = arr.splice(0, 1)[0];
        let sum = arr.reduce((acc, val, i) => 
            i % 2 !== 0 ? acc + val : acc + ((val * 2) % 9 || (val * 2 === 0 ? 0 : 9)), 0);
        sum += lastDigit;
        return sum % 10 === 0;
    }, []);

    const validateForm = useCallback(() => {
        const newErrors = { number: '', expiry: '', cvv: '' };
        let currentIsValid = true;

        // Card Number Validation
        const rawNumber = cardDetails.number.replace(/\s/g, '');
        if (rawNumber.length > 0) {
            if (rawNumber.length < 13 || rawNumber.length > 19) {
                newErrors.number = 'Invalid card length';
                currentIsValid = false;
            } else if (!luhnCheck(rawNumber)) {
                newErrors.number = 'Invalid card number';
                currentIsValid = false;
            }
        } else {
            currentIsValid = false;
        }

        // Expiry Validation
        if (cardDetails.expiry.length === 5) {
            const [month, year] = cardDetails.expiry.split('/').map(Number);
            const now = new Date();
            const currentYear = now.getFullYear() % 100;
            const currentMonth = now.getMonth() + 1;

            if (month < 1 || month > 12) {
                newErrors.expiry = 'Invalid month';
                currentIsValid = false;
            } else if (year < currentYear || (year === currentYear && month < currentMonth)) {
                newErrors.expiry = 'Card expired';
                currentIsValid = false;
            }
        } else {
            if (cardDetails.expiry.length > 0) newErrors.expiry = 'Format MM/YY';
            currentIsValid = false;
        }

        // CVV Validation
        if (cardDetails.cvv.length > 0) {
            const expectedLength = cardType === 'amex' ? 4 : 3;
            if (cardDetails.cvv.length !== expectedLength) {
                newErrors.cvv = `Must be ${expectedLength} digits`;
                currentIsValid = false;
            }
        } else {
            currentIsValid = false;
        }

        setErrors(newErrors);
        setIsValid(currentIsValid);
    }, [cardDetails, cardType, luhnCheck]);

    useEffect(() => {
        validateForm();
    }, [validateForm]);

    if (!isOpen) return null;

    const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatCardNumber(e.target.value);
        setCardDetails(prev => ({ ...prev, number: formatted.substring(0, 19) }));
    };

    const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatExpiry(e.target.value);
        setCardDetails(prev => ({ ...prev, expiry: formatted.substring(0, 5) }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isValid || isProcessing) return;
        
        setIsProcessing(true);
        setTimeout(() => {
            setIsProcessing(false);
            onPaymentSuccess();
        }, 2000);
    };

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div 
                className="absolute inset-0 bg-slate-900/60 dark:bg-black/60 dark:backdrop-blur-sm transition-opacity" 
                onClick={onClose}
            />
            
            <div className="relative w-full max-w-md bg-(--bg-card) rounded-[32px] shadow-2xl overflow-hidden border border-(--border-main) animate-in zoom-in-95 duration-300">
                <button 
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 hover:bg-(--bg-main) text-slate-400 hover:text-(--text-main) rounded-full transition-colors cursor-pointer z-10"
                >
                    <X size={20} />
                </button>

                <div className="p-8">
                    <div className="mb-8">
                        <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-4">
                            <CreditCard size={24} />
                        </div>
                        <h3 className="text-2xl font-bold text-(--text-main)">Complete Payment</h3>
                        <p className="text-(--text-muted) text-sm mt-1">Confirm your purchase details below</p>
                    </div>

                    <div className="relative p-6 bg-linear-to-br from-blue-600/10 to-violet-600/10 dark:from-blue-500/5 dark:to-violet-500/5 rounded-3xl mb-8 border border-blue-500/20 overflow-hidden group">
                        <div className="absolute top-0 left-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                            <Tag size={64} className="text-blue-600" rotate={-15} />
                        </div>
                        
                        <div className="relative z-10 space-y-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 bg-blue-100 dark:bg-blue-900/40 px-2 py-0.5 rounded-md mb-2 inline-block">
                                        Selected Plan
                                    </span>
                                    <h4 className="text-lg font-bold text-(--text-main) leading-none">{packageName}</h4>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-(--text-muted) uppercase tracking-tight mb-1">Amount to Pay</p>
                                    <div className="flex items-baseline justify-end space-x-1">
                                        <span className="text-sm font-bold text-blue-600">Rs.</span>
                                        <span className="text-3xl font-black text-(--text-main) tracking-tighter tabular-nums">{price}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="pt-3 border-t border-blue-500/10 flex items-center justify-between text-[11px]">
                                <span className="flex items-center text-slate-500 font-medium">
                                    <CheckCircle2 size={12} className="mr-1 text-green-500" />
                                    One-time payment
                                </span>
                                <span className="text-blue-600 font-bold">Secure Checkout</span>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center">
                                <label className="block text-sm font-semibold text-(--text-muted)">Card Number</label>
                                {cardType !== 'unknown' && (
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-md">
                                        {cardType}
                                    </span>
                                )}
                            </div>
                            <div className="relative">
                                <input
                                    type="text"
                                    required
                                    placeholder="0000 0000 0000 0000"
                                    className={`w-full px-4 py-3.5 bg-(--bg-main) dark:bg-(--bg-main)/50 border rounded-xl focus:ring-4 outline-none transition-all text-(--text-main) placeholder:text-slate-500 ${
                                        errors.number 
                                        ? 'border-red-500 focus:ring-red-500/10' 
                                        : 'border-(--border-main)/50 focus:ring-blue-500/10 focus:border-blue-500'
                                    }`}
                                    value={cardDetails.number}
                                    onChange={handleCardChange}
                                />
                                {errors.number ? (
                                    <AlertCircle size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500" />
                                ) : (
                                    <Lock size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                )}
                            </div>
                            {errors.number && <p className="text-[11px] text-red-500 font-medium ml-1">{errors.number}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="block text-sm font-semibold text-(--text-muted)">Expiry Date</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="MM/YY"
                                    className={`w-full px-4 py-3.5 bg-(--bg-main) dark:bg-(--bg-main)/50 border rounded-xl focus:ring-4 outline-none transition-all text-(--text-main) placeholder:text-slate-500 ${
                                        errors.expiry 
                                        ? 'border-red-500 focus:ring-red-500/10' 
                                        : 'border-(--border-main)/50 focus:ring-blue-500/10 focus:border-blue-500'
                                    }`}
                                    value={cardDetails.expiry}
                                    onChange={handleExpiryChange}
                                />
                                {errors.expiry && <p className="text-[11px] text-red-500 font-medium ml-1">{errors.expiry}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-sm font-semibold text-(--text-muted)">CVV</label>
                                <input
                                    type="password"
                                    required
                                    placeholder="***"
                                    maxLength={cardType === 'amex' ? 4 : 3}
                                    className={`w-full px-4 py-3.5 bg-(--bg-main) dark:bg-(--bg-main)/50 border rounded-xl focus:ring-4 outline-none transition-all text-(--text-main) placeholder:text-slate-500 ${
                                        errors.cvv 
                                        ? 'border-red-500 focus:ring-red-500/10' 
                                        : 'border-(--border-main)/50 focus:ring-blue-500/10 focus:border-blue-500'
                                    }`}
                                    value={cardDetails.cvv}
                                    onChange={(e) => setCardDetails(prev => ({...prev, cvv: e.target.value.replace(/\D/g, '')}))}
                                />
                                {errors.cvv && <p className="text-[11px] text-red-500 font-medium ml-1">{errors.cvv}</p>}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isProcessing || !isValid}
                            className={`w-full py-4 mt-4 text-white font-bold rounded-2xl flex items-center justify-center space-x-2 shadow-lg transition-all ${
                                isProcessing || !isValid 
                                ? 'bg-slate-400 cursor-not-allowed opacity-50' 
                                : 'bg-blue-600 hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] shadow-blue-500/20 cursor-pointer'
                            }`}
                        >
                            {isProcessing ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <div className="flex items-center space-x-2">
                                    <span>Pay Rs. {price}</span>
                                    <ShieldCheck size={18} />
                                </div>
                            )}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-xs text-slate-400 flex items-center justify-center space-x-1">
                        <Lock size={12} />
                        <span>Secure SSL Encrypted Payment</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;
