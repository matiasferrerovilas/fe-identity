import { Empty, Flex, Skeleton, Typography, theme } from "antd";
import HistoryOutlined from "@ant-design/icons/HistoryOutlined";
import { useWorkspaceAuditLog } from "@/apis/hooks/useWorkspaceAuditLog";
import type { AuditLogEntry } from "@/models/AuditLog";

const { Text } = Typography;

const dateTimeFormatter = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

// actorEmail/targetEmail según quién dispara cada acción en AuditLogService — ver
// WorkspaceMembershipService/WorkspaceInvitationService. En INVITATION_ACCEPTED/REJECTED y
// MEMBER_JOINED/LEFT el actor es el propio usuario afectado, así que no hay target.
function describe(entry: AuditLogEntry): string {
  const actor = entry.actorEmail;
  const target = entry.targetEmail;
  switch (entry.action) {
    case "INVITATION_SENT":
      return `${actor} invitó a ${target}`;
    case "INVITATION_ACCEPTED":
      return `${actor} aceptó la invitación`;
    case "INVITATION_REJECTED":
      return `${actor} rechazó la invitación`;
    case "INVITATION_CANCELLED":
      return `${actor} canceló la invitación a ${target}`;
    case "MEMBER_JOINED":
      return `${actor} se unió al workspace`;
    case "MEMBER_LEFT":
      return `${actor} dejó el workspace`;
    case "MEMBER_REMOVED":
      return `${actor} sacó a ${target} del workspace`;
    case "OWNERSHIP_TRANSFERRED":
      return `${actor} transfirió la titularidad a ${target}`;
    case "MEMBER_ROLE_CHANGED":
      return `${actor} cambió el rol de ${target}`;
    default:
      return `${actor} — ${entry.action}`;
  }
}

export default function WorkspaceAuditLog({ workspaceId, active }: { workspaceId: number; active: boolean }) {
  const { token } = theme.useToken();
  const { data: entries, isLoading, isError } = useWorkspaceAuditLog(workspaceId, active);

  if (isLoading) {
    return (
      <div style={{ padding: "12px 16px 16px", background: token.colorFillAlter }}>
        <Skeleton active paragraph={{ rows: 3 }} />
      </div>
    );
  }

  if (isError) {
    return (
      <div style={{ padding: "12px 16px 16px", background: token.colorFillAlter }}>
        <Text type="danger" style={{ fontSize: 13 }}>
          No se pudo cargar la actividad de este workspace.
        </Text>
      </div>
    );
  }

  if (!entries || entries.length === 0) {
    return (
      <div style={{ padding: "12px 16px 16px", background: token.colorFillAlter }}>
        <Empty description="Sin actividad registrada" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      </div>
    );
  }

  return (
    <div style={{ padding: "12px 16px 16px", background: token.colorFillAlter }}>
      <Flex vertical>
        {entries.map((entry, idx) => (
          <Flex
            key={entry.id}
            align="center"
            gap={10}
            style={{
              padding: "8px 4px",
              borderTop: idx > 0 ? `1px solid ${token.colorBorderSecondary}` : undefined,
            }}
          >
            <HistoryOutlined style={{ fontSize: 13, color: token.colorTextTertiary }} />
            <Text style={{ fontSize: 13, flex: 1 }}>{describe(entry)}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {dateTimeFormatter.format(new Date(entry.createdAt))}
            </Text>
          </Flex>
        ))}
      </Flex>
    </div>
  );
}
