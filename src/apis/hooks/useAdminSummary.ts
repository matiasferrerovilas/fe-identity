import { useQuery } from "@tanstack/react-query";
import { getAdminSummary } from "@/apis/admin/AdminApi";

export const useAdminSummary = () =>
  useQuery({
    queryKey: ["admin", "summary"],
    queryFn: () => getAdminSummary(),
    staleTime: 60 * 1000,
  });
