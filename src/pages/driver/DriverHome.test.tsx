import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { renderWithProviders } from "@/test/utils";

vi.mock("@/utils/http", () => ({ http: { get: vi.fn(), post: vi.fn() } }));

const { show } = vi.hoisted(() => ({ show: vi.fn() }));
vi.mock("@/hooks/useToast", async (orig) => ({
  ...(await orig<typeof import("@/hooks/useToast")>()),
  useToast: () => ({ show }),
}));

import { http } from "@/utils/http";
import DriverHome from "./DriverHome";

const m = http as unknown as { get: Mock; post: Mock };

const render = () =>
  renderWithProviders(
    <Routes>
      <Route path="/driver/:driverId">
        <Route index element={<DriverHome />} />
        <Route path="trip/:deliveryId" element={<div>trip detail stub</div>} />
      </Route>
    </Routes>,
    { route: "/driver/d1" },
  );

const allocation = {
  _id: "a1",
  vehicleId: { _id: "v1", reg: "KA01AB1234", type: "tanker", capacity: 12000 },
};
const trip = (id: string, sequence: number, status: string, dest: string) => ({
  _id: id,
  sequence,
  status,
  orderId: {
    quantity: 100,
    destinationId: { name: dest },
    productId: { name: "Diesel", unit: "litre" },
    startTime: "09:00",
  },
});

const mockToday = (over: Record<string, unknown>) =>
  m.get.mockImplementation((url: string) => {
    if (url === "/drivers/d1/stats")
      return Promise.resolve({
        data: { sinceDays: 90, completed: 12, failed: 1, total: 13 },
      });
    if (url === "/shifts/today")
      return Promise.resolve({
        data: {
          date: "2026-06-15",
          canStart: false,
          allocation: null,
          activeShift: null,
          deliveries: [],
          orders: [],
          ...over,
        },
      });
    return Promise.resolve({ data: {} });
  });

beforeEach(() => {
  vi.clearAllMocks();
  m.post.mockResolvedValue({ data: {} });
});

describe("DriverHome", () => {
  it("blocks the shift and points to the admin when no vehicle is allotted (FR-SV-2)", async () => {
    mockToday({ allocation: null, canStart: false });
    render();
    expect(await screen.findByText(/Contact your admin/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Start shift" })).toBeDisabled();
  });

  it("celebrates the assigned vehicle + metrics and starts a shift (FR-SV-1/2)", async () => {
    mockToday({ allocation, canStart: true });
    render();
    expect(await screen.findByText("KA01AB1234")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument(); // completed last 3 months
    const start = screen.getByRole("button", { name: "Start shift" });
    expect(start).toBeEnabled();
    await userEvent.click(start);
    // Starts in the client's local day frame (must match the admin's allocation
    // calendar, not the server's UTC day) — see shiftService.
    await waitFor(() =>
      expect(m.post).toHaveBeenCalledWith("/shifts", {
        driverId: "d1",
        date: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
      }),
    );
  });

  it("reveals trips chronologically, marks the in-transit stop active, and opens one (FR-SV-3)", async () => {
    // North (pending, seq 0) sits ahead of East (in_transit, seq 1): the active
    // stop is the in-transit one, not the earlier pending.
    mockToday({
      allocation,
      activeShift: { _id: "s1", status: "active" },
      deliveries: [
        trip("dl1", 0, "pending", "North Terminal"),
        trip("dl2", 1, "in_transit", "East Depot"),
      ],
    });
    render();
    await screen.findByText("North Terminal");
    const east = screen.getByRole("button", { name: /East Depot/ });
    const north = screen.getByRole("button", { name: /North Terminal/ });
    // In-transit = "In progress" (not the contradictory "Up next"); the pending
    // stop behind it gets no active label.
    expect(within(east).getByText(/In progress/i)).toBeInTheDocument();
    expect(within(north).queryByText(/In progress|Up next/i)).toBeNull();

    // The pending stop behind the active one is locked: tapping warns + doesn't open.
    await userEvent.click(north);
    expect(show).toHaveBeenCalledWith({
      tone: "info",
      message: expect.stringMatching(/finish your current trip/i),
    });
    expect(screen.queryByText("trip detail stub")).toBeNull();

    // The active (in-transit) stop opens.
    await userEvent.click(east);
    expect(await screen.findByText("trip detail stub")).toBeInTheDocument();
  });

  it("shows the active shift's trips with no allocation today (stale cross-day shift)", async () => {
    // A shift left open from a previous day has no allocation for `today`, but
    // the fleet map still shows it active — so the driver must see their trips
    // (vehicle resolved from the shift), never a "no vehicle today" block.
    mockToday({
      allocation: null,
      vehicle: { _id: "v9", reg: "3GBA029", type: "truck", capacity: 2100 },
      activeShift: { _id: "s9", status: "active", vehicleId: "v9" },
      deliveries: [trip("dl9", 0, "in_transit", "South Bay Hub")],
    });
    render();
    expect(await screen.findByText("South Bay Hub")).toBeInTheDocument();
    expect(screen.getByText("3GBA029")).toBeInTheDocument(); // shift vehicle, no allocation
    expect(screen.queryByText(/Contact your admin/)).toBeNull();
    expect(screen.getByRole("button", { name: "End shift" })).toBeInTheDocument();
  });
});
