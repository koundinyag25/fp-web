import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { FilterBuilder } from "./FilterBuilder";

const fields = [
  { key: "type", label: "Type", type: "select" as const, options: [{ value: "hub", label: "Hub" }] },
];

describe("FilterBuilder", () => {
  it("shows active count and passes filters through on Apply", async () => {
    const onApply = vi.fn();
    render(<FilterBuilder fields={fields} value={[{ field: "type", op: "in", values: ["hub"] }]} onApply={onApply} />);
    expect(screen.getByText(/Filters · 1/)).toBeInTheDocument();
    await userEvent.click(screen.getByText(/Filters · 1/));
    await userEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect(onApply).toHaveBeenCalledWith([{ field: "type", op: "in", values: ["hub"] }]);
  });

  it("adds a row, changes field → date and operator, removes it, and drops empty rows", async () => {
    const onApply = vi.fn();
    render(<FilterBuilder fields={fields} value={[]} onApply={onApply} />);
    await userEvent.click(screen.getByText("Filters"));
    expect(screen.getByText("No filters. Add one below.")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /Add filter/ }));
    const selects = screen.getAllByRole("combobox");
    await userEvent.selectOptions(selects[0], "createdAt");
    await userEvent.selectOptions(selects[1], "between");
    expect((selects[1] as HTMLSelectElement).value).toBe("between");
    await userEvent.click(screen.getByRole("button", { name: "Remove filter" }));
    expect(screen.getByText("No filters. Add one below.")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect(onApply).toHaveBeenCalledWith([]);
  });

  it("patches one of several rows and keeps only complete between-ranges", async () => {
    const onApply = vi.fn();
    // Two date rows seeded: a complete range (2 values) and a half-filled one
    // (1 value). Patching row A exercises the `r.uid === uid ? … : r` branch
    // (row B is the untouched `: r` side), and Apply exercises the
    // `op !== "between" || values.length === 2` between-completeness check.
    render(
      <FilterBuilder
        fields={fields}
        value={[
          { field: "createdAt", op: "between", values: ["2026-01-01", "2026-01-31"] },
          { field: "updatedAt", op: "between", values: ["2026-02-01"] },
        ]}
        onApply={onApply}
      />
    );
    await userEvent.click(screen.getByText(/Filters · 2/));
    // First date input belongs to row A's range start → patch A (B untouched).
    const dateInputs = document.querySelectorAll<HTMLInputElement>('input[type="date"]');
    await userEvent.clear(dateInputs[0]);
    await userEvent.type(dateInputs[0], "2026-01-15");
    await userEvent.click(screen.getByRole("button", { name: "Apply" }));
    // Only the complete 2-value between range survives; the 1-value one is dropped.
    expect(onApply).toHaveBeenCalledWith([
      { field: "createdAt", op: "between", values: ["2026-01-15", "2026-01-31"] },
    ]);
  });

  it("clears all rows", async () => {
    const onApply = vi.fn();
    render(<FilterBuilder fields={fields} value={[{ field: "type", op: "in", values: ["hub"] }]} onApply={onApply} />);
    await userEvent.click(screen.getByText(/Filters/));
    await userEvent.click(screen.getByRole("button", { name: "Clear all" }));
    await userEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect(onApply).toHaveBeenCalledWith([]);
  });
});
