import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";
import { SearchInput } from "@/atoms/SearchInput";
import { Spinner } from "@/atoms/Spinner";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";

export interface ComboOption {
  id: string;
  label: string;
  sublabel?: string;
}

interface ComboboxProps {
  value: ComboOption | null;
  onSelect: (option: ComboOption) => void;
  search: string;
  onSearchChange: (q: string) => void;
  options: ComboOption[];
  isLoading?: boolean;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
  placeholder?: string; // trigger text when nothing is selected
  searchPlaceholder?: string; // the panel's search box
  emptyLabel?: string;
  invalid?: boolean;
  /** Custom trigger (e.g. an "Assign" link); defaults to a select-like box. */
  trigger?: (open: boolean) => ReactNode;
}

/** Searchable single-select. One self-contained dropdown — a trigger plus a
 *  portalled panel (search + list together) anchored to it. The portal means it
 *  never gets clipped by a scrolling table, modal, or popover. Keyboard: ↑/↓
 *  move, Enter picks, Esc closes. The parent owns the data (search + paging). */
export const Combobox = ({
  value,
  onSelect,
  search,
  onSearchChange,
  options,
  isLoading,
  hasMore,
  isLoadingMore,
  onLoadMore,
  placeholder = "Select…",
  searchPlaceholder,
  emptyLabel = "No matches",
  invalid,
  trigger,
}: ComboboxProps) => {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const [coords, setCoords] = useState<{ top: number; left: number; width: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useInfiniteScroll(() => onLoadMore?.(), Boolean(hasMore) && !isLoadingMore, listRef);

  const optionsKey = options.map((o) => o.id).join("|");
  useEffect(() => setHighlight(0), [optionsKey]);

  const reposition = () => {
    const r = triggerRef.current?.getBoundingClientRect();
    if (!r) return;
    const width = Math.max(r.width, 256);
    const left = Math.max(8, Math.min(r.left, window.innerWidth - width - 8));
    setCoords({ top: r.bottom + 4, left, width });
  };
  useLayoutEffect(() => {
    if (!open) return;
    reposition();
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    return () => {
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t) || panelRef.current?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    try {
      listRef.current?.querySelector<HTMLElement>(`[data-idx="${highlight}"]`)?.scrollIntoView({ block: "nearest" });
    } catch {
      /* jsdom has no scrollIntoView */
    }
  }, [highlight, open]);

  const choose = (o: ComboOption) => {
    onSelect(o);
    setOpen(false);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, options.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault(); // never submit the surrounding form from the picker
      if (options[highlight]) choose(options[highlight]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    }
  };

  return (
    <>
      <button
        type="button"
        ref={triggerRef}
        onClick={() => setOpen((o) => !o)}
        className={
          trigger
            ? "w-full text-left"
            : `flex min-h-[44px] w-full items-center justify-between rounded border bg-surface-recessed px-3 py-2 text-left ${
                invalid ? "border-critical" : "border-border-hairline"
              }`
        }
      >
        {trigger ? (
          trigger(open)
        ) : (
          <>
            <span className={value ? "text-body-md text-on-surface" : "text-body-md text-on-surface-variant/60"}>
              {value?.label ?? placeholder}
            </span>
            <ChevronDown size={16} strokeWidth={1.75} className="shrink-0 text-on-surface-variant" />
          </>
        )}
      </button>
      {open &&
        coords &&
        createPortal(
          <div
            ref={panelRef}
            role="listbox"
            onMouseDown={(e) => e.stopPropagation()}
            style={{ position: "fixed", top: coords.top, left: coords.left, width: coords.width, zIndex: 60 }}
            className="overflow-hidden rounded border border-border-hairline bg-surface-container shadow-xl"
          >
            <div className="border-b border-border-hairline p-2">
              <SearchInput
                widthClass="w-full"
                placeholder={searchPlaceholder ?? "Search…"}
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                onKeyDown={onKeyDown}
                autoFocus
                role="combobox"
                aria-expanded
              />
            </div>
            <div ref={listRef} className="max-h-56 overflow-y-auto">
              {isLoading ? (
                <div className="flex justify-center py-6">
                  <Spinner label="Loading…" />
                </div>
              ) : options.length === 0 ? (
                <p className="px-3 py-6 text-center text-body-sm text-on-surface-variant">
                  {emptyLabel}
                  {search ? ` matching “${search}”` : ""}.
                </p>
              ) : (
                <ul>
                  {options.map((o, i) => (
                    <li key={o.id}>
                      <button
                        type="button"
                        data-idx={i}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => choose(o)}
                        onMouseEnter={() => setHighlight(i)}
                        className={`flex w-full items-center justify-between px-3 py-2 text-left ${
                          i === highlight ? "bg-surface-hover" : ""
                        }`}
                      >
                        <span className="text-body-md text-on-surface">{o.label}</span>
                        {o.sublabel && <span className="text-body-sm text-on-surface-variant">{o.sublabel}</span>}
                      </button>
                    </li>
                  ))}
                  {hasMore && (
                    <li>
                      <div ref={sentinelRef} className="h-1" />
                    </li>
                  )}
                  {isLoadingMore && (
                    <li className="flex justify-center py-3">
                      <Spinner label="Loading more…" />
                    </li>
                  )}
                </ul>
              )}
            </div>
          </div>,
          document.body
        )}
    </>
  );
};
