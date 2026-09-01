import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Avatar,
  Button,
  Divider,
  Drawer,
  Flex,
  Grid,
  Menu,
  Popover,
  Segmented,
  theme,
  Tooltip,
  Typography,
} from "antd";
import LogoutOutlined from "@ant-design/icons/LogoutOutlined";
import MenuOutlined from "@ant-design/icons/MenuOutlined";
import MoonOutlined from "@ant-design/icons/MoonOutlined";
import SettingOutlined from "@ant-design/icons/SettingOutlined";
import SunOutlined from "@ant-design/icons/SunOutlined";
import TeamOutlined from "@ant-design/icons/TeamOutlined";
import UserOutlined from "@ant-design/icons/UserOutlined";
import { useKeycloak } from "@react-keycloak/web";
import { useRouter, useRouterState } from "@tanstack/react-router";
import { Header } from "antd/es/layout/layout";
import { useTheme } from "@/apis/theme/ThemeContext";

const { Text } = Typography;
const { useBreakpoint } = Grid;

// Mismo navbar que fe-movements (Header sticky, NavSlider central, avatar + popover de perfil,
// drawer mobile), recortado a lo que fe-identity todavía tiene: sin WorkspaceSelector (no está
// scoped a un workspace), sin AppsGrid ni entrada de Admin (esta app YA ES el panel admin), sin
// notificaciones/tour/i18n (no existen acá todavía).

interface SideBarItem {
  key: string;
  icon: ReactNode;
  label: string;
  path: string;
}

const NAV_ITEMS: SideBarItem[] = [
  { key: "users", icon: <TeamOutlined />, label: "Usuarios", path: "/users" },
];

interface ProfileMenuItemProps {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}

function ProfileMenuItem({ icon, label, onClick, danger }: ProfileMenuItemProps) {
  const { token } = theme.useToken();
  return (
    <div
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 16px",
        cursor: "pointer",
        color: danger ? token.colorError : token.colorText,
        transition: "background 0.15s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = token.colorFillTertiary;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
      }}
    >
      <span style={{ fontSize: 15, display: "flex" }}>{icon}</span>
      <Text style={{ fontSize: 13, color: "inherit" }}>{label}</Text>
    </div>
  );
}

interface ProfileTileProps {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

function ProfileTile({ icon, label, onClick, disabled }: ProfileTileProps) {
  const { token } = theme.useToken();
  return (
    <div
      onClick={disabled ? undefined : onClick}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        width: 72,
        padding: 8,
        borderRadius: token.borderRadiusLG,
        cursor: disabled ? "not-allowed" : "pointer",
        color: disabled ? token.colorTextDisabled : token.colorText,
        textAlign: "center",
        opacity: disabled ? 0.6 : 1,
        transition: "background 0.15s ease",
      }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.background = token.colorFillTertiary;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
      }}
    >
      <span style={{ fontSize: 20, display: "flex" }}>{icon}</span>
      <Text style={{ fontSize: 11, color: "inherit" }}>{label}</Text>
    </div>
  );
}

// ── NavSlider ──────────────────────────────────────────────────────────────

interface NavSliderProps {
  items: SideBarItem[];
  activeKey: string;
  onSelect: (item: SideBarItem) => void;
  token: ReturnType<typeof theme.useToken>["token"];
}

