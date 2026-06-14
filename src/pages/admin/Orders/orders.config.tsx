import { Pencil } from "lucide-react";
import { IconButton } from "@/atoms/IconButton";
import { StatusPill } from "@/atoms/StatusPill";
import type { Column } from "@/organisms/Table";
import type { Order, OrderCounts } from "@/types";
import { ORDER_STATUSES } from "@/types/constants";
import { AssignDriverControl } from "./AssignDriverControl";

// An order's details are locked once it has started moving (a delivery now
// references it); the server enforces this too (409).
const isEditable = (status: string) => status === "pending" || status === "assigned";

const COUNT_CLASS: Record<string, string> = {
  pending: "text-warning",
  assigned: "text-warning",
  in_transit: "text-info",
  completed: "text-success",
  failed: "text-critical",
};

/** Builds the StatusFilterBar options (All + per-status) from the counts map. */
export const buildStatusOptions = (counts: OrderCounts) => {
  const total = ORDER_STATUSES.reduce((sum, s) => sum + (counts[s] ?? 0), 0);
  return [
    { value: "all", label: "All", count: total },
    ...ORDER_STATUSES.map((s) => ({ value: s, label: s, count: counts[s] ?? 0, countClass: COUNT_CLASS[s] })),
  ];
};

interface ColumnDeps {
  onAssign: (orderId: string, driverId: string) => void;
  onEdit: (order: Order) => void;
}

export const getOrderColumns = ({ onAssign, onEdit }: ColumnDeps): Column<Order>[] => [
  { key: "product", header: "Product", render: (o) => o.productId?.name ?? "—" },
  {
    key: "quantity",
    header: "Qty",
    render: (o) => (
      <span className="font-mono text-code-md">{`${o.quantity}${o.productId?.unit ? ` ${o.productId.unit}` : ""}`}</span>
    ),
  },
  {
    key: "route",
    header: "Source → Dest",
    render: (o) => (
      <span className="font-mono text-code-md text-on-surface-variant">
        {o.sourceHubId?.name} <span className="text-primary">→</span> {o.destinationId?.name}
      </span>
    ),
  },
  {
    key: "deliveryDate",
    header: "Date",
    render: (o) => (
      <span className="font-mono text-code-md text-on-surface-variant">
        {o.deliveryDate}
        {o.startTime ? <span className="text-on-surface"> {o.startTime}</span> : ""}
      </span>
    ),
  },
  { key: "driver", header: "Driver", render: (o) => <AssignDriverControl order={o} onAssign={onAssign} /> },
  { key: "status", header: "Status", render: (o) => <StatusPill status={o.status} /> },
  {
    key: "actions",
    header: "Actions",
    align: "right",
    render: (o) => (
      <div className="flex justify-end">
        <IconButton
          icon={Pencil}
          label="Edit order"
          onClick={() => onEdit(o)}
          disabled={!isEditable(o.status)}
          title={isEditable(o.status) ? "Edit order" : `Can't edit a ${o.status} order`}
          className="disabled:cursor-not-allowed disabled:opacity-40"
        />
      </div>
    ),
  },
];
