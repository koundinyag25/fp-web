import { useState, type FormEvent } from "react";
import { Button } from "@/atoms/Button";
import { Input } from "@/atoms/Input";
import { Select } from "@/atoms/Select";
import { FormField } from "@/molecules/FormField";
import { InventoryEditor, type StockRow } from "@/molecules/InventoryEditor";
import { Modal } from "@/organisms/Modal";
import type { Location, Product } from "@/types";

interface Props {
  open: boolean;
  editing: Location | null;
  products: Product[];
  onClose: () => void;
  onSave: (data: Partial<Location>) => void;
  saving?: boolean;
}

interface Errors {
  name?: string;
  lat?: string;
  lng?: string;
  stock?: string;
}

// A hub carries opening stock; terminals receive product on delivery.
const initialStock = (loc: Location | null): StockRow[] =>
  loc?.inventory ? Object.entries(loc.inventory).map(([productId, quantity]) => ({ productId, quantity })) : [];

const LocationForm = ({
  editing,
  products,
  onClose,
  onSave,
  saving,
}: Omit<Props, "open">) => {
  const [type, setType] = useState<"hub" | "terminal">(editing?.type ?? "hub");
  const [name, setName] = useState(editing?.name ?? "");
  const [lat, setLat] = useState(editing ? String(editing.lat) : "");
  const [lng, setLng] = useState(editing ? String(editing.lng) : "");
  const [stock, setStock] = useState<StockRow[]>(() => initialStock(editing));
  const [errors, setErrors] = useState<Errors>({});

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const latN = Number(lat);
    const lngN = Number(lng);
    const errs: Errors = {};
    if (!name.trim()) errs.name = "Name is required.";
    if (lat === "" || Number.isNaN(latN) || latN < -90 || latN > 90)
      errs.lat = "Latitude must be between -90 and 90.";
    if (lng === "" || Number.isNaN(lngN) || lngN < -180 || lngN > 180)
      errs.lng = "Longitude must be between -180 and 180.";
    if (type === "hub") {
      if (stock.some((r) => !r.productId)) errs.stock = "Pick a product for each stock row, or remove it.";
      else if (stock.some((r) => !Number.isFinite(r.quantity) || r.quantity < 0))
        errs.stock = "Quantity must be 0 or more.";
    }
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const payload: Partial<Location> = { type, name: name.trim(), lat: latN, lng: lngN };
    if (type === "hub") {
      const inventory: Record<string, number> = {};
      for (const r of stock) inventory[r.productId] = r.quantity;
      payload.inventory = inventory;
    }
    onSave(payload);
  };

  return (
    <form onSubmit={submit} className="flex flex-1 flex-col gap-4">
      <FormField label="Type">
        <Select value={type} onChange={(e) => setType(e.target.value as "hub" | "terminal")}>
          <option value="hub">Hub</option>
          <option value="terminal">Terminal</option>
        </Select>
      </FormField>
      <FormField label="Name" error={errors.name}>
        <Input value={name} onChange={(e) => setName(e.target.value)} invalid={!!errors.name} />
      </FormField>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField label="Latitude" error={errors.lat} hint="Decimal degrees, -90..90">
          <Input
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            invalid={!!errors.lat}
            className="font-mono"
            inputMode="decimal"
          />
        </FormField>
        <FormField label="Longitude" error={errors.lng} hint="-180..180">
          <Input
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            invalid={!!errors.lng}
            className="font-mono"
            inputMode="decimal"
          />
        </FormField>
      </div>
      {type === "hub" && (
        <div className="space-y-1">
          <span className="font-mono text-label-caps uppercase tracking-wider text-on-surface-variant">
            Opening stock
          </span>
          <InventoryEditor products={products} value={stock} onChange={setStock} />
          {errors.stock && <p className="font-mono text-label-caps text-critical">{errors.stock}</p>}
        </div>
      )}
      <footer className="mt-auto flex flex-col justify-end gap-3 pt-6 md:mt-6 md:flex-row">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={saving}>
          Save location
        </Button>
      </footer>
    </form>
  );
};

export const LocationFormModal = ({ open, editing, products, onClose, onSave, saving }: Props) => (
  <Modal open={open} title={editing ? "Edit location" : "New location"} onClose={onClose}>
    {/* key remounts the form so its state resets between new/edit targets */}
    <LocationForm
      key={editing?._id ?? "new"}
      editing={editing}
      products={products}
      onClose={onClose}
      onSave={onSave}
      saving={saving}
    />
  </Modal>
);
