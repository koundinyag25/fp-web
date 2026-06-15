import { screen, waitFor } from "@testing-library/react";
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
