import { X } from "lucide-react";
import { Select } from "@/atoms/Select";
import { OPERATORS } from "@/config/filters";
import { FilterValueEditor } from "@/molecules/FilterValueEditor";
import type { FilterFieldDef, FilterOp, ListFilter } from "@/types";

interface FilterRowProps {
  fields: FilterFieldDef[];
  row: ListFilter;
  onFieldChange: (key: string) => void;
  onOpChange: (op: FilterOp) => void;
  onValuesChange: (values: string[]) => void;
  onRemove: () => void;
}

/** One `field | operator | value` row in the FilterBuilder. */
export const FilterRow = ({
  fields,
  row,
  onFieldChange,
  onOpChange,
  onValuesChange,
  onRemove,
}: FilterRowProps) => {
  const field = fields.find((f) => f.key === row.field) ?? fields[0];
  return (
    <div className="flex flex-col gap-2 rounded border border-border-hairline p-2 md:flex-row md:items-center">
      <Select value={row.field} onChange={(e) => onFieldChange(e.target.value)} className="md:w-40">
        {fields.map((f) => (
          <option key={f.key} value={f.key}>
            {f.label}
          </option>
        ))}
      </Select>
      <Select value={row.op} onChange={(e) => onOpChange(e.target.value as FilterOp)} className="md:w-36">
        {OPERATORS[field.type].map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </Select>
      <div className="flex-1">
        <FilterValueEditor field={field} op={row.op} values={row.values} onChange={onValuesChange} />
      </div>
      <button
        type="button"
        aria-label="Remove filter"
        onClick={onRemove}
        className="self-end text-on-surface-variant hover:text-critical md:self-center"
      >
        <X size={18} strokeWidth={1.75} />
      </button>
    </div>
  );
};
