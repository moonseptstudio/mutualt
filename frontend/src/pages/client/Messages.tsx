import { useState, useEffect, useRef } from 'react';
import { useLocation, useOutletContext, useSearchParams } from 'react-router-dom';
import apiClient from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import {
    Send,
    User,
    Users,
    ChevronLeft,
    Search,
    MoreVertical,
    CheckCheck,
    Check,
    Loader2,
    MessageSquare
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Client } from '@stomp/stompjs';
import { formatDistanceToNow } from 'date-fns';
import { getAvatarUrl } from '../../api/url';



const Messages = () => {
    const { user } = useAuth();
    const location = useLocation();
    const { globalSearchQuery, hasPackage }: any = useOutletContext();
    const scrollRef = useRef<HTMLDivElement>(null);

    const [searchParams, setSearchParams] = useSearchParams();
    const activeRoomId = searchParams.get('room') ? Number(searchParams.get('room')) : null;

    const setActiveRoomId = (id: number | null) => {
        if (id) {
            setSearchParams({ room: id.toString() });
        } else {
            const newParams = new URLSearchParams(searchParams);
            newParams.delete('room');
            setSearchParams(newParams);
        }
    };

    const [rooms, setRooms] = useState<any[]>([]);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [loadingRooms, setLoadingRooms] = useState(true);
    const [activeRoom, setActiveRoom] = useState<any>(null);
    const prevMessageCount = useRef<number>(0);
    const currentRoomIdRef = useRef<number | null>(null);
    const stompClientRef = useRef<Client | null>(null);
    const [refreshTime, setRefreshTime] = useState(Date.now());
    const [sidebarSearchQuery, setSidebarSearchQuery] = useState('');

    // Force re-render relative times every minute
    useEffect(() => {
        const interval = setInterval(() => {
            setRefreshTime(Date.now());
        }, 60000);
        return () => clearInterval(interval);
    }, []);

    const fetchRooms = async (isBackground = false) => {
        try {
            if (!isBackground && rooms.length === 0) setLoadingRooms(true);
            const response = await apiClient.get('/messages/rooms');
            
            setRooms(prevRooms => {
                // Only update if there's an actual change to prevent unnecessary re-renders
                if (JSON.stringify(prevRooms) !== JSON.stringify(response.data)) {
                    return response.data;
                }
                return prevRooms;
            });

            if (!searchParams.get('room') && !isBackground && response.data.length > 0) {
                // Only auto-select first room on initial load if no room in URL and not a background update
                setActiveRoomId(response.data[0].id);
            }
        } catch (err) {
            console.error("Failed to load chat rooms", err);
            if (!isBackground) toast.error("Failed to load conversations");
        } finally {
            if (!isBackground) setLoadingRooms(false);
        }
    };

    useEffect(() => {
        if (!user?.id) return;
        
        fetchRooms();
        
        // Poll for room updates (including online status) every 30 seconds
        const interval = setInterval(() => {
            fetchRooms(true);
        }, 30000);
        
        return () => clearInterval(interval);
    }, [user?.id, location.search]);

    useEffect(() => {
        if (!activeRoomId) return;

        const isRoomSwitch = currentRoomIdRef.current !== activeRoomId;
        if (isRoomSwitch) {
            // Don't clear messages immediately to avoid jumpy UI
            // unless the new ID is totally different
            if (!currentRoomIdRef.current) {
                setMessages([]);
            }
            prevMessageCount.current = 0;
            currentRoomIdRef.current = activeRoomId;
        }

        const fetchHistory = async () => {
            try {
                if (isRoomSwitch) {
                    setLoadingHistory(true);
                }

                const response = await apiClient.get(`/messages/history/${activeRoomId}`);

                const newMessages = response.data;
                setMessages(prev => {
                    const sendingMessages = prev.filter(m => (m as any).sending);
                    return [...newMessages, ...sendingMessages];
                });

                const room = rooms.find(r => r.id === activeRoomId);
                if (room) setActiveRoom(room);
                
                // Immediate scroll attempt after setting messages
                setTimeout(() => {
                    if (scrollRef.current) {
                        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
                    }
                }, 100);
            } catch (err) {
                console.error("Failed to fetch history", err);
            } finally {
                setLoadingHistory(false);
            }
        };

        fetchHistory();

        // WebSocket Connection using native Browser WebSocket (more stable in ESM/Vite)
        const client = new Client({
            brokerURL: 'ws://localhost:8080/ws',
            debug: (str) => console.log('STOMP: ' + str),
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        client.onConnect = (frame) => {
            console.log('Connected: ' + frame);
            client.subscribe(`/topic/room/${activeRoomId}`, (message) => {
                const receivedMsg = JSON.parse(message.body);
                setMessages(prev => {
                    // Update existing message if it's a read receipt or from sending
                    const existingIdx = prev.findIndex(m => m.id === receivedMsg.id || ((m as any).sending && m.content === receivedMsg.content));

                    if (existingIdx !== -1) {
                        const newMessages = [...prev];
                        newMessages[existingIdx] = receivedMsg;
                        return newMessages;
                    }

                    return [...prev, receivedMsg];
                });
            });
        };

        client.onStompError = (frame) => {
            console.error('Broker reported error: ' + frame.headers['message']);
            console.error('Additional details: ' + frame.body);
        };

        client.activate();
        stompClientRef.current = client;

        return () => {
            if (stompClientRef.current) {
                stompClientRef.current.deactivate();
            }
        };
    }, [activeRoomId, user?.id]);

    // Keep activeRoom in sync with rooms array
    useEffect(() => {
        if (activeRoomId && rooms.length > 0) {
            const room = rooms.find(r => r.id === activeRoomId);
            if (room && JSON.stringify(room) !== JSON.stringify(activeRoom)) {
                setActiveRoom(room);
            }
        }
    }, [rooms, activeRoomId]);

    useEffect(() => {
        if (scrollRef.current && messages.length > 0) {
            const hasNewMessages = messages.length > prevMessageCount.current;
            const container = scrollRef.current;

            // Smart scroll: scroll to bottom if it's initial load or user is already near bottom
            const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 150;

            if (prevMessageCount.current === 0 || (hasNewMessages && isNearBottom)) {
                // Use requestAnimationFrame for smoother scrolling
                requestAnimationFrame(() => {
                    if (scrollRef.current) {
                        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
                    }
                });
            }

            prevMessageCount.current = messages.length;

            // Mark unread messages as read
            const unreadMessages = messages.filter(m => !(m.isRead || m.read) && m.senderId !== user?.id && !m.sending);
            if (unreadMessages.length > 0 && activeRoomId) {
                apiClient.post('/messages/read', { roomId: activeRoomId }).catch(console.error);
                // Optimistically mark as read locally
                setMessages(prev => prev.map(m => (!(m.isRead || m.read) && m.senderId !== user?.id && !m.sending) ? { ...m, isRead: true, read: true } : m));
            }
        }
    }, [messages, activeRoomId, user?.id]);

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
        <div data-refresh={refreshTime} className="h-[calc(100vh-140px)] sm:h-[calc(100vh-180px)] glass-card rounded-2xl sm:rounded-[32px] overflow-hidden flex animate-in fade-in slide-in-from-bottom-8 duration-700 bg-[var(--bg-card)] dark:bg-[var(--bg-card)]/40 border border-[var(--border-main)]">
            <div className={`w-full md:w-80 border-r border-[var(--border-main)] flex flex-col bg-[var(--bg-card)] dark:bg-[var(--bg-card)]/60 dark:backdrop-blur-xl ${activeRoomId ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 sm:p-6 border-b border-[var(--border-main)]">
                    <h3 className="text-lg sm:text-xl font-bold text-[var(--text-main)] tracking-tight">Messages</h3>
                    <div className="mt-3 sm:mt-4 relative group">
                        <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search chats..."
                            value={sidebarSearchQuery}
                            onChange={(e) => setSidebarSearchQuery(e.target.value)}
                            className="w-full bg-slate-100 dark:bg-slate-800/50 border-none rounded-xl sm:rounded-2xl py-2 sm:py-2.5 pl-10 pr-4 text-xs font-medium focus:ring-2 focus:ring-primary-500/20 text-[var(--text-main)] transition-all"
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
                            const term = (sidebarSearchQuery || globalSearchQuery || '').toLowerCase();
                            if (!term) return true;
                            
                            // Search room name
                            if (room.name?.toLowerCase().includes(term)) return true;
                            
                            // Search member names
                            return room.members.some((m: any) => {
                                const displayName = m.name;
                                return displayName.toLowerCase().includes(term);
                            });
                        }).map((room) => {
                            const partner = room.members.find((m: any) => m.id !== user?.id) || room.members[0];
                            return (
                                <button
                                    key={room.id}
                                    onClick={() => setActiveRoomId(room.id)}
                                    className={`w-full p-4 sm:p-5 flex items-center space-x-3 sm:space-x-4 transition-all border-b border-[var(--border-main)]/50 hover:bg-[var(--bg-main)]/30 ${activeRoomId === room.id ? 'bg-[var(--bg-main)] shadow-[0_8px_30px_rgb(0,0,0,0.04)] z-10' : ''}`}
                                >
                                    <div className="relative">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-100 dark:bg-slate-800 rounded-xl sm:rounded-2xl overflow-hidden border border-[var(--border-main)] shadow-sm flex items-center justify-center">
                                            {room.type === 'GROUP' ? (
                                                <Users size={20} className="text-primary-500" />
                                            ) : (
                                                <img src={getAvatarUrl(partner.avatar, partner.name)} alt="avatar" />
                                            )}
                                        </div>
                                        {room.type !== 'GROUP' && partner.lastSeen && (new Date().getTime() - new Date(partner.lastSeen).getTime() < 5 * 60 * 1000) && (
                                            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-[var(--bg-card)] shadow-sm"></div>
                                        )}
                                    </div>
                                    <div className="text-left flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline">
                                            <h4 className="font-bold text-[var(--text-main)] text-sm truncate">
                                                {room.type === 'GROUP' ? 'Match Group Chat' : partner.name}
                                            </h4>
                                            {room.lastMessage && (
                                                <span className="text-[9px] text-[var(--text-muted)] shrink-0 ml-2 font-medium">
                                                    {new Date(room.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between mt-0.5">
                                            <p className="text-[10px] text-[var(--text-muted)] font-medium truncate shrink">
                                                {room.type === 'GROUP' ? `${room.members.length} participants` : (
                                                    partner.lastSeen
                                                        ? ((new Date().getTime() - new Date(partner.lastSeen).getTime()) < 5 * 60 * 1000 ? <span className="text-emerald-500">Online</span> : `Last seen: ${formatDistanceToNow(new Date(partner.lastSeen), { addSuffix: true })}`)
                                                        : 'Offline'
                                                )}
                                            </p>
                                            {room.unreadCount > 0 && (
                                                <span className="bg-primary-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center ml-2">
                                                    {room.unreadCount}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            );
                        })
                    ) : (
                        <div className="p-10 text-center">
                            <User size={32} className="mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                            <p className="text-xs text-[var(--text-muted)] font-medium">No active chats yet.</p>
                        </div>
                    )}
                </div>
            </div>

            {activeRoomId ? (
                <div className="flex-1 flex flex-col bg-[var(--bg-main)] dark:bg-[var(--bg-main)]/40">
                    <div className="p-3 sm:p-5 flex items-center justify-between border-b border-[var(--border-main)] bg-[var(--bg-card)] dark:bg-[var(--bg-card)]/80 dark:backdrop-blur-xl z-20">
                        <div className="flex items-center space-x-2 sm:space-x-4 max-w-full">
                            <button onClick={() => setActiveRoomId(null)} className="md:hidden p-2 text-slate-500 hover:bg-[var(--bg-main)] rounded-xl">
                                <ChevronLeft size={20} />
                            </button>
                            <div className="flex items-center space-x-2 sm:space-x-3 overflow-hidden">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-100 dark:bg-slate-800 rounded-lg sm:rounded-[14px] overflow-hidden border border-[var(--border-main)] flex items-center justify-center shrink-0">
                                    {activeRoom?.type === 'GROUP' ? (
                                        <Users size={18} className="text-primary-500" />
                                    ) : (
                                        <img src={getAvatarUrl(partners[0]?.avatar, partners[0]?.name)} alt="avatar" />
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <h4 className="font-bold text-[var(--text-main)] text-base tracking-tight leading-none truncate">
                                        {activeRoom?.type === 'GROUP' ? 'Transfer Group Chat' : partners[0]?.name}
                                    </h4>
                                    <p className="text-[10px] text-[var(--text-muted)] font-medium truncate mt-1">
                                        {activeRoom?.type !== 'GROUP' && partners[0]?.lastSeen && (
                                            (new Date().getTime() - new Date(partners[0].lastSeen).getTime()) < 5 * 60 * 1000
                                                ? <span className="text-emerald-500">Online</span>
                                                : `Last seen ${formatDistanceToNow(new Date(partners[0].lastSeen), { addSuffix: true })}`
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <button className="p-2 text-slate-400 hover:text-[var(--text-main)] hover:bg-[var(--bg-main)] rounded-xl transition-all">
                            <MoreVertical size={20} />
                        </button>
                    </div>

                    <div
                        ref={scrollRef}
                        className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6 custom-scrollbar scroll-smooth"
                    >
                        {loadingHistory ? (
                            <div className="flex flex-col space-y-4 h-full">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'} animate-pulse`}>
                                        <div className={`w-2/3 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl ${i % 2 === 0 ? 'rounded-tr-none' : 'rounded-tl-none'}`} />
                                    </div>
                                ))}
                            </div>
                        ) : messages.length > 0 ? (
                            messages.map((msg, idx) => {
                                const isMe = msg.senderId === user?.id;
                                return (
                                    <div key={msg.id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'} ${(msg as any).sending ? 'opacity-60 grayscale-[0.5]' : ''}`}>
                                        <div className={`flex flex-col max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}>
                                            {!isMe && activeRoom?.type === 'GROUP' && (
                                                <div className="flex items-center space-x-2 mb-1 ml-2">
                                                    <div className="w-5 h-5 rounded-full overflow-hidden border border-slate-100">
                                                        <img src={getAvatarUrl(msg.senderProfileImageUrl, msg.senderName)} alt="avatar" />
                                                    </div>
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{msg.senderName}</span>
                                                </div>
                                            )}
                                            <div className={`px-4 sm:px-5 py-2.5 sm:py-3.5 rounded-2xl sm:rounded-3xl text-sm font-medium shadow-sm transition-all animate-in zoom-in-95 duration-200 ${isMe
                                                ? 'bg-primary-600 text-white rounded-tr-none'
                                                : 'bg-[var(--bg-card)] text-[var(--text-main)] rounded-tl-none border border-[var(--border-main)]/50'
                                                }`}>
                                                {msg.content}
                                            </div>
                                            <div className="flex items-center mt-1.5 space-x-1 px-1">
                                                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                {isMe && !((msg as any).sending) && (
                                                    <span className={(msg.isRead || msg.read) ? "text-blue-500" : "text-slate-400"}>
                                                        {(msg.isRead || msg.read) ? <CheckCheck size={12} /> : <Check size={12} />}
                                                    </span>
                                                )}
                                                {isMe && (msg as any).sending && <Loader2 size={10} className="animate-spin text-slate-400" />}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full p-10 text-center">
                                <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-3xl flex items-center justify-center text-primary-500 mb-4 animate-bounce-slow">
                                    <MessageSquare size={32} />
                                </div>
                                <h5 className="font-bold text-[var(--text-main)]">Say hello!</h5>
                                <p className="text-xs text-[var(--text-muted)] mt-1">Start your conversation in {activeRoom?.type === 'GROUP' ? 'the group' : partners[0]?.name}</p>
                            </div>
                        )}
                    </div>

                    <form onSubmit={handleSendMessage} className="p-3 sm:p-5 border-t border-[var(--border-main)] bg-[var(--bg-card)] dark:bg-[var(--bg-card)]/80 dark:backdrop-blur-xl">
                        <div className="flex items-center space-x-2 sm:space-x-3">
                            <div className="grow relative">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className="w-full bg-slate-100 dark:bg-slate-800/80 border-none rounded-xl sm:rounded-2xl py-3 sm:py-4 px-4 sm:px-6 text-sm font-semibold focus:ring-4 focus:ring-primary-500/10 text-[var(--text-main)] placeholder:text-slate-400 transition-all"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={!newMessage.trim()}
                                className="p-3 sm:p-4 bg-primary-600 text-white rounded-xl sm:rounded-2xl shadow-lg shadow-primary-600/30 hover:bg-primary-500 active:scale-95 disabled:opacity-50 disabled:active:scale-100 transition-all cursor-pointer"
                            >
                                <Send size={20} />
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-12 bg-white/5 dark:bg-black/10">
                    <div className="p-8 bg-[var(--bg-card)]/80 rounded-[40px] shadow-2xl shadow-slate-900/5 text-center max-w-sm border border-[var(--border-main)]">
                        <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/30 rounded-[28px] flex items-center justify-center text-primary-500 mx-auto mb-6">
                            <MessageSquare size={40} />
                        </div>
                        <h4 className="text-xl font-bold text-[var(--text-main)] tracking-tight">Select a conversation</h4>
                        <p className="text-sm text-[var(--text-muted)] font-medium mt-2">
                            Connect with transfer partners to discuss your mutual transfer arrangements.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Messages;
