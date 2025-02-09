'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    Plus,
    Loader2,
    Shield,
    UserX,
    Mail
} from 'lucide-react';
import Modal from '@/app/components/Modal';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useParams } from 'next/navigation';
import { organizationsApi } from '@/app/services/organizations';
import type { OrgRole, OrganizationMember } from '@/app/types/api';

export default function MembersPage() {
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState<OrgRole>('MEMBER');
    const [inviting, setInviting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [members, setMembers] = useState<OrganizationMember[]>([]);
    const params = useParams();
    const orgId = params?.orgId as string;

    const fetchMembers = useCallback(async () => {
        try {
            const response = await organizationsApi.getMembers(orgId);
            setMembers(response.data.members);
        } catch (error: unknown) {
            const err = error as Error;
            console.error('Failed to fetch members:', err);
            toast.error(err.message || 'Failed to load members');
        } finally {
            setLoading(false);
        }
    }, [orgId]);

    useEffect(() => {
        fetchMembers();
    }, [fetchMembers]);

    const handleInviteMember = async (e: React.FormEvent) => {
        e.preventDefault();
        setInviting(true);

        try {
            await organizationsApi.inviteMember(orgId, {
                email: inviteEmail,
                role: inviteRole
            });

            toast.success('Member invited successfully');
            setShowInviteModal(false);
            setInviteEmail('');
            setInviteRole('MEMBER');
            await fetchMembers();
        } catch (error: unknown) {
            const err = error as Error;
            toast.error(err.message || 'Failed to invite member');
        } finally {
            setInviting(false);
        }
    };

    const handleRemoveMember = async (memberId: string) => {
        try {
            await organizationsApi.removeMember(orgId, memberId);
            toast.success('Member removed successfully');
            await fetchMembers();
        } catch (error: unknown) {
            const err = error as Error;
            toast.error(err.message || 'Failed to remove member');
        }
    };

    if (loading) {
        return (
            <div className="min-h-[200px] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Team Members</h1>
                    <p className="text-sm text-gray-500">Manage organization members and their roles</p>
                </div>
                <button
                    onClick={() => setShowInviteModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Invite Member
                </button>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Member
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Role
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {members.map((member) => (
                            <tr key={member.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                            {member.user.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm font-medium text-gray-900">{member.user.name}</p>
                                            <p className="text-sm text-gray-500">{member.user.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-1.5">
                                        <Shield className={`w-4 h-4 ${member.role === 'OWNER' ? 'text-purple-600' :
                                            member.role === 'ADMIN' ? 'text-blue-600' : 'text-gray-600'
                                            }`} />
                                        <span className="text-sm capitalize text-gray-900">{member.role.toLowerCase()}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    {member.role !== 'OWNER' && (
                                        <button
                                            onClick={() => handleRemoveMember(member.id)}
                                            className="text-red-600 hover:text-red-700 transition-colors"
                                        >
                                            <UserX className="w-5 h-5" />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Invite Member Modal */}
            <Modal
                isOpen={showInviteModal}
                onClose={() => setShowInviteModal(false)}
                title="Invite Team Member"
                maxWidth="md"
            >
                <form onSubmit={handleInviteMember}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter email address"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Role
                            </label>
                            <select
                                value={inviteRole}
                                onChange={(e) => setInviteRole(e.target.value as OrgRole)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="MEMBER">Member</option>
                                <option value="ADMIN">Admin</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={() => setShowInviteModal(false)}
                            className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={inviting || !inviteEmail.trim()}
                            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {inviting && <Loader2 className="w-4 h-4 animate-spin" />}
                            {inviting ? 'Sending Invite...' : 'Send Invite'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
} 