import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MetricCard } from "./MetricCard";

describe("MetricCard", () => {
  it("renders label/value and warning tone", () => {
    render(<MetricCard label="Low stock" value={4} tone="warning" />);
    expect(screen.getByText("4")).toHaveClass("text-warning");
  });
});
