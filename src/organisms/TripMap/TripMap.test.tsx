import { render, screen } from "@testing-library/react";
import { createRef, type MutableRefObject, type ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import type { LivePing } from "@/hooks/fleet/useFleetStream";

vi.mock("react-leaflet", () => ({
  MapContainer: ({ children }: { children: ReactNode }) => <div data-testid="map">{children}</div>,
  TileLayer: () => <div data-testid="tile" />,
  Marker: ({ children }: { children: ReactNode }) => <div data-testid="marker">{children}</div>,
  Polyline: () => <div data-testid="polyline" />,
  Popup: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  useMap: () => ({ fitBounds: () => {}, invalidateSize: () => {} }),
}));

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
});
