import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'danger'
}) => {
    if (!isOpen) return null;

    const colors = {
        danger: {
            icon: 'bg-rose-50 text-rose-600',
            button: 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-900/10',
            border: 'border-rose-100'
        },
        warning: {
            icon: 'bg-amber-50 text-amber-600',
            button: 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-900/10',
            border: 'border-amber-100'
        },
        info: {
            icon: 'bg-slate-100 text-slate-600',
            button: 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/10',
            border: 'border-slate-100'
        }
    };

    const style = colors[type];

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className={`bg-white rounded-[32px] w-full max-w-sm shadow-2xl border ${style.border} overflow-hidden animate-in zoom-in-95 duration-300`}>
                <div className="p-8 text-center">
                    <div className={`w-16 h-16 ${style.icon} rounded-2xl flex items-center justify-center mb-6 mx-auto`}>
                        <AlertTriangle size={32} />
                    </div>
                    
                    <h2 className="text-2xl font-semibold text-slate-900 mb-2">{title}</h2>
                    <p className="text-slate-500 font-medium text-sm leading-relaxed px-2">
                        {message}
                    </p>
                </div>

                <div className="px-8 pb-8 flex flex-col space-y-3">
                    <button
                        onClick={onConfirm}
                        className={`w-full py-4 ${style.button} rounded-2xl font-bold shadow-xl transition-all active:scale-[0.98]`}
                    >
                        {confirmText}
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full py-4 bg-slate-50 text-slate-500 rounded-2xl font-bold hover:bg-slate-100 transition-all"
                    >
                        {cancelText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
