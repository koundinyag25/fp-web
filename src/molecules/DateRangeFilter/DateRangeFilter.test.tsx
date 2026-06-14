import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { DateRangeFilter } from "./DateRangeFilter";

describe("DateRangeFilter", () => {
  it("emits from / to changes", () => {
    const onFromChange = vi.fn();
    const onToChange = vi.fn();
    render(<DateRangeFilter from="" to="" onFromChange={onFromChange} onToChange={onToChange} onClear={vi.fn()} />);
    fireEvent.change(screen.getByLabelText("From date"), { target: { value: "2026-06-10" } });
    fireEvent.change(screen.getByLabelText("To date"), { target: { value: "2026-06-20" } });
    expect(onFromChange).toHaveBeenCalledWith("2026-06-10");
    expect(onToChange).toHaveBeenCalledWith("2026-06-20");
  });

  it("shows a clear button only when a bound is set", async () => {
    const onClear = vi.fn();
    const { rerender } = render(
      <DateRangeFilter from="" to="" onFromChange={vi.fn()} onToChange={vi.fn()} onClear={onClear} />
    );
    expect(screen.queryByLabelText("Clear date range")).not.toBeInTheDocument();

    rerender(
      <DateRangeFilter from="2026-06-10" to="" onFromChange={vi.fn()} onToChange={vi.fn()} onClear={onClear} />
    );
    await userEvent.click(screen.getByLabelText("Clear date range"));
    expect(onClear).toHaveBeenCalled();
  });
});
