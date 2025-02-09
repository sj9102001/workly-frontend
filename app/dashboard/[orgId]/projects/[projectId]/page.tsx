/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Search,
    Filter,
    ChevronDown,
    AlertCircle,
    CheckCircle2,
    Clock,
    CircleDot,
    Users,
    Archive,
    Settings
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { projectsApi } from '@/app/services/projects';
import { issuesApi } from '@/app/services/issues';
import { organizationsApi } from '@/app/services/organizations';
import Button from '@/app/components/Button';
import Card from '@/app/components/Card';
import Modal from '@/app/components/Modal';
import type { Project, Issue, IssueStatus, IssuePriority, User as ApiUser } from '@/app/types/api';

type ProjectRole = 'LEAD' | 'MEMBER' | 'VIEWER';

interface Label {
    id: string;
    name: string;
    color: string;
}

interface ProjectMember {
    id: string;
    user: ApiUser;
    role: ProjectRole;
    createdAt: string;
    updatedAt: string;
}

const statusOptions = [
    { value: 'TODO', label: 'To Do', icon: AlertCircle, color: 'text-yellow-600 bg-yellow-50' },
    { value: 'IN_PROGRESS', label: 'In Progress', icon: Clock, color: 'text-blue-600 bg-blue-50' },
    { value: 'IN_REVIEW', label: 'In Review', icon: CircleDot, color: 'text-purple-600 bg-purple-50' },
    { value: 'DONE', label: 'Done', icon: CheckCircle2, color: 'text-green-600 bg-green-50' }
] as const;

const priorityOptions = [
    { value: 'LOW', label: 'Low', color: 'text-green-600 bg-green-50' },
    { value: 'MEDIUM', label: 'Medium', color: 'text-yellow-600 bg-yellow-50' },
    { value: 'HIGH', label: 'High', color: 'text-orange-600 bg-orange-50' },
    { value: 'URGENT', label: 'Urgent', color: 'text-red-600 bg-red-50' }
] as const;

