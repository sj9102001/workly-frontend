'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import {
    Search,
    Filter,
    AlertCircle,
    Clock,
    CheckCircle2,
    CircleDot,
    Loader2
} from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { projectsApi } from '@/app/services/projects';
import Button from '@/app/components/Button';
import Card from '@/app/components/Card';
import type { Issue, IssueStatus, IssuePriority } from '@/app/types/api';

const statusOptions = [
    { value: 'TODO' as const, label: 'To Do', icon: AlertCircle, color: 'text-yellow-600 bg-yellow-50' },
    { value: 'IN_PROGRESS' as const, label: 'In Progress', icon: Clock, color: 'text-blue-600 bg-blue-50' },
    { value: 'IN_REVIEW' as const, label: 'In Review', icon: CircleDot, color: 'text-purple-600 bg-purple-50' },
    { value: 'DONE' as const, label: 'Done', icon: CheckCircle2, color: 'text-green-600 bg-green-50' }
];

const priorityOptions = [
    { value: 'LOW' as const, label: 'Low', color: 'text-green-600 bg-green-50' },
    { value: 'MEDIUM' as const, label: 'Medium', color: 'text-yellow-600 bg-yellow-50' },
    { value: 'HIGH' as const, label: 'High', color: 'text-orange-600 bg-orange-50' },
    { value: 'URGENT' as const, label: 'Urgent', color: 'text-red-600 bg-red-50' }
];

export default function IssuesPage() {
    const params = useParams();
    const orgId = params.orgId as string;

    const [loading, setLoading] = useState(true);
    const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);
    const [issues, setIssues] = useState<Issue[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStatuses, setSelectedStatuses] = useState<IssueStatus[]>([]);
    const [selectedPriorities, setSelectedPriorities] = useState<IssuePriority[]>([]);
    const [showFilters, setShowFilters] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            // First get all projects in the organization
            const projectsResponse = await projectsApi.getOrganizationProjects(orgId);
            const projects = projectsResponse.data.projects;
            setProjects(projects);

            // Then fetch issues for each project
            const issuePromises = projects.map(project =>
                projectsApi.getIssues(project.id, {
                    status: selectedStatuses.length > 0 ? selectedStatuses : undefined,
                    priority: selectedPriorities.length > 0 ? selectedPriorities : undefined,
                    search: searchQuery || undefined
                })
            );

            const issueResponses = await Promise.all(issuePromises);
            const allIssues = issueResponses.flatMap(response => response.data.issues);
            setIssues(allIssues);
        } catch (error) {
            toast.error('Failed to fetch issues');
            console.error('Error fetching issues:', error);
        } finally {
            setLoading(false);
        }
    }, [orgId, selectedStatuses, selectedPriorities, searchQuery]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const getStatusDetails = (status: IssueStatus) => {
        const option = statusOptions.find(opt => opt.value === status);
        return {
            label: option?.label || status,
            color: option?.color || 'text-gray-600 bg-gray-50'
        };
    };

    const getPriorityDetails = (priority: IssuePriority) => {
        const option = priorityOptions.find(opt => opt.value === priority);
        return {
            label: option?.label || priority,
            color: option?.color || 'text-gray-600 bg-gray-50'
        };
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Organization Issues</h1>
                    <p className="text-sm text-gray-500">View and manage issues across all projects</p>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search issues..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div className="relative">
                    <Button
                        variant="secondary"
                        onClick={() => setShowFilters(!showFilters)}
                        className="w-full sm:w-auto"
                    >
                        <Filter className="w-4 h-4 mr-2" />
                        Filters
                    </Button>
                    {showFilters && (
                        <Card className="absolute right-0 mt-2 p-4 z-10 w-64 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Status
                                </label>
                                <div className="space-y-2">
                                    {statusOptions.map((option) => (
                                        <label key={option.value} className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={selectedStatuses.includes(option.value)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedStatuses([...selectedStatuses, option.value]);
                                                    } else {
                                                        setSelectedStatuses(selectedStatuses.filter(s => s !== option.value));
                                                    }
                                                }}
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="text-sm text-gray-700">{option.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Priority
                                </label>
                                <div className="space-y-2">
                                    {priorityOptions.map((option) => (
                                        <label key={option.value} className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={selectedPriorities.includes(option.value)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedPriorities([...selectedPriorities, option.value]);
                                                    } else {
                                                        setSelectedPriorities(selectedPriorities.filter(p => p !== option.value));
                                                    }
                                                }}
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="text-sm text-gray-700">{option.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </Card>
                    )}
                </div>
            </div>

            {issues.length === 0 ? (
                <Card className="p-12 text-center">
                    <AlertCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No issues found</h3>
                    <p className="text-gray-500 mb-4">
                        {searchQuery || selectedStatuses.length > 0 || selectedPriorities.length > 0
                            ? 'Try adjusting your filters'
                            : 'No issues have been created yet'}
                    </p>
                </Card>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Issue
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Project
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Priority
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Assignee
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Created
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {issues.map((issue) => {
                                const statusDetails = getStatusDetails(issue.status);
                                const priorityDetails = getPriorityDetails(issue.priority);
                                const project = projects.find(p => p.id === issue.projectId);

                                return (
                                    <tr
                                        key={issue.id}
                                        className="hover:bg-gray-50 cursor-pointer"
                                        onClick={() => window.location.href = `/dashboard/${orgId}/issues/${issue.id}`}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {issue.title}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        #{issue.number}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-900">
                                                {project?.name || 'Unknown Project'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusDetails.color}`}>
                                                {statusDetails.label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${priorityDetails.color}`}>
                                                {priorityDetails.label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {issue.assignee ? (
                                                <div className="flex items-center">
                                                    <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                                                        <span className="text-xs font-medium text-white">
                                                            {issue.assignee.name.split(' ').map(n => n[0]).join('')}
                                                        </span>
                                                    </div>
                                                    <div className="ml-3">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {issue.assignee.name}
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-gray-500">Unassigned</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(issue.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
