import { useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import { useAuth } from '../../context/AuthContext';
import { requestNotificationPermission, showBrowserNotification } from '../../utils/notification';
import { useLocation } from 'react-router-dom';

const NotificationListener = () => {
    const { user, isAuthenticated } = useAuth();
    const location = useLocation();
    const [settings, setSettings] = useState<any>(null);
    const stompClientRef = useRef<Client | null>(null);

    useEffect(() => {
        if (!isAuthenticated) return;
        
        const fetchSettings = async () => {
            try {
                const response = await fetch('/api/settings', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    setSettings(data);
                }
            } catch (error) {
                console.error('Failed to fetch settings for notifications', error);
            }
        };

        fetchSettings();
    }, [isAuthenticated]);

    useEffect(() => {
        if (!isAuthenticated || !user?.id) return;

        // Request permission on mount
        requestNotificationPermission();

        const client = new Client({
            brokerURL: 'ws://localhost:8080/ws',
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        client.onConnect = () => {
            console.log('Notification Listener Connected');
            client.subscribe(`/topic/user/${user.id}/notifications`, (message) => {
                const data = JSON.parse(message.body);
                
                // 1. Check if user is already looking at this chat room
                const isMessagesPage = location.pathname.startsWith('/messages');
                const searchParams = new URLSearchParams(window.location.search);
                const activeRoomId = searchParams.get('room');
                
                if (isMessagesPage && activeRoomId === String(data.chatRoomId)) {
                    return;
                }

                // 2. Check user settings for specific card types
                if (data.type === 'MESSAGE' && settings && settings.instantMessageAlerts === false) {
                    return;
                }
                if (data.type === 'MATCH_REQUEST' && settings && settings.instantMatchAlerts === false) {
                    return;
                }

                let title = 'New Notification';
                if (data.type === 'MATCH_REQUEST') {
                    title = 'New Match Request';
                } else if (data.type === 'MATCH_ACCEPTED') {
                    title = 'Match Request Accepted';
                } else {
                    title = `New message from ${data.senderName}`;
                }

                // Show notification
                showBrowserNotification(title, {
                    body: data.content,
                    tag: data.chatRoomId ? `msg-${data.chatRoomId}` : `notif-${data.type}` // Group appropriately
                });
            });
        };

        client.activate();
        stompClientRef.current = client;

        return () => {
            if (stompClientRef.current) {
                stompClientRef.current.deactivate();
            }
        };
    }, [isAuthenticated, user?.id, location.pathname]);

    return null; // This component doesn't render anything
};

export default NotificationListener;
