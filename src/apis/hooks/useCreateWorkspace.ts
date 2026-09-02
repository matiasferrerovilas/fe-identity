import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createWorkspace } from "@/apis/admin/AdminApi";
import { ADMIN_WORKSPACES_QUERY_KEY } from "@/apis/hooks/useAdminWorkspaces";

export const useCreateWorkspace = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => createWorkspace(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_WORKSPACES_QUERY_KEY });
    },
  });
};
