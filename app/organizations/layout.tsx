'use client';

import TopNav from '../components/TopNav';
import { useUser } from '../contexts/UserContext';
import { Loader2 } from 'lucide-react';

export default function OrganizationsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { loading } = useUser();

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <TopNav />
            <main className="pt-14">
                {children}
            </main>
        </div>
    );
} 