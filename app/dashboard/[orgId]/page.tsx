'use client';

import { useParams } from 'next/navigation';
import { Activity, Users, Folder, Star } from 'lucide-react';

export default function OrganizationDashboard() {
    const params = useParams();
    const orgId = params?.orgId as string;

    const stats = [
        {
            label: 'Total Projects',
            value: '12',
            icon: Folder,
            trend: '+2.5%',
            trendUp: true,
        },
        {
            label: 'Active Issues',
            value: '24',
            icon: Activity,
            trend: '+5.0%',
            trendUp: true,
        },
        {
            label: 'Team Members',
            value: '8',
            icon: Users,
            trend: '0%',
            trendUp: null,
        },
        {
            label: 'Completed Tasks',
            value: '64',
            icon: Star,
            trend: '+12.5%',
            trendUp: true,
        },
    ];

    const recentActivity = [
        {
            user: 'Sarah Chen',
            action: 'created a new task',
            target: 'UI Design Review',
            time: '2 hours ago',
        },
        {
            user: 'Mike Wilson',
            action: 'completed',
            target: 'API Integration',
            time: '4 hours ago',
        },
        {
            user: 'Anna Johnson',
            action: 'commented on',
            target: 'Database Schema',
            time: '6 hours ago',
        },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
                <p className="text-sm text-gray-500">
                    {orgId === 'personal'
                        ? "Welcome to your personal workspace"
                        : "Welcome back! Here's what's happening with your organization"}
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={stat.label}
                            className="bg-white p-6 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                        >
                            <div className="flex items-center justify-between">
                                <div className="p-2 bg-blue-50 rounded-lg">
                                    <Icon size={20} className="text-blue-600" />
                                </div>
                                {stat.trend && (
                                    <span
                                        className={`text-sm font-medium ${stat.trendUp ? 'text-green-600' : stat.trendUp === false ? 'text-red-600' : 'text-gray-600'
                                            }`}
                                    >
                                        {stat.trend}
                                    </span>
                                )}
                            </div>
                            <div className="mt-4">
                                <h3 className="text-2xl font-semibold text-gray-900">{stat.value}</h3>
                                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
                </div>
                <div className="divide-y divide-gray-200">
                    {recentActivity.map((activity, i) => (
                        <div key={i} className="px-6 py-4">
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                                    {activity.user.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div>
                                    <p className="text-sm text-gray-900">
                                        <span className="font-medium">{activity.user}</span>{' '}
                                        {activity.action}{' '}
                                        <span className="font-medium">{activity.target}</span>
                                    </p>
                                    <p className="text-xs text-gray-500 mt-0.5">{activity.time}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
} 