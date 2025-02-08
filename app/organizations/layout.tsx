'use client';

import TopNav from '../components/TopNav';

export default function OrganizationsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gray-50">
            <TopNav />
            <main className="pt-14">
                {children}
            </main>
        </div>
    );
} 