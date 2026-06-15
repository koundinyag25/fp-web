import { Pencil, Trash2 } from "lucide-react";
import { Chip } from "@/atoms/Chip";
import { IconButton } from "@/atoms/IconButton";
import type { Column } from "@/organisms/Table";
import type { FilterFieldDef, Product } from "@/types";
import { PRODUCT_UNITS } from "@/types/constants";

interface ColumnActions {
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

const money = (n: number | undefined): string => `$${(n ?? 0).toFixed(2)}`;

export const getProductColumns = ({ onEdit, onDelete }: ColumnActions): Column<Product>[] => [
  { key: "name", header: "Name" },
  { key: "unit", header: "Unit", render: (prod) => <Chip>{prod.unit}</Chip> },
  {
    key: "cost",
    header: "Cost",
    render: (prod) => (
      <span className="font-mono text-code-md text-on-surface-variant">{money(prod.costPrice)}</span>
    ),
  },
  {
    key: "sell",
    header: "Sell",
    render: (prod) => <span className="font-mono text-code-md">{money(prod.sellingPrice)}</span>,
  },
  {
    key: "margin",
    header: "Margin",
    render: (prod) => {
      const m = (prod.sellingPrice ?? 0) - (prod.costPrice ?? 0);
      const pct = prod.costPrice ? Math.round((m / prod.costPrice) * 100) : 0;
      const tone = m > 0 ? "text-success" : m < 0 ? "text-critical" : "text-on-surface-variant";
      return (
        <span className={`font-mono text-code-md ${tone}`}>
          {money(m)} <span className="text-outline">({pct}%)</span>
        </span>
      );
    },
  },
  {
    key: "actions",
    header: "Actions",
    align: "right",
    render: (prod) => (
      <div className="flex justify-end gap-2">
        <IconButton icon={Pencil} label="Edit" onClick={() => onEdit(prod)} />
        <IconButton icon={Trash2} label="Delete" onClick={() => onDelete(prod)} />
      </div>
    ),
  },
];

export const PRODUCT_FILTER_FIELDS: FilterFieldDef[] = [
  {
    key: "unit",
    label: "Unit",
    type: "select",
    options: PRODUCT_UNITS.map((u) => ({ value: u, label: u })),
  },
];