export default function ProjectDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const orgId = params.orgId as string;
    const projectId = params.projectId as string;

    const [project, setProject] = useState<Project | null>(null);
    const [issues, setIssues] = useState<Issue[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateIssueModal, setShowCreateIssueModal] = useState(false);
    const [newIssueTitle, setNewIssueTitle] = useState('');
    const [newIssueDescription, setNewIssueDescription] = useState('');
    const [newIssuePriority, setNewIssuePriority] = useState<IssuePriority>('MEDIUM');
    const [showMembersModal, setShowMembersModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<IssueStatus[]>([]);
    const [priorityFilter, setPriorityFilter] = useState<IssuePriority[]>([]);
    const [assigneeFilter, setAssigneeFilter] = useState<string[]>([]);
    const [showFilters, setShowFilters] = useState(false);
    const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
    const [selectedRole, setSelectedRole] = useState<ProjectRole>('MEMBER');
    const [availableMembers, setAvailableMembers] = useState<ApiUser[]>([]);

    const fetchProjectDetails = useCallback(async () => {
        try {
            setLoading(true);
            const [projectResponse, issuesResponse] = await Promise.all([
                projectsApi.getById(projectId),
                projectsApi.getIssues(projectId),
            ]);
            setProject(projectResponse.data.project);
            setIssues(issuesResponse.data.issues);

            // Fetch organization members to get available users to add
            const orgResponse = await organizationsApi.getMembers(orgId);
            const projectMembers = projectResponse.data.project.members || [];
            const availableUsers = orgResponse.data.members
                .filter(orgMember => !projectMembers.some(pm => pm.user.id === orgMember.user.id))
                .map(orgMember => orgMember.user);
            setAvailableMembers(availableUsers);
        } catch (error) {
            toast.error('Failed to fetch project details');
            console.error('Error fetching project details:', error);
        } finally {
            setLoading(false);
        }
    }, [projectId, orgId]);

    useEffect(() => {
        fetchProjectDetails();
    }, [fetchProjectDetails]);

    const handleCreateIssue = async () => {
        if (!newIssueTitle.trim()) return;

        try {
            await issuesApi.create(projectId, {
                title: newIssueTitle,
                description: newIssueDescription,
                priority: newIssuePriority,
                assigneeId: selectedMembers[0] // Only support single assignee for now
            });
            toast.success('Issue created successfully');
            setShowCreateIssueModal(false);
            setNewIssueTitle('');
            setNewIssueDescription('');
            setNewIssuePriority('MEDIUM');
            setSelectedMembers([]);
            await fetchProjectDetails();
        } catch (error: unknown) {
            const err = error as Error;
            toast.error(err.message || 'Failed to create issue');
            console.error('Error creating issue:', error);
        }
    };

    const handleIssueClick = (issueId: string) => {
        router.push(`/dashboard/${orgId}/projects/${projectId}/issues/${issueId}`);
    };

    const handleAddMembers = async () => {
        if (!selectedMembers.length || !selectedRole) return;

        try {
            await Promise.all(
                selectedMembers.map(userId =>
                    projectsApi.addMember(projectId, {
                        userId,
                        role: selectedRole
                    })
                )
            );
            toast.success('Members added successfully');
            setShowMembersModal(false);
            setSelectedMembers([]);
            setSelectedRole('MEMBER');
            await fetchProjectDetails();
        } catch (error: unknown) {
            const err = error as Error;
            toast.error(err.message || 'Failed to add members');
            console.error('Error adding members:', error);
        }
    };

    const handleRemoveMember = async (memberId: string) => {
        try {
            await projectsApi.removeMember(projectId, memberId);
            toast.success('Member removed successfully');
            await fetchProjectDetails();
        } catch (error: unknown) {
            const err = error as Error;
            toast.error(err.message || 'Failed to remove member');
            console.error('Error removing member:', error);
        }
    };

    const filteredIssues = issues.filter(issue => {
        if (searchQuery && !issue.title.toLowerCase().includes(searchQuery.toLowerCase())) {
            return false;
        }
        if (statusFilter.length > 0 && !statusFilter.includes(issue.status)) {
            return false;
        }
        if (priorityFilter.length > 0 && !priorityFilter.includes(issue.priority)) {
            return false;
        }
        if (assigneeFilter.length > 0) {
            if (!issue.assignee) return false;
            if (!assigneeFilter.includes(issue.assignee.id)) return false;
        }
        return true;
    });

    const getStatusDetails = (status: IssueStatus) => {
        return statusOptions.find(option => option.value === status) || statusOptions[0];
    };

    const getPriorityDetails = (priority: IssuePriority) => {
        return priorityOptions.find(option => option.value === priority) || priorityOptions[0];
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

            <div className="flex justify-between items-start mb-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
                        {project.isArchived && (
                            <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                                Archived
                            </span>
                        )}
                    </div>
                    <p className="text-gray-500">{project.description || 'No description'}</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="secondary"
                        onClick={() => setShowMembersModal(true)}
                        disabled={project.isArchived}
                    >
                        <Users className="w-4 h-4 mr-2" />
                        Members
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={() => router.push(`/dashboard/${orgId}/projects/${projectId}/settings`)}
                    >
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                    </Button>
                </div>
            </div>

            <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Issues</h2>
                    <Button
                        onClick={() => setShowCreateIssueModal(true)}
                        disabled={project.isArchived}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        New Issue
                    </Button>
                </div>

                {/* Search and filters */}
                <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Search issues..."
                                />
                            </div>
                        </div>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <Filter className="w-5 h-5" />
                            Filters
                            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                        </button>
                    </div>

                    {/* Filter Options */}
                    <AnimatePresence>
                        {showFilters && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="mt-4 pt-4 border-t border-gray-200"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* Status Filter */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Status
                                        </label>
                                        <div className="space-y-2">
                                            {statusOptions.map((option) => {
                                                const Icon = option.icon;
                                                return (
                                                    <label
                                                        key={option.value}
                                                        className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={statusFilter.includes(option.value as IssueStatus)}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    setStatusFilter([...statusFilter, option.value as IssueStatus]);
                                                                } else {
                                                                    setStatusFilter(statusFilter.filter(v => v !== option.value as IssueStatus));
                                                                }
                                                            }}
                                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                        />
                                                        <Icon className={`w-4 h-4 ${option.color.split(' ')[0]}`} />
                                                        {option.label}
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Priority Filter */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Priority
                                        </label>
                                        <div className="space-y-2">
                                            {priorityOptions.map((option) => (
                                                <label
                                                    key={option.value}
                                                    className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={priorityFilter.includes(option.value as IssuePriority)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setPriorityFilter([...priorityFilter, option.value as IssuePriority]);
                                                            } else {
                                                                setPriorityFilter(priorityFilter.filter(v => v !== option.value as IssuePriority));
                                                            }
                                                        }}
                                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                    />
                                                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${option.color}`}>
                                                        {option.label}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Assignee Filter */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Assignee
                                        </label>
                                        <div className="space-y-2">
                                            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={assigneeFilter.includes('unassigned')}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setAssigneeFilter([...assigneeFilter, 'unassigned']);
                                                        } else {
                                                            setAssigneeFilter(assigneeFilter.filter(v => v !== 'unassigned'));
                                                        }
                                                    }}
                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                Unassigned
                                            </label>
                                            {project.members?.map((member) => (
                                                <label
                                                    key={member.id}
                                                    className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={assigneeFilter.includes(member.user.id)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setAssigneeFilter([...assigneeFilter, member.user.id]);
                                                            } else {
                                                                setAssigneeFilter(assigneeFilter.filter(v => v !== member.user.id));
                                                            }
                                                        }}
                                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                    />
                                                    {member.user.name}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {issues.length === 0 ? (
                    <Card className="p-12 text-center">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No issues yet</h3>
                        <p className="text-gray-500 mb-4">Get started by creating your first issue.</p>
                        <Button
                            onClick={() => setShowCreateIssueModal(true)}
                            disabled={project.isArchived}
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Create Issue
                        </Button>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {filteredIssues.map((issue) => (
                            <Card
                                key={issue.id}
                                onClick={() => handleIssueClick(issue.id)}
                                className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-medium text-gray-900 mb-1 truncate">
                                            {issue.title}
                                        </h3>
                                        <p className="text-sm text-gray-500 line-clamp-2">
                                            {issue.description || 'No description'}
                                        </p>
                                        {issue.assignee && (
                                            <div className="mt-2 flex items-center gap-2">
                                                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                                                    {issue.assignee.name.split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <span className="text-sm text-gray-500">{issue.assignee.name}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusDetails(issue.status).color}`}>
                                            {getStatusDetails(issue.status).label}
                                        </span>
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityDetails(issue.priority).color}`}>
                                            {getPriorityDetails(issue.priority).label}
                                        </span>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Issue Modal */}
            <Modal
                isOpen={showCreateIssueModal}
                onClose={() => {
                    setShowCreateIssueModal(false);
                    setNewIssueTitle('');
                    setNewIssueDescription('');
                    setNewIssuePriority('MEDIUM');
                    setSelectedMembers([]);
                }}
                title="Create Issue"
            >
                <div className="space-y-6">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                            Title
                        </label>
                        <input
                            type="text"
                            id="title"
                            value={newIssueTitle}
                            onChange={(e) => setNewIssueTitle(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter issue title"
                        />
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                        </label>
                        <textarea
                            id="description"
                            value={newIssueDescription}
                            onChange={(e) => setNewIssueDescription(e.target.value)}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                            placeholder="Enter issue description"
                        />
                    </div>
                    <div>
                        <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                            Priority
                        </label>
                        <select
                            id="priority"
                            value={newIssuePriority}
                            onChange={(e) => setNewIssuePriority(e.target.value as IssuePriority)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            {priorityOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Assignee
                        </label>
                        <select
                            value={selectedMembers[0] || ''}
                            onChange={(e) => setSelectedMembers(e.target.value ? [e.target.value] : [])}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">Unassigned</option>
                            {project.members?.map((member) => (
                                <option key={member.user.id} value={member.user.id}>
                                    {member.user.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex justify-end gap-3">
                        <Button
                            variant="secondary"
                            onClick={() => {
                                setShowCreateIssueModal(false);
                                setNewIssueTitle('');
                                setNewIssueDescription('');
                                setNewIssuePriority('MEDIUM');
                                setSelectedMembers([]);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleCreateIssue} disabled={!newIssueTitle.trim()}>
                            Create Issue
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Project Members Modal */}
            <Modal
                isOpen={showMembersModal}
                onClose={() => {
                    setShowMembersModal(false);
                    setSelectedMembers([]);
                    setSelectedRole('MEMBER');
                }}
                title="Project Members"
                maxWidth="2xl"
            >
                <div className="space-y-6">
                    <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-3">Current Members</h3>
                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Member</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {project.members?.map((member) => (
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
                                                <select
                                                    value={member.role}
                                                    onChange={(e) => projectsApi.updateMemberRole(projectId, member.id, e.target.value as ProjectRole)
                                                        .then(() => {
                                                            toast.success('Role updated successfully');
                                                            fetchProjectDetails();
                                                        })
                                                        .catch((error) => {
                                                            toast.error('Failed to update role');
                                                            console.error('Error updating role:', error);
                                                        })
                                                    }
                                                    className="text-sm text-gray-900 bg-transparent border-0 cursor-pointer hover:bg-gray-50 rounded px-2 py-1"
                                                >
                                                    <option value="LEAD">Lead</option>
                                                    <option value="MEMBER">Member</option>
                                                    <option value="VIEWER">Viewer</option>
                                                </select>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(member.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <button
                                                    onClick={() => handleRemoveMember(member.id)}
                                                    className="text-red-600 hover:text-red-700 transition-colors"
                                                >
                                                    Remove
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-3">Add Members</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Select Members
                                </label>
                                <div className="space-y-2">
                                    {availableMembers.map((member) => (
                                        <label key={member.id} className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={selectedMembers.includes(member.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedMembers([...selectedMembers, member.id]);
                                                    } else {
                                                        setSelectedMembers(selectedMembers.filter(id => id !== member.id));
                                                    }
                                                }}
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="text-sm text-gray-900">{member.name}</span>
                                            <span className="text-sm text-gray-500">({member.email})</span>
                                        </label>
                                    ))}
                                    {availableMembers.length === 0 && (
                                        <p className="text-sm text-gray-500">No available members to add</p>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Role
                                </label>
                                <select
                                    value={selectedRole}
                                    onChange={(e) => setSelectedRole(e.target.value as ProjectRole)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="LEAD">Lead</option>
                                    <option value="MEMBER">Member</option>
                                    <option value="VIEWER">Viewer</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button
                            variant="secondary"
                            onClick={() => {
                                setShowMembersModal(false);
                                setSelectedMembers([]);
                                setSelectedRole('MEMBER');
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAddMembers}
                            disabled={selectedMembers.length === 0}
                        >
                            Add Selected Members
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
} 