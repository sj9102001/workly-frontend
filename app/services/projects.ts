import { api } from './api-client';
import type {
    ApiResponse,
    Project,
    GetProjectResponse,
    CreateProjectRequest,
    AddProjectMemberRequest,
    ProjectMember,
    Issue,
    IssueStatus,
    IssuePriority,
} from '../types/api';

interface ApiErrorResponse {
    message?: string;
    [key: string]: unknown;
}

// Error handling helper
const handleApiError = (error: ApiErrorResponse) => {
    // Check if it's a Prisma validation error
    if (error?.message?.includes('prisma')) {
        throw new Error('Invalid request data. Please check your input and try again.');
    }
    throw error;
};

export const projectsApi = {
    // Get all projects for an organization
    getOrganizationProjects: (organizationId: string) =>
        api.get<ApiResponse<{ projects: Project[] }>>(`/organizations/${organizationId}/projects`).catch(handleApiError),

    // Create new project
    create: (organizationId: string, data: CreateProjectRequest) =>
        api.post<ApiResponse<{ project: Project }>>(`/organizations/${organizationId}/projects`, data).catch(handleApiError),

    // Get project details
    getById: (projectId: string) =>
        api.get<ApiResponse<GetProjectResponse>>(`/projects/${projectId}`).catch(handleApiError),

    // Update project
    update: (projectId: string, data: Partial<CreateProjectRequest>) =>
        api.patch<ApiResponse<{ project: Project }>>(`/projects/${projectId}`, data).catch(handleApiError),

    // Archive project
    archive: (projectId: string) =>
        api.post<ApiResponse<{ project: Project }>>(`/projects/${projectId}/archive`, {}).catch(handleApiError),

    // Unarchive project
    unarchive: (projectId: string) =>
        api.post<ApiResponse<{ project: Project }>>(`/projects/${projectId}/unarchive`, {}).catch(handleApiError),

    // Delete project
    delete: (projectId: string) =>
        api.delete<ApiResponse<{ message: string }>>(`/projects/${projectId}`).catch(handleApiError),

    // Get project members
    getMembers: (projectId: string) =>
        api.get<ApiResponse<{ members: ProjectMember[] }>>(`/projects/${projectId}/members`).catch(handleApiError),

    // Add project member
    addMember: (projectId: string, data: AddProjectMemberRequest) =>
        api.post<ApiResponse<{ member: ProjectMember }>>(`/projects/${projectId}/members`, data).catch(handleApiError),

    // Remove project member
    removeMember: (projectId: string, memberId: string) =>
        api.delete<ApiResponse<{ message: string }>>(`/projects/${projectId}/members/${memberId}`).catch(handleApiError),

    // Update member role
    updateMemberRole: (projectId: string, memberId: string, role: string) =>
        api.patch<ApiResponse<{ member: ProjectMember }>>(`/projects/${projectId}/members/${memberId}`, { role }).catch(handleApiError),

    // Get project issues
    getIssues: (projectId: string, filters?: {
        status?: IssueStatus[];
        priority?: IssuePriority[];
        assigneeId?: string;
        search?: string;
    }) => {
        const params = new URLSearchParams();
        if (filters?.status?.length) params.append('status', filters.status.join(','));
        if (filters?.priority?.length) params.append('priority', filters.priority.join(','));
        if (filters?.assigneeId) params.append('assigneeId', filters.assigneeId);
        if (filters?.search) params.append('search', filters.search);

        return api.get<ApiResponse<{ issues: Issue[] }>>(`/projects/${projectId}/issues?${params.toString()}`).catch(handleApiError);
    },
}; 