import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Select } from "./Select";

describe("Select", () => {
  it("renders options and fires change", async () => {
    const onChange = vi.fn();
    render(
      <Select aria-label="type" value="hub" onChange={onChange}>
        <option value="hub">Hub</option>
        <option value="terminal">Terminal</option>
      </Select>
    );
    await userEvent.selectOptions(screen.getByLabelText("type"), "terminal");
    expect(onChange).toHaveBeenCalled();
  });

  it("applies the critical border when invalid", () => {
    render(
      <Select invalid aria-label="t">
        <option>a</option>
      </Select>
    );
    expect(screen.getByLabelText("t")).toHaveClass("border-critical");
  });
});
