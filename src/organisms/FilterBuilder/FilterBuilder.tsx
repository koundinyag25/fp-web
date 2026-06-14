import { Plus, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { Button } from "@/atoms/Button";
import { TIMESTAMP_FILTER_FIELDS, defaultFilterOp } from "@/config/filters";
import { FilterRow } from "@/molecules/FilterRow";
import { Popover } from "@/molecules/Popover";
import type { FilterFieldDef, FilterOp, ListFilter } from "@/types";

interface DraftRow extends ListFilter {
  uid: string;
}

const BuilderBody = ({
  fields,
  initial,
  onApply,
  onClose,
}: {
  fields: FilterFieldDef[];
  initial: ListFilter[];
  onApply: (filters: ListFilter[]) => void;
  onClose: () => void;
}) => {
  const [rows, setRows] = useState<DraftRow[]>(initial.map((f) => ({ ...f, uid: crypto.randomUUID() })));
  const fieldOf = (key: string) => fields.find((f) => f.key === key) ?? fields[0];

  const addRow = () => {
    const field = fields[0];
    setRows([...rows, { uid: crypto.randomUUID(), field: field.key, op: defaultFilterOp(field.type), values: [] }]);
  };
  const patch = (uid: string, next: Partial<DraftRow>) =>
    setRows(rows.map((r) => (r.uid === uid ? { ...r, ...next } : r)));
  const removeRow = (uid: string) => setRows(rows.filter((r) => r.uid !== uid));

  const apply = () => {
    const valid = rows.filter(
      (r) =>
        r.values.filter(Boolean).length > 0 &&
        (r.op !== "between" || r.values.filter(Boolean).length === 2)
    );
    onApply(valid.map(({ uid: _uid, ...f }) => f));
  };

  return (
    <div className="flex flex-col gap-4">
      {rows.length === 0 && <p className="text-body-sm text-on-surface-variant">No filters. Add one below.</p>}
      <div className="flex flex-col gap-3">
        {rows.map((r) => (
          <FilterRow
            key={r.uid}
            fields={fields}
            row={r}
            onFieldChange={(key) => patch(r.uid, { field: key, op: defaultFilterOp(fieldOf(key).type), values: [] })}
            onOpChange={(op: FilterOp) => patch(r.uid, { op, values: [] })}
            onValuesChange={(values) => patch(r.uid, { values })}
            onRemove={() => removeRow(r.uid)}
          />
        ))}
      </div>
      <button
        type="button"
        onClick={addRow}
        className="flex items-center gap-1 self-start font-mono text-code-sm text-primary hover:underline"
      >
        <Plus size={14} strokeWidth={1.75} /> Add filter
      </button>
      <footer className="flex justify-between gap-3 border-t border-border-hairline pt-4">
        <button type="button" onClick={() => setRows([])} className="text-body-sm text-on-surface-variant hover:underline">
          Clear all
        </button>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={apply}>
            Apply
          </Button>
        </div>
      </footer>
    </div>
  );
};

interface FilterBuilderProps {
  fields: FilterFieldDef[]; // the page's select fields; timestamps are appended
  value: ListFilter[];
  onApply: (filters: ListFilter[]) => void;
}

/** A "Filters" button anchoring a wide popover with the field/operator/value row
 *  builder. Timestamp (created/updated) date fields are always available. */
export const FilterBuilder = ({ fields, value, onApply }: FilterBuilderProps) => {
  const allFields = [...fields, ...TIMESTAMP_FILTER_FIELDS];
  const count = value.length;
  return (
    <Popover
      align="right"
      panelClassName="w-[520px] max-w-[92vw]"
      trigger={(open) => (
        <span
          className={`flex h-8 items-center justify-center gap-2 rounded border px-3 text-body-md transition-colors ${
            open || count > 0 ? "border-primary text-primary" : "border-border-hairline text-on-surface hover:border-primary"
          }`}
        >
          <SlidersHorizontal size={16} strokeWidth={1.75} />
          Filters{count > 0 ? ` · ${count}` : ""}
        </span>
      )}
    >
      {(close) => (
        <div className="flex flex-col gap-4 p-4">
          <span className="font-mono text-label-caps uppercase text-on-surface-variant">Filters</span>
          {/* mounts fresh on open → reseeds from value */}
          <BuilderBody
            fields={allFields}
            initial={value}
            onApply={(f) => {
              onApply(f);
              close();
            }}
            onClose={close}
          />
        </div>
      )}
    </Popover>
  );
};
