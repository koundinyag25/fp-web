import { render, screen } from "@testing-library/react";
import { createRef, type MutableRefObject, type ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import type { LivePing } from "@/hooks/fleet/useFleetStream";

vi.mock("react-leaflet", async () => {
  const { forwardRef } = await import("react");
  // Marker forwards its ref to a host node so TripMap's callback ref fires on
  // mount (set) and unmount (delete) — that's the branch under test.
  const Marker = forwardRef<HTMLDivElement, { children?: ReactNode }>(({ children }, ref) => (
    <div data-testid="marker" ref={ref}>
      {children}
    </div>
  ));
  return {
    MapContainer: ({ children }: { children: ReactNode }) => <div data-testid="map">{children}</div>,
    TileLayer: () => <div data-testid="tile" />,
    Marker,
    Polyline: () => <div data-testid="polyline" />,
    Popup: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    useMap: () => ({ fitBounds: () => {}, invalidateSize: () => {} }),
  };
});

import { TripMap } from "./TripMap";

const refOf = <T,>(v: T): MutableRefObject<T> => {
  const r = createRef<T>() as MutableRefObject<T>;
  r.current = v;
  return r;
};

const route = {
  deliveryId: "dl1",
  from: { _id: "h1", name: "Central Hub", lat: 37.3, lng: -121.95 },
  to: { _id: "t1", name: "North Terminal", lat: 37.4, lng: -121.85 },
  path: [
    { lat: 37.3, lng: -121.95, ts: "t1" },
    { lat: 37.4, lng: -121.85, ts: "t2" },
  ],
};

describe("TripMap", () => {
  it("draws the route, destination, and driver marker (FR-DM-1/2/3)", () => {
    const pings = refOf(new Map<string, LivePing>([["v1", { lat: 37.3, lng: -121.95, ts: "t1" }]]));
    render(<TripMap vehicleId="v1" route={route} pingsRef={pings} />);
    expect(screen.getByTestId("polyline")).toBeInTheDocument();
    // destination pin + driver truck
    expect(screen.getAllByTestId("marker").length).toBeGreaterThanOrEqual(2);
  });

  it("registers the marker on mount and unregisters it on unmount", () => {
    const pings = refOf(new Map<string, LivePing>([["v1", { lat: 37.3, lng: -121.95, ts: "t1" }]]));
    const { unmount } = render(<TripMap vehicleId="v1" route={route} pingsRef={pings} />);
    expect(screen.getAllByTestId("marker").length).toBeGreaterThanOrEqual(1);
    // Unmount runs the callback ref with null → the `else markersRef.delete` arm.
    expect(() => unmount()).not.toThrow();
  });

  it("seeds the driver marker from the route start when no ping has arrived yet", () => {
    // Empty pings → `pings.get(id) ?? seeds.get(id)` falls back to the seed.
    const pings = refOf(new Map<string, LivePing>());
    render(<TripMap vehicleId="v1" route={route} pingsRef={pings} />);
    // route.to pin + seeded driver marker
    expect(screen.getAllByTestId("marker").length).toBeGreaterThanOrEqual(2);
  });

  it("centers on the default and draws no markers when the route has no points", () => {
    // No route → from is undefined (center fallback) and no seed/ping → no driver
    // marker, and no `to` → no destination pin.
    const pings = refOf(new Map<string, LivePing>());
    render(<TripMap vehicleId="v1" pingsRef={pings} />);
    expect(screen.queryByTestId("marker")).not.toBeInTheDocument();
    expect(screen.queryByTestId("polyline")).not.toBeInTheDocument();
  });
});
