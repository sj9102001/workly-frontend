'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Archive, Trash2, AlertTriangle } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { projectsApi } from '@/app/services/projects';
import Button from '@/app/components/Button';
import Card from '@/app/components/Card';
import Modal from '@/app/components/Modal';
import type { Project } from '@/app/types/api';

export default function ProjectSettingsPage() {
    const params = useParams();
    const router = useRouter();
    const orgId = params.orgId as string;
    const projectId = params.projectId as string;

    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [projectName, setProjectName] = useState('');
    const [projectDescription, setProjectDescription] = useState('');
    const [saving, setSaving] = useState(false);
    const [archiving, setArchiving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');

    const fetchProjectDetails = useCallback(async () => {
        try {
            setLoading(true);
            const response = await projectsApi.getById(projectId);
            setProject(response.data.project);
            setProjectName(response.data.project.name);
            setProjectDescription(response.data.project.description || '');
        } catch (error: unknown) {
            const err = error as Error;
            toast.error(err.message || 'Failed to fetch project details');
            console.error('Error fetching project details:', error);
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        fetchProjectDetails();
    }, [fetchProjectDetails]);

    const handleUpdateProject = async () => {
        if (!projectName.trim()) return;

        try {
            setSaving(true);
            await projectsApi.update(projectId, {
                name: projectName,
                description: projectDescription,
            });
            toast.success('Project updated successfully');
            await fetchProjectDetails();
        } catch (error: unknown) {
            const err = error as Error;
            toast.error(err.message || 'Failed to update project');
            console.error('Error updating project:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleArchiveProject = async () => {
        try {
            setArchiving(true);
            if (project?.isArchived) {
                await projectsApi.unarchive(projectId);
                toast.success('Project unarchived successfully');
            } else {
                await projectsApi.archive(projectId);
                toast.success('Project archived successfully');
            }
            await fetchProjectDetails();
        } catch (error: unknown) {
            const err = error as Error;
            toast.error(err.message || 'Failed to update project archive status');
            console.error('Error updating project archive status:', error);
        } finally {
            setArchiving(false);
        }
    };

    const handleDeleteProject = async () => {
        if (deleteConfirmText !== project?.name) {
            toast.error('Please type the project name to confirm deletion');
            return;
        }

        try {
            setDeleting(true);
            await projectsApi.delete(projectId);
            toast.success('Project deleted successfully');
            router.push(`/dashboard/${orgId}/projects`);
        } catch (error: unknown) {
            const err = error as Error;
            toast.error(err.message || 'Failed to delete project');
            console.error('Error deleting project:', error);
            setDeleting(false);
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
                        <h1 className="text-2xl font-bold mb-2">Project Settings</h1>
                        <p className="text-gray-500">Manage project settings and configuration</p>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <Card className="p-6">
                    <h2 className="text-lg font-semibold mb-4">General Settings</h2>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                Project Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                value={projectName}
                                onChange={(e) => setProjectName(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                placeholder="Enter project name"
                            />
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                Description
                            </label>
                            <textarea
                                id="description"
                                value={projectDescription}
                                onChange={(e) => setProjectDescription(e.target.value)}
                                rows={3}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                placeholder="Enter project description"
                            />
                        </div>
                        <div className="flex justify-end">
                            <Button onClick={handleUpdateProject} disabled={!projectName.trim() || saving}>
                                {saving ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <h2 className="text-lg font-semibold mb-4">Archive Project</h2>
                    <p className="text-gray-500 mb-4">
                        {project.isArchived
                            ? 'This project is currently archived. Unarchive it to make it active again.'
                            : 'Archive this project to make it read-only and hide it from active projects.'}
                    </p>
                    <Button
                        variant="secondary"
                        onClick={handleArchiveProject}
                        disabled={archiving}
                    >
                        <Archive className="w-4 h-4 mr-2" />
                        {archiving ? 'Processing...' : project.isArchived ? 'Unarchive Project' : 'Archive Project'}
                    </Button>
                </Card>

                <Card className="p-6">
                    <h2 className="text-lg font-semibold text-red-600 mb-4 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" />
                        Danger Zone
                    </h2>
                    <p className="text-gray-500 mb-4">
                        Once you delete a project, there is no going back. Please be certain.
                    </p>
                    <Button
                        variant="danger"
                        onClick={() => setShowDeleteModal(true)}
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Project
                    </Button>
                </Card>
            </div>

            <Modal
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setDeleteConfirmText('');
                }}
                title="Delete Project"
            >
                <div className="space-y-4">
                    <div className="p-4 bg-red-50 text-red-600 rounded-lg">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                            <p className="text-sm font-medium">This action cannot be undone</p>
                        </div>
                        <p className="text-sm mt-2">
                            This will permanently delete the project and all of its data, including:
                        </p>
                        <ul className="text-sm mt-2 space-y-1 list-disc list-inside">
                            <li>All issues and comments</li>
                            <li>All project members and their roles</li>
                            <li>All project settings and configurations</li>
                        </ul>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Type <span className="font-mono text-red-600">{project.name}</span> to confirm
                        </label>
                        <input
                            type="text"
                            value={deleteConfirmText}
                            onChange={(e) => setDeleteConfirmText(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            placeholder="Type project name"
                        />
                    </div>
                    <div className="flex justify-end space-x-3">
                        <Button
                            variant="secondary"
                            onClick={() => {
                                setShowDeleteModal(false);
                                setDeleteConfirmText('');
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="danger"
                            onClick={handleDeleteProject}
                            disabled={deleting || deleteConfirmText !== project.name}
                        >
                            {deleting ? 'Deleting...' : 'Delete Project'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
} 