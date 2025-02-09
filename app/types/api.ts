// Common Types
export interface User {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string | null;
}

export type OrgRole = 'OWNER' | 'ADMIN' | 'MEMBER';
export type ProjectRole = 'LEAD' | 'MEMBER' | 'VIEWER';
export type IssueStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
export type IssuePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

// Organization Types
export interface Organization {
    id: string;
    name: string;
    description?: string;
    slug: string;
    logoUrl: string | null;
    role?: OrgRole;
    memberCount?: number;
    projectCount?: number;
    projects?: Project[];
    members?: OrganizationMember[];
    createdAt: string;
    updatedAt: string;
}

export interface OrganizationMember {
    id: string;
    role: OrgRole;
    user: User;
}

export interface OrganizationInvite {
    id: string;
    organization: {
        id: string;
        name: string;
        description?: string;
        logoUrl: string | null;
    };
}

// Project Types
export interface Project {
    id: string;
    name: string;
    key: string;
    description?: string;
    organizationId: string;
    isArchived: boolean;
    members?: ProjectMember[];
    issues?: Issue[];
    createdAt: string;
    updatedAt: string;
}

export interface ProjectMember {
    id: string;
    role: ProjectRole;
    user: User;
    createdAt: string;
    updatedAt: string;
}

// Issue Types
export interface Issue {
    id: string;
    number: number;
    title: string;
    description?: string;
    status: IssueStatus;
    priority: IssuePriority;
    projectId: string;
    assigneeId?: string;
    creatorId: string;
    assignee?: User;
    creator: User;
    project?: {
        id: string;
        name: string;
    };
    comments?: IssueComment[];
    labels?: IssueLabel[];
    createdAt: string;
    updatedAt: string;
}

export interface IssueComment {
    id: string;
    content: string;
    author: User;
    createdAt: string;
}

export interface IssueLabel {
    id: string;
    name: string;
    color: string;
}

// API Response Types
export interface ApiResponse<T> {
    status: 'success';
    data: T;
}

export interface ApiError {
    status: 'error';
    message: string;
}

// Organization API Types
export interface GetOrganizationsResponse {
    organizations: Organization[];
    pendingInvites: OrganizationInvite[];
}

export interface GetOrganizationResponse {
    organization: Organization;
    userRole: OrgRole;
}

export interface CreateOrganizationRequest {
    name: string;
    description?: string;
}

export interface InviteMemberRequest {
    email: string;
    role: OrgRole;
}

// Project API Types
export interface CreateProjectRequest {
    name: string;
    key: string;
    description?: string;
}

export interface GetProjectResponse {
    project: Project;
    userRole: ProjectRole;
}

export interface AddProjectMemberRequest {
    userId: string;
    role: ProjectRole;
}

// Issue API Types
export interface CreateIssueRequest {
    title: string;
    description?: string;
    priority: IssuePriority;
    assigneeId?: string;
}

export interface UpdateIssueStatusRequest {
    status: IssueStatus;
} 