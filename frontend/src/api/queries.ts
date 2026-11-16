import { useQuery } from '@tanstack/react-query';
import apiClient from './client';

/** Central list of cache keys so pages and real-time events stay in sync. */
export const queryKeys = {
    profile: ['profile'] as const,
    matches: ['matches'] as const,
    requests: ['requests'] as const,
    rooms: ['rooms'] as const,
    preferences: ['preferences'] as const,
    settings: ['settings'] as const,
    notifications: ['notifications'] as const,
    trial: ['trial'] as const,
    stations: (fieldId: number | null | undefined) => ['stations', fieldId ?? 'all'] as const,
    messages: (roomId: number | null | undefined) => ['messages', roomId] as const,
};

const get = async <T,>(url: string): Promise<T> => (await apiClient.get<T>(url)).data;

export interface RequestsData {
    incoming: any[];
    outgoing: any[];
}

export const useProfileQuery = () =>
    useQuery({ queryKey: queryKeys.profile, queryFn: () => get<any>('/profile/me') });

export const useMatchesQuery = () =>
    useQuery({ queryKey: queryKeys.matches, queryFn: () => get<any[]>('/matches') });

export const useRequestsQuery = () =>
    useQuery({ queryKey: queryKeys.requests, queryFn: () => get<RequestsData>('/requests/me') });

export const useRoomsQuery = (options?: { refetchInterval?: number }) =>
    useQuery({
        queryKey: queryKeys.rooms,
        queryFn: () => get<any[]>('/messages/rooms'),
        refetchInterval: options?.refetchInterval,
    });

export const usePreferencesQuery = () =>
    useQuery({ queryKey: queryKeys.preferences, queryFn: () => get<any[]>('/preferences') });

export const useSettingsQuery = (enabled = true) =>
    useQuery({ queryKey: queryKeys.settings, queryFn: () => get<any>('/settings'), enabled });

export const useNotificationsQuery = (enabled = true) =>
    useQuery({
        queryKey: queryKeys.notifications,
        queryFn: () => get<any[]>('/notifications'),
        enabled,
        // Fallback in case a WebSocket event is missed.
        refetchInterval: 60_000,
    });

export const useStationsQuery = (fieldId: number | null | undefined, enabled = true) =>
    useQuery({
        queryKey: queryKeys.stations(fieldId),
        queryFn: () => get<any[]>(fieldId ? `/public/stations?fieldId=${fieldId}` : '/public/stations'),
        enabled,
        // Station list rarely changes.
        staleTime: 10 * 60_000,
    });


/** Free-trial state for the signed-in user, as returned by GET /packages/trial. */
export interface TrialStatus {
    /** Length of the trial window, in days (14). */
    trialDays: number;
    /** The trial can be claimed right now - never claimed and still inside the window. */
    eligible: boolean;
    /** The trial has been claimed at some point, running or not. */
    claimed: boolean;
    /** A claimed trial is still running. */
    active: boolean;
    /** The window closed without the trial ever being claimed. */
    expired: boolean;
    /** Whole days left to claim, 0 once the window has closed. */
    daysLeftToClaim: number;
    /** Whole days left on a running trial, 0 when none is running. */
    daysRemaining: number;
    /** End of the claim window (registration + trialDays). */
    windowEndDate: string;
    /** End of the claimed trial, null until claimed. */
    trialEndDate: string | null;
}

export const useTrialStatusQuery = (enabled = true) =>
    useQuery({
        queryKey: queryKeys.trial,
        queryFn: () => get<TrialStatus>('/packages/trial'),
        enabled,
    });

/** Claims the 14-day free trial. No payment and no card details are involved. */
export const claimFreeTrial = async (): Promise<TrialStatus> => {
    const { data } = await apiClient.post<{ trial: TrialStatus }>('/packages/trial/claim');
    return data.trial;
};
