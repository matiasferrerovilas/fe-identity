import { useMemo, useState } from "react";
import { Alert, Button, Card, Col, Divider, Empty, Flex, Input, Popconfirm, Row, Select, Skeleton, Tabs, Tag, Typography, message, theme } from "antd";
import DownOutlined from "@ant-design/icons/DownOutlined";
import RightOutlined from "@ant-design/icons/RightOutlined";
import SearchOutlined from "@ant-design/icons/SearchOutlined";
import TeamOutlined from "@ant-design/icons/TeamOutlined";
import UserDeleteOutlined from "@ant-design/icons/UserDeleteOutlined";
import UserOutlined from "@ant-design/icons/UserOutlined";
import { useAdminWorkspaces } from "@/apis/hooks/useAdminWorkspaces";
import { useChangeMemberRole } from "@/apis/hooks/useChangeMemberRole";
import { useRemoveMember } from "@/apis/hooks/useRemoveMember";
import CreateWorkspaceModal from "@/components/workspaces/CreateWorkspaceModal";
import InviteMemberModal from "@/components/workspaces/InviteMemberModal";
import TransferOwnershipModal from "@/components/workspaces/TransferOwnershipModal";
import WorkspaceAuditLog from "@/components/workspaces/WorkspaceAuditLog";
import { isVisibleWorkspaceName } from "@/utils/workspaceVisibility";
import type { AdminWorkspaceMember, AdminWorkspaceSummary } from "@/models/AdminWorkspace";
import type { WorkspaceRole } from "@/models/AdminUser";

// COLLABORATOR/READ_ONLY son los únicos roles asignables por acá — OWNER solo se otorga vía
// transferir titularidad (ver TransferOwnershipModal), nunca desde este selector.
const CHANGEABLE_ROLE_OPTIONS: { value: Exclude<WorkspaceRole, "OWNER">; label: string }[] = [
  { value: "COLLABORATOR", label: "Colaborador" },
  { value: "READ_ONLY", label: "Solo lectura" },
];

const { Text } = Typography;

const WORKSPACE_ROLE_LABEL: Record<WorkspaceRole, string> = {
  OWNER: "Owner",
  COLLABORATOR: "Colaborador",
  READ_ONLY: "Solo lectura",
};

const WORKSPACE_ROLE_COLOR: Record<WorkspaceRole, string> = {
  OWNER: "gold",
  COLLABORATOR: "blue",
  READ_ONLY: "default",
};

const dateFormatter = new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return dateFormatter.format(new Date(iso));
}

function memberName(member: AdminWorkspaceMember): string {
  if (member.givenName) {
    return member.familyName ? `${member.givenName} ${member.familyName}` : member.givenName;
  }
  return member.email;
}

function matchesSearch(workspace: AdminWorkspaceSummary, query: string): boolean {
  return workspace.name.toLowerCase().includes(query.toLowerCase());
}

const COL_PADDING = "10px 16px";

