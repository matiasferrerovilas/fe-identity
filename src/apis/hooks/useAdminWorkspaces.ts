import { useQuery } from "@tanstack/react-query";
import { getAdminWorkspaces } from "@/apis/admin/AdminApi";

export const ADMIN_WORKSPACES_QUERY_KEY = ["admin", "workspaces"];

export const useAdminWorkspaces = () =>
  useQuery({
    queryKey: ADMIN_WORKSPACES_QUERY_KEY,
    queryFn: () => getAdminWorkspaces(),
    staleTime: 60 * 1000,
  });
