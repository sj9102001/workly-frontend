'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, UserPlus, User } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { projectsApi } from '@/app/services/projects';
import { organizationsApi } from '@/app/services/organizations';
import Button from '@/app/components/Button';
import Card from '@/app/components/Card';
import Modal from '@/app/components/Modal';
import type { Project, ProjectMember, User as UserType, ProjectRole } from '@/app/types/api';

export default function ProjectMembersPage() {
    const params = useParams();
    const router = useRouter();
    const orgId = params.orgId as string;
    const projectId = params.projectId as string;

    const [project, setProject] = useState<Project | null>(null);
    const [members, setMembers] = useState<ProjectMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddMemberModal, setShowAddMemberModal] = useState(false);
    const [availableMembers, setAvailableMembers] = useState<UserType[]>([]);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [selectedRole, setSelectedRole] = useState<ProjectRole>('MEMBER');

    useEffect(() => {
        fetchProjectDetails();
    }, [projectId]);

    const fetchProjectDetails = async () => {
        try {
            setLoading(true);
            const [projectResponse, membersResponse] = await Promise.all([
                projectsApi.getById(projectId),
                projectsApi.getMembers(projectId),
            ]);
            setProject(projectResponse.data.project);
            setMembers(membersResponse.data.members);

            // Fetch organization members to get available users to add
            const orgResponse = await organizationsApi.getById(orgId);
            const orgMembers = orgResponse.data.organization.members || [];
            const availableUsers = orgMembers
                .filter(orgMember => !membersResponse.data.members.some(pm => pm.user.id === orgMember.user.id))
                .map(orgMember => orgMember.user);
            setAvailableMembers(availableUsers);
        } catch (error) {
            toast.error('Failed to fetch project details');
            console.error('Error fetching project details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddMember = async () => {
        if (!selectedUserId || !selectedRole) return;

        try {
            await projectsApi.addMember(projectId, {
                userId: selectedUserId,
                role: selectedRole,
            });
            toast.success('Member added successfully');
            setShowAddMemberModal(false);
            setSelectedUserId('');
            setSelectedRole('MEMBER');
            fetchProjectDetails();
        } catch (error) {
            toast.error('Failed to add member');
            console.error('Error adding member:', error);
        }
    };

    const handleRemoveMember = async (memberId: string) => {
        try {
            await projectsApi.removeMember(projectId, memberId);
            toast.success('Member removed successfully');
            fetchProjectDetails();
        } catch (error) {
            toast.error('Failed to remove member');
            console.error('Error removing member:', error);
        }
    };

    const handleUpdateRole = async (memberId: string, newRole: ProjectRole) => {
        try {
            await projectsApi.updateMemberRole(projectId, memberId, newRole);
            toast.success('Role updated successfully');
            fetchProjectDetails();
        } catch (error) {
            toast.error('Failed to update role');
            console.error('Error updating role:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Project not found</h3>
                <p className="text-gray-500">The project you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.</p>
            </div>
        );
    }

    return (
        <div className="p-6">
            <ToastContainer position="bottom-right" />

            <div className="mb-6">
                <button
                    onClick={() => router.push(`/dashboard/${orgId}/projects/${projectId}`)}
                    className="flex items-center text-gray-500 hover:text-gray-700 mb-4"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Project
                </button>

                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold mb-2">Project Members</h1>
                        <p className="text-gray-500">Manage members and their roles in {project.name}</p>
                    </div>
                    <Button onClick={() => setShowAddMemberModal(true)}>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add Member
                    </Button>
                </div>
            </div>

            <div className="space-y-4">
                {members.map((member) => (
                    <Card key={member.id} className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                    {member.user.name.split(' ').map((n: string) => n[0]).join('')}
                                </div>
                                <div>
                                    <h3 className="font-medium text-gray-900">{member.user.name}</h3>
                                    <p className="text-sm text-gray-500">{member.user.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <select
                                    value={member.role}
                                    onChange={(e) => handleUpdateRole(member.id, e.target.value as ProjectRole)}
                                    className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                    <option value="LEAD">Lead</option>
                                    <option value="MEMBER">Member</option>
                                    <option value="VIEWER">Viewer</option>
                                </select>
                                <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => handleRemoveMember(member.id)}
                                >
                                    Remove
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}

                {members.length === 0 && (
                    <Card className="p-12 text-center">
                        <User className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No members yet</h3>
                        <p className="text-gray-500 mb-4">Get started by adding your first project member.</p>
                        <Button onClick={() => setShowAddMemberModal(true)}>
                            <UserPlus className="w-4 h-4 mr-2" />
                            Add Member
                        </Button>
                    </Card>
                )}
            </div>

            <Modal
                isOpen={showAddMemberModal}
                onClose={() => setShowAddMemberModal(false)}
                title="Add Project Member"
            >
                <div className="space-y-4">
                    <div>
                        <label htmlFor="user" className="block text-sm font-medium text-gray-700">
                            User
                        </label>
                        <select
                            id="user"
                            value={selectedUserId}
                            onChange={(e) => setSelectedUserId(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                            <option value="">Select a user</option>
                            {availableMembers.map((user) => (
                                <option key={user.id} value={user.id}>
                                    {user.name} ({user.email})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                            Role
                        </label>
                        <select
                            id="role"
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value as ProjectRole)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                            <option value="LEAD">Lead</option>
                            <option value="MEMBER">Member</option>
                            <option value="VIEWER">Viewer</option>
                        </select>
                    </div>
                    <div className="flex justify-end space-x-3">
                        <Button variant="secondary" onClick={() => setShowAddMemberModal(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleAddMember} disabled={!selectedUserId || !selectedRole}>
                            Add Member
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
} 