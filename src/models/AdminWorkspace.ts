import type { WorkspaceRole } from "@/models/AdminUser";

export interface AdminWorkspaceMember {
  userId: number;
  email: string;
  givenName: string | null;
  familyName: string | null;
  role: WorkspaceRole;
  joinedAt: string;
}

// Espeja AdminWorkspaceSummaryDTO (api-identity, GET /v1/admin/workspaces).
export interface AdminWorkspaceSummary {
  id: number;
  name: string;
  createdAt: string;
  members: AdminWorkspaceMember[];
}
