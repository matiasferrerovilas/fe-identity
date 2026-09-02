export type AuditAction =
  | "INVITATION_SENT"
  | "INVITATION_ACCEPTED"
  | "INVITATION_REJECTED"
  | "INVITATION_CANCELLED"
  | "MEMBER_JOINED"
  | "MEMBER_LEFT"
  | "MEMBER_REMOVED"
  | "OWNERSHIP_TRANSFERRED"
  | "MEMBER_ROLE_CHANGED";

// Espeja AuditLogDTO (api-identity, GET /v1/workspaces/{workspaceId}/audit-log).
export interface AuditLogEntry {
  id: number;
  action: AuditAction;
  actorEmail: string;
  targetEmail: string | null;
  createdAt: string;
}
