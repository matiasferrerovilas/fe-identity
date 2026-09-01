import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { Layout } from "antd";
import { Content } from "antd/es/layout/layout";
import type { QueryClient } from "@tanstack/react-query";
import { memo } from "react";
import NavHeader from "@/components/NavHeader";
import { QueryLoadingBoundary } from "@/components/QueryLoadingBoundary";
import NotFound from "@/components/NotFound";
import type { AuthContextState } from "@/apis/auth/AuthContext";
import type Keycloak from "keycloak-js";

export interface RootRouteContext {
  queryClient: QueryClient;
  auth: AuthContextState & {
    keycloak: Keycloak;
  };
}

const MemoizedNavHeader = memo(NavHeader);

function RootComponent() {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <MemoizedNavHeader />
      <Content style={{ padding: 24 }}>
        <QueryLoadingBoundary>
          <Outlet />
        </QueryLoadingBoundary>
      </Content>
    </Layout>
  );
}

// Sin guard acá — correría para /forbidden también y generaría un loop de redirects. El guard
// de ROLE_ADMIN vive en _authenticated.tsx, que agrupa todas las rutas reales de la app.
export const Route = createRootRouteWithContext<RootRouteContext>()({
  component: RootComponent,
  notFoundComponent: NotFound,
});
