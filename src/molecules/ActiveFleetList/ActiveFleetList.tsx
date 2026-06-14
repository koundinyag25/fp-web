import { List, type RowComponentProps } from "react-window";
import { StatusPill } from "@/atoms/StatusPill";
import { EmptyState } from "@/molecules/EmptyState";
import type { ActiveVehicle } from "@/types";

interface ActiveFleetListProps {
  rows: ActiveVehicle[];
  selectedId: string | null;
  onSelect: (vehicleId: string) => void;
}

interface RowData {
  rows: ActiveVehicle[];
  selectedId: string | null;
  onSelect: (vehicleId: string) => void;
}

const ROW_HEIGHT = 88;

const FleetCard = ({ index, style, rows, selectedId, onSelect }: RowComponentProps<RowData>) => {
  const v = rows[index];
  const vid = v.vehicle?._id ?? v.shiftId;
  const selected = vid === selectedId;
  const dest = v.currentDelivery?.orderId?.destinationId?.name;
  return (
    <div style={style} className="px-2 pb-2">
      <button
        type="button"
        onClick={() => v.vehicle?._id && onSelect(v.vehicle._id)}
        aria-pressed={selected}
        className={`relative h-full w-full overflow-hidden rounded border p-3 text-left transition-colors ${
          selected
            ? "border-primary bg-surface-hover"
            : "border-transparent hover:border-border-hairline hover:bg-surface-hover"
        }`}
      >
        {selected && <span className="absolute inset-y-0 left-0 w-0.5 bg-primary" />}
        <div className="mb-1 flex items-center justify-between gap-2">
          <span className={`font-mono text-code-md ${selected ? "text-primary" : "text-on-surface"}`}>
            {v.vehicle?.reg ?? "—"}
          </span>
          <StatusPill status={v.deliveryStatus ?? "idle"} />
        </div>
        <div className="text-body-sm text-on-surface-variant">{v.driver?.name ?? "Unassigned"}</div>
        <div className="mt-1 text-body-sm text-outline">{dest ? `→ ${dest}` : (v.deliveryStatus ?? "idle")}</div>
      </button>
    </div>
  );
};

/** Scrollable roster of active vehicles. Virtualized + self-sizing
 *  (react-window) so only the visible cards render and the list resizes with
 *  its column — stays smooth at hundreds of vehicles. */
export const ActiveFleetList = ({ rows, selectedId, onSelect }: ActiveFleetListProps) => (
  <div className="flex h-full flex-col">
    <div className="flex items-center justify-between border-b border-border-hairline px-3 py-2">
      <h2 className="text-body-md font-medium text-on-surface">Active fleet</h2>
      <span className="font-mono text-code-sm text-on-surface-variant">{rows.length}</span>
    </div>
    <div className="min-h-0 flex-1 pt-2">
      {rows.length === 0 ? (
        <div className="p-2">
          <EmptyState message="No active vehicles right now." />
        </div>
      ) : (
        <List
          rowComponent={FleetCard}
          rowCount={rows.length}
          rowHeight={ROW_HEIGHT}
          rowProps={{ rows, selectedId, onSelect }}
          defaultHeight={600}
          overscanCount={4}
          style={{ height: "100%" }}
        />
      )}
    </div>
  </div>
);
