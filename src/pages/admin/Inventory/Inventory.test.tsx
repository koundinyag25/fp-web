import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { renderWithProviders } from "@/test/utils";

vi.mock("@/utils/http", () => ({ http: { get: vi.fn() } }));
import { http } from "@/utils/http";
import Inventory from "./Inventory";

const m = http as unknown as { get: Mock };

const inventory = {
  thresholds: { low: 20, warn: 50 },
  rows: [
    {
      locationId: "h1",
      locationName: "Central Hub",
      type: "hub",
      products: [
        { productId: "p1", productName: "Diesel", unit: "litre", qty: 80, band: "ok" },
        { productId: "p2", productName: "Petrol", unit: "litre", qty: 8, band: "low" },
      ],
    },
    {
      locationId: "t1",
      locationName: "North Terminal",
      type: "terminal",
      products: [
        { productId: "p1", productName: "Diesel", unit: "litre", qty: 35, band: "warn" },
        { productId: "p2", productName: "Petrol", unit: "litre", qty: 60, band: "ok" },
      ],
    },
  ],
};

beforeEach(() => {
  vi.clearAllMocks();
  m.get.mockImplementation((url: string) => {
    if (url === "/inventory") return Promise.resolve({ data: inventory });
    if (url === "/products")
      return Promise.resolve({
        data: {
          items: [
            { _id: "p1", name: "Diesel", unit: "litre" },
            { _id: "p2", name: "Petrol", unit: "litre" },
          ],
          nextCursor: null,
        },
      });
    if (url === "/locations")
      return Promise.resolve({
        data: { items: [{ _id: "h1", name: "Central Hub", type: "hub", lat: 0, lng: 0 }], nextCursor: null },
      });
    return Promise.resolve({ data: { items: [], nextCursor: null } });
  });
});

describe("Inventory dashboard", () => {
  it("renders the location × product pivot with quantities (FR-IN-1)", async () => {
    renderWithProviders(<Inventory />);
    expect(await screen.findByText("North Terminal")).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Diesel" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Petrol" })).toBeInTheDocument();
    expect(screen.getByText("80")).toBeInTheDocument(); // Diesel @ Central Hub
  });

  it("flags low-stock cells with a critical tone (FR-IN-2)", async () => {
    renderWithProviders(<Inventory />);
    await screen.findByText("North Terminal");
    // Petrol @ Central Hub = 8 → low band.
    expect(screen.getByText("8").className).toContain("text-critical");
  });

  it("searches locations by name (FR-IN-3)", async () => {
    renderWithProviders(<Inventory />);
    await screen.findByText("North Terminal");
    await userEvent.type(screen.getByPlaceholderText("Search locations…"), "north");
    await waitFor(() =>
      expect(m.get).toHaveBeenCalledWith("/inventory", {
        params: expect.objectContaining({ q: "north" }),
      })
    );
  });

  it("renders a dash for a missing cell and omits the unit when absent", async () => {
    m.get.mockImplementation((url: string) => {
      if (url === "/inventory")
        return Promise.resolve({
          data: {
            thresholds: { low: 20, warn: 50 },
            rows: [
              {
                locationId: "h1",
                locationName: "Central Hub",
                type: "hub",
                products: [
                  // No `unit` on this cell → the unit span is omitted.
                  { productId: "p1", productName: "Diesel", qty: 80, band: "ok" },
                  { productId: "p2", productName: "Petrol", unit: "litre", qty: 60, band: "ok" },
                ],
              },
              {
                locationId: "t1",
                locationName: "North Terminal",
                type: "terminal",
                // Missing p2 entirely → that cell falls back to "—".
                products: [{ productId: "p1", productName: "Diesel", unit: "litre", qty: 35, band: "warn" }],
              },
            ],
          },
        });
      return Promise.resolve({ data: { items: [], nextCursor: null } });
    });
    renderWithProviders(<Inventory />);
    expect(await screen.findByText("North Terminal")).toBeInTheDocument();
    expect(screen.getByText("—")).toBeInTheDocument(); // Petrol @ North Terminal missing
    // The unit-less Diesel cell shows just the number, no "litre" suffix beside 80.
    const dieselCell = screen.getByText("80");
    expect(dieselCell.textContent).toBe("80");
  });

  it("offers Location and Product filters via the shared FilterBuilder (FR-IN-3)", async () => {
    renderWithProviders(<Inventory />);
    await screen.findByText("North Terminal");
    await userEvent.click(screen.getByText("Filters"));
    await userEvent.click(screen.getByRole("button", { name: /Add filter/ }));
    // The field selector is seeded with this page's fields.
    expect(screen.getByRole("option", { name: "Location" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Product" })).toBeInTheDocument();
  });
});
