import { Button, Result } from "antd";
import { Link } from "@tanstack/react-router";

export default function NotFound() {
  return (
    <Result
      status="404"
      title="Página no encontrada"
      subTitle="La página que buscás no existe o fue movida."
      extra={
        <Link to="/">
          <Button type="primary">Volver al inicio</Button>
        </Link>
      }
    />
  );
}
