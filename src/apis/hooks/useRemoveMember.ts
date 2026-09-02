import { useMutation, useQueryClient } from "@tanstack/react-query";
import { removeWorkspaceMember } from "@/apis/admin/AdminApi";
import { ADMIN_WORKSPACES_QUERY_KEY } from "@/apis/hooks/useAdminWorkspaces";

export interface RemoveMemberVariables {
  workspaceId: number;
  userId: number;
}

export const useRemoveMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ workspaceId, userId }: RemoveMemberVariables) =>
      removeWorkspaceMember(workspaceId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_WORKSPACES_QUERY_KEY });
    },
  });
};
