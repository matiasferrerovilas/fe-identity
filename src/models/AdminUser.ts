export type UserType = "PERSONAL" | "ENTERPRISE";

export type UserRole = "ROLE_ADMIN" | "ROLE_FAMILY" | "ROLE_GUEST";

export type WorkspaceRole = "OWNER" | "COLLABORATOR" | "READ_ONLY";

export interface AdminUserWorkspaceMembership {
  workspaceId: number;
  workspaceName: string;
  role: WorkspaceRole;
  joinedAt: string;
}

// Espeja AdminUserSummaryDTO (api-identity, GET /v1/admin/users).
export interface AdminUserSummary {
  id: number;
  email: string;
  givenName: string | null;
  familyName: string | null;
  userType: UserType;
  userRoles: UserRole[];
  createdAt: string;
  workspaces: AdminUserWorkspaceMembership[];
}
