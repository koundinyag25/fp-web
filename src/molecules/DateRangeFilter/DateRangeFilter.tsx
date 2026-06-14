import { X } from "lucide-react";

interface DateRangeFilterProps {
  from: string; // YYYY-MM-DD
  to: string;
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
  onClear: () => void;
  label?: string;
}

const dateClass =
  "h-9 rounded border border-border-hairline bg-surface-recessed px-2 font-mono text-code-sm text-on-surface focus:border-primary focus:outline-none";

/** Two bounded date inputs (from–to) plus a clear affordance. Empty bounds mean
 *  "open-ended" on that side. */
export const DateRangeFilter = ({
  from,
  to,
  onFromChange,
  onToChange,
  onClear,
  label = "Delivery",
}: DateRangeFilterProps) => (
  <div className="flex flex-wrap items-center gap-2">
    <span className="font-mono text-label-caps uppercase text-on-surface-variant">{label}</span>
    <input
      type="date"
      aria-label="From date"
      className={dateClass}
      value={from}
      max={to || undefined}
      onChange={(e) => onFromChange(e.target.value)}
    />
    <span className="text-on-surface-variant">–</span>
    <input
      type="date"
      aria-label="To date"
      className={dateClass}
      value={to}
      min={from || undefined}
      onChange={(e) => onToChange(e.target.value)}
    />
    {(from || to) && (
      <button
        type="button"
        aria-label="Clear date range"
        onClick={onClear}
        className="text-on-surface-variant hover:text-critical"
      >
        <X size={16} strokeWidth={1.75} />
      </button>
    )}
  </div>
);
