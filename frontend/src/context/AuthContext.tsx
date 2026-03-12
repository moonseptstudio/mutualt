import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/client';

interface User {
    id: number;
    username: string;
    token: string;
    role: string;
    fullName?: string;
    profileImageUrl?: string;
    packageName?: string;
}

interface AuthContextType {
    user: User | null;
    login: (userData: User, rememberMe?: boolean) => void;
    logout: () => void;
    isAuthenticated: boolean;
    isLoading: boolean;
    refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const isTokenExpired = (token: string) => {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp * 1000 < Date.now();
    } catch (e) {
        return true;
    }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check both storages on initialization
        const localUser = localStorage.getItem('user');
        const sessionUser = sessionStorage.getItem('user');

        if (localUser) {
            const parsedUser = JSON.parse(localUser);
            if (isTokenExpired(parsedUser.token)) {
                localStorage.removeItem('user');
                setUser(null);
            } else {
                setUser(parsedUser);
            }
        } else if (sessionUser) {
            const parsedUser = JSON.parse(sessionUser);
            if (isTokenExpired(parsedUser.token)) {
                sessionStorage.removeItem('user');
                setUser(null);
            } else {
                setUser(parsedUser);
            }
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        const interceptor = apiClient.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                    logout();
                }
                return Promise.reject(error);
            }
        );

        return () => apiClient.interceptors.response.eject(interceptor);
    }, []);

    useEffect(() => {
        if (!user) return;
        
        // Initial ping
        apiClient.post('/ping').catch(console.error);
        
        // Ping every 1 minute to update lastSeen status
        const interval = setInterval(() => {
            apiClient.post('/ping').catch(console.error);
        }, 60000);
        
        return () => clearInterval(interval);
    }, [user]);

    const login = (userData: User, rememberMe: boolean = false) => {
        if (rememberMe) {
            localStorage.setItem('user', JSON.stringify(userData));
            sessionStorage.removeItem('user'); // Clean up any existing session
        } else {
            sessionStorage.setItem('user', JSON.stringify(userData));
            localStorage.removeItem('user'); // Clean up any existing local
        }
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');
        setUser(null);
    };

    const refreshSession = async () => {
        try {
            const response = await apiClient.get('/auth/me');
            if (response.data) {
                // Keep existing token if not provided in /me response
                const currentToken = user?.token;
                const updatedUser = { ...response.data };
                if (!updatedUser.token && currentToken) {
                    updatedUser.token = currentToken;
                }
                
                // Update storage if user was already logged in
                if (localStorage.getItem('user')) {
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                } else if (sessionStorage.getItem('user')) {
                    sessionStorage.setItem('user', JSON.stringify(updatedUser));
                }
                
                setUser(updatedUser);
            }
        } catch (error) {
            console.error("Session refresh failed", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, isLoading, refreshSession }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
