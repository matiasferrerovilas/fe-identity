import { useQuery } from "@tanstack/react-query";
import { getWorkspaceAuditLog } from "@/apis/admin/AdminApi";

// enabled controla la carga: la pestaña de Actividad recién pide el log la primera vez que se
// abre, no en cada expansión de la fila (evita pedir el audit-log de todos los workspaces
// listados de una).
export const useWorkspaceAuditLog = (workspaceId: number, enabled: boolean) =>
  useQuery({
    queryKey: ["admin", "workspaces", workspaceId, "audit-log"],
    queryFn: () => getWorkspaceAuditLog(workspaceId),
    enabled,
    staleTime: 30 * 1000,
  });
