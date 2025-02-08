'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Home,
    LayoutGrid,
    ClipboardList,
    Users,
    Bell,
    ChevronDown,
    Menu,
    X,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Building2
} from 'lucide-react';

interface Organization {
    id: string;
    name: string;
    role: string;
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);

    const pathname = usePathname();
    const params = useParams();
    const orgId = params?.orgId as string;

    useEffect(() => {
        // Mock API call - replace with actual API call
        if (orgId === 'personal') {
            setCurrentOrg({
                id: 'personal',
                name: 'Personal Workspace',
                role: 'Owner'
            });
        } else {
            // Simulate API fetch
            setCurrentOrg({
                id: orgId,
                name: 'Acme Corp',
                role: 'Admin'
            });
        }
    }, [orgId]);

    const menuItems = [
        { icon: Home, label: 'Dashboard', href: `/dashboard/${orgId}` },
        { icon: LayoutGrid, label: 'Projects', href: `/dashboard/${orgId}/projects` },
        { icon: ClipboardList, label: 'Issues', href: `/dashboard/${orgId}/issues` },
        { icon: Users, label: 'Members', href: `/dashboard/${orgId}/members` },
        { icon: Settings, label: 'Settings', href: `/dashboard/${orgId}/settings` },
    ];

    if (!currentOrg) {
        return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Navigation */}
            <header className="h-14 bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-30">
                <div className="h-full px-4 flex items-center justify-between">
                    {/* Left section */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="lg:hidden p-1.5 hover:bg-gray-100 rounded-md"
                        >
                            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                        <Link href="/organizations" className="flex items-center gap-2">
                            <span className="text-xl font-semibold text-[#1A73E8]">Workly</span>
                        </Link>
                        <div className="h-6 w-px bg-gray-200 mx-2"></div>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                {currentOrg.id === 'personal' ? (
                                    <Users size={18} className="text-blue-600" />
                                ) : (
                                    <Building2 size={18} className="text-blue-600" />
                                )}
                            </div>
                            <div className="hidden sm:block">
                                <h3 className="text-sm font-medium text-gray-900">{currentOrg.name}</h3>
                                <p className="text-xs text-gray-500">{currentOrg.role}</p>
                            </div>
                        </div>
                    </div>

                    {/* Right section */}
                    <div className="flex items-center gap-4">
                        <button className="p-1.5 hover:bg-gray-100 rounded-full relative">
                            <Bell size={20} />
                            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>
                        <div className="relative">
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="flex items-center gap-2 hover:bg-gray-100 p-1.5 rounded-md"
                            >
                                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                                    JS
                                </div>
                                <ChevronDown size={16} />
                            </button>

                            <AnimatePresence>
                                {isProfileOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1"
                                    >
                                        <div className="px-4 py-2 border-b border-gray-100">
                                            <p className="text-sm font-medium">John Smith</p>
                                            <p className="text-xs text-gray-500">john@example.com</p>
                                        </div>
                                        <Link
                                            href="/profile"
                                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                        >
                                            <Settings size={16} />
                                            Profile Settings
                                        </Link>
                                        <Link
                                            href="/organizations"
                                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                        >
                                            <Building2 size={16} />
                                            Switch Organization
                                        </Link>
                                        <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-50">
                                            <LogOut size={16} />
                                            Sign Out
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </header>

            {/* Sidebar */}
            <aside
                className={`fixed left-0 top-14 bottom-0 bg-white border-r border-gray-200 z-20 transition-all duration-300 ${isSidebarCollapsed ? 'w-16' : 'w-64'
                    } ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
            >
                <nav className="p-4 space-y-1">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={`flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors ${isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                                    }`}
                            >
                                <Icon size={18} />
                                {!isSidebarCollapsed && <span>{item.label}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* Collapse button */}
                <button
                    onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-5 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                    {isSidebarCollapsed ? (
                        <ChevronRight size={14} />
                    ) : (
                        <ChevronLeft size={14} />
                    )}
                </button>
            </aside>

            {/* Main Content */}
            <main className={`pt-14 transition-all duration-300 ${isSidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'}`}>
                <div className="p-6">{children}</div>
            </main>

            {/* Mobile menu backdrop */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/20 z-10 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                ></div>
            )}
        </div>
    );
} 