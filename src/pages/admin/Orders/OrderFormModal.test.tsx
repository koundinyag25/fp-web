import { fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { renderWithProviders } from "@/test/utils";

// The form's driver picker pulls the roster via http; an empty page is enough.
vi.mock("@/utils/http", () => ({
  http: { get: vi.fn(), post: vi.fn(), patch: vi.fn() },
}));
import { http } from "@/utils/http";
import { OrderFormModal } from "./OrderFormModal";

const m = http as unknown as { get: Mock };

const noop = () => {};

beforeEach(() => {
  vi.clearAllMocks();
  m.get.mockResolvedValue({ data: { items: [], nextCursor: null } });
});

describe("OrderFormModal — option fallbacks and optional fields", () => {
  // Empty hubs/terminals/products → the `?? ""` tails of the state initializers
  // fire (no editing order, no first option to fall back to).
  it("defaults selects to empty strings when no options are available", async () => {
    const onSave = vi.fn();
    renderWithProviders(
      <OrderFormModal
        open
        editing={null}
        hubs={[]}
        terminals={[]}
        products={[]}
        onClose={noop}
        onSave={onSave}
      />,
    );
    expect(
      screen.getByRole("heading", { name: "New order" }),
    ).toBeInTheDocument();
    // No product selected → no unit suffix is rendered.
    expect(screen.queryByText("litre")).not.toBeInTheDocument();

    await userEvent.type(screen.getByLabelText("Quantity"), "5");
    await userEvent.click(screen.getByRole("button", { name: "Create order" }));
    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          sourceHubId: "",
          destinationId: "",
          productId: "",
          quantity: 5,
        }),
      ),
    );
  });

  // Clearing the start-time input drops it from the payload (the `startTime ? …`
  // spread takes its empty-object branch).
  it("omits startTime from the payload when the time field is cleared", async () => {
    const onSave = vi.fn();
    renderWithProviders(
      <OrderFormModal
        open
        editing={null}
        hubs={[{ _id: "h1", name: "Central Hub", type: "hub", lat: 0, lng: 0 }]}
        terminals={[
          {
            _id: "t1",
            name: "North Terminal",
            type: "terminal",
            lat: 0,
            lng: 0,
          },
        ]}
        products={[
          {
            _id: "pr1",
            name: "Diesel",
            unit: "litre",
            costPrice: 0,
            sellingPrice: 0,
          },
        ]}
        onClose={noop}
        onSave={onSave}
      />,
    );
    await userEvent.type(screen.getByLabelText("Quantity"), "12");
    fireEvent.change(screen.getByLabelText("Start time"), {
      target: { value: "" },
    });
    await userEvent.click(screen.getByRole("button", { name: "Create order" }));

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    const payload = onSave.mock.calls[0][0];
    expect(payload).not.toHaveProperty("startTime");
    expect(payload).toMatchObject({ productId: "pr1", quantity: 12 });
  });

  // An editing order with no startTime / no driver exercises those `??` and
  // ternary fallbacks on the edit path.
  it("seeds edit mode and falls back to the default time when the order has none", () => {
    renderWithProviders(
      <OrderFormModal
        open
        editing={
          {
            _id: "o9",
            productId: { _id: "pr1", name: "Diesel", unit: "litre" },
            quantity: 99,
            sourceHubId: { _id: "h1", name: "Central Hub" },
            destinationId: { _id: "t1", name: "North Terminal" },
            deliveryDate: "2026-07-01",
            startTime: undefined,
            assignedDriverId: null,
            status: "pending",
          } as never
        }
        hubs={[{ _id: "h1", name: "Central Hub", type: "hub", lat: 0, lng: 0 }]}
        terminals={[
          {
            _id: "t1",
            name: "North Terminal",
            type: "terminal",
            lat: 0,
            lng: 0,
          },
        ]}
        products={[
          {
            _id: "pr1",
            name: "Diesel",
            unit: "litre",
            costPrice: 0,
            sellingPrice: 0,
          },
        ]}
        onClose={noop}
        onSave={noop}
      />,
    );
    expect(
      screen.getByRole("heading", { name: "Edit order" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Save changes" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Quantity")).toHaveValue(99);
    // startTime absent on the order → default "09:00".
    expect(screen.getByLabelText("Start time")).toHaveValue("09:00");
  });
});
