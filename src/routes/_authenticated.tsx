import { createFileRoute, Outlet } from "@tanstack/react-router";
import { protectedRouteGuard } from "@/apis/auth/protectedRouteGuard";
import { RoleEnum } from "@/enums/RoleEnum";

// Layout route sin path propio (prefijo "_"): agrupa todas las rutas que requieren ROLE_ADMIN
// bajo un único guard en vez de repetirlo ruta por ruta como en fe-movements/fe-keep. /forbidden
// queda deliberadamente fuera de este grupo — vive directo bajo __root, sin guard.
export const Route = createFileRoute("/_authenticated")({
  beforeLoad: protectedRouteGuard({ roles: [RoleEnum.ADMIN], redirectTo: "/forbidden" }),
  component: () => <Outlet />,
});
