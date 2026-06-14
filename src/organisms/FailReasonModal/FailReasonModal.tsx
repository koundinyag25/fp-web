import { useState } from "react";
import { Button } from "@/atoms/Button";
import { Textarea } from "@/atoms/Textarea";
import { Modal } from "@/organisms/Modal";

interface FailReasonModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
  pending?: boolean;
}

/** Captures a required reason before failing a delivery (FR-DL-2). */
export const FailReasonModal = ({ open, onClose, onSubmit, pending }: FailReasonModalProps) => {
  const [reason, setReason] = useState("");
  const [touched, setTouched] = useState(false);
  const trimmed = reason.trim();

  const submit = () => {
    setTouched(true);
    if (trimmed) onSubmit(trimmed);
  };

  return (
    <Modal
      open={open}
      title="Mark delivery failed"
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={submit} disabled={pending}>
            Submit
          </Button>
        </>
      }
    >
      <label htmlFor="fail-reason" className="mb-2 block text-body-sm text-on-surface-variant">
        Reason
      </label>
      <Textarea
        id="fail-reason"
        autoFocus
        value={reason}
        invalid={touched && !trimmed}
        onChange={(e) => setReason(e.target.value)}
        placeholder="e.g. Customer unavailable, access blocked…"
      />
      {touched && !trimmed && <p className="mt-1 text-body-sm text-critical">A reason is required.</p>}
    </Modal>
  );
};
