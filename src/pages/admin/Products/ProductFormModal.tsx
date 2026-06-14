import { useState, type FormEvent } from "react";
import { Button } from "@/atoms/Button";
import { Input } from "@/atoms/Input";
import { Select } from "@/atoms/Select";
import { FormField } from "@/molecules/FormField";
import { Modal } from "@/organisms/Modal";
import type { Product } from "@/types";
import { PRODUCT_UNITS } from "@/types/constants";

interface Props {
  open: boolean;
  editing: Product | null;
  onClose: () => void;
  onSave: (data: Partial<Product>) => void;
  saving?: boolean;
}

const ProductForm = ({ editing, onClose, onSave, saving }: Omit<Props, "open">) => {
  const [name, setName] = useState(editing?.name ?? "");
  const [unit, setUnit] = useState(editing?.unit ?? "litre");
  const [error, setError] = useState<string | undefined>();

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    onSave({ name: name.trim(), unit });
  };

  return (
    <form onSubmit={submit} className="flex flex-1 flex-col gap-4">
      <FormField label="Name" error={error}>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          invalid={!!error}
          placeholder="e.g. Bio-Diesel"
        />
      </FormField>
      <FormField label="Unit">
        <Select value={unit} onChange={(e) => setUnit(e.target.value)}>
          {PRODUCT_UNITS.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </Select>
      </FormField>
      <footer className="mt-auto flex flex-col justify-end gap-3 pt-6 md:mt-6 md:flex-row">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={saving}>
          Save product
        </Button>
      </footer>
    </form>
  );
};

export const ProductFormModal = ({ open, editing, onClose, onSave, saving }: Props) => (
  <Modal open={open} title={editing ? "Edit product" : "New product"} onClose={onClose}>
    <ProductForm key={editing?._id ?? "new"} editing={editing} onClose={onClose} onSave={onSave} saving={saving} />
  </Modal>
);