function NavSlider({ items, activeKey, onSelect, token }: NavSliderProps) {
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const barRef = useRef<HTMLDivElement | null>(null);
  const mountedRef = useRef(false);

  useEffect(() => {
    const idx = items.findIndex((i) => i.key === activeKey);
    const el = itemRefs.current[idx];
    const bar = barRef.current;
    if (!bar) return;

    if (!el) {
      bar.style.left = "0px";
      bar.style.width = "0px";
      return;
    }

    if (!mountedRef.current) {
      // Primera vez: posicionar sin transición
      bar.style.transition = "none";
      bar.style.left = `${el.offsetLeft}px`;
      bar.style.width = `${el.offsetWidth}px`;
      // Forzar reflow para que el siguiente cambio de transition se aplique
      bar.getBoundingClientRect();
      bar.style.transition =
        "left 0.35s cubic-bezier(0.25, 1, 0.5, 1), width 0.35s cubic-bezier(0.25, 1, 0.5, 1)";
      mountedRef.current = true;
    } else {
      bar.style.left = `${el.offsetLeft}px`;
      bar.style.width = `${el.offsetWidth}px`;
    }
  }, [activeKey, items]);

  return (
    <nav
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: 0,
        flex: "0 0 auto",
      }}
    >
      {items.map((item, idx) => {
        const isActive = item.key === activeKey;
        return (
          <button
            key={item.key}
            ref={(el) => {
              itemRefs.current[idx] = el;
            }}
            onClick={() => onSelect(item)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "0 16px",
              height: 56,
              border: "none",
              background: "transparent",
              cursor: "pointer",
              color: isActive ? token.colorPrimary : token.colorTextSecondary,
              fontSize: token.fontSize,
              fontFamily: "inherit",
              fontWeight: isActive ? 600 : 400,
              transition: `color 0.25s cubic-bezier(0.25, 1, 0.5, 1),
                           font-weight 0.25s cubic-bezier(0.25, 1, 0.5, 1)`,
              whiteSpace: "nowrap",
              outline: "none",
            }}
            onMouseEnter={(e) => {
              if (!isActive) (e.currentTarget as HTMLButtonElement).style.color = token.colorText;
            }}
            onMouseLeave={(e) => {
              if (!isActive) (e.currentTarget as HTMLButtonElement).style.color = token.colorTextSecondary;
            }}
          >
            <span style={{ fontSize: 15, lineHeight: 1, display: "flex" }}>
              {item.icon}
            </span>
            {item.label}
          </button>
        );
      })}

      {/* Sliding indicator bar */}
      <div
        ref={barRef}
        style={{
          position: "absolute",
          bottom: 0,
          height: 2,
          backgroundColor: token.colorPrimary,
          borderRadius: "1px 1px 0 0",
          left: 0,
          width: 0,
          pointerEvents: "none",
        }}
      />
    </nav>
  );
}

