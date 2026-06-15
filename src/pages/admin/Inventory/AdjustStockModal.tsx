import { useState, type FormEvent } from "react";
import { Button } from "@/atoms/Button";
import { Input } from "@/atoms/Input";
import { FormField } from "@/molecules/FormField";
import { Modal } from "@/organisms/Modal";

/** The cell being adjusted — location + product context plus the current qty. */
export interface AdjustTarget {
  locationId: string;
  locationName: string;
  productId: string;
  productName: string;
  unit?: string;
  qty: number;
}

interface AdjustStockModalProps {
  target: AdjustTarget | null;
  onClose: () => void;
  onSave: (quantity: number) => void;
  saving?: boolean;
}

const AdjustForm = ({
  target,
  onClose,
  onSave,
  saving,
}: { target: AdjustTarget } & Omit<AdjustStockModalProps, "target">) => {
  const [quantity, setQuantity] = useState(String(target.qty));
  const [error, setError] = useState<string>();

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const n = Number(quantity);
    if (quantity.trim() === "" || !Number.isInteger(n) || n < 0) {
      setError("Enter a whole number ≥ 0.");
      return;
    }
    onSave(n);
  };

  return (
    <form onSubmit={submit} className="flex flex-1 flex-col gap-4">
      <p className="text-body-sm text-on-surface-variant">
        {target.locationName} · <span className="text-on-surface">{target.productName}</span>
      </p>
      <FormField label={`On-hand quantity${target.unit ? ` (${target.unit})` : ""}`} error={error}>
        <Input
          type="number"
          inputMode="numeric"
          min={0}
          autoFocus
          className="font-mono"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          invalid={!!error}
        />
      </FormField>
      <footer className="mt-auto flex flex-col justify-end gap-3 pt-6 md:mt-6 md:flex-row">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={saving}>
          Save stock
        </Button>
      </footer>
    </form>
  );
};

export const AdjustStockModal = ({ target, onClose, onSave, saving }: AdjustStockModalProps) => (
  <Modal open={Boolean(target)} title="Adjust stock" onClose={onClose}>
    {target && (
      <AdjustForm
        key={`${target.locationId}:${target.productId}`}
        target={target}
        onClose={onClose}
        onSave={onSave}
        saving={saving}
      />
    )}
  </Modal>
);
