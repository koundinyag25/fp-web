import { Pencil, Trash2 } from "lucide-react";
import { Chip } from "@/atoms/Chip";
import { IconButton } from "@/atoms/IconButton";
import type { Column } from "@/organisms/Table";
import type { FilterFieldDef, Location } from "@/types";

interface ColumnActions {
  onEdit: (loc: Location) => void;
  onDelete: (loc: Location) => void;
}

export const getLocationColumns = ({ onEdit, onDelete }: ColumnActions): Column<Location>[] => [
  { key: "name", header: "Name" },
  {
    key: "type",
    header: "Type",
    render: (l) => <Chip tone={l.type === "hub" ? "primary" : "info"}>{l.type}</Chip>,
  },
  {
    key: "coords",
    header: "Coordinates",
    align: "center",
    render: (l) => (
      <span className="font-mono text-code-md text-on-surface-variant">
        {l.lat}, {l.lng}
      </span>
    ),
  },
  {
    key: "products",
    header: "Products stocked",
    align: "center",
    render: (l) => (
      <span className="font-mono text-code-md">{Object.keys(l.inventory ?? {}).length}</span>
    ),
  },
  {
    key: "actions",
    header: "Actions",
    align: "right",
    render: (l) => (
      <div className="flex justify-end gap-2">
        <IconButton icon={Pencil} label="Edit" onClick={() => onEdit(l)} />
        <IconButton icon={Trash2} label="Delete" onClick={() => onDelete(l)} />
      </div>
    ),
  },
];

export const LOCATION_FILTER_FIELDS: FilterFieldDef[] = [
  {
    key: "type",
    label: "Type",
    type: "select",
    options: [
      { value: "hub", label: "Hub" },
      { value: "terminal", label: "Terminal" },
    ],
  },
];
