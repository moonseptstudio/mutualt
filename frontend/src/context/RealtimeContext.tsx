import React, { createContext, useCallback, useContext, useEffect, useRef } from 'react';
import { Client, type IMessage, type StompSubscription } from '@stomp/stompjs';
import { useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from './AuthContext';
import { WS_URL } from '../api/url';
import { queryKeys, useSettingsQuery } from '../api/queries';
import { requestNotificationPermission, showBrowserNotification } from '../utils/notification';

type Handler = (message: IMessage) => void;

interface Listener {
    destination: string;
    handler: Handler;
    subscription?: StompSubscription;
}

interface RealtimeContextType {
    /** Subscribe to a STOMP topic on the shared connection. Returns an unsubscribe function. */
    subscribe: (destination: string, handler: Handler) => () => void;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

/**
 * One WebSocket connection for the whole client area. It survives page
 * navigation, pushes browser notifications and invalidates cached queries
 * so every page shows fresh data in real time.
 */
export const RealtimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, isAuthenticated } = useAuth();
    const queryClient = useQueryClient();
    const location = useLocation();
    const { data: settings } = useSettingsQuery(isAuthenticated);

    const clientRef = useRef<Client | null>(null);
    const listenersRef = useRef(new Set<Listener>());
    // Read the latest values inside socket callbacks without reconnecting.
    const pathnameRef = useRef(location.pathname);
    const settingsRef = useRef(settings);
    useEffect(() => {
        pathnameRef.current = location.pathname;
        settingsRef.current = settings;
    }, [location.pathname, settings]);

    const subscribe = useCallback((destination: string, handler: Handler) => {
        const listener: Listener = { destination, handler };
        listenersRef.current.add(listener);
        const client = clientRef.current;
        if (client?.connected) {
            listener.subscription = client.subscribe(destination, handler);
        }
        return () => {
            listener.subscription?.unsubscribe();
            listenersRef.current.delete(listener);
        };
    }, []);

    useEffect(() => {
        if (!isAuthenticated || !user?.id) return;

        requestNotificationPermission();

        const client = new Client({
            brokerURL: WS_URL,
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        client.onConnect = () => {
            // (Re)attach every page-level listener after (re)connecting.
            listenersRef.current.forEach((listener) => {
                listener.subscription = client.subscribe(listener.destination, listener.handler);
            });

            // Catch up on anything missed while disconnected.
            queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
            queryClient.invalidateQueries({ queryKey: queryKeys.rooms });
            queryClient.invalidateQueries({ queryKey: queryKeys.requests });

            client.subscribe(`/topic/user/${user.id}/notifications`, (message) => {
                const data = JSON.parse(message.body);
                const isMatchEvent = data.type === 'MATCH_REQUEST' || data.type === 'MATCH_ACCEPTED';

                // 1. Keep cached data fresh.
                queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
                if (isMatchEvent) {
                    queryClient.invalidateQueries({ queryKey: queryKeys.requests });
                    queryClient.invalidateQueries({ queryKey: queryKeys.matches });
                    queryClient.invalidateQueries({ queryKey: queryKeys.rooms });
                } else {
                    queryClient.invalidateQueries({ queryKey: queryKeys.rooms });
                }

                // 2. Skip the browser notification if the user is already viewing this chat.
                const isMessagesPage = pathnameRef.current.startsWith('/messages');
                const activeRoomId = new URLSearchParams(window.location.search).get('room');
                if (isMessagesPage && data.chatRoomId != null && activeRoomId === String(data.chatRoomId)) {
                    return;
                }

                // 3. Respect user alert settings.
                const s = settingsRef.current;
                if (data.type === 'MATCH_REQUEST' && s?.instantMatchAlerts === false) return;
                if (!isMatchEvent && s?.instantMessageAlerts === false) return;

                let title: string;
                if (data.type === 'MATCH_REQUEST') title = 'New Match Request';
                else if (data.type === 'MATCH_ACCEPTED') title = 'Match Request Accepted';
                else title = `New message from ${data.senderName}`;

                showBrowserNotification(title, {
                    body: data.content,
                    tag: data.chatRoomId ? `msg-${data.chatRoomId}` : `notif-${data.type}`,
                });
            });
        };

        client.onWebSocketClose = () => {
            listenersRef.current.forEach((listener) => {
                listener.subscription = undefined;
            });
        };

        client.activate();
        clientRef.current = client;

        return () => {
            clientRef.current = null;
            client.deactivate();
        };
    }, [isAuthenticated, user?.id, queryClient]);

    return <RealtimeContext.Provider value={{ subscribe }}>{children}</RealtimeContext.Provider>;
};

export const useRealtime = () => {
    const context = useContext(RealtimeContext);
    if (!context) throw new Error('useRealtime must be used within a RealtimeProvider');
    return context;
};
