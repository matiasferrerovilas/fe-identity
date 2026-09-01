import { useState } from "react";
import { Button, Form, Input, Modal, Select, message } from "antd";
import PlusCircleOutlined from "@ant-design/icons/PlusCircleOutlined";
import UserAddOutlined from "@ant-design/icons/UserAddOutlined";
import { useSendInvitation } from "@/apis/hooks/useSendInvitation";
import type { WorkspaceRole } from "@/models/AdminUser";

interface InviteMemberModalProps {
  workspaceId: number;
  workspaceName: string;
}

// Mismo flujo que InviteUserToWorkspace.tsx en fe-movements (form de email + rol, mutation a
// POST /invitations/{workspaceId}) — acá sin i18n/ModalComponent, que no existen en fe-identity.
export default function InviteMemberModal({ workspaceId, workspaceName }: InviteMemberModalProps) {
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const sendInvitationMutation = useSendInvitation();

  const handleClose = () => {
    setOpen(false);
    form.resetFields();
  };

  const handleSubmit = (values: { email: string; role: WorkspaceRole }) => {
    sendInvitationMutation.mutate(
      { workspaceId, emails: [values.email], role: values.role },
      {
        onSuccess: () => {
          message.success(`Invitación enviada a ${values.email}`);
          handleClose();
        },
        onError: (error) => {
          // @ts-expect-error - response puede estar presente en el error de Axios
          const status = error?.response?.status;
          if (status === 429) {
            message.error("Alcanzaste el límite de invitaciones enviadas. Probá de nuevo más tarde.");
          } else {
            message.error("Error al enviar la invitación");
          }
        },
      },
    );
  };

  return (
    <>
      <Button
        size="small"
        icon={<UserAddOutlined />}
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
      >
        Agregar miembro
      </Button>
      <Modal
        open={open}
        title={`Invitar a "${workspaceName}"`}
        onCancel={handleClose}
        destroyOnHidden
        centered
        footer={
          <Button
            type="primary"
            icon={<PlusCircleOutlined />}
            loading={sendInvitationMutation.isPending}
            onClick={() => form.submit()}
          >
            Enviar invitación
          </Button>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          disabled={sendInvitationMutation.isPending}
          initialValues={{ role: "COLLABORATOR" }}
        >
          <Form.Item
            label="Correo electrónico"
            name="email"
            rules={[
              { required: true, message: "Por favor ingresá un correo" },
              { type: "email", message: "Ingresá un correo válido" },
            ]}
          >
            <Input placeholder="usuario@ejemplo.com" />
          </Form.Item>
          <Form.Item
            label="Rol"
            name="role"
            rules={[{ required: true, message: "Por favor elegí un rol" }]}
          >
            <Select
              options={[
                { value: "COLLABORATOR", label: "Colaborador — puede crear y editar" },
                { value: "READ_ONLY", label: "Solo lectura — solo puede ver" },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
