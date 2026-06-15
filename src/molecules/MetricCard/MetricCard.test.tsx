import { render, screen } from "@testing-library/react";
import { Boxes } from "lucide-react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { MetricCard } from "./MetricCard";

describe("MetricCard", () => {
  it("renders label/value and warning tone", () => {
    render(<MetricCard label="Low stock" value={4} tone="warning" />);
    expect(screen.getByText("4")).toHaveClass("text-warning");
    expect(screen.getByText("Low stock")).toHaveClass("text-warning");
  });

  it("renders the default tone and a plain (non-link) card with no icon/arrow", () => {
    const { container } = render(<MetricCard label="Vehicles" value={20} />);
    expect(screen.getByText("20")).toHaveClass("text-on-surface");
    expect(screen.getByText("Vehicles")).toHaveClass("text-outline");
    expect(container.querySelector("a")).not.toBeInTheDocument();
    // neither an icon chip nor the drill-in arrow
    expect(container.querySelector("svg")).not.toBeInTheDocument();
  });

  it("renders an icon chip when an icon is supplied", () => {
    const { container } = render(<MetricCard label="Hubs" value={3} icon={<Boxes data-testid="ic" />} />);
    expect(screen.getByTestId("ic")).toBeInTheDocument();
    expect(screen.getByTestId("ic").parentElement).toHaveClass("text-primary"); // default-tone chip
    // icon takes precedence over the drill-in arrow
    expect(container.querySelector(".lucide-arrow-up-right")).not.toBeInTheDocument();
  });

  it("tints the icon chip amber in the warning tone", () => {
    render(<MetricCard label="Low stock" value={2} tone="warning" icon={<Boxes data-testid="ic" />} />);
    expect(screen.getByTestId("ic").parentElement).toHaveClass("text-warning");
  });

  it("becomes a drill-in link with an arrow when `to` is set (and no icon)", () => {
    const { container } = render(
      <MemoryRouter>
        <MetricCard label="Orders" value={9} to="/admin/orders" hint="this week" />
      </MemoryRouter>
    );
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/admin/orders");
    expect(container.querySelector(".lucide-arrow-up-right")).toBeInTheDocument();
    expect(screen.getByText("this week")).toBeInTheDocument();
  });
});
