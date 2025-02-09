'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
    Plus,
    Building2,
    Users,
    Mail,
    ChevronRight,
    UserCircle,
    Loader2
} from 'lucide-react';
import { organizationsApi } from '@/app/services/organizations';
import type { Organization, OrganizationInvite } from '@/app/types/api';
import Modal from '@/app/components/Modal';

export default function OrganizationsPage() {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [personalOrg, setPersonalOrg] = useState<Organization | null>(null);
    const [invitations, setInvitations] = useState<OrganizationInvite[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [newOrgName, setNewOrgName] = useState('');
    const [newOrgDescription, setNewOrgDescription] = useState('');

    const router = useRouter();

    useEffect(() => {
        fetchOrganizations();
    }, []);

    const fetchOrganizations = async () => {
        try {
            const response = await organizationsApi.getAll();
            setOrganizations(response.data.organizations);
            setPersonalOrg(response.data.personalOrganization);
            setInvitations(response.data.pendingInvites);
        } catch (error: unknown) {
            const err = error as Error;
            console.error('Error fetching organizations:', err);
            toast.error(err.message || 'Failed to load organizations');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateOrganization = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);

        try {
            await organizationsApi.create({
                name: newOrgName,
                description: newOrgDescription
            });

            toast.success('Organization created successfully');
            setShowCreateModal(false);
            setNewOrgName('');
            setNewOrgDescription('');
            await fetchOrganizations();
        } catch (error: unknown) {
            const err = error as Error;
            toast.error(err.message || 'Failed to create organization');
        } finally {
            setCreating(false);
        }
    };

    const handleAcceptInvite = async (inviteId: string) => {
        try {
            await organizationsApi.acceptInvite(inviteId);
            toast.success('Invitation accepted');
            await fetchOrganizations();
        } catch (error: unknown) {
            const err = error as Error;
            toast.error(err.message || 'Failed to accept invitation');
        }
    };

    const handleRejectInvite = async (inviteId: string) => {
        try {
            await organizationsApi.rejectInvite(inviteId);
            toast.success('Invitation rejected');
            await fetchOrganizations();
        } catch (error: unknown) {
            const err = error as Error;
            toast.error(err.message || 'Failed to reject invitation');
        }
    };

    const handleOrganizationSelect = (orgId: string) => {
        router.push(`/dashboard/${orgId}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <ToastContainer position="bottom-right" />
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900">Welcome to Workly</h1>
                    <p className="mt-2 text-lg text-gray-600">Select an organization to continue or create a new one</p>
                </div>

                {/* Personal Organization */}
                {personalOrg && (
                    <div
                        onClick={() => handleOrganizationSelect(personalOrg.id)}
                        className="bg-white rounded-lg border border-gray-200 hover:border-blue-500 transition-colors cursor-pointer p-6"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <UserCircle size={24} className="text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">{personalOrg.name}</h3>
                                    <p className="text-sm text-gray-500">{personalOrg.description}</p>
                                </div>
                            </div>
                            <ChevronRight size={20} className="text-gray-400" />
                        </div>
                    </div>
                )}

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
                                                        <span>{org.memberCount} members</span>
                                                    </div>
                                                    <div className="text-sm font-medium text-blue-600">
                                                        {org.role && `${org.role.charAt(0)}${org.role.slice(1).toLowerCase()}`}
                                                    </div>
                                                </div>
                                                {org.description && (
                                                    <p className="text-sm text-gray-500 mt-1">{org.description}</p>
                                                )}
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
                                                <h3 className="text-lg font-medium text-gray-900">{invitation.organization.name}</h3>
                                                {invitation.organization.description && (
                                                    <p className="text-sm text-gray-500">{invitation.organization.description}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => handleRejectInvite(invitation.id)}
                                                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                                            >
                                                Decline
                                            </button>
                                            <button
                                                onClick={() => handleAcceptInvite(invitation.id)}
                                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                                            >
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
                <Modal
                    isOpen={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    title="Create Organization"
                    maxWidth="md"
                >
                    <form onSubmit={handleCreateOrganization}>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Organization Name
                                </label>
                                <input
                                    type="text"
                                    value={newOrgName}
                                    onChange={(e) => setNewOrgName(e.target.value)}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter organization name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description (Optional)
                                </label>
                                <textarea
                                    value={newOrgDescription}
                                    onChange={(e) => setNewOrgDescription(e.target.value)}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter organization description"
                                />
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-3 mt-6">
                            <button
                                type="button"
                                onClick={() => setShowCreateModal(false)}
                                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                                disabled={creating}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={creating || !newOrgName.trim()}
                                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {creating && <Loader2 size={16} className="animate-spin" />}
                                {creating ? 'Creating...' : 'Create'}
                            </button>
                        </div>
                    </form>
                </Modal>
            </div>
        </div>
    );
} 