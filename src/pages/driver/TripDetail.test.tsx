import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { renderWithProviders } from "@/test/utils";

vi.mock("react-leaflet", () => ({
  MapContainer: ({ children }: { children: ReactNode }) => <div data-testid="map">{children}</div>,
  TileLayer: () => <div data-testid="tile" />,
  Marker: ({ children }: { children: ReactNode }) => <div data-testid="marker">{children}</div>,
  Polyline: () => <div data-testid="polyline" />,
  Popup: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  useMap: () => ({ fitBounds: () => {}, invalidateSize: () => {} }),
}));

vi.mock("@/utils/http", () => ({ http: { get: vi.fn(), post: vi.fn() } }));
import { http } from "@/utils/http";
import TripDetail from "./TripDetail";

const m = http as unknown as { get: Mock; post: Mock };

const DEST = { name: "North Terminal", lat: 37.4, lng: -121.85 };

const render = () =>
  renderWithProviders(
    <Routes>
      <Route path="/driver/:driverId">
        <Route index element={<div>back home</div>} />
        <Route path="trip/:deliveryId" element={<TripDetail />} />
      </Route>
    </Routes>,
    { route: "/driver/d1/trip/dl1" }
  );

beforeEach(() => {
  vi.clearAllMocks();
  m.post.mockResolvedValue({ data: {} });
  m.get.mockImplementation((url: string) => {
    if (url.startsWith("/fleet/route"))
      return Promise.resolve({
        data: {
          deliveryId: "dl1",
          from: { name: "Central Hub", lat: 37.3, lng: -121.95 },
          to: DEST,
          path: [
            { lat: 37.3, lng: -121.95, ts: "t1" },
            { lat: 37.4, lng: -121.85, ts: "t2" },
          ],
        },
      });
    if (url === "/shifts/today")
      return Promise.resolve({
        data: {
          date: "2026-06-15",
          canStart: false,
          allocation: { _id: "a1", vehicleId: { _id: "v1", reg: "KA01AB1234", type: "tanker" } },
          activeShift: { _id: "s1", status: "active" },
          deliveries: [
            {
              _id: "dl1",
              sequence: 0,
              status: "pending",
              orderId: {
                quantity: 100,
                destinationId: DEST,
                sourceHubId: { name: "Central Hub" },
                productId: { name: "Diesel", unit: "litre" },
                startTime: "09:00",
              },
            },
          ],
          orders: [],
        },
      });
    return Promise.resolve({ data: {} });
  });
});

describe("TripDetail", () => {
  it("starts the trip from the source (FR-DM-4)", async () => {
    render();
    await userEvent.click(await screen.findByRole("button", { name: "Start trip" }));
    await waitFor(() =>
      expect(m.post).toHaveBeenCalledWith("/drivers/d1/drive/start", { replay: true })
    );
  });

  it("lets the driver finish the order once under way, completing it (FR-DL-1)", async () => {
    render();
    // Start the trip → it's under way → the finish action is offered.
    await userEvent.click(await screen.findByRole("button", { name: "Start trip" }));
    await userEvent.click(await screen.findByRole("button", { name: /Finish order/ }));
    await waitFor(() => expect(m.post).toHaveBeenCalledWith("/deliveries/dl1/complete"));
  });

  it("marks the delivery failed with a required reason (FR-DL-2)", async () => {
    render();
    await userEvent.click(await screen.findByRole("button", { name: "Mark failed" }));
    await userEvent.type(screen.getByLabelText("Reason"), "Customer unavailable");
    await userEvent.click(screen.getByRole("button", { name: "Submit" }));
    await waitFor(() =>
      expect(m.post).toHaveBeenCalledWith("/deliveries/dl1/fail", { reason: "Customer unavailable" })
    );
  });
});
