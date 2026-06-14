import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Input } from "./Input";

describe("Input", () => {
  it("toggles invalid styling and accepts input", async () => {
    const onChange = vi.fn();
    render(<Input invalid value="" onChange={onChange} aria-label="lat" />);
    const input = screen.getByLabelText("lat");
    expect(input).toHaveClass("border-critical");
    await userEvent.type(input, "1");
    expect(onChange).toHaveBeenCalled();
  });
});
