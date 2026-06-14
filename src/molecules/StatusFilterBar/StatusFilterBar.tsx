interface StatusOption {
  value: string;
  label: string;
  count: number;
  countClass?: string;
}

interface StatusFilterBarProps {
  options: StatusOption[];
  value: string;
  onChange: (value: string) => void;
}

/** Single-select status tabs with per-status counts (FR-OM-3). */
export const StatusFilterBar = ({ options, value, onChange }: StatusFilterBarProps) => (
  <div className="flex gap-2 overflow-x-auto border-b border-border-hairline pb-2">
    {options.map((o) => (
      <button
        key={o.value}
        onClick={() => onChange(o.value)}
        className={`flex items-center whitespace-nowrap rounded-t border-b-2 px-3 py-1.5 text-body-sm transition-colors ${
          value === o.value
            ? "border-primary text-primary"
            : "border-transparent text-on-surface-variant hover:bg-surface-hover hover:text-on-surface"
        }`}
      >
        {o.label}
        <span className={`ml-2 font-mono text-code-sm ${o.countClass ?? "text-on-surface-variant"}`}>
          {o.count}
        </span>
      </button>
    ))}
  </div>
);
