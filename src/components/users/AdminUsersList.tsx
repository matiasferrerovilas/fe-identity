import { useMemo, useState } from "react";
import { Alert, Card, Col, Divider, Empty, Flex, Input, Row, Skeleton, Tag, Typography, theme } from "antd";
import CheckCircleFilled from "@ant-design/icons/CheckCircleFilled";
import CloseCircleOutlined from "@ant-design/icons/CloseCircleOutlined";
import DownOutlined from "@ant-design/icons/DownOutlined";
import RightOutlined from "@ant-design/icons/RightOutlined";
import SearchOutlined from "@ant-design/icons/SearchOutlined";
import TeamOutlined from "@ant-design/icons/TeamOutlined";
import { useAdminUsers } from "@/apis/hooks/useAdminUsers";
import { isVisibleWorkspaceName } from "@/utils/workspaceVisibility";
import type {
  AdminUserSummary,
  AdminUserWorkspaceMembership,
  UserRole,
  WorkspaceRole,
} from "@/models/AdminUser";

const { Text } = Typography;

const USER_TYPE_COLOR: Record<string, string> = {
  PERSONAL: "blue",
  ENTERPRISE: "green",
};

const USER_ROLE_LABEL: Record<UserRole, string> = {
  ROLE_ADMIN: "Admin",
  ROLE_FAMILY: "Family",
  ROLE_GUEST: "Guest",
};

const USER_ROLE_COLOR: Record<UserRole, string> = {
  ROLE_ADMIN: "gold",
  ROLE_FAMILY: "purple",
  ROLE_GUEST: "default",
};

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

function displayName(user: AdminUserSummary): string {
  if (user.givenName) {
    return user.familyName ? `${user.givenName} ${user.familyName}` : user.givenName;
  }
  return user.email;
}

function visibleWorkspaces(user: AdminUserSummary): AdminUserWorkspaceMembership[] {
  return user.workspaces.filter((w) => isVisibleWorkspaceName(w.workspaceName));
}

function matchesSearch(user: AdminUserSummary, query: string): boolean {
  const haystack = `${displayName(user)} ${user.email}`.toLowerCase();
  return haystack.includes(query.toLowerCase());
}

const COL_PADDING = "10px 16px";

function UserDetails({ user }: { user: AdminUserSummary }) {
  const { token } = theme.useToken();
  const workspaces = visibleWorkspaces(user);

  return (
    <div style={{ padding: "12px 16px 16px", background: token.colorFillAlter }}>
      <Text type="secondary" style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 0.4 }}>
        Workspaces
      </Text>
      <Flex vertical style={{ marginTop: 8, marginBottom: 16 }}>
        {workspaces.length === 0 ? (
          <Text type="secondary" style={{ fontSize: 13 }}>
            No pertenece a ningún workspace
          </Text>
        ) : (
          workspaces.map((w, idx) => (
            <Flex
              key={w.workspaceId}
              align="center"
              justify="space-between"
              style={{
                padding: "8px 4px",
                borderTop: idx > 0 ? `1px solid ${token.colorBorderSecondary}` : undefined,
              }}
            >
              <Text>{w.workspaceName}</Text>
              <Flex align="center" gap={12}>
                <Tag color={WORKSPACE_ROLE_COLOR[w.role]}>{WORKSPACE_ROLE_LABEL[w.role] ?? w.role}</Tag>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Desde {formatDate(w.joinedAt)}
                </Text>
              </Flex>
            </Flex>
          ))
        )}
      </Flex>

      <Text type="secondary" style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 0.4 }}>
        Onboarding
      </Text>
      <Flex vertical style={{ marginTop: 8 }}>
        {user.onboarding.length === 0 ? (
          <Text type="secondary" style={{ fontSize: 13 }}>
            Todavía no hizo onboarding en ninguna app
          </Text>
        ) : (
          user.onboarding.map((o, idx) => (
            <Flex
              key={o.api}
              align="center"
              justify="space-between"
              style={{
                padding: "8px 4px",
                borderTop: idx > 0 ? `1px solid ${token.colorBorderSecondary}` : undefined,
              }}
            >
              <Text>{o.api}</Text>
              {o.hasSeenTour ? (
                <Tag color="success" icon={<CheckCircleFilled />}>
                  Tour completo
                </Tag>
              ) : (
                <Tag color="default" icon={<CloseCircleOutlined />}>
                  Tour pendiente
                </Tag>
              )}
            </Flex>
          ))
        )}
      </Flex>
    </div>
  );
}

