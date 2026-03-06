import { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import {
    Hospital,
    MapPin,
    Search,
    Plus,
    MoreHorizontal,
    Activity,
    Globe
} from 'lucide-react';
import toast from 'react-hot-toast';

const StationManagement = () => {
    const [stations, setStations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchStations = async () => {
            try {
                const url = searchTerm ? `/stations/search?name=${searchTerm}` : '/stations';
                const response = await apiClient.get(url);
                setStations(response.data);
            } catch (err) {
                console.error("Failed to fetch stations", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStations();
    }, [searchTerm]);

    return (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-semibold text-slate-950 tracking-tight leading-none">Station Registry</h1>
                    <p className="text-slate-500 mt-2 font-medium">Manage healthcare facilities and monitor transfer capacity.</p>
                </div>
                <button
                    onClick={() => toast('Register station wizard coming soon', { icon: '🏥' })}
                    className="flex items-center justify-center space-x-2 bg-slate-950 text-white px-8 py-3.5 rounded-2xl font-medium shadow-xl shadow-slate-900/20 hover:bg-primary-600 transition-all active:scale-95 text-sm cursor-pointer"
                >
                    <Plus size={18} />
                    <span>Register Station</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card rounded-[32px] p-6 border-white bg-white/60">
                    <div className="flex items-center space-x-4 mb-4">
                        <div className="p-3 bg-primary-50 text-primary-600 rounded-2xl">
                            <Globe size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider leading-none">Coverage</p>
                            <p className="text-xl font-semibold text-slate-900 mt-1">25 Districts</p>
                        </div>
                    </div>
                </div>

                <div className="glass-card rounded-[32px] p-6 border-white bg-white/60">
                    <div className="flex items-center space-x-4 mb-4">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                            <Activity size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider leading-none">Status</p>
                            <p className="text-xl font-semibold text-slate-900 mt-1">Live Environment</p>
                        </div>
                    </div>
                </div>

                <div className="glass-card rounded-[32px] p-6 border-white bg-white/60 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider leading-none">Total Units</p>
                        <p className="text-2xl font-semibold text-slate-900 mt-1">{stations.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300">
                        <Hospital size={24} />
                    </div>
                </div>
            </div>

            <div className="glass-card rounded-[40px] overflow-hidden border-white">
                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/50 backdrop-blur-md">
                    <div className="relative w-full md:w-96 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search station by name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-100 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-primary-100 transition-all outline-none shadow-sm"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-20 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-8 py-5 text-xs font-medium text-slate-400 uppercase tracking-wider">Station & District</th>
                                    <th className="px-8 py-5 text-xs font-medium text-slate-400 uppercase tracking-wider text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {stations.map((station) => (
                                    <tr key={station.id} className="group hover:bg-slate-50/50 transition-colors cursor-pointer">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-12 h-12 bg-slate-950 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-slate-900/10 group-hover:bg-primary-600 transition-colors">
                                                    <Hospital size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-900">{station.name}</p>
                                                    <div className="flex items-center space-x-2 text-slate-400 mt-1">
                                                        <MapPin size={12} />
                                                        <span className="text-xs font-bold leading-none">{station.district}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toast('Station actions coming soon', { icon: '⚙️' });
                                                }}
                                                className="p-2.5 hover:bg-slate-100 rounded-xl transition-all text-slate-400 hover:text-slate-950 cursor-pointer"
                                            >
                                                <MoreHorizontal size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {stations.length === 0 && (
                                    <tr>
                                        <td colSpan={2} className="px-8 py-20 text-center text-slate-400 font-medium">
                                            No stations found matching your search.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StationManagement;
