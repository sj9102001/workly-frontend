'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Building2,
    Users,
    Mail,
    ChevronRight,
    Briefcase,
    UserCircle
} from 'lucide-react';

export default function OrganizationsPage() {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const router = useRouter();

    // Mock data - replace with actual API calls
    const organizations = [
        {
            id: '1',
            name: 'Acme Corp',
            members: 24,
            role: 'Admin',
        },
        {
            id: '2',
            name: 'Startup Inc',
            members: 12,
            role: 'Member',
        }
    ];

    const invitations = [
        {
            id: '1',
            organizationName: 'Tech Solutions',
            invitedBy: 'Sarah Chen',
            role: 'Member',
        }
    ];

    const handleOrganizationSelect = (orgId: string) => {
        router.push(`/dashboard/${orgId}`);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900">Welcome to Workly</h1>
                    <p className="mt-2 text-lg text-gray-600">Select an organization to continue or create a new one</p>
                </div>

                {/* Personal Workspace Option */}
                <div className="bg-white rounded-lg border border-gray-200 hover:border-blue-500 transition-colors cursor-pointer p-6"
                    onClick={() => handleOrganizationSelect('personal')}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <UserCircle size={24} className="text-blue-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-gray-900">Personal Workspace</h3>
                                <p className="text-sm text-gray-500">Your individual workspace for personal projects</p>
                            </div>
                        </div>
                        <ChevronRight size={20} className="text-gray-400" />
                    </div>
                </div>

                {/* Organizations List */}
                {organizations.length > 0 && (
                    <div>
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Your Organizations</h2>
                        <div className="space-y-4">
                            {organizations.map((org) => (
                                <div
                                    key={org.id}
                                    onClick={() => handleOrganizationSelect(org.id)}
                                    className="bg-white rounded-lg border border-gray-200 hover:border-blue-500 transition-colors cursor-pointer"
                                >
                                    <div className="p-6 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                                <Building2 size={24} className="text-blue-600" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-medium text-gray-900">{org.name}</h3>
                                                <div className="flex items-center gap-4 mt-1">
                                                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                                        <Users size={16} />
                                                        <span>{org.members} members</span>
                                                    </div>
                                                    <div className="text-sm font-medium text-blue-600">
                                                        {org.role}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <ChevronRight size={20} className="text-gray-400" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Invitations */}
                {invitations.length > 0 && (
                    <div>
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Pending Invitations</h2>
                        <div className="space-y-4">
                            {invitations.map((invitation) => (
                                <div
                                    key={invitation.id}
                                    className="bg-white rounded-lg border border-gray-200 p-6"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                                                <Mail size={24} className="text-yellow-600" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-medium text-gray-900">{invitation.organizationName}</h3>
                                                <p className="text-sm text-gray-500">
                                                    Invited by {invitation.invitedBy} • {invitation.role}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                                                Decline
                                            </button>
                                            <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                                                Accept
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Create Organization Button */}
                <div className="flex justify-center">
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
                    >
                        <Plus size={20} />
                        Create New Organization
                    </button>
                </div>

                {/* Create Organization Modal */}
                <AnimatePresence>
                    {showCreateModal && (
                        <>
                            <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setShowCreateModal(false)} />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-lg shadow-lg z-50 p-6"
                            >
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Create Organization</h2>
                                <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Organization Name
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Enter organization name"
                                        />
                                    </div>
                                    <div className="flex items-center justify-end gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setShowCreateModal(false)}
                                            className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            Create
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
} 