function UserRow({
  user,
  expanded,
  onToggle,
}: {
  user: AdminUserSummary;
  expanded: boolean;
  onToggle: () => void;
}) {
  const workspaces = visibleWorkspaces(user);

  return (
    <Card
      hoverable
      onClick={onToggle}
      style={{ marginBottom: 8, borderRadius: 6, cursor: "pointer" }}
      styles={{ body: { padding: 0 } }}
    >
      <Row justify="center" align="middle" style={{ padding: COL_PADDING }}>
        <Col span={1}>{expanded ? <DownOutlined /> : <RightOutlined />}</Col>
        <Col span={7}>
          <Flex vertical gap={0}>
            <Text strong>{displayName(user)}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {user.email}
            </Text>
          </Flex>
        </Col>
        <Col span={3}>
          <Tag color={USER_TYPE_COLOR[user.userType] ?? "default"}>{user.userType}</Tag>
        </Col>
        <Col span={4}>
          <Flex gap={4} wrap>
            {user.userRoles.length === 0 && <Text type="secondary">—</Text>}
            {user.userRoles.map((role) => (
              <Tag key={role} color={USER_ROLE_COLOR[role] ?? "default"}>
                {USER_ROLE_LABEL[role] ?? role}
              </Tag>
            ))}
          </Flex>
        </Col>
        <Col span={4}>
          <Text type="secondary">{formatDate(user.createdAt)}</Text>
        </Col>
        <Col span={5} style={{ textAlign: "right" }}>
          <Text type="secondary" style={{ fontSize: 13 }}>
            {workspaces.length === 0
              ? "Sin workspaces"
              : `${workspaces.length} workspace${workspaces.length > 1 ? "s" : ""}`}
          </Text>
        </Col>
      </Row>

      {expanded && (
        <>
          <Divider style={{ margin: 0 }} />
          <div onClick={(e) => e.stopPropagation()} style={{ cursor: "default" }}>
            <UserDetails user={user} />
          </div>
        </>
      )}
    </Card>
  );
}

export default function AdminUsersList() {
  const { token } = theme.useToken();
  const { data: users, isLoading, isError } = useAdminUsers();
  const [search, setSearch] = useState("");
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    if (!search.trim()) return users;
    return users.filter((user) => matchesSearch(user, search));
  }, [users, search]);

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
              Usuarios
            </Text>
            <br />
            <Text type="secondary" style={{ fontSize: 13 }}>
              Todos los usuarios de la instancia y a qué workspaces pertenecen
            </Text>
          </div>
        </Flex>

        <Input
          allowClear
          placeholder="Buscar por nombre o email..."
          prefix={<SearchOutlined style={{ color: token.colorTextTertiary }} />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ marginBottom: 16 }}
        />

        {isError && (
          <Alert
            type="error"
            showIcon
            title="No se pudo cargar el listado de usuarios"
            description="Probá recargar la página. Si el problema persiste, puede ser que api-identity no esté disponible."
          />
        )}

        {isLoading && <Skeleton active paragraph={{ rows: 4 }} />}

        {!isLoading && !isError && filteredUsers.length === 0 && (
          <Empty description={search ? "Ningún usuario coincide con la búsqueda" : "No hay usuarios todavía"} />
        )}
      </Card>

      {!isLoading && !isError && filteredUsers.length > 0 && (
        <>
          <Card style={{ marginBottom: -8, borderRadius: 6 }} styles={{ body: { padding: COL_PADDING } }}>
            <Row justify="center" align="middle">
              <Col span={1} />
              <Col span={7}>Usuario</Col>
              <Col span={3}>Tipo</Col>
              <Col span={4}>Rol</Col>
              <Col span={4}>Creado</Col>
              <Col span={5} style={{ textAlign: "right" }}>
                Workspaces
              </Col>
            </Row>
          </Card>

          <div>
            {filteredUsers.map((user) => (
              <UserRow
                key={user.id}
                user={user}
                expanded={expandedIds.has(user.id)}
                onToggle={() => toggleExpanded(user.id)}
              />
            ))}
          </div>
        </>
      )}
    </Flex>
  );
}
