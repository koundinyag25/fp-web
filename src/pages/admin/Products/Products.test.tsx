import { fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { MockIntersectionObserver } from "@/test/mocks";
import { renderWithProviders } from "@/test/utils";

vi.mock("@/utils/http", () => ({ http: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() } }));
import { http } from "@/utils/http";
import Products from "./Products";

const m = http as unknown as { get: Mock; post: Mock; put: Mock; delete: Mock };
const prod = { _id: "p1", name: "Diesel", unit: "litre", costPrice: 3.1, sellingPrice: 3.89 };

beforeEach(() => {
  vi.clearAllMocks();
  m.get.mockResolvedValue({ data: { items: [prod], nextCursor: null } });
  m.post.mockResolvedValue({ data: {} });
  m.put.mockResolvedValue({ data: {} });
  m.delete.mockResolvedValue({ data: {} });
});

describe("Products page", () => {
  it("renders and creates a product", async () => {
    renderWithProviders(<Products />);
    expect(await screen.findByText("Diesel")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /New product/ }));
    await userEvent.type(screen.getByLabelText("Name"), "CNG");
    await userEvent.selectOptions(screen.getByLabelText("Unit"), "kg");
    await userEvent.type(screen.getByLabelText("Cost price"), "2.50");
    await userEvent.type(screen.getByLabelText("Selling price"), "3.25");
    await userEvent.click(screen.getByRole("button", { name: "Save product" }));
    await waitFor(() =>
      expect(m.post).toHaveBeenCalledWith("/products", {
        name: "CNG",
        unit: "kg",
        costPrice: 2.5,
        sellingPrice: 3.25,
      })
    );
  });

  it("requires a name", async () => {
    renderWithProviders(<Products />);
    await screen.findByText("Diesel");
    await userEvent.click(screen.getByRole("button", { name: /New product/ }));
    await userEvent.click(screen.getByRole("button", { name: "Save product" }));
    expect(screen.getByText("Name is required.")).toBeInTheDocument();
    expect(m.post).not.toHaveBeenCalled();
  });

  it("tones the margin by sign and zeroes the percent when cost is missing", async () => {
    m.get.mockResolvedValue({
      data: {
        items: [
          { _id: "p1", name: "Profit", unit: "litre", costPrice: 2, sellingPrice: 3 }, // +1 → success
          { _id: "p2", name: "Loss", unit: "litre", costPrice: 3, sellingPrice: 2 }, // -1 → critical
          { _id: "p3", name: "FlatPaid", unit: "litre", costPrice: 2, sellingPrice: 2 }, // 0 → neutral
          { _id: "p4", name: "Freebie", unit: "litre", costPrice: 0, sellingPrice: 0 }, // cost 0 → pct 0
        ],
        nextCursor: null,
      },
    });
    renderWithProviders(<Products />);
    await screen.findByText("Profit");
    // The "(pct%)" text sits in an inner span; the tone class is on its parent.
    // +$1.00 margin renders in green (50%), -$1.00 in red, $0.00 flat in neutral.
    expect(screen.getByText("(50%)").parentElement).toHaveClass("text-success");
    expect(screen.getByText("(-33%)").parentElement).toHaveClass("text-critical");
    const zeroPctSpans = screen.getAllByText("(0%)");
    // Both the flat-margin row and the cost-zero row show "(0%)" with neutral tone.
    expect(zeroPctSpans.length).toBe(2);
    zeroPctSpans.forEach((s) => expect(s.parentElement).toHaveClass("text-on-surface-variant"));
  });

  it("passes the debounced search term as the q param", async () => {
    renderWithProviders(<Products />);
    await screen.findByText("Diesel");
    await userEvent.type(screen.getByPlaceholderText(/Search/), "diesel");
    await waitFor(() =>
      expect(m.get).toHaveBeenCalledWith("/products", expect.objectContaining({ params: expect.objectContaining({ q: "diesel" }) }))
    );
  });

  it("passes applied filters as the filters param", async () => {
    renderWithProviders(<Products />);
    await screen.findByText("Diesel");
    await userEvent.click(screen.getByText("Filters"));
    await userEvent.click(screen.getByRole("button", { name: /Add filter/ }));
    await userEvent.selectOptions(screen.getByDisplayValue("Unit"), "createdAt");
    const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement;
    fireEvent.change(dateInput, { target: { value: "2026-01-01" } });
    await userEvent.click(screen.getByRole("button", { name: "Apply" }));
    await waitFor(() =>
      expect(m.get).toHaveBeenCalledWith(
        "/products",
        expect.objectContaining({ params: expect.objectContaining({ filters: expect.stringContaining("createdAt") }) })
      )
    );
  });

  it("edits a product", async () => {
    renderWithProviders(<Products />);
    await userEvent.click((await screen.findAllByRole("button", { name: "Edit" }))[0]);
    expect(screen.getByRole("heading", { name: "Edit product" })).toBeInTheDocument();
    const name = screen.getByLabelText("Name");
    await userEvent.clear(name);
    await userEvent.type(name, "Bio-Diesel");
    await userEvent.click(screen.getByRole("button", { name: "Save product" }));
    await waitFor(() =>
      expect(m.put).toHaveBeenCalledWith("/products/p1", {
        name: "Bio-Diesel",
        unit: "litre",
        costPrice: 3.1,
        sellingPrice: 3.89,
      })
    );
  });

  it("deletes a product after confirmation", async () => {
    renderWithProviders(<Products />);
    await userEvent.click((await screen.findAllByRole("button", { name: "Delete" }))[0]);
    const dels = screen.getAllByRole("button", { name: "Delete" });
    await userEvent.click(dels[dels.length - 1]);
    await waitFor(() => expect(m.delete).toHaveBeenCalledWith("/products/p1"));
  });

  it("loads the next page on scroll", async () => {
    m.get.mockImplementation((_u: string, o?: { params?: { cursor?: string } }) =>
      o?.params?.cursor
        ? Promise.resolve({ data: { items: [{ _id: "p2", name: "Petrol", unit: "litre" }], nextCursor: null } })
        : Promise.resolve({ data: { items: [prod], nextCursor: "c1" } })
    );
    renderWithProviders(<Products />);
    await screen.findByText("Diesel");
    MockIntersectionObserver.last().trigger(true);
    expect(await screen.findByText("Petrol")).toBeInTheDocument();
  });
});
