import { Pencil, Trash2 } from "lucide-react";
import { Avatar } from "@/atoms/Avatar";
import { IconButton } from "@/atoms/IconButton";
import type { Column } from "@/organisms/Table";
import type { Driver, FilterFieldDef } from "@/types";

interface ColumnActions {
  onEdit: (driver: Driver) => void;
  onDelete: (driver: Driver) => void;
}

export const getDriverColumns = ({ onEdit, onDelete }: ColumnActions): Column<Driver>[] => [
  {
    key: "name",
    header: "Name",
    render: (d) => (
      <div className="flex items-center gap-3">
        <Avatar name={d.name} />
        <span>{d.name}</span>
      </div>
    ),
  },
  {
    key: "phone",
    header: "Phone",
    render: (d) => <span className="font-mono text-code-md text-on-surface-variant">{d.phone}</span>,
  },
  {
    key: "license",
    header: "License",
    render: (d) => <span className="font-mono text-code-md text-on-surface-variant">{d.license}</span>,
  },
  {
    key: "actions",
    header: "Actions",
    align: "right",
    render: (d) => (
      <div className="flex justify-end gap-2">
        <IconButton icon={Pencil} label="Edit" onClick={() => onEdit(d)} />
        <IconButton icon={Trash2} label="Delete" onClick={() => onDelete(d)} />
      </div>
    ),
  },
];

// No select filters; the builder still offers created/updated date filters.
export const DRIVER_FILTER_FIELDS: FilterFieldDef[] = [];
