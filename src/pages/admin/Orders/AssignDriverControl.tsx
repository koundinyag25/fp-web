import { useState } from "react";
import { useDriverSearch } from "@/hooks/driver/useDriverSearch";
import { useDebounce } from "@/hooks/useDebounce";
import { Combobox } from "@/molecules/Combobox";
import type { Order } from "@/types";

interface AssignDriverControlProps {
  order: Order;
  onAssign: (orderId: string, driverId: string) => void;
}

/** Assign / reassign a driver to an order (FR-OM-2) via a searchable picker.
 *  Picking a driver assigns immediately. */
export const AssignDriverControl = ({ order, onAssign }: AssignDriverControlProps) => {
  const [search, setSearch] = useState("");
  const debounced = useDebounce(search);
  const list = useDriverSearch(debounced);
  const current = order.assignedDriverId?.name;

  return (
    <Combobox
      value={null}
      onSelect={(o) => onAssign(order._id, o.id)}
      search={search}
      onSearchChange={setSearch}
      options={list.items.map((d) => ({ id: d._id, label: d.name }))}
      isLoading={list.isLoading}
      hasMore={list.hasNextPage}
      isLoadingMore={list.isFetchingNextPage}
      onLoadMore={list.fetchNextPage}
      searchPlaceholder="Search driver by name…"
      emptyLabel="No drivers"
      trigger={() =>
        current ? (
          <span className="text-on-surface underline decoration-dotted underline-offset-4">{current}</span>
        ) : (
          <span className="inline-block rounded border border-primary px-3 py-1 text-code-sm text-primary hover:bg-primary/10">
            Assign
          </span>
        )
      }
    />
  );
};
