export const API_BASE_URL = import.meta.env.VITE_BASE_URL.replace(/\/$/, "");

export const getAvatarUrl = (url: string | null | undefined, name: string) => {
    if (!url) return `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`;
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    // Ensure the URL starts with / if it doesn't
    const path = url.startsWith('/') ? url : `/${url}`;
    return `${API_BASE_URL}${path}`;
};
