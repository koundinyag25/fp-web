import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Chip } from "./Chip";

describe("Chip", () => {
  it("renders a tone", () => {
    render(<Chip tone="warning">van</Chip>);
    expect(screen.getByText("van")).toHaveClass("text-warning");
  });
});
