import { Search } from "lucide-react";
import { useState } from "react";

export interface Option {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: Option[];
  selected: string[];
  onChange: (next: string[]) => void;
}

/** Searchable checkbox list. The search box appears once there are enough
 *  options to scroll (the "more than 10" case). */
export const MultiSelect = ({ options, selected, onChange }: MultiSelectProps) => {
  const [q, setQ] = useState("");
  const filtered = q
    ? options.filter((o) => o.label.toLowerCase().includes(q.toLowerCase()))
    : options;

  const toggle = (value: string) =>
    onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]);

  return (
    <div>
      {options.length > 7 && (
        <div className="relative border-b border-border-hairline p-2">
          <Search
            size={14}
            strokeWidth={1.75}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-outline"
          />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search…"
            className="h-8 w-full rounded border border-border-hairline bg-surface-recessed pl-8 pr-2 text-body-sm text-on-surface placeholder-outline focus:border-primary focus:outline-none"
          />
        </div>
      )}
      <div className="max-h-56 overflow-y-auto py-1">
        {filtered.map((o) => (
          <label
            key={o.value}
            className="flex cursor-pointer items-center gap-2 px-3 py-1.5 hover:bg-surface-hover"
          >
            <input
              type="checkbox"
              checked={selected.includes(o.value)}
              onChange={() => toggle(o.value)}
              className="accent-primary"
            />
            <span className="text-body-md text-on-surface">{o.label}</span>
          </label>
        ))}
        {filtered.length === 0 && (
          <p className="px-3 py-2 text-body-sm text-on-surface-variant">No matches</p>
        )}
      </div>
    </div>
  );
};
