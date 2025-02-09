'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User {
    id: string;
    email: string;
    name: string;
    createdAt: string;
    updatedAt: string;
}

interface UserContextType {
    user: User | null;
    setUser: (user: User | null) => void;
    logout: () => Promise<void>;
    loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Try to get user data from localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const handleSetUser = (newUser: User | null) => {
        setUser(newUser);
        if (newUser) {
            localStorage.setItem('user', JSON.stringify(newUser));
        } else {
            localStorage.removeItem('user');
        }
    };

    const logout = async () => {
        try {
            const res = await fetch('http://localhost:8080/api/auth/logout', {
                method: 'GET',
                credentials: 'include'
            });

            if (!res.ok) {
                console.log(res);
                throw new Error('Failed to logout');
            }

            // If logout was successful, clear local storage and redirect
            handleSetUser(null);
            router.push('/');
        } catch (error) {
            console.error('Logout failed:', error);
            // Even if the backend call fails, clear local state and redirect
            handleSetUser(null);
            router.push('/');
        }
    };

    return (
        <UserContext.Provider value={{ user, setUser: handleSetUser, logout, loading }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
} 