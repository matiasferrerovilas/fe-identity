import { createFileRoute } from "@tanstack/react-router";
import { Alert, Card, Col, Row, Skeleton, Statistic, Typography, theme } from "antd";
import ClockCircleOutlined from "@ant-design/icons/ClockCircleOutlined";
import MailOutlined from "@ant-design/icons/MailOutlined";
import TeamOutlined from "@ant-design/icons/TeamOutlined";
import UserOutlined from "@ant-design/icons/UserOutlined";
import { useAdminSummary } from "@/apis/hooks/useAdminSummary";

const { Title, Paragraph } = Typography;

export const Route = createFileRoute("/_authenticated/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { token } = theme.useToken();
  const { data: summary, isLoading, isError } = useAdminSummary();

  const cards = [
    { title: "Usuarios", value: summary?.totalUsers, icon: <UserOutlined />, color: token.colorPrimary },
    { title: "Workspaces", value: summary?.totalWorkspaces, icon: <TeamOutlined />, color: token.colorSuccess },
    {
      title: "Workspaces creados este mes",
      value: summary?.workspacesCreatedThisMonth,
      icon: <ClockCircleOutlined />,
      color: token.colorWarning,
    },
    { title: "Invitaciones pendientes", value: summary?.pendingInvitations, icon: <MailOutlined />, color: token.colorInfo },
  ];

  return (
    <div>
      <Title level={3}>Identity Admin</Title>
      <Paragraph type="secondary">Panel de administración de api-identity.</Paragraph>

      {isError && (
        <Alert
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
          message="No se pudo cargar el resumen"
          description="Probá recargar la página. Si el problema persiste, puede ser que api-identity no esté disponible."
        />
      )}

      <Row gutter={[16, 16]}>
        {cards.map((card) => (
          <Col xs={24} sm={12} lg={6} key={card.title}>
            <Card>
              {isLoading ? (
                <Skeleton active paragraph={false} title={{ width: "60%" }} />
              ) : (
                <Statistic
                  title={card.title}
                  value={card.value ?? 0}
                  valueStyle={{ color: card.color }}
                  prefix={card.icon}
                />
              )}
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
