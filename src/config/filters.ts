import type { FilterFieldDef, FilterOp } from "@/types";

// Operator options offered per field type in the FilterBuilder.
export const OPERATORS: Record<"select" | "date", { value: FilterOp; label: string }[]> = {
  select: [
    { value: "in", label: "is any of" },
    { value: "nin", label: "is not" },
  ],
  date: [
    { value: "after", label: "after" },
    { value: "before", label: "before" },
    { value: "between", label: "between" },
  ],
};

export const defaultFilterOp = (type: "select" | "date"): FilterOp =>
  type === "date" ? "after" : "in";

// Every entity has these (Mongoose `timestamps`), so the builder always offers them.
export const TIMESTAMP_FILTER_FIELDS: FilterFieldDef[] = [
  { key: "createdAt", label: "Created at", type: "date" },
  { key: "updatedAt", label: "Updated at", type: "date" },
];
