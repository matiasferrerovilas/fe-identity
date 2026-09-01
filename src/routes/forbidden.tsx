import { createFileRoute } from "@tanstack/react-router";
import { useKeycloak } from "@react-keycloak/web";
import Forbidden from "@/components/Forbidden";

// Sin guard a propósito — si tuviera el mismo guard que /_authenticated, un usuario sin
// ROLE_ADMIN sería redirigido acá y volvería a fallar el guard, generando un loop infinito.
export const Route = createFileRoute("/forbidden")({
  component: RouteComponent,
});

function RouteComponent() {
  const { keycloak } = useKeycloak();
  return <Forbidden onRetry={() => keycloak.logout()} />;
}