export default function NavHeader() {
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const { keycloak } = useKeycloak();
  const { token } = theme.useToken();
  const { isDark, toggleTheme } = useTheme();

  const router = useRouter();
  const currentPath = useRouterState({ select: (s) => s.location.pathname });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const closeProfile = () => setProfileOpen(false);

  // Todavía no hay un endpoint /me propio de fe-identity — el nombre/email salen directo del
  // token de Keycloak en vez de un hook useCurrentUser como en fe-movements/fe-keep.
  const tokenParsed = keycloak.tokenParsed as
    | { given_name?: string; family_name?: string; email?: string }
    | undefined;
  const displayName = tokenParsed?.given_name
    ? [tokenParsed.given_name, tokenParsed.family_name].filter(Boolean).join(" ")
    : undefined;
  const email = tokenParsed?.email;

  const isHome = currentPath === "/";
  const activeKey = NAV_ITEMS.find((i) => i.path === currentPath)?.key ?? "";

  const handleNavClick = (item: SideBarItem) => {
    setDrawerOpen(false);
    router.navigate({ to: item.path });
  };

  const ThemeToggle = (
    <Segmented
      value={isDark ? "dark" : "light"}
      onChange={(v) => {
        if (v !== (isDark ? "dark" : "light")) toggleTheme();
      }}
      shape="round"
      options={[
        {
          label: (
            <span aria-label="Modo claro">
              <SunOutlined />
            </span>
          ),
          value: "light",
        },
        {
          label: (
            <span aria-label="Modo oscuro">
              <MoonOutlined />
            </span>
          ),
          value: "dark",
        },
      ]}
    />
  );

  const ProfilePopoverContent = (
    <div style={{ width: 220 }}>
      <div style={{ padding: "12px 16px" }}>
        <Text strong style={{ display: "block" }}>
          {displayName || email}
        </Text>
      </div>
      <Divider style={{ margin: 0 }} />
      <Flex gap={8} wrap style={{ padding: "8px 16px" }}>
        <Tooltip title="Próximamente">
          <ProfileTile icon={<SettingOutlined />} label="Configuración" disabled onClick={() => {}} />
        </Tooltip>
        <ProfileTile
          icon={isDark ? <SunOutlined /> : <MoonOutlined />}
          label={isDark ? "Modo claro" : "Modo oscuro"}
          onClick={() => {
            toggleTheme();
            closeProfile();
          }}
        />
      </Flex>
      <Divider style={{ margin: 0 }} />
      <div style={{ padding: "4px 0" }}>
        <ProfileMenuItem
          icon={<LogoutOutlined />}
          label="Salir"
          danger
          onClick={() => {
            closeProfile();
            keycloak.logout();
          }}
        />
      </div>
    </div>
  );

  const UserAvatar = (
    <Popover
      content={ProfilePopoverContent}
      placement="bottomRight"
      trigger="click"
      open={profileOpen}
      onOpenChange={setProfileOpen}
      styles={{ root: { marginTop: 8 }, content: { padding: 0 } }}
    >
      <span style={{ display: "inline-flex" }} aria-label="Perfil">
        <Avatar
          size={36}
          icon={<UserOutlined />}
          style={{ backgroundColor: token.colorPrimary, flexShrink: 0, cursor: "pointer" }}
        />
      </span>
    </Popover>
  );

  const Logo = (
    <button
      onClick={() => router.navigate({ to: "/" })}
      style={{
        background: "transparent",
        border: "none",
        cursor: "pointer",
        padding: 4,
        display: "flex",
        alignItems: "center",
        borderRadius: token.borderRadiusSM,
        outline: isHome ? `2px solid ${token.colorPrimary}` : "none",
        outlineOffset: 2,
        transition: "outline 0.2s",
      }}
    >
      <img src="/favicon.svg" alt="Identity Admin" style={{ height: 40, width: 40 }} />
    </button>
  );

  return (
    <>
      <Header
        style={{
          position: "sticky",
          top: 0,
          width: "100%",
          zIndex: 100,
          background: token.colorBgContainer,
          padding: "0 16px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 56,
        }}
      >
        {isMobile ? (
          <>
            <Button
              type="text"
              icon={<MenuOutlined style={{ fontSize: 20 }} />}
              onClick={() => setDrawerOpen(true)}
              aria-label="Abrir menú"
            />
            <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)" }}>
              {Logo}
            </div>
            {UserAvatar}
          </>
        ) : (
          <>
            <Flex style={{ flex: 1 }} align="center" gap={12}>
              {Logo}
              <Text strong style={{ fontSize: 16 }}>
                Identity Admin
              </Text>
            </Flex>
            <NavSlider items={NAV_ITEMS} activeKey={activeKey} onSelect={handleNavClick} token={token} />
            <Flex style={{ flex: 1 }} justify="flex-end" align="center" gap={8}>
              {UserAvatar}
            </Flex>
          </>
        )}
      </Header>

      <Drawer
        title={
          <Flex vertical>
            <Text strong>{displayName || email}</Text>
            {displayName && email && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                {email}
              </Text>
            )}
          </Flex>
        }
        placement="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        size={240}
        styles={{ body: { padding: 0 } }}
      >
        <Menu
          mode="inline"
          selectedKeys={[activeKey]}
          style={{ border: "none", paddingTop: 8 }}
          items={[
            ...NAV_ITEMS.map((item) => ({
              key: item.key,
              icon: item.icon,
              label: item.label,
              onClick: () => handleNavClick(item),
            })),
            { type: "divider" as const },
            {
              key: "settings",
              icon: <SettingOutlined />,
              label: "Configuración",
              disabled: true,
            },
          ]}
        />
        <div style={{ padding: "16px 16px 0" }}>
          <Flex gap={8} style={{ marginBottom: 16 }}>
            {ThemeToggle}
            <Text type="secondary" style={{ lineHeight: "32px", fontSize: 13 }}>
              {isDark ? "Modo oscuro" : "Modo claro"}
            </Text>
          </Flex>
          <Button block danger icon={<LogoutOutlined />} onClick={() => keycloak.logout()}>
            Salir
          </Button>
        </div>
      </Drawer>
    </>
  );
}
