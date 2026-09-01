import { api } from "@/apis/axios";
import type { AdminUserSummary, WorkspaceRole } from "@/models/AdminUser";
import type { AdminWorkspaceSummary } from "@/models/AdminWorkspace";

export const getAdminUsers = () =>
  api.get<AdminUserSummary[]>("/admin/users").then((response) => response.data);

export const getAdminWorkspaces = () =>
  api.get<AdminWorkspaceSummary[]>("/admin/workspaces").then((response) => response.data);

export interface SendInvitationRequest {
  workspaceId: number;
  emails: string[];
  role: WorkspaceRole;
}

// A diferencia del resto de este archivo, este endpoint no vive bajo /admin — es
// POST /v1/invitations/{workspaceId}, el mismo que usa fe-movements. Funciona para un
// ROLE_ADMIN que no es miembro del workspace gracias al bypass agregado en
// WorkspaceMembershipService.requireAtLeastCollaborator.
export const sendInvitation = (request: SendInvitationRequest) =>
  api.post(`/invitations/${request.workspaceId}`, request).then((response) => response.data);
