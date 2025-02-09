'use client';

import {
    Folder,
    ClipboardList,
    Users,
    Clock
} from 'lucide-react';

interface RecentActivity {
    id: string;
    type: 'issue_created' | 'issue_updated' | 'project_created' | 'member_added';
    title: string;
    timestamp: string;
    actor: string;
}

export default function OrganizationDashboard() {
    // Mock data - replace with API calls
    const stats = {
        totalProjects: 5,
        totalIssues: 23,
        activeIssues: 8,
        totalMembers: 12
    };

    const recentActivity: RecentActivity[] = [
        {
            id: '1',
            type: 'issue_created',
            title: 'New issue: Implement user authentication',
            timestamp: '2024-01-20T10:00:00Z',
            actor: 'John Smith'
        },
        {
            id: '2',
            type: 'project_created',
            title: 'New project: Frontend Development',
            timestamp: '2024-01-19T15:30:00Z',
            actor: 'Sarah Wilson'
        }
    ];

    return (
        <div className="space-y-8">
            {/* Overview Stats */}
            <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                                <Folder className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Total Projects</p>
                                <p className="text-2xl font-semibold text-gray-900">{stats.totalProjects}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                                <ClipboardList className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Total Issues</p>
                                <p className="text-2xl font-semibold text-gray-900">{stats.totalIssues}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
                                <Clock className="w-6 h-6 text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Active Issues</p>
                                <p className="text-2xl font-semibold text-gray-900">{stats.activeIssues}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                                <Users className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Team Members</p>
                                <p className="text-2xl font-semibold text-gray-900">{stats.totalMembers}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Recent Activity */}
            <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
                <div className="bg-white rounded-lg border border-gray-200">
                    <div className="divide-y divide-gray-200">
                        {recentActivity.map((activity) => (
                            <div key={activity.id} className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-900">{activity.title}</p>
                                        <p className="text-xs text-gray-500">by {activity.actor}</p>
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        {new Date(activity.timestamp).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
} 