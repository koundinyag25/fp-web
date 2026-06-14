import { useEffect, useRef, useState, type ReactNode } from "react";

interface PopoverProps {
  trigger: (open: boolean) => ReactNode;
  children: (close: () => void) => ReactNode;
  align?: "left" | "right";
  panelClassName?: string; // e.g. width overrides
}

/** Anchored popover: renders a floating panel below the trigger; closes on
 *  outside-click or Escape. The children render-prop receives `close`. */
export const Popover = ({ trigger, children, align = "left", panelClassName = "" }: PopoverProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative inline-block" ref={ref}>
      <button type="button" onClick={() => setOpen((o) => !o)} className="block">
        {trigger(open)}
      </button>
      {open && (
        <div
          className={`absolute z-50 mt-1 min-w-[240px] rounded border border-border-hairline bg-surface-container shadow-xl ${
            align === "right" ? "right-0" : "left-0"
          } ${panelClassName}`}
        >
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
};
