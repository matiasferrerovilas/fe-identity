import { useMutation, useQueryClient } from "@tanstack/react-query";
import { transferOwnership } from "@/apis/admin/AdminApi";
import { ADMIN_WORKSPACES_QUERY_KEY } from "@/apis/hooks/useAdminWorkspaces";

export interface TransferOwnershipVariables {
  workspaceId: number;
  newOwnerUserId: number;
}

export const useTransferOwnership = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ workspaceId, newOwnerUserId }: TransferOwnershipVariables) =>
      transferOwnership(workspaceId, newOwnerUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_WORKSPACES_QUERY_KEY });
    },
  });
};
