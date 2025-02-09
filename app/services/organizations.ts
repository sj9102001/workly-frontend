import { api } from './api-client';
import type {
    ApiResponse,
    Organization,
    GetOrganizationResponse,
    CreateOrganizationRequest,
    InviteMemberRequest,
    OrganizationMember,
    OrganizationInvite,
} from '../types/api';

interface Invitation {
    id: string;
    organizationId: string;
    role: string;
    status: 'PENDING';
    invitedEmail: string;
    createdAt: string;
    updatedAt: string;
}

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

export const organizationsApi = {
    // Get all organizations for the user (including personal)
    getAll: () =>
        api.get<ApiResponse<{
            organizations: Organization[];
            pendingInvites: OrganizationInvite[];
            personalOrganization: Organization;
        }>>('/organizations').catch(handleApiError),

    // Get organization details
    getById: (id: string) =>
        api.get<ApiResponse<GetOrganizationResponse>>(`/organizations/${id}`).catch(handleApiError),

    // Get organization members
    getMembers: (organizationId: string) =>
        api.get<ApiResponse<{ members: OrganizationMember[] }>>(`/organizations/${organizationId}/members`).catch(handleApiError),

    // Create new organization
    create: (data: CreateOrganizationRequest) =>
        api.post<ApiResponse<{ organization: Organization }>>('/organizations', data).catch(handleApiError),

    // Delete organization
    delete: (id: string) =>
        api.delete<ApiResponse<{ message: string }>>(`/organizations/${id}`).catch(handleApiError),

    // Invite member
    inviteMember: (organizationId: string, data: InviteMemberRequest) =>
        api.post<ApiResponse<{ invitation: Invitation }>>(`/organizations/${organizationId}/members/invite`, data).catch(handleApiError),

    // Accept invite
    acceptInvite: (inviteId: string) =>
        api.post<ApiResponse<{ member: OrganizationMember }>>(`/organizations/invites/${inviteId}/accept`, {}).catch(handleApiError),

    // Reject invite
    rejectInvite: (inviteId: string) =>
        api.post<ApiResponse<{ message: string }>>(`/organizations/invites/${inviteId}/reject`, {}).catch(handleApiError),

    // Remove member
    removeMember: (organizationId: string, memberId: string) =>
        api.delete<ApiResponse<{ message: string }>>(`/organizations/${organizationId}/members/${memberId}`).catch(handleApiError),
}; 