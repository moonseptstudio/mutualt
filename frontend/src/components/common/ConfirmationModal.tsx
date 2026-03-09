import React from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, LogOut, Info, X } from 'lucide-react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'info' | 'logout';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'info'
}) => {
    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case 'danger':
                return <AlertTriangle className="text-rose-500" size={32} />;
            case 'logout':
                return <LogOut className="text-rose-500" size={32} />;
            case 'info':
            default:
                return <Info className="text-primary-500" size={32} />;
        }
    };

    const getIconBg = () => {
        switch (type) {
            case 'danger':
            case 'logout':
                return 'bg-rose-50';
            case 'info':
            default:
                return 'bg-primary-50';
        }
    };

    const getConfirmBtnClass = () => {
        switch (type) {
            case 'danger':
            case 'logout':
                return 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20';
            case 'info':
            default:
                return 'bg-primary-600 hover:bg-primary-700 shadow-primary-600/20';
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative w-full max-w-sm bg-white rounded-[32px] shadow-2xl p-6 sm:p-8 border border-white/20 animate-in zoom-in-95 duration-300 overflow-hidden">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-all"
                >
                    <X size={18} />
                </button>

                <div className={`mx-auto w-16 h-16 ${getIconBg()} rounded-2xl flex items-center justify-center mb-6`}>
                    {getIcon()}
                </div>

                <h3 className="text-xl font-bold text-center text-slate-900 mb-2 tracking-tight">{title}</h3>
                <p className="text-slate-500 text-center text-sm mb-8 leading-relaxed px-2">
                    {message}
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs uppercase tracking-widest transition-all cursor-pointer"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`flex-1 px-4 py-3.5 ${getConfirmBtnClass()} text-white font-bold rounded-2xl text-xs uppercase tracking-widest transition-all shadow-lg cursor-pointer hover:scale-[1.02] active:scale-[0.98]`}
                    >
                        {confirmText}
                    </button>
                </div>

                {/* Decorative background glow */}
                <div className={`absolute -right-4 -top-4 w-24 h-24 ${type === 'info' ? 'bg-primary-500/5' : 'bg-rose-500/5'} rounded-full blur-2xl`}></div>
            </div>
        </div>,
        document.body
    );
};

export default ConfirmationModal;
