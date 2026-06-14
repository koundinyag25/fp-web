import { Input } from "@/atoms/Input";
import { MultiSelect } from "@/molecules/MultiSelect";
import { Popover } from "@/molecules/Popover";
import type { FilterFieldDef, FilterOp } from "@/types";

interface FilterValueEditorProps {
  field: FilterFieldDef;
  op: FilterOp;
  values: string[];
  onChange: (v: string[]) => void;
}

/** The value cell of a filter row: date input(s) for date fields, a searchable
 *  multiselect popover for select fields. */
export const FilterValueEditor = ({ field, op, values, onChange }: FilterValueEditorProps) => {
  if (field.type === "date") {
    if (op === "between") {
      return (
        <div className="flex items-center gap-2">
          <Input type="date" value={values[0] ?? ""} onChange={(e) => onChange([e.target.value, values[1] ?? ""])} />
          <span className="text-on-surface-variant">→</span>
          <Input type="date" value={values[1] ?? ""} onChange={(e) => onChange([values[0] ?? "", e.target.value])} />
        </div>
      );
    }
    return <Input type="date" value={values[0] ?? ""} onChange={(e) => onChange([e.target.value])} />;
  }
  return (
    <Popover
      trigger={() => (
        <span className="flex min-h-[44px] w-full items-center rounded border border-border-hairline bg-surface-recessed px-3 py-2 text-body-md text-on-surface">
          {values.length ? `${values.length} selected` : "Select…"}
        </span>
      )}
    >
      {() => <MultiSelect options={field.options ?? []} selected={values} onChange={onChange} />}
    </Popover>
  );
};
