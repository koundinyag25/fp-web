import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import type { ReactElement } from "react";
import type { ActiveVehicle } from "@/types";

// react-window v2 self-measures via ResizeObserver (absent in jsdom); render all
// rows through the row component so card assertions are deterministic.
vi.mock("react-window", () => ({
  List: ({ rowComponent: Row, rowCount, rowProps }: { rowComponent: (p: Record<string, unknown>) => ReactElement; rowCount: number; rowProps: Record<string, unknown> }) => (
    <div>{Array.from({ length: rowCount }, (_, i) => <Row key={i} index={i} style={{}} {...rowProps} />)}</div>
  ),
}));

import { ActiveFleetList } from "./ActiveFleetList";

const rows: ActiveVehicle[] = [
  {
    shiftId: "s1",
    vehicle: { _id: "v1", reg: "KA01AB1234", type: "tanker" },
    driver: { _id: "d1", name: "Asha Rao" },
    position: { lat: 1, lng: 1, ts: "t" },
    deliveryStatus: "in_transit",
    currentDelivery: { _id: "del1", orderId: { destinationId: { _id: "l1", name: "North Terminal" } } },
  },
  {
    shiftId: "s2",
    vehicle: { _id: "v2", reg: "KA02CD5678", type: "rigid" },
    driver: { _id: "d2", name: "Sara Lee" },
    position: { lat: 2, lng: 2, ts: "t" },
    deliveryStatus: "idle",
  },
];

describe("ActiveFleetList", () => {
  it("renders a card per vehicle with driver, destination, and a count", () => {
    render(<ActiveFleetList rows={rows} selectedId={null} onSelect={vi.fn()} />);
    expect(screen.getByText("KA01AB1234")).toBeInTheDocument();
    expect(screen.getByText("Asha Rao")).toBeInTheDocument();
    expect(screen.getByText("→ North Terminal")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument(); // count
  });

  it("marks the selected card pressed and reports selection", async () => {
    const onSelect = vi.fn();
    render(<ActiveFleetList rows={rows} selectedId="v1" onSelect={onSelect} />);
    expect(screen.getByRole("button", { name: /KA01AB1234/ })).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(screen.getByRole("button", { name: /KA02CD5678/ }));
    expect(onSelect).toHaveBeenCalledWith("v2");
  });

  it("shows an empty state with no active vehicles", () => {
    render(<ActiveFleetList rows={[]} selectedId={null} onSelect={vi.fn()} />);
    expect(screen.getByText(/no active vehicles/i)).toBeInTheDocument();
  });

  it("falls back gracefully when vehicle/driver/delivery data is missing", async () => {
    const onSelect = vi.fn();
    const sparse: ActiveVehicle[] = [
      {
        shiftId: "s9",
        vehicle: null,
        driver: null,
        position: null,
        deliveryStatus: null,
        currentDelivery: null,
      },
    ];
    render(<ActiveFleetList rows={sparse} selectedId="s9" onSelect={onSelect} />);
    expect(screen.getByText("—")).toBeInTheDocument(); // reg fallback
    expect(screen.getByText("Unassigned")).toBeInTheDocument(); // driver fallback
    // deliveryStatus null → "idle" shown both as the pill status and the no-dest line
    expect(screen.getAllByText("idle").length).toBeGreaterThan(0);
    // vid falls back to shiftId, so the card is marked selected
    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "true");
    // clicking does nothing because there's no vehicle._id
    await userEvent.click(screen.getByRole("button"));
    expect(onSelect).not.toHaveBeenCalled();
  });
});
