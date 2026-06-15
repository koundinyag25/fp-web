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

const render = (route = "/driver/d1/trip/dl1") =>
  renderWithProviders(
    <Routes>
      <Route path="/driver/:driverId">
        <Route index element={<div>back home</div>} />
        <Route path="trip/:deliveryId" element={<TripDetail />} />
      </Route>
    </Routes>,
    { route }
  );

const defaultDelivery = {
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
};

// Drives the /shifts/today response; pass an array of deliveries to shape the
// page's state (terminal / not-current / order fields).
const mockToday = (
  deliveries: Array<Record<string, unknown>> = [defaultDelivery],
  todayResolves = true
) => {
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
    if (url === "/shifts/today") {
      if (!todayResolves) return new Promise(() => {}); // never settles → loading
      return Promise.resolve({
        data: {
          date: "2026-06-15",
          canStart: false,
          allocation: { _id: "a1", vehicleId: { _id: "v1", reg: "KA01AB1234", type: "tanker" } },
          activeShift: { _id: "s1", status: "active" },
          deliveries,
          orders: [],
        },
      });
    }
    return Promise.resolve({ data: {} });
  });
};

beforeEach(() => {
  vi.clearAllMocks();
  mockToday();
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

  it("shows a spinner while the day is loading", () => {
    mockToday([defaultDelivery], false); // /shifts/today never settles
    render();
    expect(screen.getByText("Loading trip…")).toBeInTheDocument();
  });

  it("shows a not-found state and goes back when the delivery is missing", async () => {
    // The today payload has no delivery matching the routed id.
    render("/driver/d1/trip/missing");
    expect(await screen.findByText("Trip not found.")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /Back/ }));
    expect(await screen.findByText("back home")).toBeInTheDocument();
  });

  it("locks earlier stops behind the active one (Complete your earlier stops)", async () => {
    // dl2 is in_transit (the current stop); the routed dl1 sits behind it → locked.
    mockToday([
      defaultDelivery,
      { ...defaultDelivery, _id: "dl2", sequence: 1, status: "in_transit" },
    ]);
    render();
    expect(
      await screen.findByText(/Complete your earlier stops first/)
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Start trip" })).toBeNull();
  });

  it("shows a terminal note and a success badge for a completed stop", async () => {
    mockToday([{ ...defaultDelivery, status: "completed" }]);
    render();
    expect(await screen.findByText("This stop is completed.")).toBeInTheDocument();
    // statusTone('completed') → success badge, no action buttons.
    expect(screen.getByText("completed")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Start trip" })).toBeNull();
  });

  it("shows a terminal note for a failed stop (critical tone)", async () => {
    mockToday([{ ...defaultDelivery, status: "failed" }]);
    render();
    expect(await screen.findByText("This stop is failed.")).toBeInTheDocument();
    expect(screen.getByText("failed")).toBeInTheDocument();
  });

  it("offers Finish directly when the stop is already in transit (info tone)", async () => {
    // status in_transit → driving=true without tapping start, and the badge tone is info.
    mockToday([{ ...defaultDelivery, status: "in_transit" }]);
    render();
    expect(
      await screen.findByRole("button", { name: /Finish order/ })
    ).toBeInTheDocument();
    expect(screen.getByText("in_transit")).toBeInTheDocument();
  });

  it("falls back to dashes and hides the schedule when order fields are missing", async () => {
    // No source/destination/unit/startTime → the ?? and optional-chaining fallbacks render.
    mockToday([
      {
        _id: "dl1",
        sequence: 0,
        status: "pending",
        orderId: { quantity: 100, productId: { name: "Diesel" } },
      },
    ]);
    render();
    await screen.findByRole("button", { name: "Start trip" });
    // sourceHubId / destinationId absent → both rows show the em dash.
    expect(screen.getAllByText("—")).toHaveLength(2);
    // startTime absent → no "Scheduled" line.
    expect(screen.queryByText(/Scheduled/)).toBeNull();
  });
});
