'use client';

import { useState } from 'react';
import {
    Plus,
    Search,
    Filter,
    ArrowUp,
    ArrowDown,
    Clock,
    AlertCircle,
    CheckCircle2,
    Circle,
} from 'lucide-react';

interface Issue {
    id: string;
    title: string;
    status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
    priority: 'High' | 'Medium' | 'Low';
    assignee: string;
    project: string;
    created: string;
    updated: string;
}

const initialIssues: Issue[] = [
    {
        id: 'ISSUE-1',
        title: 'Dashboard loading performance issues',
        status: 'Open',
        priority: 'High',
        assignee: 'Sarah Chen',
        project: 'Frontend App',
        created: '2024-01-15',
        updated: '2024-01-20',
    },
    {
        id: 'ISSUE-2',
        title: 'API rate limiting not working',
        status: 'In Progress',
        priority: 'High',
        assignee: 'Mike Wilson',
        project: 'Backend API',
        created: '2024-01-14',
        updated: '2024-01-19',
    },
    {
        id: 'ISSUE-3',
        title: 'Update user documentation',
        status: 'Resolved',
        priority: 'Low',
        assignee: 'Anna Johnson',
        project: 'Documentation',
        created: '2024-01-10',
        updated: '2024-01-18',
    },
];

export default function IssuesPage() {
    const [issues] = useState<Issue[]>(initialIssues);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortField, setSortField] = useState<keyof Issue>('updated');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    const getStatusColor = (status: Issue['status']) => {
        switch (status) {
            case 'Open':
                return 'text-red-600 bg-red-50';
            case 'In Progress':
                return 'text-yellow-600 bg-yellow-50';
            case 'Resolved':
                return 'text-green-600 bg-green-50';
            case 'Closed':
                return 'text-gray-600 bg-gray-50';
        }
    };

    const getStatusIcon = (status: Issue['status']) => {
        switch (status) {
            case 'Open':
                return AlertCircle;
            case 'In Progress':
                return Clock;
            case 'Resolved':
                return CheckCircle2;
            case 'Closed':
                return Circle;
        }
    };

    const handleSort = (field: keyof Issue) => {
        if (field === sortField) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const filteredAndSortedIssues = issues
        .filter((issue) =>
            issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            issue.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            issue.assignee.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => {
            const aValue = a[sortField];
            const bValue = b[sortField];
            const direction = sortDirection === 'asc' ? 1 : -1;
            return aValue < bValue ? -direction : aValue > bValue ? direction : 0;
        });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Issues</h1>
                    <p className="text-sm text-gray-500">Track and manage project issues.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Plus size={18} />
                    New Issue
                </button>
            </div>

            <div className="bg-white rounded-lg border border-gray-200">
                {/* Toolbar */}
                <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search issues..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                            <Filter size={18} />
                            Filter
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200 bg-gray-50">
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <button
                                        onClick={() => handleSort('id')}
                                        className="flex items-center gap-2 hover:text-gray-700"
                                    >
                                        ID
                                        {sortField === 'id' && (
                                            sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                                        )}
                                    </button>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <button
                                        onClick={() => handleSort('title')}
                                        className="flex items-center gap-2 hover:text-gray-700"
                                    >
                                        Title
                                        {sortField === 'title' && (
                                            sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                                        )}
                                    </button>
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
                                    Project
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <button
                                        onClick={() => handleSort('updated')}
                                        className="flex items-center gap-2 hover:text-gray-700"
                                    >
                                        Updated
                                        {sortField === 'updated' && (
                                            sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                                        )}
                                    </button>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredAndSortedIssues.map((issue) => {
                                const StatusIcon = getStatusIcon(issue.status);
                                return (
                                    <tr key={issue.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {issue.id}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {issue.title}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <StatusIcon size={16} className={getStatusColor(issue.status)} />
                                                <span className={`text-sm ${getStatusColor(issue.status)}`}>
                                                    {issue.status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`text-xs px-2 py-1 rounded-full ${issue.priority === 'High'
                                                    ? 'bg-red-100 text-red-700'
                                                    : issue.priority === 'Medium'
                                                        ? 'bg-yellow-100 text-yellow-700'
                                                        : 'bg-green-100 text-green-700'
                                                    }`}
                                            >
                                                {issue.priority}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs">
                                                    {issue.assignee.split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <span className="text-sm text-gray-900">{issue.assignee}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {issue.project}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(issue.updated).toLocaleDateString()}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
