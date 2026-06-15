import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Delivery, DeliveryOrder } from "@/types";
import { TripCard } from "./TripCard";

const makeDelivery = (overrides: Partial<Delivery> = {}, order: Partial<DeliveryOrder> | null = {}): Delivery => ({
  _id: "del1",
  sequence: 0,
  status: "pending",
  orderId:
    order === null
      ? null
      : {
          quantity: 200,
          startTime: "08:30",
          productId: { _id: "p1", name: "Diesel", unit: "litre" },
          destinationId: { _id: "l1", name: "North Terminal" },
          ...order,
        },
  ...overrides,
});

describe("TripCard", () => {
  it("renders order details and fires onOpen on click", async () => {
    const onOpen = vi.fn();
    render(<TripCard delivery={makeDelivery()} onOpen={onOpen} />);
    expect(screen.getByText("08:30")).toBeInTheDocument();
    expect(screen.getByText(/Diesel · 200 litre/)).toBeInTheDocument();
    expect(screen.getByText("North Terminal")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button"));
    expect(onOpen).toHaveBeenCalled();
  });

  it("shows the current+pending 'Up next' marker and primary styling", () => {
    render(<TripCard delivery={makeDelivery({ status: "pending" })} current onOpen={vi.fn()} />);
    expect(screen.getByText(/Up next/)).toBeInTheDocument();
    expect(screen.getByRole("button")).toHaveClass("border-primary");
  });

  it("shows 'In progress' when the current stop is in transit (info tone)", () => {
    render(<TripCard delivery={makeDelivery({ status: "in_transit" })} current onOpen={vi.fn()} />);
    expect(screen.getByText(/In progress/)).toBeInTheDocument();
    expect(screen.getByText("in_transit")).toHaveClass("text-info");
  });

  it("hides the current marker for terminal (completed/failed) stops", () => {
    const { rerender } = render(
      <TripCard delivery={makeDelivery({ status: "completed" })} current onOpen={vi.fn()} />
    );
    expect(screen.queryByText(/Up next|In progress/)).not.toBeInTheDocument();
    expect(screen.getByText("completed")).toHaveClass("text-success");

    rerender(<TripCard delivery={makeDelivery({ status: "failed" })} current onOpen={vi.fn()} />);
    expect(screen.getByText("failed")).toHaveClass("text-critical");
  });

  it("renders a lock icon and dimmed styling when locked", () => {
    const { container } = render(<TripCard delivery={makeDelivery()} locked onOpen={vi.fn()} />);
    const btn = screen.getByRole("button");
    expect(btn).toHaveAttribute("aria-disabled", "true");
    expect(btn).toHaveClass("opacity-60");
    // lucide icons render as <svg class="lucide-lock ...">
    expect(container.querySelector(".lucide-lock")).toBeInTheDocument();
    expect(container.querySelector(".lucide-chevron-right")).not.toBeInTheDocument();
  });

  it("renders a chevron (not a lock) when unlocked", () => {
    const { container } = render(<TripCard delivery={makeDelivery()} onOpen={vi.fn()} />);
    expect(container.querySelector(".lucide-chevron-right")).toBeInTheDocument();
    expect(container.querySelector(".lucide-lock")).not.toBeInTheDocument();
  });

  it("uses the warning tone for unknown statuses and degrades gracefully with no order", () => {
    render(<TripCard delivery={makeDelivery({ status: "scheduled" }, null)} onOpen={vi.fn()} />);
    expect(screen.getByText("scheduled")).toHaveClass("text-warning");
    // missing destination falls back to em dash
    expect(screen.getByText("—")).toBeInTheDocument();
    // no startTime span rendered
    expect(screen.queryByText("08:30")).not.toBeInTheDocument();
  });

  it("omits the unit suffix when the product has no unit", () => {
    render(
      <TripCard
        delivery={makeDelivery({}, { quantity: 5, productId: { _id: "p2", name: "Pallet" } })}
        onOpen={vi.fn()}
      />
    );
    expect(screen.getByText(/Pallet · 5$/)).toBeInTheDocument();
  });
});
