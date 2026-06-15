import { fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { MockIntersectionObserver } from "@/test/mocks";
import { renderWithProviders } from "@/test/utils";

vi.mock("@/utils/http", () => ({
  http: { get: vi.fn(), post: vi.fn(), patch: vi.fn() },
}));
import { http } from "@/utils/http";
import Orders from "./Orders";

const m = http as unknown as { get: Mock; post: Mock; patch: Mock };

const orders = [
  { _id: "o1", productId: { name: "Diesel", unit: "litre" }, quantity: 120, sourceHubId: { name: "Central Hub" }, destinationId: { name: "North Terminal" }, deliveryDate: "2026-06-14", startTime: "14:30", assignedDriverId: { _id: "d1", name: "Asha Rao" }, status: "in_transit" },
  { _id: "o2", productId: { name: "Petrol" }, quantity: 200, sourceHubId: { name: "Central Hub" }, destinationId: { name: "West Depot" }, deliveryDate: "2026-06-14", assignedDriverId: null, status: "pending" },
];

// A pending (so editable) order whose nested refs carry _ids — the edit form
// seeds its selects/inputs from these.
const editableOrder = {
  _id: "o2",
  productId: { _id: "pr1", name: "Diesel", unit: "litre" },
  quantity: 200,
  sourceHubId: { _id: "h1", name: "Central Hub" },
  destinationId: { _id: "t1", name: "North Terminal" },
  deliveryDate: "2026-06-20",
  startTime: "08:15",
  assignedDriverId: { _id: "d1", name: "Asha Rao" },
  status: "pending",
};

const handle = (ordersPage: { items: unknown[]; nextCursor: string | null }) =>
  m.get.mockImplementation((url: string, opts?: { params?: { type?: string } }) => {
    if (url === "/orders/counts")
      return Promise.resolve({ data: { pending: 4, assigned: 3, in_transit: 2, completed: 12, failed: 1 } });
    if (url === "/orders") return Promise.resolve({ data: ordersPage });
    if (url === "/locations")
      // Hubs and terminals are distinct pools, so source ≠ destination in the form.
      return Promise.resolve({
        data: {
          items:
            opts?.params?.type === "terminal"
              ? [{ _id: "t1", name: "North Terminal", type: "terminal" }]
              : [{ _id: "h1", name: "Central Hub", type: "hub" }],
          nextCursor: null,
        },
      });
    if (url === "/products") return Promise.resolve({ data: { items: [{ _id: "pr1", name: "Diesel", unit: "litre" }], nextCursor: null } });
    if (url === "/drivers") return Promise.resolve({ data: { items: [{ _id: "d1", name: "Asha Rao" }, { _id: "d9", name: "Bhavna K" }], nextCursor: null } });
    return Promise.resolve({ data: {} });
  });

beforeEach(() => {
  vi.clearAllMocks();
  m.post.mockResolvedValue({ data: {} });
  m.patch.mockResolvedValue({ data: {} });
});

describe("Orders page", () => {
  it("renders orders with statuses", async () => {
    handle({ items: orders, nextCursor: null });
    renderWithProviders(<Orders />);
    expect(await screen.findByText("Asha Rao")).toBeInTheDocument(); // row driver
    expect(screen.getByText("Petrol")).toBeInTheDocument();
    expect(screen.getByText("120 litre")).toBeInTheDocument(); // qty + product unit
    expect(screen.getByText("14:30")).toBeInTheDocument(); // start time
  });

  it("filters by status", async () => {
    handle({ items: orders, nextCursor: null });
    renderWithProviders(<Orders />);
    await screen.findByText("Asha Rao");
    await userEvent.click(screen.getByRole("button", { name: /pending/ }));
    await waitFor(() =>
      expect(m.get).toHaveBeenCalledWith("/orders", expect.objectContaining({ params: expect.objectContaining({ status: "pending" }) }))
    );
  });

  it("filters by delivery-date range (list + counts)", async () => {
    handle({ items: orders, nextCursor: null });
    renderWithProviders(<Orders />);
    await screen.findByText("Asha Rao");

    fireEvent.change(screen.getByLabelText("From date"), { target: { value: "2026-06-10" } });
    fireEvent.change(screen.getByLabelText("To date"), { target: { value: "2026-06-20" } });

    await waitFor(() =>
      expect(m.get).toHaveBeenCalledWith(
        "/orders",
        expect.objectContaining({ params: expect.objectContaining({ from: "2026-06-10", to: "2026-06-20" }) })
      )
    );
    expect(m.get).toHaveBeenCalledWith(
      "/orders/counts",
      expect.objectContaining({ params: expect.objectContaining({ from: "2026-06-10", to: "2026-06-20" }) })
    );
  });

  it("creates an order", async () => {
    handle({ items: orders, nextCursor: null });
    renderWithProviders(<Orders />);
    await screen.findByText("Asha Rao");
    await userEvent.click(screen.getByRole("button", { name: /New order/ }));
    expect(screen.getByRole("heading", { name: "New order" })).toBeInTheDocument();
    expect(screen.getByText("litre")).toBeInTheDocument(); // unit of the selected product
    await userEvent.type(screen.getByLabelText("Quantity"), "150");
    await userEvent.click(screen.getByRole("button", { name: "Create order" }));
    await waitFor(() =>
      expect(m.post).toHaveBeenCalledWith("/orders", expect.objectContaining({ quantity: 150, startTime: "09:00" }))
    );
    expect(await screen.findByText("Order created.")).toBeInTheDocument(); // success toast
  });

  it("assigns a driver to a pending order", async () => {
    handle({ items: orders, nextCursor: null });
    renderWithProviders(<Orders />);
    await screen.findByText("Petrol"); // the pending (unassigned) order row
    await userEvent.click(screen.getByRole("button", { name: "Assign" })); // open the picker
    await userEvent.click(await screen.findByRole("button", { name: "Bhavna K" })); // picking assigns immediately
    await waitFor(() => expect(m.patch).toHaveBeenCalledWith("/orders/o2/assign", { driverId: "d9" }));
  });

  it("edits an order: seeds the form from the row and PATCHes (update path)", async () => {
    handle({ items: [editableOrder], nextCursor: null });
    renderWithProviders(<Orders />);
    await screen.findByText("Diesel");

    // The row's edit button (pending → editable). The modal heading shares the
    // text, so scope to the button via its accessible label.
    await userEvent.click(screen.getByRole("button", { name: "Edit order" }));
    expect(await screen.findByRole("heading", { name: "Edit order" })).toBeInTheDocument();
    // Edit mode seeds the submit label and the quantity from the order.
    expect(screen.getByRole("button", { name: "Save changes" })).toBeInTheDocument();
    expect(screen.getByLabelText("Quantity")).toHaveValue(200);

    await userEvent.click(screen.getByRole("button", { name: "Save changes" }));
    await waitFor(() =>
      expect(m.patch).toHaveBeenCalledWith(
        "/orders/o2",
        expect.objectContaining({ quantity: 200, startTime: "08:15", assignedDriverId: "d1" })
      )
    );
    expect(await screen.findByText("Order updated.")).toBeInTheDocument();
  });

  it("blocks submit when quantity is invalid (validation branch)", async () => {
    handle({ items: orders, nextCursor: null });
    renderWithProviders(<Orders />);
    await screen.findByText("Asha Rao");
    await userEvent.click(screen.getByRole("button", { name: /New order/ }));

    // Empty quantity → invalid; submit shows the error and never POSTs.
    await userEvent.click(screen.getByRole("button", { name: "Create order" }));
    expect(await screen.findByText("Quantity must be at least 1.")).toBeInTheDocument();
    expect(m.post).not.toHaveBeenCalled();

    // Below the minimum is also rejected.
    await userEvent.type(screen.getByLabelText("Quantity"), "0");
    await userEvent.click(screen.getByRole("button", { name: "Create order" }));
    expect(screen.getByText("Quantity must be at least 1.")).toBeInTheDocument();
    expect(m.post).not.toHaveBeenCalled();
  });

  it("blocks submit when source and destination are the same hub/terminal", async () => {
    // Same id for the only hub and terminal so source === destination.
    m.get.mockImplementation((url: string, opts?: { params?: { type?: string } }) => {
      if (url === "/orders/counts") return Promise.resolve({ data: {} });
      if (url === "/orders") return Promise.resolve({ data: { items: orders, nextCursor: null } });
      if (url === "/locations")
        return Promise.resolve({ data: { items: [{ _id: "same", name: "Shared Yard", type: opts?.params?.type }], nextCursor: null } });
      if (url === "/products") return Promise.resolve({ data: { items: [{ _id: "pr1", name: "Diesel", unit: "litre" }], nextCursor: null } });
      return Promise.resolve({ data: { items: [], nextCursor: null } });
    });
    renderWithProviders(<Orders />);
    await screen.findByText("Asha Rao");
    await userEvent.click(screen.getByRole("button", { name: /New order/ }));
    await userEvent.type(screen.getByLabelText("Quantity"), "10");
    await userEvent.click(screen.getByRole("button", { name: "Create order" }));

    expect(await screen.findByText("Source and destination must be different.")).toBeInTheDocument();
    expect(m.post).not.toHaveBeenCalled();
  });

  it("shows a product fallback dash and omits the unit when product has no unit", async () => {
    m.get.mockImplementation((url: string) => {
      if (url === "/orders/counts") return Promise.resolve({ data: {} });
      if (url === "/orders")
        return Promise.resolve({
          data: {
            items: [
              // No productId at all → "—" fallback; another with name but no unit.
              { ...orders[1], _id: "o3", productId: null, quantity: 50 },
              { ...orders[1], _id: "o4", productId: { name: "Petrol" }, quantity: 75 },
            ],
            nextCursor: null,
          },
        });
      return Promise.resolve({ data: { items: [], nextCursor: null } });
    });
    renderWithProviders(<Orders />);
    expect(await screen.findByText("—")).toBeInTheDocument(); // missing product name
    expect(screen.getByText("50")).toBeInTheDocument(); // quantity with no unit suffix
    expect(screen.getByText("75")).toBeInTheDocument();
  });

  it("loads the next page on scroll", async () => {
    m.get.mockImplementation((url: string, opts?: { params?: { cursor?: string } }) => {
      if (url === "/orders/counts") return Promise.resolve({ data: {} });
      if (url === "/orders")
        return opts?.params?.cursor
          ? Promise.resolve({ data: { items: [{ ...orders[1], _id: "o3", productId: { name: "CNG" } }], nextCursor: null } })
          : Promise.resolve({ data: { items: [orders[0]], nextCursor: "c1" } });
      return Promise.resolve({ data: { items: [], nextCursor: null } });
    });
    renderWithProviders(<Orders />);
    await screen.findByText("Diesel");
    MockIntersectionObserver.last().trigger(true);
    expect(await screen.findByText("CNG")).toBeInTheDocument();
  });
});