function WorkspaceMembers({ workspaceId, members }: { workspaceId: number; members: AdminWorkspaceMember[] }) {
  const { token } = theme.useToken();
  const removeMemberMutation = useRemoveMember();
  const changeRoleMutation = useChangeMemberRole();

  const handleRoleChange = (member: AdminWorkspaceMember, newRole: WorkspaceRole) => {
    changeRoleMutation.mutate(
      { workspaceId, userId: member.userId, newRole },
      {
        onSuccess: () => {
          message.success(`${memberName(member)} ahora es ${WORKSPACE_ROLE_LABEL[newRole]}`);
        },
        onError: (error) => {
          // @ts-expect-error - response puede estar presente en el error de Axios
          const status = error?.response?.status;
          if (status === 403) {
            message.error("No se puede cambiar el rol: quien invoca no es OWNER/admin, o el miembro es el OWNER");
          } else {
            message.error("Error al cambiar el rol");
          }
        },
      },
    );
  };

  const handleRemove = (member: AdminWorkspaceMember) => {
    removeMemberMutation.mutate(
      { workspaceId, userId: member.userId },
      {
        onSuccess: () => {
          message.success(`${memberName(member)} fue eliminado del workspace`);
        },
        onError: (error) => {
          // @ts-expect-error - response puede estar presente en el error de Axios
          const status = error?.response?.status;
          if (status === 403) {
            message.error("No se puede eliminar: quien invoca no es OWNER/admin, o intenta eliminarse a sí mismo");
          } else {
            message.error("Error al eliminar al miembro");
          }
        },
      },
    );
  };

  if (members.length === 0) {
    return (
      <div style={{ padding: "12px 16px 16px", background: token.colorFillAlter }}>
        <Text type="secondary" style={{ fontSize: 13 }}>
          Sin miembros
        </Text>
      </div>
    );
  }

  return (
    <div style={{ padding: "12px 16px 16px", background: token.colorFillAlter }}>
      <Flex vertical>
        {members.map((member, idx) => (
          <Flex
            key={member.userId}
            align="center"
            justify="space-between"
            style={{
              padding: "8px 4px",
              borderTop: idx > 0 ? `1px solid ${token.colorBorderSecondary}` : undefined,
            }}
          >
            <Flex align="center" gap={8}>
              <UserOutlined style={{ fontSize: 13, color: token.colorTextTertiary }} />
              <Flex vertical gap={0}>
                <Text>{memberName(member)}</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {member.email}
                </Text>
              </Flex>
            </Flex>
            <Flex align="center" gap={12}>
              {member.role === "OWNER" ? (
                <Tag color={WORKSPACE_ROLE_COLOR.OWNER}>{WORKSPACE_ROLE_LABEL.OWNER}</Tag>
              ) : (
                <Select
                  size="small"
                  value={member.role}
                  options={CHANGEABLE_ROLE_OPTIONS}
                  style={{ width: 132 }}
                  loading={changeRoleMutation.isPending && changeRoleMutation.variables?.userId === member.userId}
                  onChange={(newRole) => handleRoleChange(member, newRole)}
                  onClick={(e) => e.stopPropagation()}
                />
              )}
              <Text type="secondary" style={{ fontSize: 12 }}>
                Desde {formatDate(member.joinedAt)}
              </Text>
              <Popconfirm
                title={`Sacar a ${memberName(member)} del workspace`}
                description={
                  member.role === "OWNER"
                    ? "Es el OWNER — vos vas a pasar a ser el nuevo dueño del workspace."
                    : "Pierde acceso inmediatamente."
                }
                okText="Sacar"
                okButtonProps={{ danger: true }}
                cancelText="Cancelar"
                onConfirm={() => handleRemove(member)}
              >
                <Button
                  size="small"
                  type="text"
                  danger
                  icon={<UserDeleteOutlined />}
                  loading={removeMemberMutation.isPending && removeMemberMutation.variables?.userId === member.userId}
                  aria-label={`Sacar a ${memberName(member)}`}
                />
              </Popconfirm>
            </Flex>
          </Flex>
        ))}
      </Flex>
    </div>
  );
}

