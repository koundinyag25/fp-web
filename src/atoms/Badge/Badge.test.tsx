import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Badge } from "./Badge";

describe("Badge", () => {
  it("renders a tone", () => {
    render(<Badge tone="success">ok</Badge>);
    expect(screen.getByText("ok")).toHaveClass("text-success");
  });
});
