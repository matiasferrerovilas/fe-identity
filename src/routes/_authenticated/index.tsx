import { createFileRoute } from "@tanstack/react-router";
import { Typography } from "antd";

const { Title, Paragraph } = Typography;

export const Route = createFileRoute("/_authenticated/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <Title level={3}>Identity Admin</Title>
      <Paragraph type="secondary">
        Panel de administración de api-identity — en construcción.
      </Paragraph>
    </div>
  );
}
