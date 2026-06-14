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

export const getProductColumns = ({ onEdit, onDelete }: ColumnActions): Column<Product>[] => [
  { key: "name", header: "Name" },
  { key: "unit", header: "Unit", render: (prod) => <Chip>{prod.unit}</Chip> },
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
