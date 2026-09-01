import { Button, Result } from "antd";

type ForbiddenProps = {
  onRetry?: () => void;
};

/**
 * fe-identity es admin-only: cualquier usuario autenticado sin ROLE_ADMIN cae acá (redirigido
 * por protectedRouteGuard en __root.tsx), no solo el que falla al loguearse contra Keycloak.
 */
export default function Forbidden({ onRetry }: ForbiddenProps) {
  return (
    <Result
      status="403"
      title="403"
      subTitle="No tenés permisos para acceder a esta aplicación. Se requiere el rol de administrador."
      extra={
        <Button type="primary" onClick={onRetry ?? (() => window.location.reload())}>
          Reintentar
        </Button>
      }
    />
  );
}
