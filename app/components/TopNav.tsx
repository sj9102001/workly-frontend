'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bell,
    ChevronDown,
    Settings,
    LogOut,
    Building2,
    Users,
    Menu,
    X
} from 'lucide-react';

interface TopNavProps {
    showOrgSwitcher?: boolean;
    currentOrg?: {
        id: string;
        name: string;
        role: string;
    } | null;
    onMobileMenuClick?: () => void;
    showMobileMenu?: boolean;
}

export default function TopNav({
    showOrgSwitcher = false,
    currentOrg = null,
    onMobileMenuClick,
    showMobileMenu
}: TopNavProps) {
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    return (
        <header className="h-14 bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-30">
            <div className="h-full px-4 flex items-center justify-between">
                {/* Left section */}
                <div className="flex items-center gap-3">
                    {onMobileMenuClick && (
                        <button
                            onClick={onMobileMenuClick}
                            className="lg:hidden p-1.5 hover:bg-gray-100 rounded-md"
                        >
                            {showMobileMenu ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    )}
                    <Link href="/organizations" className="flex items-center gap-2">
                        <span className="text-xl font-semibold text-[#1A73E8]">Workly</span>
                    </Link>

                    {showOrgSwitcher && currentOrg && (
                        <>
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
                        </>
                    )}
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
                                    {showOrgSwitcher && (
                                        <Link
                                            href="/organizations"
                                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                        >
                                            <Building2 size={16} />
                                            Switch Organization
                                        </Link>
                                    )}
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
    );
} 