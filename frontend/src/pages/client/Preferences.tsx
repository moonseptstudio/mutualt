import {
    Search,
    GripVertical,
    Trash2,
    Plus,
    Info
} from 'lucide-react';

const stations = [
    { id: 1, name: 'National Hospital of Sri Lanka', city: 'Colombo', type: 'Tertiary' },
    { id: 2, name: 'Teaching Hospital Karapitiya', city: 'Galle', type: 'Tertiary' },
    { id: 3, name: 'Teaching Hospital Kandy', city: 'Kandy', type: 'Tertiary' },
    { id: 4, name: 'Base Hospital Panadura', city: 'Panadura', type: 'Base' },
];

const Preferences = () => {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-8">
            <div>
                <h1 className="text-4xl font-semibold text-slate-950 tracking-tight leading-none">Transfer Preferences</h1>
                <p className="text-slate-500 mt-2 font-medium">Rank your target stations by priority to optimize matching.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass-card rounded-[32px] p-6 border-white bg-white/40">
                        <div className="flex items-center justify-between mb-6 px-2">
                            <h3 className="font-semibold text-slate-900 uppercase text-xs tracking-wider">Ranked Selection</h3>
                            <span className="text-xs font-bold text-slate-400">Drag to reorder</span>
                        </div>

                        <div className="space-y-3">
                            {[
                                { name: 'National Hospital Kandy', city: 'Kandy', rank: 1 },
                                { name: 'GH Matale', city: 'Matale', rank: 2 },
                                { name: 'Base Hospital Peradeniya', city: 'Peradeniya', rank: 3 }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center space-x-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm group hover:border-primary-200 transition-all cursor-grab active:cursor-grabbing">
                                    <div className="text-slate-300 group-hover:text-primary-400 transition-colors">
                                        <GripVertical size={20} />
                                    </div>
                                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center font-medium text-xs text-slate-400 group-hover:bg-primary-50 group-hover:text-primary-600 transition-all">
                                        {item.rank}
                                    </div>
                                    <div className="grow">
                                        <p className="font-semibold text-slate-900 leading-tight">{item.name}</p>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-0.5">{item.city}</p>
                                    </div>
                                    <button className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <button className="w-full mt-6 py-4 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center space-x-2 text-slate-400 hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50/50 transition-all group">
                            <Plus size={18} className="group-hover:rotate-90 transition-transform duration-500" />
                            <span className="text-sm font-medium uppercase tracking-wider">Add target station</span>
                        </button>
                    </div>

                    <div className="bg-slate-900 rounded-[32px] p-8 text-white relative overflow-hidden">
                        <div className="relative z-10 flex items-start space-x-4">
                            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md">
                                <Info size={20} className="text-primary-400" />
                            </div>
                            <div>
                                <h4 className="font-semibold tracking-tight mb-2">Priority Matching Logic</h4>
                                <p className="text-white/50 text-xs font-medium leading-relaxed max-w-md">
                                    Our algorithm prioritizes matches for your #1 ranked station. Increasing your list to 5 stations improves match probability by 40%.
                                </p>
                            </div>
                        </div>
                        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-primary-500/10 rounded-full blur-3xl"></div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="glass-card rounded-[32px] p-8 border-white">
                        <h3 className="text-lg font-semibold text-slate-900 tracking-tight mb-6">Discovery</h3>
                        <div className="relative mb-6">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search stations..."
                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-4 focus:ring-primary-100 transition-all outline-none"
                            />
                        </div>

                        <div className="space-y-4">
                            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider border-l-2 border-primary-500 pl-3">Nearby Options</p>
                            {stations.map(station => (
                                <div key={station.id} className="p-4 bg-slate-50/50 rounded-2xl border border-transparent hover:border-slate-100 hover:bg-white transition-all cursor-pointer group">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold text-slate-900 text-sm group-hover:text-primary-600 transition-colors">{station.name}</p>
                                            <p className="text-xs text-slate-400 font-medium mt-0.5">{station.city} • {station.type}</p>
                                        </div>
                                        <button className="p-1.5 bg-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-sm border border-slate-100">
                                            <Plus size={14} className="text-primary-600" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Preferences;
