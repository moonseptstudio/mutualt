import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapPin, Zap, Send, ShieldCheck, MessageSquare, Check, ChevronRight, X } from 'lucide-react';

interface UserGuideWidgetProps {
    preferences: any[];
    matches: any[];
    requests: { incoming: any[], outgoing: any[] };
    rooms: any[];
    onClose?: () => void;
}

const UserGuideWidget = ({ preferences, matches, requests, rooms, onClose }: UserGuideWidgetProps) => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const steps = [
        {
            id: 1,
            title: t('dashboard.guide.step1_title'),
            desc: t('dashboard.guide.step1_desc'),
            btnText: t('dashboard.guide.step1_btn'),
            icon: MapPin,
            completed: preferences.length > 0,
            action: () => {
                navigate('/preferences');
                onClose?.();
            },
        },
        {
            id: 2,
            title: t('dashboard.guide.step2_title'),
            desc: t('dashboard.guide.step2_desc'),
            btnText: t('dashboard.guide.step2_btn'),
            icon: Zap,
            completed: matches.length > 0 || requests.outgoing.length > 0,
            action: () => {
                navigate('/matches');
                onClose?.();
            },
        },
        {
            id: 3,
            title: t('dashboard.guide.step3_title'),
            desc: t('dashboard.guide.step3_desc'),
            btnText: t('dashboard.guide.step3_btn'),
            icon: Send,
            completed: requests.outgoing.length > 0,
            action: () => {
                navigate('/matches');
                onClose?.();
            },
        },
        {
            id: 4,
            title: t('dashboard.guide.step4_title'),
            desc: t('dashboard.guide.step4_desc'),
            btnText: t('dashboard.guide.step4_btn'),
            icon: ShieldCheck,
            completed: [...requests.incoming, ...requests.outgoing].some(r => r.status === 'ACCEPTED') || rooms.length > 0,
            action: () => {
                navigate('/requests');
                onClose?.();
            },
        },
        {
            id: 5,
            title: t('dashboard.guide.step5_title'),
            desc: t('dashboard.guide.step5_desc'),
            btnText: t('dashboard.guide.step5_btn'),
            icon: MessageSquare,
            completed: rooms.length > 0,
            action: () => {
                navigate('/messages');
                onClose?.();
            },
        }
    ];

    const completedCount = steps.filter(s => s.completed).length;
    const progressPercentage = (completedCount / steps.length) * 100;

    // Find first incomplete step
    const activeStepIndex = steps.findIndex(s => !s.completed);
    
    // If all completed, don't show the guide or show a "All done" state?
    // Often it's hidden or minimized. Let's show it fully but maybe users can dismiss it.
    // For now, we'll just render it as is.
    if (completedCount === steps.length) {
        return null; // hide completely when done to free up space
    }

    return (
        <div className="bg-slate-900 dark:bg-slate-800/80 rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl shadow-slate-900/20 mb-8 mt-4 lg:mt-0">
            {onClose && (
                <button 
                    onClick={onClose}
                    className="absolute top-6 right-6 z-20 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-all active:scale-95"
                >
                    <X size={18} />
                </button>
            )}
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-500/20 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>
            
            <div className={`relative z-10 mb-8 ${onClose ? 'pr-8' : ''}`}>
                <h3 className="text-xl font-bold text-white tracking-tight">{t('dashboard.guide.title')}</h3>
                <p className="text-sm font-medium text-white/60 mt-1">{t('dashboard.guide.subtitle')}</p>
                
                <div className="mt-6">
                    <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest mb-2">
                        <span className="text-primary-400">{completedCount} of {steps.length} {t('dashboard.guide.completed')}</span>
                        <span className="text-white/60">{Math.round(progressPercentage)}%</span>
                    </div>
                    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-linear-to-r from-primary-400 to-indigo-400 rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${progressPercentage}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            <div className="relative z-10 space-y-4">
                {steps.map((step, index) => {
                    const isActive = index === activeStepIndex;
                    const Icon = step.icon;
                    
                    if (step.completed) {
                        // Compact completed state
                        return (
                            <div key={step.id} className="flex items-center space-x-4 p-3 opacity-60">
                                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                                    <Check size={14} className="text-emerald-400" strokeWidth={3} />
                                </div>
                                <div className="grow">
                                    <p className="text-sm font-bold text-white/60 line-through decoration-white/20">{step.title}</p>
                                </div>
                            </div>
                        );
                    }

                    // Active or pending steps
                    return (
                        <div 
                            key={step.id} 
                            className={`p-5 rounded-3xl border transition-all duration-300 ${
                                isActive 
                                    ? 'bg-white/5 border-primary-500/30 shadow-lg shadow-black/20' 
                                    : 'bg-transparent border-transparent opacity-50 grayscale hover:grayscale-0 hover:bg-white/5'
                            }`}
                        >
                            <div className="flex items-start gap-4">
                                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
                                    isActive 
                                        ? 'bg-primary-500/20 text-primary-400' 
                                        : 'bg-white/10 text-white/40 group-hover:bg-white/20'
                                }`}>
                                    <Icon size={18} />
                                </div>
                                <div className="grow pt-0.5">
                                    <h4 className={`text-sm font-bold ${isActive ? 'text-white' : 'text-white/80'}`}>{step.title}</h4>
                                    {isActive && (
                                        <>
                                            <p className="text-xs text-white/60 font-medium mt-1 leading-relaxed">{step.desc}</p>
                                            <button 
                                                onClick={step.action}
                                                className="mt-4 flex items-center space-x-1.5 text-[11px] font-bold uppercase tracking-widest text-primary-400 hover:text-primary-300 transition-colors group"
                                            >
                                                <span>{step.btnText}</span>
                                                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default UserGuideWidget;

