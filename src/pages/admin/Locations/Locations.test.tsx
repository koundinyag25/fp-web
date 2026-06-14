import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { renderWithProviders } from "@/test/utils";

vi.mock("@/utils/http", () => ({
  http: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));
import { http } from "@/utils/http";
import Locations from "./Locations";

const m = http as unknown as { get: Mock; post: Mock; put: Mock; delete: Mock };

const loc1 = { _id: "l1", type: "hub", name: "Central Hub", lat: 12.97, lng: 77.59, inventory: { p: 1 } };
const loc2 = { _id: "l2", type: "terminal", name: "North Terminal", lat: 13.08, lng: 77.58 };
const products = [
  { _id: "p", name: "Diesel", unit: "litre" },
  { _id: "p2", name: "Petrol", unit: "litre" },
];

beforeEach(() => {
  vi.clearAllMocks();
  m.get.mockImplementation((url: string) => {
    if (url === "/products") return Promise.resolve({ data: { items: products, nextCursor: null } });
    return Promise.resolve({ data: { items: [loc1, loc2], nextCursor: null } });
  });
  m.post.mockResolvedValue({ data: loc1 });
  m.put.mockResolvedValue({ data: loc1 });
  m.delete.mockResolvedValue({ data: {} });
});

describe("Locations page", () => {
  it("renders rows from the API", async () => {
    renderWithProviders(<Locations />);
    expect(await screen.findByText("Central Hub")).toBeInTheDocument();
    expect(screen.getByText("North Terminal")).toBeInTheDocument();
    expect(m.get).toHaveBeenCalledWith("/locations", { params: { limit: "20" } });
  });

  it("creates a location through the modal", async () => {
    renderWithProviders(<Locations />);
    await screen.findByText("Central Hub");
    await userEvent.click(screen.getByRole("button", { name: /New location/ }));
    expect(screen.getByRole("heading", { name: "New location" })).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText("Name"), "South Depot");
    await userEvent.type(screen.getByLabelText("Latitude"), "12.5");
    await userEvent.type(screen.getByLabelText("Longitude"), "77.1");
    await userEvent.click(screen.getByRole("button", { name: "Save location" }));

    await waitFor(() =>
      expect(m.post).toHaveBeenCalledWith("/locations", {
        type: "hub",
        name: "South Depot",
        lat: 12.5,
        lng: 77.1,
        inventory: {},
      })
    );
  });

  it("shows an error toast when the server rejects a create", async () => {
    m.post.mockRejectedValueOnce({ response: { data: { error: "Name already taken" } } });
    renderWithProviders(<Locations />);
    await screen.findByText("Central Hub");
    await userEvent.click(screen.getByRole("button", { name: /New location/ }));
    await userEvent.type(screen.getByLabelText("Name"), "Dup Hub");
    await userEvent.type(screen.getByLabelText("Latitude"), "12.5");
    await userEvent.type(screen.getByLabelText("Longitude"), "77.1");
    await userEvent.click(screen.getByRole("button", { name: "Save location" }));
    expect(await screen.findByText("Name already taken")).toBeInTheDocument(); // error toast
  });

  it("stocks a hub with product quantities on create", async () => {
    renderWithProviders(<Locations />);
    await screen.findByText("Central Hub");
    await userEvent.click(screen.getByRole("button", { name: /New location/ }));
    await userEvent.type(screen.getByLabelText("Name"), "Stocked Hub");
    await userEvent.type(screen.getByLabelText("Latitude"), "12.5");
    await userEvent.type(screen.getByLabelText("Longitude"), "77.1");

    await userEvent.click(screen.getByRole("button", { name: /add product/i }));
    await userEvent.selectOptions(screen.getByLabelText("Product 1"), "p");
    await userEvent.type(screen.getByLabelText("Quantity 1"), "500");
    await userEvent.click(screen.getByRole("button", { name: "Save location" }));

    await waitFor(() =>
      expect(m.post).toHaveBeenCalledWith(
        "/locations",
        expect.objectContaining({ type: "hub", name: "Stocked Hub", inventory: { p: 500 } })
      )
    );
  });

  it("hides the opening-stock editor for terminals", async () => {
    renderWithProviders(<Locations />);
    await screen.findByText("Central Hub");
    await userEvent.click(screen.getByRole("button", { name: /New location/ }));
    expect(screen.getByText("Opening stock")).toBeInTheDocument();
    await userEvent.selectOptions(screen.getByLabelText("Type"), "terminal");
    expect(screen.queryByText("Opening stock")).not.toBeInTheDocument();
  });

  it("blocks invalid coordinates with inline errors", async () => {
    renderWithProviders(<Locations />);
    await screen.findByText("Central Hub");
    await userEvent.click(screen.getByRole("button", { name: /New location/ }));
    await userEvent.type(screen.getByLabelText("Name"), "Bad");
    // leave lat/lng empty
    await userEvent.click(screen.getByRole("button", { name: "Save location" }));
    expect(screen.getByText("Latitude must be between -90 and 90.")).toBeInTheDocument();
    expect(m.post).not.toHaveBeenCalled();
  });

  it("edits a location", async () => {
    renderWithProviders(<Locations />);
    await userEvent.click((await screen.findAllByRole("button", { name: "Edit" }))[0]);
    expect(screen.getByRole("heading", { name: "Edit location" })).toBeInTheDocument();
    const name = screen.getByLabelText("Name");
    await userEvent.clear(name);
    await userEvent.type(name, "Main Hub");
    await userEvent.click(screen.getByRole("button", { name: "Save location" }));
    await waitFor(() =>
      expect(m.put).toHaveBeenCalledWith("/locations/l1", expect.objectContaining({ name: "Main Hub" }))
    );
  });

  it("deletes a location after confirmation", async () => {
    renderWithProviders(<Locations />);
    await screen.findByText("Central Hub");
    await userEvent.click(screen.getAllByRole("button", { name: "Delete" })[0]);
    expect(screen.getByText("Delete location?")).toBeInTheDocument();
    const deletes = screen.getAllByRole("button", { name: "Delete" });
    await userEvent.click(deletes[deletes.length - 1]); // dialog confirm
    await waitFor(() => expect(m.delete).toHaveBeenCalledWith("/locations/l1"));
  });

  it("loads the next page on scroll", async () => {
    m.get.mockImplementation((_url: string, opts?: { params?: { cursor?: string } }) =>
      opts?.params?.cursor === "c1"
        ? Promise.resolve({ data: { items: [loc2], nextCursor: null } })
        : Promise.resolve({ data: { items: [loc1], nextCursor: "c1" } })
    );
    const { MockIntersectionObserver } = await import("@/test/mocks");
    renderWithProviders(<Locations />);
    await screen.findByText("Central Hub");
    expect(screen.queryByText("North Terminal")).not.toBeInTheDocument();
    MockIntersectionObserver.last().trigger(true);
    expect(await screen.findByText("North Terminal")).toBeInTheDocument();
  });
});
