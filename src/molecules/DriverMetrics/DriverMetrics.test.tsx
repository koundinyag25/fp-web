import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { DriverStats } from "@/types";
import { DriverMetrics } from "./DriverMetrics";

const stats: DriverStats = { sinceDays: 90, completed: 18, failed: 2, total: 20 };

describe("DriverMetrics", () => {
  it("renders skeleton placeholders while loading", () => {
    const { container } = render(<DriverMetrics loading />);
    expect(container.querySelectorAll(".animate-pulse")).toHaveLength(3);
    expect(screen.queryByText("Success")).not.toBeInTheDocument();
  });

  it("renders skeleton placeholders when stats are missing (not loading)", () => {
    const { container } = render(<DriverMetrics />);
    expect(container.querySelectorAll(".animate-pulse")).toHaveLength(3);
  });

  it("renders completed/failed counts and a computed success rate", () => {
    render(<DriverMetrics stats={stats} />);
    expect(screen.getByText("18")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("90%")).toBeInTheDocument(); // 18/20
  });

  it("falls back to 100% success when there are no deliveries", () => {
    render(<DriverMetrics stats={{ sinceDays: 90, completed: 0, failed: 0, total: 0 }} />);
    expect(screen.getByText("100%")).toBeInTheDocument();
  });
});
