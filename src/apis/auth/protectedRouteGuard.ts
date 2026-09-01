import { redirect } from "@tanstack/react-router";
import type { RootRouteContext } from "@/routes/__root";

type ProtectedRouteGuardOptions = {
  roles?: string[];
  redirectTo?: string;
};

// A diferencia de fe-movements/fe-keep, acá no hay flujo de onboarding (firstLogin) — fe-identity
// es admin-only, así que este guard se aplica una sola vez en __root.tsx para toda la app en vez
// de por ruta.
export const protectedRouteGuard = (options?: ProtectedRouteGuardOptions) => {
  return async ({ context }: { context: RootRouteContext }) => {
    const { auth } = context;
    if (auth.loading) return;

    if (options?.roles && options.roles.length > 0) {
      const userRoles = auth?.keycloak?.tokenParsed?.realm_access?.roles || [];

      const hasRequiredRole = options.roles.some((role) => {
        return userRoles.includes(`ROLE_${role}`) || userRoles.includes(role);
      });

      if (!hasRequiredRole) {
        throw redirect({ to: options.redirectTo || "/" });
      }
    }
  };
};
