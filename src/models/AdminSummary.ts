// Espeja AdminSummaryDTO (api-identity, GET /v1/admin/summary).
export interface AdminSummary {
  totalUsers: number;
  totalWorkspaces: number;
  workspacesCreatedThisMonth: number;
  pendingInvitations: number;
}
