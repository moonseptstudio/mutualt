import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/client';

interface User {
    id: number;
    username: string;
    token: string;
    role: string;
    fullName?: string;
    profileImageUrl?: string;
}

interface AuthContextType {
    user: User | null;
    login: (userData: User, rememberMe?: boolean) => void;
    logout: () => void;
    isAuthenticated: boolean;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check both storages on initialization
        const localUser = localStorage.getItem('user');
        const sessionUser = sessionStorage.getItem('user');

        if (localUser) {
            setUser(JSON.parse(localUser));
        } else if (sessionUser) {
            setUser(JSON.parse(sessionUser));
        }
        setIsLoading(false);
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

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, isLoading }}>
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
