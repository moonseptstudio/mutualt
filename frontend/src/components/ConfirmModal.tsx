import React from 'react';

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
            button: 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-900/10',
            border: 'border-rose-100 dark:border-rose-900/30'
        },
        warning: {
            button: 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-900/10',
            border: 'border-amber-100 dark:border-amber-900/30'
        },
        info: {
            button: 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-900/10',
            border: 'border-slate-100 dark:border-slate-800'
        }
    };

    const style = colors[type];

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-6 bg-slate-950/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className={`bg-[var(--bg-card)] rounded-[32px] w-full max-w-sm shadow-2xl border ${style.border} overflow-hidden animate-in zoom-in-95 duration-300`}>
                <div className="p-8 text-center">
                    <h2 className="text-2xl font-bold text-[var(--text-main)] mb-2">{title}</h2>
                    <p className="text-[var(--text-muted)] font-medium text-sm leading-relaxed px-2">
                        {message}
                    </p>
                </div>

                <div className="px-8 pb-8 flex flex-col space-y-3">
                    <button
                        onClick={onConfirm}
                        className={`w-full py-4 ${style.button} rounded-2xl font-bold shadow-xl transition-all active:scale-[0.98] cursor-pointer`}
                    >
                        {confirmText}
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
                    >
                        {cancelText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
