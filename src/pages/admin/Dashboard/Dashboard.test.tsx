import { screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { renderWithProviders } from "@/test/utils";

vi.mock("@/utils/http", () => ({ http: { get: vi.fn() } }));
import { http } from "@/utils/http";
import Dashboard from "./Dashboard";

const m = http as unknown as { get: Mock };

beforeEach(() => vi.clearAllMocks());

describe("Dashboard", () => {
  it("renders metrics, status counts and recent movements", async () => {
    m.get.mockImplementation((url: string) => {
      if (url === "/orders/counts")
        return Promise.resolve({ data: { pending: 4, assigned: 3, in_transit: 2, completed: 12, failed: 1 } });
      if (url === "/fleet/active") return Promise.resolve({ data: [{}, {}] });
      if (url === "/movements")
        return Promise.resolve({
          data: [
            {
              _id: "mv1",
              productId: { name: "Diesel", unit: "litre" },
              fromLocationId: { name: "Central Hub" },
              toLocationId: { name: "North Terminal" },
              quantity: 120,
              completedAt: "2026-06-14T14:02:00.000Z",
            },
          ],
        });
      if (url === "/inventory")
        return Promise.resolve({ data: { thresholds: { low: 20, warn: 50 }, rows: [{ products: [{ band: "low" }, { band: "ok" }] }] } });
      return Promise.resolve({ data: {} });
    });
    renderWithProviders(<Dashboard />, { route: "/admin" });
    expect(await screen.findByRole("heading", { name: "Dashboard" })).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText("Diesel")).toBeInTheDocument());
    expect(screen.getByText("120 litre")).toBeInTheDocument(); // movement qty + unit
    expect(screen.getByText("Active vehicles")).toBeInTheDocument();
  });

  it("renders the empty/zero state while data is loading", () => {
    m.get.mockReturnValue(new Promise(() => {}));
    renderWithProviders(<Dashboard />, { route: "/admin" });
    expect(screen.getByRole("heading", { name: "Dashboard" })).toBeInTheDocument();
    expect(screen.getByText(/No movements yet/)).toBeInTheDocument();
  });
});
