import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/atoms/Input";
import { Select } from "@/atoms/Select";
import type { Product } from "@/types";

export interface StockRow {
  productId: string;
  quantity: number;
}

interface InventoryEditorProps {
  products: Product[];
  value: StockRow[];
  onChange: (rows: StockRow[]) => void;
}

/** Editable list of product → opening-quantity rows. Presentational: the parent
 *  owns the product catalogue and the row state. Used to stock a hub on create
 *  or edit (Location.inventory). */
export const InventoryEditor = ({ products, value, onChange }: InventoryEditorProps) => {
  const chosen = new Set(value.map((r) => r.productId).filter(Boolean));
  const unitOf = (id: string) => products.find((p) => p._id === id)?.unit;

  const update = (i: number, patch: Partial<StockRow>) =>
    onChange(value.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  const addRow = () => onChange([...value, { productId: "", quantity: 0 }]);
  const removeRow = (i: number) => onChange(value.filter((_, idx) => idx !== i));

  return (
    <div className="flex flex-col gap-2">
      {value.length === 0 && (
        <p className="text-body-sm text-on-surface-variant">
          No stock yet — add a product to set its opening quantity.
        </p>
      )}
      {value.map((row, i) => (
        <div key={i} className="flex items-center gap-2">
          <Select
            aria-label={`Product ${i + 1}`}
            value={row.productId}
            onChange={(e) => update(i, { productId: e.target.value })}
            className="flex-1"
          >
            <option value="">Select product…</option>
            {products
              .filter((p) => p._id === row.productId || !chosen.has(p._id))
              .map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
          </Select>
          <div className="relative w-32">
            <Input
              aria-label={`Quantity ${i + 1}`}
              type="number"
              min={0}
              inputMode="numeric"
              className="pr-12 font-mono"
              value={Number.isFinite(row.quantity) ? String(row.quantity) : ""}
              onChange={(e) => update(i, { quantity: Number(e.target.value) })}
            />
            {unitOf(row.productId) && (
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-mono text-code-sm text-outline">
                {unitOf(row.productId)}
              </span>
            )}
          </div>
          <button
            type="button"
            aria-label={`Remove product ${i + 1}`}
            onClick={() => removeRow(i)}
            className="text-on-surface-variant hover:text-critical"
          >
            <Trash2 size={16} strokeWidth={1.75} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addRow}
        className="flex items-center gap-1 self-start font-mono text-code-sm text-primary hover:underline"
      >
        <Plus size={14} strokeWidth={1.75} /> Add product
      </button>
    </div>
  );
};