function WorkspaceRow({
  workspace,
  expanded,
  onToggle,
}: {
  workspace: AdminWorkspaceSummary;
  expanded: boolean;
  onToggle: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"members" | "activity">("members");

  return (
    <Card
      hoverable
      onClick={onToggle}
      style={{ marginBottom: 8, borderRadius: 6, cursor: "pointer" }}
      styles={{ body: { padding: 0 } }}
    >
      <Row justify="center" align="middle" style={{ padding: COL_PADDING }}>
        <Col span={1}>{expanded ? <DownOutlined /> : <RightOutlined />}</Col>
        <Col span={8}>
          <Text strong>{workspace.name}</Text>
        </Col>
        <Col span={5}>
          <Text type="secondary">{formatDate(workspace.createdAt)}</Text>
        </Col>
        <Col span={4}>
          <Text type="secondary" style={{ fontSize: 13 }}>
            {workspace.members.length} miembro{workspace.members.length !== 1 ? "s" : ""}
          </Text>
        </Col>
        <Col span={6} style={{ textAlign: "right" }}>
          <Flex gap={8} justify="flex-end">
            <TransferOwnershipModal
              workspaceId={workspace.id}
              workspaceName={workspace.name}
              members={workspace.members}
            />
            <InviteMemberModal workspaceId={workspace.id} workspaceName={workspace.name} />
          </Flex>
        </Col>
      </Row>

      {expanded && (
        <>
          <Divider style={{ margin: 0 }} />
          <div onClick={(e) => e.stopPropagation()} style={{ cursor: "default" }}>
            <Tabs
              size="small"
              activeKey={activeTab}
              onChange={(key) => setActiveTab(key as "members" | "activity")}
              tabBarStyle={{ margin: "0 16px" }}
              items={[
                {
                  key: "members",
                  label: "Miembros",
                  children: <WorkspaceMembers workspaceId={workspace.id} members={workspace.members} />,
                },
                {
                  key: "activity",
                  label: "Actividad",
                  children: <WorkspaceAuditLog workspaceId={workspace.id} active={activeTab === "activity"} />,
                },
              ]}
            />
          </div>
        </>
      )}
    </Card>
  );
}

export default function AdminWorkspacesList() {
  const { token } = theme.useToken();
  const { data: workspaces, isLoading, isError } = useAdminWorkspaces();
  const [search, setSearch] = useState("");
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  const filteredWorkspaces = useMemo(() => {
    if (!workspaces) return [];
    const visible = workspaces.filter((workspace) => isVisibleWorkspaceName(workspace.name));
    if (!search.trim()) return visible;
    return visible.filter((workspace) => matchesSearch(workspace, search));
  }, [workspaces, search]);

  const toggleExpanded = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <Flex vertical gap={16}>
      <Card>
        <Flex align="center" justify="space-between" style={{ marginBottom: 16 }}>
          <Flex align="center" gap={10}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: token.borderRadius,
                background: token.colorPrimaryBg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <TeamOutlined style={{ fontSize: 16, color: token.colorPrimary }} />
            </div>
            <div>
              <Text strong style={{ fontSize: 16 }}>
                Workspaces
              </Text>
              <br />
              <Text type="secondary" style={{ fontSize: 13 }}>
                Todos los workspaces de la instancia y sus miembros
              </Text>
            </div>
          </Flex>
          <CreateWorkspaceModal />
        </Flex>

        <Input
          allowClear
          placeholder="Buscar por nombre..."
          prefix={<SearchOutlined style={{ color: token.colorTextTertiary }} />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ marginBottom: 16 }}
        />

        {isError && (
          <Alert
            type="error"
            showIcon
            title="No se pudo cargar el listado de workspaces"
            description="Probá recargar la página. Si el problema persiste, puede ser que api-identity no esté disponible."
          />
        )}

        {isLoading && <Skeleton active paragraph={{ rows: 4 }} />}

        {!isLoading && !isError && filteredWorkspaces.length === 0 && (
          <Empty description={search ? "Ningún workspace coincide con la búsqueda" : "No hay workspaces todavía"} />
        )}
      </Card>

      {!isLoading && !isError && filteredWorkspaces.length > 0 && (
        <>
          <Card style={{ marginBottom: -8, borderRadius: 6 }} styles={{ body: { padding: COL_PADDING } }}>
            <Row justify="center" align="middle">
              <Col span={1} />
              <Col span={8}>Workspace</Col>
              <Col span={5}>Creado</Col>
              <Col span={4}>Miembros</Col>
              <Col span={6} style={{ textAlign: "right" }} />
            </Row>
          </Card>

          <div>
            {filteredWorkspaces.map((workspace) => (
              <WorkspaceRow
                key={workspace.id}
                workspace={workspace}
                expanded={expandedIds.has(workspace.id)}
                onToggle={() => toggleExpanded(workspace.id)}
              />
            ))}
          </div>
        </>
      )}
    </Flex>
  );
}
