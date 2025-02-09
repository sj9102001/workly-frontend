import { ApiResponse, Issue, IssueComment, CreateIssueRequest, UpdateIssueStatusRequest } from '../types/api';

const api = {
    get: async <T>(url: string): Promise<T> => {
        const response = await fetch(`http://localhost:8080/api${url}`, { credentials: 'include' });
        if (!response.ok) {
            throw new Error('API request failed');
        }
        return response.json();
    },
    post: async <T>(url: string, data: unknown): Promise<T> => {
        const response = await fetch(`http://localhost:8080/api${url}`, {
            credentials: 'include',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error('API request failed');
        }
        return response.json();
    },
    patch: async <T>(url: string, data: unknown): Promise<T> => {
        const response = await fetch(`http://localhost:8080/api${url}`, {
            credentials: 'include',
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error('API request failed');
        }
        return response.json();
    },
    delete: async <T>(url: string): Promise<T> => {
        const response = await fetch(`http://localhost:8080/api${url}`, {
            credentials: 'include',
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error('API request failed');
        }
        return response.json();
    },
};

export const issuesApi = {
    getProjectIssues: async (projectId: string, params?: {
        status?: string[];
        priority?: string[];
        search?: string;
    }): Promise<ApiResponse<{ issues: Issue[] }>> => {
        const searchParams = new URLSearchParams();
        if (params?.status?.length) {
            params.status.forEach(status => searchParams.append('status', status));
        }
        if (params?.priority?.length) {
            params.priority.forEach(priority => searchParams.append('priority', priority));
        }
        if (params?.search) {
            searchParams.append('search', params.search);
        }
        const query = searchParams.toString();
        return api.get(`/projects/${projectId}/issues${query ? `?${query}` : ''}`);
    },

    getById: async (issueId: string): Promise<ApiResponse<{ issue: Issue }>> => {
        return api.get(`/projects/issues/${issueId}`);
    },

    create: async (projectId: string, data: CreateIssueRequest): Promise<ApiResponse<{ issue: Issue }>> => {
        return api.post(`/projects/${projectId}/issues`, data);
    },

    update: async (issueId: string, data: Partial<CreateIssueRequest> | UpdateIssueStatusRequest): Promise<ApiResponse<{ issue: Issue }>> => {
        return api.patch(`/projects/issues/${issueId}`, data);
    },

    addComment: async (issueId: string, data: { content: string }): Promise<ApiResponse<{ comment: IssueComment }>> => {
        return api.post(`/projects/issues/${issueId}/comments`, data);
    },

    getComments: async (issueId: string): Promise<ApiResponse<{ comments: IssueComment[] }>> => {
        return api.get(`/projects/issues/${issueId}/comments`);
    },

    deleteComment: async (issueId: string, commentId: string): Promise<ApiResponse<void>> => {
        return api.delete(`/projects/issues/${issueId}/comments/${commentId}`);
    }
}; 