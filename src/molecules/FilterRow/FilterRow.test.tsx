import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { FilterRow } from "./FilterRow";

const fields = [
  { key: "type", label: "Type", type: "select" as const, options: [{ value: "hub", label: "Hub" }] },
  { key: "createdAt", label: "Created", type: "date" as const },
];

describe("FilterRow", () => {
  it("renders field/operator selects and fires change + remove", async () => {
    const onFieldChange = vi.fn();
    const onRemove = vi.fn();
    render(
      <FilterRow
        fields={fields}
        row={{ field: "type", op: "in", values: [] }}
        onFieldChange={onFieldChange}
        onOpChange={vi.fn()}
        onValuesChange={vi.fn()}
        onRemove={onRemove}
      />
    );
    await userEvent.selectOptions(screen.getAllByRole("combobox")[0], "createdAt");
    expect(onFieldChange).toHaveBeenCalledWith("createdAt");
    await userEvent.click(screen.getByRole("button", { name: "Remove filter" }));
    expect(onRemove).toHaveBeenCalled();
  });
});
