import { useMutation, useQueryClient } from "@tanstack/react-query";
import { changeMemberRole } from "@/apis/admin/AdminApi";
import { ADMIN_WORKSPACES_QUERY_KEY } from "@/apis/hooks/useAdminWorkspaces";
import type { WorkspaceRole } from "@/models/AdminUser";

export interface ChangeMemberRoleVariables {
  workspaceId: number;
  userId: number;
  newRole: WorkspaceRole;
}

export const useChangeMemberRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ workspaceId, userId, newRole }: ChangeMemberRoleVariables) =>
      changeMemberRole(workspaceId, userId, newRole),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_WORKSPACES_QUERY_KEY });
    },
  });
};
