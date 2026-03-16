import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import apiClient from '../../api/client';
import {
    Inbox,
    Send,
    CheckCircle2,
    XCircle,
    MessageSquare,
    Phone,
    Mail,
    Clock,
    MapPin
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getAvatarUrl } from '../../api/url';

const RequestCard = ({ request, type, onAction, onMessage, hasPackage }: any) => {
    const isIncoming = type === 'incoming';
    const partnerName = isIncoming ? request.senderName : request.receiverName;
    const partnerStation = isIncoming ? request.senderStationName : request.receiverStationName;
    const partnerId = isIncoming ? request.senderId : request.receiverId;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACCEPTED': return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800';
            case 'REJECTED': return 'text-rose-500 bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-800';
            default: return 'text-amber-500 bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800';
        }
    };

    return (
        <div className="glass-card p-4 sm:p-6 rounded-2xl sm:rounded-[32px] border-[var(--border-main)] bg-[var(--bg-card)] hover:shadow-xl transition-all duration-500 group">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center space-x-3 sm:space-x-5">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-slate-100 dark:bg-slate-800 rounded-xl sm:rounded-2xl overflow-hidden border-2 border-[var(--border-main)] shadow-sm shrink-0">
                        <img src={getAvatarUrl(isIncoming ? request.senderProfileImageUrl : request.receiverProfileImageUrl, partnerName)} alt="avatar" />
                    </div>
                    <div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                            <h4 className="text-base sm:text-lg font-bold text-[var(--text-main)]">{partnerName}</h4>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(request.status)}`}>
                                {request.status}
                            </span>
                        </div>
                        <p className="text-xs text-[var(--text-muted)] font-medium flex items-center mt-1">
                            <MapPin size={12} className="mr-1 text-slate-400 dark:text-slate-500" />
                            {partnerStation}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                    {request.status === 'PENDING' && isIncoming && (
                        <>
                            <button
                                onClick={() => onAction(request.id, 'accept')}
                                className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
                            >
                                <CheckCircle2 size={16} />
                                <span>Accept</span>
                            </button>
                            <button
                                onClick={() => onAction(request.id, 'reject')}
                                className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-2.5 bg-[var(--bg-card)] border border-[var(--border-main)] text-[var(--text-muted)] hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-100 dark:hover:border-rose-800 rounded-xl font-bold text-xs transition-all cursor-pointer"
                            >
                                <XCircle size={16} />
                                <span>Decline</span>
                            </button>
                        </>
                    )}

                    {request.status === 'ACCEPTED' && (
                        <button
                            onClick={() => onMessage(partnerId)}
                            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-xs transition-all shadow-lg shadow-primary-600/20 cursor-pointer"
                        >
                            <MessageSquare size={16} />
                            <span>Message Partner</span>
                        </button>
                    )}

                    {request.status === 'PENDING' && !isIncoming && (
                        <div className="flex items-center space-x-2 px-4 py-2 bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 rounded-xl text-xs font-bold italic">
                            <Clock size={14} />
                            <span>Awaiting response...</span>
                        </div>
                    )}
                </div>
            </div>

            {request.status === 'ACCEPTED' && (
                <div className="mt-6 pt-6 border-t border-[var(--border-main)] grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    <div className="flex items-center space-x-3 p-2.5 sm:p-3 bg-[var(--bg-main)] dark:bg-[var(--bg-main)]/50 rounded-xl sm:rounded-2xl border border-[var(--border-main)]/50">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[var(--bg-card)] rounded-lg sm:rounded-xl flex items-center justify-center text-primary-500 shadow-sm border border-[var(--border-main)]">
                            <Phone size={18} />
                        </div>
                        <div>
                            <p className="text-[9px] sm:text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest leading-none mb-1">Phone Number</p>
                            <p className="text-xs sm:text-sm font-bold text-[var(--text-main)]">{hasPackage ? (request.phoneNumber || '07XXXXXXXX') : '07* *** ****'}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3 p-2.5 sm:p-3 bg-[var(--bg-main)] dark:bg-[var(--bg-main)]/50 rounded-xl sm:rounded-2xl border border-[var(--border-main)]/50">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[var(--bg-card)] rounded-lg sm:rounded-xl flex items-center justify-center text-primary-500 shadow-sm border border-[var(--border-main)]">
                            <Mail size={18} />
                        </div>
                        <div>
                            <p className="text-[9px] sm:text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest leading-none mb-1">Email Address</p>
                            <p className="text-xs sm:text-sm font-bold text-[var(--text-main)]">{hasPackage ? (request.email || 'user@example.com') : 'u***@example.com'}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const Requests = () => {
    const navigate = useNavigate();
    const { globalSearchQuery, hasPackage }: any = useOutletContext();
    const [requests, setRequests] = useState<any>({ incoming: [], outgoing: [] });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('incoming');

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/requests/me');
            setRequests(response.data);
        } catch (err) {
            console.error("Failed to fetch requests", err);
            toast.error("Failed to load requests");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleAction = async (id: number, action: 'accept' | 'reject') => {
        try {
            await apiClient.put(`/requests/${id}/${action}`);
            toast.success(`Request ${action}ed successfully!`);
            fetchRequests();
        } catch (err) {
            console.error(`Failed to ${action} request`, err);
            toast.error(`Failed to ${action} request`);
        }
    };

    const handleMessage = (partnerId: number) => {
        navigate(`/messages?partner=${partnerId}`);
    };

    const currentList = (activeTab === 'incoming' ? requests.incoming : requests.outgoing).filter((req: any) => {
        if (!globalSearchQuery) return true;
        const term = globalSearchQuery.toLowerCase();
        return (
            req.senderName?.toLowerCase().includes(term) ||
            req.receiverName?.toLowerCase().includes(term) ||
            req.senderStationName?.toLowerCase().includes(term) ||
            req.receiverStationName?.toLowerCase().includes(term) ||
            req.status?.toLowerCase().includes(term)
        );
    });

    return (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-8 pb-10">
            <div>
                <h1 className="text-2xl sm:text-4xl font-semibold text-[var(--text-main)] tracking-tight leading-tight">Match Requests</h1>
                <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-2 font-medium">Manage your incoming and outgoing transfer requests.</p>
            </div>

            <div className="flex p-1.5 bg-slate-100 dark:bg-slate-800/50 rounded-xl sm:rounded-2xl w-full sm:w-fit overflow-x-auto custom-scrollbar-hide">
                <button
                    onClick={() => setActiveTab('incoming')}
                    className={`flex items-center justify-center space-x-2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold transition-all whitespace-nowrap grow sm:grow-0 ${activeTab === 'incoming' ? 'bg-[var(--bg-card)] text-primary-600 dark:text-primary-400 shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
                >
                    <Inbox size={16} />
                    <span>Incoming ({requests.incoming.length})</span>
                </button>
                <button
                    onClick={() => setActiveTab('outgoing')}
                    className={`flex items-center justify-center space-x-2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold transition-all whitespace-nowrap grow sm:grow-0 ${activeTab === 'outgoing' ? 'bg-[var(--bg-card)] text-primary-600 dark:text-primary-400 shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
                >
                    <Send size={16} />
                    <span>Outgoing ({requests.outgoing.length})</span>
                </button>
            </div>

            <div className="space-y-4">
                {loading ? (
                    <div className="p-10 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                    </div>
                ) : currentList.length > 0 ? (
                    currentList.map((req: any) => (
                        <RequestCard
                            key={req.id}
                            request={req}
                            type={activeTab}
                            onAction={handleAction}
                            onMessage={handleMessage}
                            hasPackage={hasPackage}
                        />
                    ))
                ) : (
                    <div className="p-16 glass-card rounded-[32px] text-center border-[var(--border-main)] bg-[var(--bg-card)]">
                        <Inbox size={48} className="mx-auto text-slate-200 dark:text-slate-800 mb-4" />
                        <p className="text-[var(--text-muted)] font-medium">No {activeTab} requests found.</p>
                        <button onClick={() => navigate('/matches')} className="mt-4 text-primary-600 dark:text-primary-400 text-xs font-bold uppercase tracking-widest hover:text-primary-800 dark:hover:text-primary-300 transition-all cursor-pointer">Find Matches</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Requests;
