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

// Tampoco vive bajo /admin — DELETE /v1/workspaces/{workspaceId}/members/{userId}
// (WorkspaceController.removeMember). Si quien elimina es ROLE_ADMIN y el eliminado era el
// OWNER, el admin pasa a ser el nuevo OWNER del workspace.
export const removeWorkspaceMember = (workspaceId: number, userId: number) =>
  api.delete(`/workspaces/${workspaceId}/members/${userId}`).then((response) => response.data);

// PATCH /v1/workspaces/{workspaceId}/members/{userId}/role — solo COLLABORATOR/READ_ONLY.
// No sirve para asignar ni para cambiar el rol de un OWNER (ver transferOwnership).
export const changeMemberRole = (workspaceId: number, userId: number, newRole: WorkspaceRole) =>
  api
    .patch(`/workspaces/${workspaceId}/members/${userId}/role`, { newRole })
    .then((response) => response.data);

// PATCH /v1/workspaces/{workspaceId}/transfer-ownership — el OWNER actual pasa a COLLABORATOR.
export const transferOwnership = (workspaceId: number, newOwnerUserId: number) =>
  api
    .patch(`/workspaces/${workspaceId}/transfer-ownership`, { newOwnerUserId })
    .then((response) => response.data);
