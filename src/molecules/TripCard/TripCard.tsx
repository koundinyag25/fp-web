import { ChevronRight, Lock, MapPin } from "lucide-react";
import { Badge } from "@/atoms/Badge";
import type { Delivery } from "@/types";

const statusTone = (s: string): "success" | "critical" | "info" | "warning" => {
  if (s === "completed") return "success";
  if (s === "failed") return "critical";
  if (s === "in_transit") return "info";
  return "warning";
};

interface TripCardProps {
  delivery: Delivery;
  current?: boolean;
  /** A future stop that can't be opened yet — earlier ones must finish first. */
  locked?: boolean;
  onOpen: () => void;
}

/** One stop in the driver's day — tappable, opens the trip detail (FR-SV-3). */
export const TripCard = ({ delivery, current, locked, onOpen }: TripCardProps) => {
  const order = delivery.orderId;
  const terminal = delivery.status === "completed" || delivery.status === "failed";
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-disabled={locked}
      className={`flex w-full items-center gap-3 rounded-lg border p-4 text-left transition-colors ${
        current
          ? "border-primary bg-primary/5"
          : "border-border-hairline bg-surface-container hover:bg-surface-hover"
      } ${locked ? "opacity-60" : ""}`}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border-hairline font-mono text-code-md text-on-surface-variant">
        {delivery.sequence + 1}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {order?.startTime && (
            <span className="font-mono text-code-sm text-on-surface-variant">{order.startTime}</span>
          )}
          <Badge tone={statusTone(delivery.status)}>{delivery.status}</Badge>
          {current && !terminal && (
            <span className="font-mono text-label-caps uppercase tracking-wider text-primary">
              · {delivery.status === "in_transit" ? "In progress" : "Up next"}
            </span>
          )}
        </div>
        <p className="mt-1 truncate text-body-md text-on-surface">
          {order?.productId?.name} · {order?.quantity}
          {order?.productId?.unit ? ` ${order.productId.unit}` : ""}
        </p>
        <p className="mt-0.5 flex items-center gap-1 truncate text-body-sm text-on-surface-variant">
          <MapPin size={12} strokeWidth={1.75} /> {order?.destinationId?.name ?? "—"}
        </p>
      </div>
      {locked ? (
        <Lock size={16} strokeWidth={1.75} className="shrink-0 text-on-surface-variant" />
      ) : (
        <ChevronRight size={18} strokeWidth={1.75} className="shrink-0 text-on-surface-variant" />
      )}
    </button>
  );
};
