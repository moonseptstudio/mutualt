import React, { useState } from 'react';
import { X, ShieldCheck, CreditCard, Lock } from 'lucide-react';

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

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);
        
        // Simulate payment processing delay
        setTimeout(() => {
            setIsProcessing(false);
            onPaymentSuccess();
        }, 2000);
    };

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 animate-in fade-in duration-200">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-slate-900/60 dark:bg-black/60 dark:backdrop-blur-sm transition-opacity" 
                onClick={onClose}
            />
            
            {/* Modal Content */}
            <div className="relative w-full max-w-md bg-[var(--bg-card)] rounded-[32px] shadow-2xl overflow-hidden border border-[var(--border-main)] animate-in zoom-in-95 duration-300">
                <button 
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 hover:bg-[var(--bg-main)] text-slate-400 hover:text-[var(--text-main)] rounded-full transition-colors cursor-pointer z-10"
                >
                    <X size={20} />
                </button>

                <div className="p-8">
                    <div className="mb-8">
                        <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-4">
                            <CreditCard size={24} />
                        </div>
                        <h3 className="text-2xl font-bold text-[var(--text-main)]">Complete Payment</h3>
                        <p className="text-[var(--text-muted)] text-sm mt-1">Upgrade your account to {packageName}</p>
                    </div>

                    <div className="p-4 bg-[var(--bg-main)] dark:bg-[var(--bg-main)]/50 rounded-2xl mb-8 flex justify-between items-center border border-[var(--border-main)]/50">
                        <span className="text-[var(--text-muted)] font-medium">Total Amount</span>
                        <span className="text-xl font-bold text-[var(--text-main)]">Rs. {price}</span>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-[var(--text-muted)] mb-2">Card Number</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    required
                                    placeholder="0000 0000 0000 0000"
                                    className="w-full px-4 py-3.5 bg-[var(--bg-main)] dark:bg-[var(--bg-main)]/50 border border-[var(--border-main)]/50 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-[var(--text-main)] placeholder:text-slate-500"
                                    value={cardDetails.number}
                                    onChange={(e) => setCardDetails({...cardDetails, number: e.target.value})}
                                />
                                <Lock size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-[var(--text-muted)] mb-2">Expiry Date</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="MM/YY"
                                    className="w-full px-4 py-3.5 bg-[var(--bg-main)] dark:bg-[var(--bg-main)]/50 border border-[var(--border-main)] dark:border-[var(--border-main)]/50 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-[var(--text-main)] placeholder:text-slate-500"
                                    value={cardDetails.expiry}
                                    onChange={(e) => setCardDetails({...cardDetails, expiry: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-[var(--text-muted)] mb-2">CVV</label>
                                <input
                                    type="password"
                                    required
                                    placeholder="***"
                                    maxLength={3}
                                    className="w-full px-4 py-3.5 bg-[var(--bg-main)] dark:bg-[var(--bg-main)]/50 border border-[var(--border-main)] dark:border-[var(--border-main)]/50 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-[var(--text-main)] placeholder:text-slate-500"
                                    value={cardDetails.cvv}
                                    onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value})}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isProcessing}
                            className={`w-full py-4 mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl flex items-center justify-center space-x-2 shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] ${isProcessing ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
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
