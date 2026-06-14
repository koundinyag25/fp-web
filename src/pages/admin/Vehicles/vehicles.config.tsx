import { Pencil, Trash2 } from "lucide-react";
import { Chip } from "@/atoms/Chip";
import { IconButton } from "@/atoms/IconButton";
import type { Column } from "@/organisms/Table";
import type { FilterFieldDef, Vehicle } from "@/types";
import { VEHICLE_TYPES, type VehicleType } from "@/types/constants";

// Exhaustive over VehicleType: adding a new type without a tone is a compile error.
const TYPE_TONE: Record<VehicleType, "info" | "warning" | "success"> = {
  tanker: "info",
  van: "warning",
  truck: "success",
};

const typeTone = (type: string): "info" | "warning" | "success" | "neutral" =>
  TYPE_TONE[type as VehicleType] ?? "neutral";

const titleCase = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);

interface ColumnActions {
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (vehicle: Vehicle) => void;
}

export const getVehicleColumns = ({ onEdit, onDelete }: ColumnActions): Column<Vehicle>[] => [
  { key: "reg", header: "Reg", render: (v) => <span className="font-mono text-code-md">{v.reg}</span> },
  { key: "type", header: "Type", render: (v) => <Chip tone={typeTone(v.type)}>{v.type}</Chip> },
  {
    key: "capacity",
    header: "Capacity",
    render: (v) => <span className="font-mono text-code-md">{v.capacity} L</span>,
  },
  {
    key: "actions",
    header: "Actions",
    align: "right",
    render: (v) => (
      <div className="flex justify-end gap-2">
        <IconButton icon={Pencil} label="Edit" onClick={() => onEdit(v)} />
        <IconButton icon={Trash2} label="Delete" onClick={() => onDelete(v)} />
      </div>
    ),
  },
];

export const VEHICLE_FILTER_FIELDS: FilterFieldDef[] = [
  {
    key: "type",
    label: "Type",
    type: "select",
    options: VEHICLE_TYPES.map((value) => ({ value, label: titleCase(value) })),
  },
];
