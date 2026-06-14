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

  it("clears all rows", async () => {
    const onApply = vi.fn();
    render(<FilterBuilder fields={fields} value={[{ field: "type", op: "in", values: ["hub"] }]} onApply={onApply} />);
    await userEvent.click(screen.getByText(/Filters/));
    await userEvent.click(screen.getByRole("button", { name: "Clear all" }));
    await userEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect(onApply).toHaveBeenCalledWith([]);
  });
});
