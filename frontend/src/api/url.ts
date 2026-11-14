export const API_BASE_URL = import.meta.env.VITE_BASE_URL.replace(/\/$/, "");

export const getAvatarUrl = (url: string | null | undefined, name: string) => {
    if (!url) return `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`;
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    // Ensure the URL starts with / if it doesn't
    const path = url.startsWith('/') ? url : `/${url}`;
    return `${API_BASE_URL}${path}`;
};

/**
 * STOMP WebSocket endpoint. Set VITE_WS_URL explicitly when the socket is served
 * from a different host; otherwise it is derived from VITE_BASE_URL
 * (https://example.com/ -> wss://example.com/ws).
 */
export const WS_URL: string =
    import.meta.env.VITE_WS_URL ||
    `${API_BASE_URL.replace(/^http/, 'ws')}/ws`;
