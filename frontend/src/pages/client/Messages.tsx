import { useState, useEffect, useRef } from 'react';
import { useLocation, useOutletContext } from 'react-router-dom';
import apiClient from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import {
    Send,
    User,
    Users,
    Phone,
    Mail,
    ChevronLeft,
    Search,
    MoreVertical,
    CheckCheck,
    Loader2,
    MessageSquare
} from 'lucide-react';
import toast from 'react-hot-toast';

const Messages = () => {
    const { user } = useAuth();
    const location = useLocation();
    const { globalSearchQuery }: any = useOutletContext();
    const scrollRef = useRef<HTMLDivElement>(null);

    const [activeRoomId, setActiveRoomId] = useState<number | null>(null);
    const [rooms, setRooms] = useState<any[]>([]);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [loadingRooms, setLoadingRooms] = useState(true);
    const [activeRoom, setActiveRoom] = useState<any>(null);
    const prevMessageCount = useRef<number>(0);
    const currentRoomIdRef = useRef<number | null>(null);

    const fetchRooms = async () => {
        try {
            setLoadingRooms(true);
            const response = await apiClient.get('/messages/rooms');
            setRooms(response.data);

            const params = new URLSearchParams(location.search);
            const roomIdParam = params.get('room');
            if (roomIdParam) {
                setActiveRoomId(Number(roomIdParam));
            } else if (!activeRoomId && response.data.length > 0) {
                setActiveRoomId(response.data[0].id);
            }
        } catch (err) {
            console.error("Failed to load chat rooms", err);
            toast.error("Failed to load conversations");
        } finally {
            setLoadingRooms(false);
        }
    };

    useEffect(() => {
        fetchRooms();
    }, [user?.id, location.search]);

    useEffect(() => {
        if (!activeRoomId) return;

        const isRoomSwitch = currentRoomIdRef.current !== activeRoomId;
        if (isRoomSwitch) {
            setMessages([]);
            prevMessageCount.current = 0;
            currentRoomIdRef.current = activeRoomId;
        }

        const fetchHistory = async (isBackground = false) => {
            try {
                // Only show history loader when switching rooms
                if (!isBackground && isRoomSwitch) {
                    setLoadingHistory(true);
                }

                const response = await apiClient.get(`/messages/history/${activeRoomId}`);

                // Only update state if data actually changed to avoid unnecessary re-renders
                // BUT preserve messages that are currently being sent (optimistic UI)
                const newMessages = response.data;
                setMessages(prev => {
                    const sendingMessages = prev.filter(m => (m as any).sending);
                    // Combine server messages with local "sending" messages
                    const combined = [...newMessages, ...sendingMessages];

                    if (JSON.stringify(prev) === JSON.stringify(combined)) return prev;
                    return combined;
                });

                const room = rooms.find(r => r.id === activeRoomId);
                setActiveRoom(room);
            } catch (err) {
                console.error("Failed to fetch history", err);
            } finally {
                setLoadingHistory(false);
            }
        };

        fetchHistory();
        const interval = setInterval(() => fetchHistory(true), 5000); // Polling (background)
        return () => clearInterval(interval);
    }, [activeRoomId, rooms]);

    useEffect(() => {
        if (scrollRef.current && messages.length > 0) {
            const hasNewMessages = messages.length > prevMessageCount.current;
            const container = scrollRef.current;

            // Smart scroll: scroll to bottom if it's initial load or user is already near bottom
            const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;

            if (prevMessageCount.current === 0 || (hasNewMessages && isNearBottom)) {
                container.scrollTop = container.scrollHeight;
            }

            prevMessageCount.current = messages.length;
        }
    }, [messages]);

    const handleSendMessage = async (e: any) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeRoomId) return;

        const content = newMessage.trim();
        const tempId = `temp-${Date.now()}`;

        // Optimistic message object for immediate UI update
        const optimisticMsg = {
            id: tempId,
            content: content,
            senderId: user?.id,
            senderName: user?.fullName || user?.username,
            createdAt: new Date().toISOString(),
            isRead: false,
            sending: true
        };

        setNewMessage('');
        // Append optimistic message locally
        setMessages(prev => [...prev, optimisticMsg]);

        try {
            const response = await apiClient.post('/messages', {
                roomId: activeRoomId,
                content: content
            });

            // Replace the optimistic message with the actual message from server
            setMessages(prev => prev.map(m => m.id === tempId ? response.data : m));
        } catch (err) {
            console.error("Failed to send message", err);
            toast.error("Message failed to send");
            // Remove the optimistic message on failure
            setMessages(prev => prev.filter(m => m.id !== tempId));
            // Restore the message in input so user can try again
            setNewMessage(content);
        }
    };

    // Get partners (members excluding current user)
    const partners = activeRoom?.members?.filter((m: any) => m.id !== user?.id) || [];

    return (
        <div className="h-[calc(100vh-180px)] glass-card rounded-[32px] overflow-hidden flex animate-in fade-in slide-in-from-bottom-8 duration-700 bg-white/40 border-white">
            <div className={`w-full md:w-80 border-r border-slate-100 flex flex-col bg-white/60 backdrop-blur-xl ${activeRoomId ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-6 border-b border-slate-100">
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">Messages</h3>
                    <div className="mt-4 relative group">
                        <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search chats..."
                            className="w-full bg-slate-100/50 border-none rounded-2xl py-2.5 pl-10 pr-4 text-xs font-medium focus:ring-2 focus:ring-primary-500/20 transition-all"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {loadingRooms ? (
                        <div className="flex items-center justify-center h-20">
                            <Loader2 className="animate-spin text-primary-500" size={24} />
                        </div>
                    ) : rooms.length > 0 ? (
                        rooms.filter((room: any) => {
                            if (!globalSearchQuery) return true;
                            const term = globalSearchQuery.toLowerCase();
                            return room.members.some((m: any) => m.name?.toLowerCase().includes(term));
                        }).map((room) => {
                            const partner = room.members.find((m: any) => m.id !== user?.id) || room.members[0];
                            return (
                                <button
                                    key={room.id}
                                    onClick={() => setActiveRoomId(room.id)}
                                    className={`w-full p-5 flex items-center space-x-4 transition-all border-b border-slate-50/50 hover:bg-white ${activeRoomId === room.id ? 'bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] z-10' : ''}`}
                                >
                                    <div className="relative">
                                        <div className="w-12 h-12 bg-slate-100 rounded-2xl overflow-hidden border border-white shadow-sm flex items-center justify-center">
                                            {room.type === 'GROUP' ? (
                                                <Users size={20} className="text-primary-500" />
                                            ) : (
                                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${partner.name}`} alt="avatar" />
                                            )}
                                        </div>
                                        {room.type !== 'GROUP' && (
                                            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white shadow-sm"></div>
                                        )}
                                    </div>
                                    <div className="text-left flex-1 min-w-0">
                                        <h4 className="font-bold text-slate-900 text-sm truncate">
                                            {room.type === 'GROUP' ? 'Match Group Chat' : partner.name}
                                        </h4>
                                        <p className="text-[10px] text-slate-500 font-medium truncate mt-0.5">
                                            {room.type === 'GROUP' ? `${room.members.length} participants` : partner.email}
                                        </p>
                                    </div>
                                </button>
                            );
                        })
                    ) : (
                        <div className="p-10 text-center">
                            <User size={32} className="mx-auto text-slate-200 mb-3" />
                            <p className="text-xs text-slate-500 font-medium">No active chats yet.</p>
                        </div>
                    )}
                </div>
            </div>

            {activeRoomId ? (
                <div className="flex-1 flex flex-col bg-white/40">
                    <div className="p-5 flex items-center justify-between border-b border-slate-100 bg-white/80 backdrop-blur-xl z-20">
                        <div className="flex items-center space-x-4 max-w-[80%]">
                            <button onClick={() => setActiveRoomId(null)} className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-full">
                                <ChevronLeft size={20} />
                            </button>
                            <div className="flex items-center space-x-3 overflow-hidden">
                                <div className="w-10 h-10 bg-slate-100 rounded-[14px] overflow-hidden border border-white flex items-center justify-center shrink-0">
                                    {activeRoom?.type === 'GROUP' ? (
                                        <Users size={18} className="text-primary-500" />
                                    ) : (
                                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${partners[0]?.name}`} alt="avatar" />
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <h4 className="font-bold text-slate-900 text-base tracking-tight leading-none truncate">
                                        {activeRoom?.type === 'GROUP' ? 'Transfer Group Chat' : partners[0]?.name}
                                    </h4>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {partners.map((p: any) => (
                                            <div key={p.id} className="flex items-center space-x-2 bg-slate-100/50 p-1.5 pr-3 rounded-lg border border-white/50">
                                                <div className="flex flex-col">
                                                    <div className="flex items-center space-x-2 mt-1">
                                                        <span className="flex items-center text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1 py-0.5 rounded leading-none">
                                                            <Phone size={10} className="mr-0.5" /> {p.phoneNumber}
                                                        </span>
                                                        <span className="flex items-center text-[10px] text-primary-600 font-bold bg-primary-50 px-1 py-0.5 rounded leading-none">
                                                            <Mail size={10} className="mr-0.5" /> {p.email}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all">
                            <MoreVertical size={20} />
                        </button>
                    </div>

                    <div
                        ref={scrollRef}
                        className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar scroll-smooth"
                    >
                        {loadingHistory ? (
                            <div className="flex items-center justify-center h-full opacity-50">
                                <Loader2 className="animate-spin text-primary-500" />
                            </div>
                        ) : messages.length > 0 ? (
                            messages.map((msg, idx) => {
                                const isMe = msg.senderId === user?.id;
                                return (
                                    <div key={msg.id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'} ${(msg as any).sending ? 'opacity-60 grayscale-[0.5]' : ''}`}>
                                        <div className={`flex flex-col max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}>
                                            {!isMe && activeRoom?.type === 'GROUP' && (
                                                <span className="text-[9px] font-bold text-slate-400 mb-1 ml-2 uppercase tracking-widest">{msg.senderName}</span>
                                            )}
                                            <div className={`px-5 py-3.5 rounded-3xl text-sm font-medium shadow-sm transition-all animate-in zoom-in-95 duration-200 ${isMe
                                                ? 'bg-primary-600 text-white rounded-tr-none'
                                                : 'bg-white text-slate-800 rounded-tl-none border border-slate-50'
                                                }`}>
                                                {msg.content}
                                            </div>
                                            <div className="flex items-center mt-1.5 space-x-1 px-1 opacity-40">
                                                <span className="text-[9px] font-bold uppercase tracking-widest">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                {isMe && !((msg as any).sending) && <CheckCheck size={10} />}
                                                {isMe && (msg as any).sending && <Loader2 size={10} className="animate-spin" />}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full p-10 text-center">
                                <div className="w-16 h-16 bg-primary-50 rounded-3xl flex items-center justify-center text-primary-500 mb-4 animate-bounce-slow">
                                    <MessageSquare size={32} />
                                </div>
                                <h5 className="font-bold text-slate-900">Say hello!</h5>
                                <p className="text-xs text-slate-500 mt-1">Start your conversation in {activeRoom?.type === 'GROUP' ? 'the group' : partners[0]?.name}</p>
                            </div>
                        )}
                    </div>

                    <form onSubmit={handleSendMessage} className="p-5 border-t border-slate-100 bg-white/80 backdrop-blur-xl">
                        <div className="flex items-center space-x-3">
                            <div className="grow relative">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type your message here..."
                                    className="w-full bg-slate-100/80 border-none rounded-2xl py-4 px-6 text-sm font-semibold focus:ring-4 focus:ring-primary-500/10 placeholder:text-slate-400 transition-all pr-12"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={!newMessage.trim()}
                                className="p-4 bg-primary-600 text-white rounded-2xl shadow-lg shadow-primary-600/30 hover:bg-primary-500 active:scale-95 disabled:opacity-50 disabled:active:scale-100 transition-all cursor-pointer"
                            >
                                <Send size={20} />
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-12 bg-white/20">
                    <div className="p-8 bg-white/80 rounded-[40px] shadow-2xl shadow-slate-900/5 text-center max-w-sm border border-white">
                        <div className="w-20 h-20 bg-primary-50 rounded-[28px] flex items-center justify-center text-primary-500 mx-auto mb-6">
                            <MessageSquare size={40} />
                        </div>
                        <h4 className="text-xl font-bold text-slate-900 tracking-tight">Select a conversation</h4>
                        <p className="text-sm text-slate-500 font-medium mt-2">
                            Connect with transfer partners to discuss your mutual transfer arrangements.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Messages;
