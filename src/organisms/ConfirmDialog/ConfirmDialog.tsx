import { Button } from "@/atoms/Button";
import { Modal } from "@/organisms/Modal";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  pending?: boolean;
}

export const ConfirmDialog = ({
  open,
  title,
  message,
  confirmLabel = "Delete",
  onConfirm,
  onCancel,
  pending,
}: ConfirmDialogProps) => (
  <Modal
    open={open}
    title={title}
    onClose={onCancel}
    footer={
      <>
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm} disabled={pending}>
          {confirmLabel}
        </Button>
      </>
    }
  >
    <p className="text-body-md text-on-surface-variant">{message}</p>
  </Modal>
);
