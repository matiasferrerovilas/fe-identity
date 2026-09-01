import { Button, Result } from "antd";

export function ErrorFallback({ onReload }: { onReload: () => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
      <Result
        status="500"
        title="Algo salió mal"
        subTitle="Ocurrió un error inesperado. Probá recargar la página."
        extra={
          <Button type="primary" onClick={onReload}>
            Recargar
          </Button>
        }
      />
    </div>
  );
}
