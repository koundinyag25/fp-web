import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { FilterValueEditor } from "./FilterValueEditor";

describe("FilterValueEditor", () => {
  it("renders a single date input for after/before", async () => {
    const onChange = vi.fn();
    const { container } = render(
      <FilterValueEditor field={{ key: "createdAt", label: "Created", type: "date" }} op="after" values={[]} onChange={onChange} />
    );
    await userEvent.type(container.querySelector('input[type="date"]')!, "2026-06-14");
    expect(onChange).toHaveBeenCalled();
  });

  it("renders two date inputs for between", () => {
    const { container } = render(
      <FilterValueEditor field={{ key: "createdAt", label: "Created", type: "date" }} op="between" values={["2026-06-01", "2026-06-14"]} onChange={() => {}} />
    );
    expect(container.querySelectorAll('input[type="date"]')).toHaveLength(2);
  });

  it("preserves the untouched bound when only one between input changes (empty defaults)", async () => {
    const onChange = vi.fn();
    const { container } = render(
      <FilterValueEditor field={{ key: "createdAt", label: "Created", type: "date" }} op="between" values={[]} onChange={onChange} />
    );
    const inputs = container.querySelectorAll<HTMLInputElement>('input[type="date"]');
    await userEvent.type(inputs[0], "2026-06-14"); // second bound falls back to ""
    expect(onChange).toHaveBeenLastCalledWith(["2026-06-14", ""]);
    await userEvent.type(inputs[1], "2026-06-20"); // first bound falls back to ""
    expect(onChange).toHaveBeenLastCalledWith(["", "2026-06-20"]);
  });

  it("shows the selected count and tolerates a select field with no options", async () => {
    render(
      <FilterValueEditor
        field={{ key: "type", label: "Type", type: "select" }}
        op="in"
        values={["hub", "terminal"]}
        onChange={vi.fn()}
      />
    );
    expect(screen.getByText("2 selected")).toBeInTheDocument();
    await userEvent.click(screen.getByText("2 selected"));
    // options default to [] → multiselect renders its empty state, no crash
    expect(screen.getByText("No matches")).toBeInTheDocument();
  });

  it("opens the multiselect popover for select fields and toggles a value", async () => {
    const onChange = vi.fn();
    render(
      <FilterValueEditor
        field={{ key: "type", label: "Type", type: "select", options: [{ value: "hub", label: "Hub" }, { value: "terminal", label: "Terminal" }] }}
        op="in"
        values={[]}
        onChange={onChange}
      />
    );
    await userEvent.click(screen.getByText("Select…"));
    await userEvent.click(screen.getByText("Hub"));
    expect(onChange).toHaveBeenCalledWith(["hub"]);
  });
});
