'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Plus, Folder, Archive, Search } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { projectsApi } from '@/app/services/projects';
import Button from '@/app/components/Button';
import Card from '@/app/components/Card';
import Modal from '@/app/components/Modal';
import type { Project } from '@/app/types/api';

export default function ProjectsPage() {
    const params = useParams();
    const router = useRouter();
    const orgId = params.orgId as string;

    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');
    const [newProjectDescription, setNewProjectDescription] = useState('');
    const [creating, setCreating] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchProjects = useCallback(async () => {
        try {
            setLoading(true);
            const response = await projectsApi.getOrganizationProjects(orgId);
            setProjects(response.data.projects);
        } catch (error: unknown) {
            const err = error as Error;
            toast.error(err.message || 'Failed to fetch projects');
            console.error('Error fetching projects:', error);
        } finally {
            setLoading(false);
        }
    }, [orgId]);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    const handleCreateProject = async () => {
        if (!newProjectName.trim()) return;

        try {
            setCreating(true);
            await projectsApi.create(orgId, {
                name: newProjectName,
                description: newProjectDescription,
                key: newProjectName.substring(0, 4).toUpperCase(),
            });
            toast.success('Project created successfully');
            setShowCreateModal(false);
            setNewProjectName('');
            setNewProjectDescription('');
            fetchProjects();
        } catch (error: unknown) {
            const err = error as Error;
            toast.error(err.message || 'Failed to create project');
            console.error('Error creating project:', error);
        } finally {
            setCreating(false);
        }
    };

    const handleProjectClick = (projectId: string) => {
        router.push(`/dashboard/${orgId}/projects/${projectId}`);
    };

    const filteredProjects = projects.filter(project =>
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage and organize your team&apos;s projects</p>
                </div>
                <Button onClick={() => setShowCreateModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    New Project
                </Button>
            </div>

            {/* Search and filters */}
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    placeholder="Search projects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
            </div>

            {filteredProjects.length === 0 ? (
                <Card className="p-12 text-center">
                    <Folder className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {searchQuery ? 'No projects found' : 'No projects yet'}
                    </h3>
                    <p className="text-gray-500 mb-4">
                        {searchQuery
                            ? 'Try adjusting your search terms'
                            : 'Get started by creating your first project.'}
                    </p>
                    {!searchQuery && (
                        <Button onClick={() => setShowCreateModal(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Create Project
                        </Button>
                    )}
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProjects.map((project) => (
                        <Card
                            key={project.id}
                            onClick={() => handleProjectClick(project.id)}
                            className="cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1"
                        >
                            <div className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
                                            {project.name}
                                        </h3>
                                        <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                                            {project.description || 'No description'}
                                        </p>
                                    </div>
                                    {project.isArchived && (
                                        <Archive className="w-5 h-5 text-gray-400 flex-shrink-0 ml-4" />
                                    )}
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center space-x-4 text-gray-500">
                                        <span>{project.issues?.length || 0} issues</span>
                                        <span>{project.members?.length || 0} members</span>
                                    </div>
                                    <span className="text-gray-400">{project.key}</span>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            <Modal
                isOpen={showCreateModal}
                onClose={() => {
                    setShowCreateModal(false);
                    setNewProjectName('');
                    setNewProjectDescription('');
                }}
                title="Create New Project"
            >
                <div className="space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                            Project Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            value={newProjectName}
                            onChange={(e) => setNewProjectName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter project name"
                        />
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                        </label>
                        <textarea
                            id="description"
                            value={newProjectDescription}
                            onChange={(e) => setNewProjectDescription(e.target.value)}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                            placeholder="Enter project description"
                        />
                    </div>
                    <div className="flex justify-end gap-3">
                        <Button
                            variant="secondary"
                            onClick={() => {
                                setShowCreateModal(false);
                                setNewProjectName('');
                                setNewProjectDescription('');
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCreateProject}
                            disabled={creating || !newProjectName.trim()}
                        >
                            {creating ? 'Creating...' : 'Create Project'}
                        </Button>
                    </div>
                </div>
            </Modal>

            <ToastContainer position="bottom-right" />
        </div>
    );
} 