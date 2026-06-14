import { useRef, type ReactNode } from "react";
import { Spinner } from "@/atoms/Spinner";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { EmptyState } from "@/molecules/EmptyState";

export interface Column<T> {
  key: string;
  header: string;
  align?: "left" | "center" | "right";
  render?: (row: T) => ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  rows: T[];
  getRowId: (row: T) => string;
  isLoading?: boolean;
  emptyMessage?: string;
  minWidth?: number;
  /** Max height of the scroll region; the header stays pinned while rows scroll. */
  maxHeight?: string;
  // Infinite scroll: the sentinel lives inside the scroll region and is observed
  // against it, so paging works with the sticky-header internal scroll.
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
}

const alignClass = (a?: "left" | "center" | "right") =>
  a === "center" ? "text-center" : a === "right" ? "text-right" : "text-left";

export const Table = <T,>({
  columns,
  rows,
  getRowId,
  isLoading,
  emptyMessage = "Nothing here yet.",
  minWidth = 800,
  maxHeight = "70vh",
  hasMore,
  isLoadingMore,
  onLoadMore,
}: TableProps<T>) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useInfiniteScroll(
    () => onLoadMore?.(),
    Boolean(hasMore) && !isLoadingMore,
    scrollRef
  );

  return (
    <div className="overflow-hidden rounded border border-border-hairline bg-surface-container">
      <div ref={scrollRef} className="overflow-auto" style={{ maxHeight }}>
        <table className="w-full border-collapse text-left" style={{ minWidth }}>
          <thead>
            <tr>
              {columns.map((c) => (
                <th
                  key={c.key}
                  className={`sticky top-0 z-10 border-b border-border-hairline bg-surface-container-high px-4 py-3 font-mono text-label-caps uppercase text-on-surface-variant ${alignClass(c.align)}`}
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-hairline/40">
            {isLoading &&
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={`sk-${i}`}>
                  {columns.map((c) => (
                    <td key={c.key} className="px-4 py-4">
                      <div className="h-3 w-24 animate-pulse rounded bg-surface-hover" />
                    </td>
                  ))}
                </tr>
              ))}
            {!isLoading &&
              rows.map((row) => (
                <tr key={getRowId(row)} className="transition-colors hover:bg-surface-hover">
                  {columns.map((c) => {
                    const v = (row as Record<string, unknown>)[c.key];
                    return (
                      <td
                        key={c.key}
                        className={`px-4 py-4 text-body-md text-on-surface ${alignClass(c.align)}`}
                      >
                        {c.render ? c.render(row) : String(v ?? "")}
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
            <Spinner label="Loading more…" />
          </div>
        )}
      </div>
      {!isLoading && rows.length === 0 && (
        <div className="p-8">
          <EmptyState message={emptyMessage} />
        </div>
      )}
    </div>
  );
};
