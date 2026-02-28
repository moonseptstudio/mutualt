import {
    Search,
    Filter,
    MoreVertical,
    CheckCircle2,
    XCircle,
    Clock,
    UserPlus,
    ArrowUpDown,
    Mail
} from 'lucide-react';

const users = [
    { id: 1, name: 'Aruna Jayawardena', email: 'aruna@hospital.gov.lk', role: 'Staff', status: 'Verified', station: 'Kandy General' },
    { id: 2, name: 'Saman Kumara', email: 'saman.k@health.lk', role: 'Admin', status: 'Pending', station: 'Colombo National' },
    { id: 3, name: 'Irangi Perera', email: 'irangi@uok.lk', role: 'Staff', status: 'Blocked', station: 'Galle Karapitiya' },
    { id: 4, name: 'Nilmini Silva', email: 'nilmini@med.lk', role: 'Staff', status: 'Verified', station: 'Kurunegala TH' },
    { id: 5, name: 'Kasun Rathnayake', email: 'kasun.r@health.lk', role: 'Staff', status: 'Verified', station: 'Anuradhapura TH' },
];

const StatusBadge = ({ status }: { status: string }) => {
    const styles: any = {
        'Verified': 'bg-emerald-50 text-emerald-600 border-emerald-100',
        'Pending': 'bg-amber-50 text-amber-600 border-amber-100',
        'Blocked': 'bg-rose-50 text-rose-600 border-rose-100'
    };

    const icons: any = {
        'Verified': <CheckCircle2 size={14} />,
        'Pending': <Clock size={14} />,
        'Blocked': <XCircle size={14} />
    };

    return (
        <span className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider border ${styles[status]}`}>
            {icons[status]}
            <span>{status}</span>
        </span>
    );
};

const UserManagement = () => {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-semibold text-slate-950 tracking-tight leading-none">User Directory</h1>
                    <p className="text-slate-500 mt-2 font-medium">Manage and verify system accounts and access levels.</p>
                </div>
                <button className="flex items-center justify-center space-x-2 bg-slate-950 text-white px-8 py-3.5 rounded-2xl font-medium shadow-xl shadow-slate-900/20 hover:bg-primary-600 transition-all active:scale-95 text-sm">
                    <UserPlus size={18} />
                    <span>Onboard User</span>
                </button>
            </div>

            <div className="glass-card rounded-[40px] overflow-hidden border border-white overflow-x-auto">
                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/50 backdrop-blur-md">
                    <div className="relative w-full md:w-96 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name, NIC or station..."
                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-4 focus:ring-primary-100 transition-all outline-none placeholder:text-slate-400"
                        />
                    </div>
                    <div className="flex items-center space-x-2">
                        <button className="flex items-center space-x-2 px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-medium text-slate-600 hover:bg-slate-50 transition-all">
                            <Filter size={16} />
                            <span>Filter</span>
                        </button>
                        <button className="flex items-center space-x-2 px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-medium text-slate-600 hover:bg-slate-50 transition-all">
                            <ArrowUpDown size={16} />
                            <span>Sort</span>
                        </button>
                    </div>
                </div>

                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50">
                            <th className="px-8 py-5 text-xs font-medium text-slate-400 uppercase tracking-wider">Profile</th>
                            <th className="px-8 py-5 text-xs font-medium text-slate-400 uppercase tracking-wider">Station Context</th>
                            <th className="px-8 py-5 text-xs font-medium text-slate-400 uppercase tracking-wider">Verification</th>
                            <th className="px-8 py-5 text-xs font-medium text-slate-400 uppercase tracking-wider">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {users.map((user) => (
                            <tr key={user.id} className="group hover:bg-slate-50/50 transition-colors cursor-pointer">
                                <td className="px-8 py-6">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 bg-linear-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center text-slate-600 font-medium border border-white shadow-sm group-hover:from-primary-50 group-hover:to-primary-100 transition-all">
                                            {user.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-900 group-hover:text-primary-600 transition-colors">{user.name}</p>
                                            <div className="flex items-center space-x-2 text-slate-400 mt-0.5">
                                                <Mail size={12} />
                                                <span className="text-xs font-medium">{user.email}</span>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <p className="text-sm font-bold text-slate-700">{user.station}</p>
                                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mt-0.5">{user.role}</p>
                                </td>
                                <td className="px-8 py-6">
                                    <StatusBadge status={user.status} />
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex items-center space-x-2">
                                        <button className="p-2.5 hover:bg-slate-200 rounded-xl transition-all text-slate-400 hover:text-slate-900">
                                            <MoreVertical size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="p-6 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-500 tracking-tight">Showing 1 to 5 of 1,240 results</p>
                    <div className="flex items-center space-x-2 font-medium text-xs uppercase tracking-wider">
                        <button className="px-4 py-2 opacity-50 cursor-not-allowed">Prev</button>
                        <div className="flex items-center space-x-1">
                            <button className="w-8 h-8 rounded-lg bg-slate-950 text-white shadow-lg">1</button>
                            <button className="w-8 h-8 rounded-lg hover:bg-slate-200 transition-all">2</button>
                            <button className="w-8 h-8 rounded-lg hover:bg-slate-200 transition-all">3</button>
                        </div>
                        <button className="px-4 py-2 hover:text-primary-600 transition-all">Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserManagement;
