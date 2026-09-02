import { useState } from "react";
import { Button, Form, Modal, Select, Tooltip, message } from "antd";
import SwapOutlined from "@ant-design/icons/SwapOutlined";
import { useTransferOwnership } from "@/apis/hooks/useTransferOwnership";
import type { AdminWorkspaceMember } from "@/models/AdminWorkspace";

interface TransferOwnershipModalProps {
  workspaceId: number;
  workspaceName: string;
  members: AdminWorkspaceMember[];
}

function memberLabel(member: AdminWorkspaceMember): string {
  if (member.givenName) {
    return member.familyName ? `${member.givenName} ${member.familyName} (${member.email})` : `${member.givenName} (${member.email})`;
  }
  return member.email;
}

// Mismo flujo que InviteMemberModal — form + mutation, sin i18n/ModalComponent (no existen en
// fe-identity). El OWNER actual no aparece en el selector: transferirse la titularidad a uno
// mismo no tiene sentido y el backend lo rechaza igual (PermissionDeniedException).
export default function TransferOwnershipModal({ workspaceId, workspaceName, members }: TransferOwnershipModalProps) {
  const [form] = Form.useForm<{ newOwnerUserId: number }>();
  const [open, setOpen] = useState(false);
  const transferOwnershipMutation = useTransferOwnership();

  const candidates = members.filter((m) => m.role !== "OWNER");

  const handleClose = () => {
    setOpen(false);
    form.resetFields();
  };

  const handleSubmit = (values: { newOwnerUserId: number }) => {
    const newOwner = candidates.find((m) => m.userId === values.newOwnerUserId);
    transferOwnershipMutation.mutate(
      { workspaceId, newOwnerUserId: values.newOwnerUserId },
      {
        onSuccess: () => {
          message.success(`${newOwner ? memberLabel(newOwner) : "El miembro elegido"} ahora es el OWNER de "${workspaceName}"`);
          handleClose();
        },
        onError: () => {
          message.error("Error al transferir la titularidad");
        },
      },
    );
  };

  return (
    <>
      <Tooltip title={candidates.length === 0 ? "No hay otros miembros a quien transferir" : "Transferir titularidad"}>
        <Button
          size="small"
          icon={<SwapOutlined />}
          disabled={candidates.length === 0}
          aria-label="Transferir titularidad"
          onClick={(e) => {
            e.stopPropagation();
            setOpen(true);
          }}
        />
      </Tooltip>
      <Modal
        open={open}
        title={`Transferir titularidad de "${workspaceName}"`}
        onCancel={handleClose}
        destroyOnHidden
        centered
        footer={
          <Button
            type="primary"
            danger
            icon={<SwapOutlined />}
            loading={transferOwnershipMutation.isPending}
            onClick={() => form.submit()}
          >
            Transferir
          </Button>
        }
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} disabled={transferOwnershipMutation.isPending}>
          <Form.Item
            label="Nuevo OWNER"
            name="newOwnerUserId"
            rules={[{ required: true, message: "Elegí quién va a ser el nuevo OWNER" }]}
          >
            <Select
              placeholder="Seleccioná un miembro"
              options={candidates.map((m) => ({ value: m.userId, label: memberLabel(m) }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
