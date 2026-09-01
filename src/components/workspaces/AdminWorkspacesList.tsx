import { useMemo, useState } from "react";
import { Alert, Card, Col, Divider, Empty, Flex, Input, Row, Skeleton, Tag, Typography, theme } from "antd";
import DownOutlined from "@ant-design/icons/DownOutlined";
import RightOutlined from "@ant-design/icons/RightOutlined";
import SearchOutlined from "@ant-design/icons/SearchOutlined";
import TeamOutlined from "@ant-design/icons/TeamOutlined";
import UserOutlined from "@ant-design/icons/UserOutlined";
import { useAdminWorkspaces } from "@/apis/hooks/useAdminWorkspaces";
import InviteMemberModal from "@/components/workspaces/InviteMemberModal";
import type { AdminWorkspaceMember, AdminWorkspaceSummary } from "@/models/AdminWorkspace";
import type { WorkspaceRole } from "@/models/AdminUser";

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

function WorkspaceMembers({ members }: { members: AdminWorkspaceMember[] }) {
  const { token } = theme.useToken();

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
              <Tag color={WORKSPACE_ROLE_COLOR[member.role]}>{WORKSPACE_ROLE_LABEL[member.role] ?? member.role}</Tag>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Desde {formatDate(member.joinedAt)}
              </Text>
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
          <InviteMemberModal workspaceId={workspace.id} workspaceName={workspace.name} />
        </Col>
      </Row>

      {expanded && (
        <>
          <Divider style={{ margin: 0 }} />
          <div onClick={(e) => e.stopPropagation()} style={{ cursor: "default" }}>
            <WorkspaceMembers members={workspace.members} />
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
    if (!search.trim()) return workspaces;
    return workspaces.filter((workspace) => matchesSearch(workspace, search));
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
        <Flex align="center" gap={10} style={{ marginBottom: 16 }}>
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
