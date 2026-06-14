import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatusPill } from "./StatusPill";

describe("StatusPill", () => {
  it("maps status → tone", () => {
    const { rerender } = render(<StatusPill status="completed" />);
    expect(screen.getByText("completed")).toHaveClass("text-success");
    rerender(<StatusPill status="failed" />);
    expect(screen.getByText("failed")).toHaveClass("text-critical");
    rerender(<StatusPill status="in_transit" />);
    expect(screen.getByText("in_transit")).toHaveClass("text-info");
    rerender(<StatusPill status="weird" />);
    expect(screen.getByText("weird")).toHaveClass("text-on-surface-variant");
  });
});
