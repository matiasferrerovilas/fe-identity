import { useMutation } from "@tanstack/react-query";
import { sendInvitation, type SendInvitationRequest } from "@/apis/admin/AdminApi";

// No invalida ADMIN_WORKSPACES_QUERY_KEY on success: una invitación queda PENDING hasta que el
// invitado la acepta, así que todavía no hay ningún miembro nuevo que mostrar en el listado.
export const useSendInvitation = () =>
  useMutation({
    mutationFn: (request: SendInvitationRequest) => sendInvitation(request),
  });
