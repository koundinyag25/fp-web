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

interface Errors {
  name?: string;
  costPrice?: string;
  sellingPrice?: string;
}

const ProductForm = ({ editing, onClose, onSave, saving }: Omit<Props, "open">) => {
  const [name, setName] = useState(editing?.name ?? "");
  const [unit, setUnit] = useState(editing?.unit ?? "litre");
  const [costPrice, setCostPrice] = useState(editing ? String(editing.costPrice) : "");
  const [sellingPrice, setSellingPrice] = useState(editing ? String(editing.sellingPrice) : "");
  const [errors, setErrors] = useState<Errors>({});

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const cost = Number(costPrice);
    const sell = Number(sellingPrice);
    const errs: Errors = {};
    if (!name.trim()) errs.name = "Name is required.";
    if (costPrice === "" || Number.isNaN(cost) || cost < 0) errs.costPrice = "Cost price must be 0 or more.";
    if (sellingPrice === "" || Number.isNaN(sell) || sell < 0)
      errs.sellingPrice = "Selling price must be 0 or more.";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    onSave({ name: name.trim(), unit, costPrice: cost, sellingPrice: sell });
  };

  return (
    <form onSubmit={submit} className="flex flex-1 flex-col gap-4">
      <FormField label="Name" error={errors.name}>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          invalid={!!errors.name}
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Cost price" hint="$ per unit" error={errors.costPrice}>
          <Input
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            className="font-mono"
            value={costPrice}
            onChange={(e) => setCostPrice(e.target.value)}
            invalid={!!errors.costPrice}
            placeholder="0.00"
          />
        </FormField>
        <FormField label="Selling price" hint="$ per unit" error={errors.sellingPrice}>
          <Input
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            className="font-mono"
            value={sellingPrice}
            onChange={(e) => setSellingPrice(e.target.value)}
            invalid={!!errors.sellingPrice}
            placeholder="0.00"
          />
        </FormField>
      </div>
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
