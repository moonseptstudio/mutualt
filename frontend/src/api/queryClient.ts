import { QueryClient } from '@tanstack/react-query';

/**
 * Shared cache for all server data (stale-while-revalidate).
 *
 * - Data fetched once is shown instantly when the user returns to a page,
 *   while a background refetch brings it up to date.
 * - Real-time WebSocket events (see RealtimeProvider) invalidate the relevant
 *   keys so pages update without a manual refresh.
 */
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // Treat data as fresh for 30s: switching pages inside this window
            // does not hit the API at all.
            staleTime: 30_000,
            // Keep unused data in memory for 30 min so returning to a page is instant.
            gcTime: 30 * 60_000,
            refetchOnWindowFocus: true,
            retry: (failureCount, error: any) => {
                const status = error?.response?.status;
                if (status === 401 || status === 403 || status === 404) return false;
                return failureCount < 1;
            },
        },
    },
});
