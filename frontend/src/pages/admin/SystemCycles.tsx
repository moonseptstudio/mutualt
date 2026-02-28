import { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import {
    RefreshCw,
    ArrowRight,
    Zap,
    ShieldCheck,
    TrendingUp
} from 'lucide-react';

const CycleItem = ({ cycle, id }: any) => (
    <div className="glass-card p-10 rounded-[40px] border-white relative overflow-hidden group hover:scale-[1.01] transition-all duration-500 cursor-pointer">
        <div className="relative z-10">
            <div className="flex justify-between items-start mb-10">
                <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-primary-600 text-white rounded-2xl shadow-lg shadow-primary-900/20">
                        <RefreshCw size={20} className="animate-spin-slow" />
                    </div>
                    <div>
                        <h4 className="text-xl font-semibold text-slate-900 tracking-tight leading-none">Cycle #{id}</h4>
                        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mt-2 leading-none">Automatic Detection</p>
                    </div>
                </div>
                <div className={`px-4 py-2 rounded-xl text-[11px] font-medium uppercase tracking-wider border bg-emerald-50 text-emerald-600 border-emerald-100`}>
                    Optimal Status
                </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-12">
                <div className="flex items-center space-x-4 grow">
                    {cycle.participants.map((p: any, i: number) => (
                        <div key={i} className="flex items-center space-x-4 shrink-0">
                            <div className="relative">
                                <div className="w-16 h-16 bg-slate-50 rounded-[22px] border-2 border-white shadow-md overflow-hidden p-0.5">
                                    <div className="w-full h-full bg-linear-to-br from-slate-100 to-slate-200 rounded-[20px] flex items-center justify-center font-medium text-slate-400">
                                        {p.name[0]}
                                    </div>
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-lg shadow-sm flex items-center justify-center text-xs font-semibold text-slate-900 border border-slate-100">
                                    {i + 1}
                                </div>
                            </div>
                            {i < cycle.participants.length - 1 && (
                                <div className="p-2 bg-slate-50 rounded-xl text-slate-300">
                                    <ArrowRight size={20} />
                                </div>
                            )}
                        </div>
                    ))}
                    <div className="p-2 bg-slate-50 rounded-xl text-slate-300">
                        <RefreshCw size={20} className="rotate-45" />
                    </div>
                </div>

                <div className="flex items-center space-x-10 shrink-0">
                    <div className="text-right">
                        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1 leading-none">Complexity</p>
                        <p className="text-2xl font-semibold text-slate-900 leading-none">{cycle.type}</p>
                    </div>
                    <div className="w-px h-12 bg-slate-100"></div>
                    <button className="flex items-center space-x-3 bg-slate-950 text-white px-8 py-4 rounded-2xl font-medium hover:bg-primary-600 transition-all shadow-xl shadow-slate-950/10 active:scale-95 text-xs uppercase tracking-wider">
                        <span>Close Loop</span>
                        <Zap size={16} fill="currentColor" />
                    </button>
                </div>
            </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full opacity-40 translate-x-1/2 -translate-y-1/2 blur-3xl pointer-events-none"></div>
    </div>
);

const SystemCycles = () => {
    const [cycles, setCycles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCycles = async () => {
            try {
                const response = await apiClient.get('/matches/all');
                setCycles(response.data);
            } catch (err) {
                console.error("Failed to fetch system cycles", err);
            } finally {
                setLoading(false);
            }
        };
        fetchCycles();
    }, []);

    return (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-semibold text-slate-950 tracking-tight leading-none">Detection Engine</h1>
                    <p className="text-slate-500 mt-2 font-medium">Complex transfer cycles and multi-way replacement matching.</p>
                </div>
                <div className="flex items-center space-x-4">
                    <button className="flex items-center justify-center space-x-2 bg-white border border-slate-200 text-slate-950 px-6 py-3.5 rounded-2xl font-medium shadow-sm hover:bg-slate-50 transition-all text-xs uppercase tracking-wider">
                        <TrendingUp size={18} className="text-primary-600" />
                        <span>Efficiency Report</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3 space-y-6">
                    {loading ? (
                        <div className="p-20 text-center glass-card rounded-[40px]">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                        </div>
                    ) : cycles.length > 0 ? (
                        cycles.map((c, i) => <CycleItem key={i} cycle={c} id={1024 + i} />)
                    ) : (
                        <div className="p-20 text-center glass-card rounded-[40px]">
                            <p className="text-slate-500 font-medium">No cycles detected in the system yet.</p>
                        </div>
                    )}
                </div>

                <div className="space-y-8">
                    <div className="premium-gradient rounded-[40px] p-8 text-white relative flex flex-col justify-between shadow-2xl shadow-slate-900/40">
                        <div className="relative z-10">
                            <div className="flex items-center space-x-3 mb-8">
                                <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md border border-white/20">
                                    <ShieldCheck size={24} className="text-primary-400" />
                                </div>
                                <span className="text-xs font-medium tracking-wider uppercase opacity-60 leading-none">Safety Filter</span>
                            </div>
                            <h2 className="text-2xl font-medium mb-4 tracking-tight leading-tight">Biometric Consensus</h2>
                            <p className="text-white/60 text-xs font-medium leading-relaxed mb-10">
                                All multi-way cycles require verification before administrative approval.
                            </p>
                        </div>
                        <div className="absolute top-1/2 right-0 w-32 h-32 bg-primary-600/10 rounded-full blur-2xl -translate-y-1/2 pointer-events-none"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SystemCycles;
