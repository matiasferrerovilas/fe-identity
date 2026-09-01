import { useQuery } from "@tanstack/react-query";
import { getAdminUsers } from "@/apis/admin/AdminApi";

export const ADMIN_USERS_QUERY_KEY = ["admin", "users"];

export const useAdminUsers = () =>
  useQuery({
    queryKey: ADMIN_USERS_QUERY_KEY,
    queryFn: () => getAdminUsers(),
    staleTime: 60 * 1000,
  });
