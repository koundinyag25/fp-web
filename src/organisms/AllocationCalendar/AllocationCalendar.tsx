import { useRef } from "react";
import { X } from "lucide-react";
import { Spinner } from "@/atoms/Spinner";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { EmptyState } from "@/molecules/EmptyState";
import type { Allocation, Vehicle } from "@/types";
import type { WeekDay } from "@/utils/date";

interface AllocationCalendarProps {
  vehicles: Vehicle[];
  days: WeekDay[];
  allocations: Allocation[];
  onAllocate: (vehicle: Vehicle, date: string) => void;
  onRemove: (allocationId: string) => void;
  isLoading?: boolean;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
}

/** Week grid (FR-VA-2): rows = vehicles, columns = days. A cell shows the
 *  allocated driver (teal chip) or an empty "allocate" affordance. Vehicle rows
 *  are paginated — the sentinel loads more on scroll, so the grid never renders
 *  the whole fleet at once. */
export const AllocationCalendar = ({
  vehicles,
  days,
  allocations,
  onAllocate,
  onRemove,
  isLoading,
  hasMore,
  isLoadingMore,
  onLoadMore,
}: AllocationCalendarProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useInfiniteScroll(() => onLoadMore?.(), Boolean(hasMore) && !isLoadingMore, scrollRef);

  const byCell = new Map<string, Allocation>();
  for (const a of allocations) {
    if (a.vehicleId?._id && a.date) byCell.set(`${a.vehicleId._id}|${a.date}`, a);
  }

  return (
    <div className="overflow-hidden rounded border border-border-hairline bg-surface-container">
      <div className="flex items-center justify-end border-b border-border-hairline p-3">
        <span className="flex items-center gap-2 font-mono text-label-caps uppercase text-on-surface-variant">
          <span className="h-3 w-3 rounded-sm border border-primary bg-primary/20" /> teal chip = allocated
        </span>
      </div>
      <div ref={scrollRef} className="overflow-auto" style={{ maxHeight: "60vh" }}>
        <table className="w-full min-w-[800px] border-collapse text-left">
          <thead>
            <tr>
              <th className="sticky top-0 z-10 w-48 border-b border-r border-border-hairline bg-surface-container p-3 font-mono text-label-caps uppercase text-on-surface-variant">
                Vehicle
              </th>
              {days.map((d) => (
                <th
                  key={d.date}
                  className="sticky top-0 z-10 border-b border-r border-border-hairline bg-surface-container p-3 last:border-r-0"
                >
                  <span className="block font-mono text-label-caps uppercase text-on-surface-variant">
                    {d.weekday}
                  </span>
                  <span className="font-mono text-code-md text-on-surface">{d.day}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-hairline">
              {isLoading &&
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={`sk-${i}`}>
                    <td className="border-r border-border-hairline p-3">
                      <div className="h-3 w-24 animate-pulse rounded bg-surface-hover" />
                    </td>
                    {days.map((d) => (
                      <td key={d.date} className="border-r border-border-hairline p-3 last:border-r-0">
                        <div className="h-3 w-full animate-pulse rounded bg-surface-hover" />
                      </td>
                    ))}
                  </tr>
                ))}
              {!isLoading &&
                vehicles.map((v) => (
                  <tr key={v._id} className="hover:bg-surface-hover">
                    <td className="border-r border-border-hairline p-3 font-mono text-code-md text-on-surface">
                      {v.reg}
                    </td>
                    {days.map((d) => {
                      const alloc = byCell.get(`${v._id}|${d.date}`);
                      return (
                        <td key={d.date} className="border-r border-border-hairline p-1 last:border-r-0">
                          {alloc ? (
                            <div className="flex items-center justify-between rounded border border-primary bg-primary/10 px-2 py-1 text-body-sm text-primary">
                              <span>{alloc.driverId?.name}</span>
                              <button
                                type="button"
                                aria-label={`Remove ${v.reg} on ${d.date}`}
                                onClick={() => onRemove(alloc._id)}
                                className="text-primary/70 hover:text-primary"
                              >
                                <X size={14} strokeWidth={2} />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              aria-label={`Allocate ${v.reg} on ${d.date}`}
                              onClick={() => onAllocate(v, d.date)}
                              className="group flex h-9 w-full items-center justify-center rounded border border-dashed border-transparent text-body-sm text-on-surface-variant hover:border-border-hairline"
                            >
                              <span className="opacity-0 group-hover:opacity-100">click to allocate</span>
                            </button>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
            </tbody>
          </table>
        {hasMore && <div ref={sentinelRef} className="h-1" />}
        {isLoadingMore && (
          <div className="flex justify-center py-4">
            <Spinner label="Loading more vehicles…" />
          </div>
        )}
      </div>
      {!isLoading && vehicles.length === 0 && (
        <div className="p-8">
          <EmptyState message="No vehicles match — adjust your search or add vehicles first." />
        </div>
      )}
    </div>
  );
};
