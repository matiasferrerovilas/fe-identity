import { useState } from "react";
import { Button, Form, Input, Modal, message } from "antd";
import PlusOutlined from "@ant-design/icons/PlusOutlined";
import { useCreateWorkspace } from "@/apis/hooks/useCreateWorkspace";

// Crea el workspace con quien administra como OWNER (WorkspaceAddService.buildWorkspace no
// permite elegir otro dueño) — para setear una cuenta a mano, se crea acá y después se invita al
// usuario real con InviteMemberModal, igual que el resto del panel.
export default function CreateWorkspaceModal() {
  const [form] = Form.useForm<{ name: string }>();
  const [open, setOpen] = useState(false);
  const createWorkspaceMutation = useCreateWorkspace();

  const handleClose = () => {
    setOpen(false);
    form.resetFields();
  };

  const handleSubmit = (values: { name: string }) => {
    createWorkspaceMutation.mutate(values.name, {
      onSuccess: () => {
        message.success(`Workspace "${values.name}" creado`);
        handleClose();
      },
      onError: (error) => {
        // @ts-expect-error - response puede estar presente en el error de Axios
        const status = error?.response?.status;
        if (status === 409) {
          message.error("Ya existe un workspace con ese nombre a tu nombre");
        } else {
          message.error("Error al crear el workspace");
        }
      },
    });
  };

  return (
    <>
      <Button type="primary" icon={<PlusOutlined />} onClick={() => setOpen(true)}>
        Crear workspace
      </Button>
      <Modal
        open={open}
        title="Crear workspace"
        onCancel={handleClose}
        destroyOnHidden
        centered
        footer={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            loading={createWorkspaceMutation.isPending}
            onClick={() => form.submit()}
          >
            Crear
          </Button>
        }
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} disabled={createWorkspaceMutation.isPending}>
          <Form.Item
            label="Nombre"
            name="name"
            rules={[{ required: true, message: "Por favor ingresá un nombre" }]}
          >
            <Input placeholder="Nombre del workspace" autoFocus />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
