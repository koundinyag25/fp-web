import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Textarea } from "./Textarea";

describe("Textarea", () => {
  it("uses the valid border by default and accepts input", async () => {
    const onChange = vi.fn();
    render(<Textarea value="" onChange={onChange} aria-label="notes" />);
    const el = screen.getByLabelText("notes");
    expect(el).toHaveClass("border-border-hairline");
    expect(el).not.toHaveClass("border-critical");
    await userEvent.type(el, "hi");
    expect(onChange).toHaveBeenCalled();
  });

  it("switches to critical styling when invalid and merges a custom className", () => {
    render(<Textarea invalid className="custom-cls" aria-label="notes" />);
    const el = screen.getByLabelText("notes");
    expect(el).toHaveClass("border-critical");
    expect(el).toHaveClass("custom-cls");
  });
});
