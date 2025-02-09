'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ChevronLeft,
    Calendar,
    User,
    AlertCircle,
    Send,
    X,
    ChevronRight,
    MessageSquare,
    Loader2,
    Clock,
    CircleDot,
    CheckCircle2
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { issuesApi } from '@/app/services/issues';
import { projectsApi } from '@/app/services/projects';
import Button from '@/app/components/Button';
import type { Issue, IssueStatus, IssuePriority, IssueComment, Project } from '@/app/types/api';

const statusOptions = [
    { value: 'TODO' as const, label: 'To Do', icon: AlertCircle, color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
    { value: 'IN_PROGRESS' as const, label: 'In Progress', icon: Clock, color: 'text-blue-600 bg-blue-50 border-blue-200' },
    { value: 'IN_REVIEW' as const, label: 'In Review', icon: CircleDot, color: 'text-purple-600 bg-purple-50 border-purple-200' },
    { value: 'DONE' as const, label: 'Done', icon: CheckCircle2, color: 'text-green-600 bg-green-50 border-green-200' }
];

const priorityOptions = [
    { value: 'LOW' as const, label: 'Low', color: 'text-green-600 bg-green-50 border-green-200' },
    { value: 'MEDIUM' as const, label: 'Medium', color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
    { value: 'HIGH' as const, label: 'High', color: 'text-orange-600 bg-orange-50 border-orange-200' },
    { value: 'URGENT' as const, label: 'Urgent', color: 'text-red-600 bg-red-50 border-red-200' }
];

export default function IssueDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const orgId = params.orgId as string;
    const issueId = params.issueId as string;

    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [issue, setIssue] = useState<Issue | null>(null);
    const [project, setProject] = useState<Project | null>(null);
    const [comment, setComment] = useState('');
    const [comments, setComments] = useState<IssueComment[]>([]);

    const fetchIssue = useCallback(async () => {
        try {
            setLoading(true);
            const response = await issuesApi.getById(issueId);
            setIssue(response.data.issue);

            // Fetch project details
            const projectResponse = await projectsApi.getById(response.data.issue.projectId);
            setProject(projectResponse.data.project);

            // Fetch comments
            const commentsResponse = await issuesApi.getComments(issueId);
            setComments(commentsResponse.data.comments);
        } catch (error) {
            toast.error('Failed to fetch issue details');
            console.error('Error fetching issue:', error);
        } finally {
            setLoading(false);
        }
    }, [issueId]);

    useEffect(() => {
        fetchIssue();
    }, [fetchIssue]);

    const handleStatusChange = async (newStatus: IssueStatus) => {
        if (!issue) return;
        try {
            setUpdating(true);
            await issuesApi.update(issueId, { status: newStatus });
            await fetchIssue();
            toast.success('Status updated successfully');
        } catch (error) {
            toast.error('Failed to update status');
            console.error('Error updating status:', error);
        } finally {
            setUpdating(false);
        }
    };

    const handlePriorityChange = async (newPriority: IssuePriority) => {
        if (!issue) return;
        try {
            setUpdating(true);
            await issuesApi.update(issueId, { priority: newPriority });
            await fetchIssue();
            toast.success('Priority updated successfully');
        } catch (error) {
            toast.error('Failed to update priority');
            console.error('Error updating priority:', error);
        } finally {
            setUpdating(false);
        }
    };

    const handleAssigneeChange = async (userId: string | undefined) => {
        if (!issue) return;
        try {
            setUpdating(true);
            await issuesApi.update(issueId, { assigneeId: userId });
            await fetchIssue();
            toast.success('Assignee updated successfully');
        } catch (error) {
            toast.error('Failed to update assignee');
            console.error('Error updating assignee:', error);
        } finally {
            setUpdating(false);
        }
    };

    const handleAddComment = async () => {
        if (!comment.trim() || !issue) return;
        try {
            setUpdating(true);
            await issuesApi.addComment(issueId, { content: comment });
            setComment('');
            await fetchIssue();
            toast.success('Comment added successfully');
        } catch (error) {
            toast.error('Failed to add comment');
            console.error('Error adding comment:', error);
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    if (!issue || !project) {
        return (
            <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 mx-auto text-yellow-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Issue not found</h3>
                <p className="text-gray-500 mb-4">The issue you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.</p>
                <Button
                    variant="secondary"
                    onClick={() => router.push(`/dashboard/${orgId}/issues`)}
                >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Back to Issues
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Section */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => router.push(`/dashboard/${orgId}/issues`)}
                                className="text-gray-500 hover:text-gray-700 transition-colors duration-200 flex items-center space-x-1 group"
                            >
                                <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform duration-200" />
                                <span className="text-sm font-medium">Back to Issues</span>
                            </button>
                            <div className="h-6 w-px bg-gray-300" />
                            <Link
                                href={`/dashboard/${orgId}/projects/${project.id}`}
                                className="text-gray-500 hover:text-gray-700 transition-colors duration-200 flex items-center space-x-1 group"
                            >
                                <span className="text-sm font-medium">{project.key}</span>
                                <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform duration-200" />
                            </Link>
                        </div>
                        <div className="flex items-center space-x-3">
                            {/* Status Dropdown */}
                            <select
                                value={issue.status}
                                onChange={(e) => handleStatusChange(e.target.value as IssueStatus)}
                                className="h-9 pl-3 pr-10 text-sm font-medium rounded-full border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer transition-all duration-200"
                                style={{
                                    borderColor: statusOptions.find((opt) => opt.value === issue.status)?.color || "rgb(209 213 219)",
                                    color: statusOptions.find((opt) => opt.value === issue.status)?.color || "rgb(107 114 128)",
                                }}
                            >
                                {statusOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>

                            {/* Priority Dropdown */}
                            <select
                                value={issue.priority}
                                onChange={(e) => handlePriorityChange(e.target.value as IssuePriority)}
                                className="h-9 px-4 text-sm font-medium rounded-full border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer transition-all duration-200"
                                style={{
                                    borderColor: priorityOptions.find((opt) => opt.value === issue.priority)?.color || "rgb(209 213 219)",
                                    color: priorityOptions.find((opt) => opt.value === issue.priority)?.color || "rgb(107 114 128)",
                                }}
                            >
                                {priorityOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>

                            {/* Assignee */}
                            {issue.assignee ? (
                                <div className="flex items-center space-x-2 h-9 px-4 border-2 border-gray-300 rounded-full bg-white transition-all duration-200 hover:border-gray-400 group">
                                    <div className="h-5 w-5 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                                        <span className="text-xs font-medium text-white">
                                            {issue.assignee.name
                                                .split(" ")
                                                .map((n) => n[0])
                                                .join("")}
                                        </span>
                                    </div>
                                    <span className="text-sm text-gray-700">{issue.assignee.name}</span>
                                    <button
                                        onClick={() => handleAssigneeChange(undefined)}
                                        className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => {
                                        /* TODO: Implement assign modal */
                                    }}
                                    className="h-9 px-4 text-sm text-gray-600 border-2 border-gray-300 rounded-full hover:border-gray-400 transition-all duration-200 inline-flex items-center space-x-2"
                                >
                                    <User className="w-4 h-4" />
                                    <span>Assign</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* Title and metadata */}
                    <div className="px-6 py-5 border-b border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                            <h1 className="text-2xl font-bold text-gray-900">{issue.title}</h1>
                            <span className="px-3 py-1 text-sm font-medium text-gray-600 bg-gray-100 rounded-full">
                                #{issue.number}
                            </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-2">
                                <Calendar className="w-4 h-4" />
                                <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="h-5 w-5 bg-blue-600 rounded-full flex items-center justify-center">
                                    <span className="text-xs font-medium text-white">
                                        {issue.creator.name
                                            .split(" ")
                                            .map((n) => n[0])
                                            .join("")}
                                    </span>
                                </div>
                                <span>{issue.creator.name}</span>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="px-6 py-5 border-b border-gray-200">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Description</h3>
                        <div className="text-sm text-gray-700 whitespace-pre-wrap">
                            {issue.description || <span className="text-gray-400 italic">No description provided.</span>}
                        </div>
                    </div>

                    {/* Comments */}
                    <div className="px-6 py-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-semibold text-gray-900">Comments</h3>
                            <span className="text-sm text-gray-500">{comments.length} comments</span>
                        </div>

                        {/* Comment input */}
                        <div className="mb-6">
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Write a comment..."
                                rows={3}
                                className="w-full text-sm px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none placeholder:text-gray-400 transition-all duration-200"
                            />
                            <div className="mt-3 flex justify-end">
                                <button
                                    onClick={handleAddComment}
                                    disabled={!comment.trim() || updating}
                                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                >
                                    {updating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                                    Add Comment
                                </button>
                            </div>
                        </div>

                        {/* Comments list */}
                        {comments.length > 0 ? (
                            <div className="space-y-4">
                                {comments.map((comment) => (
                                    <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                                        <div className="flex items-start space-x-3">
                                            <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                                                <span className="text-xs font-medium text-white">
                                                    {comment.author.name
                                                        .split(" ")
                                                        .map((n) => n[0])
                                                        .join("")}
                                                </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-sm font-medium text-gray-900">{comment.author.name}</span>
                                                    <span className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleString()}</span>
                                                </div>
                                                <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-gray-50 rounded-lg py-12">
                                <div className="text-center">
                                    <MessageSquare className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                                    <p className="text-sm text-gray-500">No comments yet</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
