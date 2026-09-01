import { useMemo, useState } from "react";
import { Alert, Card, Empty, Flex, Input, Skeleton, Tag, Typography, theme } from "antd";
import SearchOutlined from "@ant-design/icons/SearchOutlined";
import TeamOutlined from "@ant-design/icons/TeamOutlined";
import UserOutlined from "@ant-design/icons/UserOutlined";
import { useAdminUsers } from "@/apis/hooks/useAdminUsers";
import type {
  AdminUserSummary,
  UserRole,
  WorkspaceRole,
} from "@/models/AdminUser";

const { Title, Text } = Typography;

const USER_TYPE_COLOR: Record<string, string> = {
  PERSONAL: "blue",
  ENTERPRISE: "green",
};

const USER_ROLE_LABEL: Record<UserRole, string> = {
  ROLE_ADMIN: "Admin",
  ROLE_FAMILY: "Family",
  ROLE_GUEST: "Guest",
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

function displayName(user: AdminUserSummary): string {
  if (user.givenName) {
    return user.familyName ? `${user.givenName} ${user.familyName}` : user.givenName;
  }
  return user.email;
}

function matchesSearch(user: AdminUserSummary, query: string): boolean {
  const haystack = `${displayName(user)} ${user.email}`.toLowerCase();
  return haystack.includes(query.toLowerCase());
}

function UserRow({ user }: { user: AdminUserSummary }) {
  const { token } = theme.useToken();

  return (
    <Flex
      align="flex-start"
      gap={12}
      style={{ padding: "14px 4px", borderTop: `1px solid ${token.colorBorderSecondary}` }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          background: token.colorPrimaryBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          marginTop: 2,
        }}
      >
        <UserOutlined style={{ fontSize: 15, color: token.colorPrimary }} />
      </div>
      <Flex vertical gap={6} style={{ flex: 1, minWidth: 0 }}>
        <Flex align="center" gap={8} wrap>
          <Text strong>{displayName(user)}</Text>
          <Tag color={USER_TYPE_COLOR[user.userType] ?? "default"}>{user.userType}</Tag>
          {user.userRoles.map((role) => (
            <Tag key={role}>{USER_ROLE_LABEL[role] ?? role}</Tag>
          ))}
        </Flex>
        <Text type="secondary" style={{ fontSize: 13 }}>
          {user.email}
        </Text>
        {user.workspaces.length > 0 ? (
          <Flex gap={6} wrap style={{ marginTop: 2 }}>
            {user.workspaces.map((w) => (
              <Tag key={w.workspaceId} color={WORKSPACE_ROLE_COLOR[w.role]}>
                {w.workspaceName} · {WORKSPACE_ROLE_LABEL[w.role] ?? w.role}
              </Tag>
            ))}
          </Flex>
        ) : (
          <Text type="secondary" style={{ fontSize: 12, fontStyle: "italic" }}>
            No pertenece a ningún workspace
          </Text>
        )}
      </Flex>
    </Flex>
  );
}

export default function AdminUsersList() {
  const { token } = theme.useToken();
  const { data: users, isLoading, isError } = useAdminUsers();
  const [search, setSearch] = useState("");

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    if (!search.trim()) return users;
    return users.filter((user) => matchesSearch(user, search));
  }, [users, search]);

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
            <Title level={5} style={{ margin: 0, fontWeight: 600 }}>
              Usuarios
            </Title>
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
          style={{ marginBottom: 8 }}
        />

        {isError && (
          <Alert
            type="error"
            showIcon
            title="No se pudo cargar el listado de usuarios"
            description="Probá recargar la página. Si el problema persiste, puede ser que api-identity no esté disponible."
            style={{ marginTop: 12 }}
          />
        )}

        {isLoading && <Skeleton active paragraph={{ rows: 4 }} style={{ marginTop: 12 }} />}

        {!isLoading && !isError && filteredUsers.length === 0 && (
          <Empty
            description={search ? "Ningún usuario coincide con la búsqueda" : "No hay usuarios todavía"}
            style={{ marginTop: 24 }}
          />
        )}

        {!isLoading && !isError && filteredUsers.length > 0 && (
          <Flex vertical>
            {filteredUsers.map((user) => (
              <UserRow key={user.id} user={user} />
            ))}
          </Flex>
        )}
      </Card>
    </Flex>
  );
}
