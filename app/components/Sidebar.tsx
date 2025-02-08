'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Home,
    LayoutGrid,
    ClipboardList,
    Users,
    Settings,
    ChevronLeft,
    ChevronRight,
    LucideIcon
} from 'lucide-react';

interface SidebarProps {
    orgId: string;
    isCollapsed: boolean;
    onCollapsedChange: (collapsed: boolean) => void;
    isMobileOpen: boolean;
}

interface MenuItem {
    icon: LucideIcon;
    label: string;
    href: string;
}

export default function Sidebar({
    orgId,
    isCollapsed,
    onCollapsedChange,
    isMobileOpen
}: SidebarProps) {
    const pathname = usePathname();

    const menuItems: MenuItem[] = [
        { icon: Home, label: 'Overview', href: `/dashboard/${orgId}` },
        { icon: LayoutGrid, label: 'Projects', href: `/dashboard/${orgId}/projects` },
        { icon: ClipboardList, label: 'Issues', href: `/dashboard/${orgId}/issues` },
        { icon: Users, label: 'Members', href: `/dashboard/${orgId}/members` },
        { icon: Settings, label: 'Settings', href: `/dashboard/${orgId}/settings` },
    ];

    return (
        <aside
            className={`fixed left-0 top-14 bottom-0 bg-white border-r border-gray-200 z-20 transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'
                } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
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
                            {!isCollapsed && <span>{item.label}</span>}
                        </Link>
                    );
                })}
            </nav>

            {/* Collapse button */}
            <button
                onClick={() => onCollapsedChange(!isCollapsed)}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-5 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
                {isCollapsed ? (
                    <ChevronRight size={14} />
                ) : (
                    <ChevronLeft size={14} />
                )}
            </button>
        </aside>
    );
} 