import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Zap, X, Activity, MapPin, Inbox, MessageSquare, Gift, Sparkles } from 'lucide-react';
import { isPromoActive } from '../../utils/promo';

interface UnlockFullAccessModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const UnlockFullAccessModal: React.FC<UnlockFullAccessModalProps> = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
    const promo = isPromoActive();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-900/60 dark:bg-black/60 dark:backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            
            {/* Modal Content */}
            <div className="relative w-full max-w-lg bg-[var(--bg-card)] rounded-[32px] shadow-2xl overflow-hidden border border-[var(--border-main)] animate-in zoom-in-95 duration-300">
                {/* Header Image/Pattern */}
                <div className={`h-32 relative overflow-hidden ${promo ? 'promo-banner-bg' : 'bg-primary-600'}`}>
                    <div className="absolute inset-0 opacity-20">
                        <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
                        <div className="absolute bottom-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                            {promo ? <Gift size={32} className="text-amber-300" /> : <Zap size={32} className="text-white" />}
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-all backdrop-blur-md"
                    >
                        <X size={18} />
                    </button>

                    {promo && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400/20 border border-amber-400/30 text-amber-300 text-[10px] font-black uppercase tracking-widest rounded-full backdrop-blur-md">
                                <Sparkles size={10} /> {t('modal.limited_offer')}
                            </span>
                        </div>
                    )}
                </div>

                <div className="p-6 sm:p-8">
                    <div className="text-center mb-8">
                        <h3 className="text-2xl font-bold text-[var(--text-main)] mb-2">
                            {promo ? t('modal.promo_title') : t('modal.unlock_title')}
                        </h3>
                        <p className="text-[var(--text-muted)] text-sm">
                            {promo
                                ? t('modal.promo_desc')
                                : t('modal.unlock_desc')
                            }
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                        {[
                            { icon: Activity, title: t('modal.feature_analytics'), desc: t('modal.feature_analytics_desc') },
                            { icon: MapPin, title: t('modal.feature_location'), desc: t('modal.feature_location_desc') },
                            { icon: Inbox, title: t('modal.feature_unlimited'), desc: t('modal.feature_unlimited_desc') },
                            { icon: MessageSquare, title: t('modal.feature_direct_msg'), desc: t('modal.feature_direct_msg_desc') }
                        ].map((feature, i) => (
                            <div key={i} className="flex flex-col space-y-2 p-4 bg-[var(--bg-main)] dark:bg-[var(--bg-main)]/50 rounded-2xl border border-[var(--border-main)]/50">
                                <div className={`p-1.5 rounded-lg self-start ${promo ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400' : 'bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400'}`}>
                                    <feature.icon size={16} />
                                </div>
                                <h4 className="text-sm font-semibold text-[var(--text-main)]">{feature.title}</h4>
                                <p className="text-xs text-[var(--text-muted)] leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col gap-3">
                        <Link 
                            to="/pricing" 
                            onClick={onClose}
                            className={`w-full py-4 text-white font-bold rounded-2xl text-sm uppercase tracking-widest text-center transition-all shadow-lg ${promo ? 'promo-banner-bg shadow-violet-500/20' : 'bg-primary-600 hover:bg-primary-700 shadow-primary-500/20'}`}
                        >
                            {promo ? t('modal.claim_free_cta') : t('modal.view_plans_cta')}
                        </Link>
                        <button 
                            onClick={onClose}
                            className="w-full py-4 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 font-bold rounded-2xl text-sm uppercase tracking-widest transition-all"
                        >
                            {t('modal.maybe_later')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default UnlockFullAccessModal;
