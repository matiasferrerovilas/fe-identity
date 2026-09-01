import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AxiosInterceptorProvider } from "@/apis/AxiosInterceptorProvider";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { routeTree } from "@/routeTree.gen";
import { ConfigProvider, theme, App as AntdApp } from "antd";
import type { RootRouteContext } from "@/routes/__root";
import { useContext, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { AuthContext } from "@/apis/auth/AuthContext";
import { useKeycloak } from "@react-keycloak/web";
import esES from "antd/locale/es_ES";
import { ThemeProvider } from "@/apis/theme/ThemeProvider";
import { useTheme } from "@/apis/theme/ThemeContext";

declare module "@tanstack/react-router" {
  interface Register {
    context: RootRouteContext;
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      gcTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// El router se crea una sola vez como singleton fuera de cualquier componente.
// El contexto se actualiza via router.update() + router.invalidate() cuando
// el estado de auth cambia, evitando que los guards queden con el contexto frozen.
const router = createRouter({
  routeTree,
  context: {
    queryClient,
    auth: {
      authenticated: false,
      loading: true,
      keycloak: undefined as never,
    },
  },
  defaultPreload: "intent",
  defaultPreloadStaleTime: 0,
});

function RouterWithAuth() {
  const auth = useContext(AuthContext);
  const { keycloak } = useKeycloak();

  // authRef permite leer el valor actual de auth dentro del efecto sin convertirlo
  // en dependencia reactiva — el objeto cambia de referencia en cada render aunque
  // sus valores primitivos (loading, authenticated) sean los mismos.
  const authRef = useRef(auth);
  useLayoutEffect(() => {
    authRef.current = auth;
  });

  // Cada vez que el estado de auth cambia (loading, authenticated) actualizamos el contexto
  // del router y lo invalidamos para que el beforeLoad de _authenticated se re-ejecute con
  // los valores correctos.
  useEffect(() => {
    const currentAuth = authRef.current;
    router.update({
      context: {
        queryClient,
        auth: { ...currentAuth, keycloak },
      },
    });
    if (!currentAuth.loading) {
      router.invalidate();
    }
  }, [auth.loading, auth.authenticated, keycloak]);

  return <RouterProvider router={router} />;
}

function ThemedApp() {
  const { isDark } = useTheme();

  const themeConfig = useMemo(
    () => ({
      algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
      token: {
        fontFamily: "Inter",
        borderRadius: 10,
      },
    }),
    [isDark],
  );

  return (
    <ConfigProvider locale={esES} theme={themeConfig}>
      <AntdApp>
        <AxiosInterceptorProvider>
          <QueryClientProvider client={queryClient}>
            <RouterWithAuth />
          </QueryClientProvider>
        </AxiosInterceptorProvider>
      </AntdApp>
    </ConfigProvider>
  );
}

function App() {
  return (
    <ThemeProvider>
      <ThemedApp />
    </ThemeProvider>
  );
}

export default App;
