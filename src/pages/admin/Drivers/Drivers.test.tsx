import { fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { MockIntersectionObserver } from "@/test/mocks";
import { renderWithProviders } from "@/test/utils";

vi.mock("@/utils/http", () => ({ http: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() } }));
import { http } from "@/utils/http";
import Drivers from "./Drivers";

const m = http as unknown as { get: Mock; post: Mock; put: Mock; delete: Mock };
const drv = { _id: "d1", name: "Asha Rao", phone: "+91 90000 11111", license: "KA01" };

beforeEach(() => {
  vi.clearAllMocks();
  m.get.mockResolvedValue({ data: { items: [drv], nextCursor: null } });
  m.post.mockResolvedValue({ data: {} });
  m.put.mockResolvedValue({ data: {} });
  m.delete.mockResolvedValue({ data: {} });
});

describe("Drivers page", () => {
  it("validates phone then creates a driver", async () => {
    renderWithProviders(<Drivers />);
    expect(await screen.findByText("Asha Rao")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /New driver/ }));
    await userEvent.type(screen.getByLabelText("Name"), "Vik");
    await userEvent.type(screen.getByLabelText("Phone"), "123");
    await userEvent.type(screen.getByLabelText("License"), "KA05");
    await userEvent.click(screen.getByRole("button", { name: "Save driver" }));
    expect(screen.getByText("Enter a valid phone number.")).toBeInTheDocument();
    expect(m.post).not.toHaveBeenCalled();

    await userEvent.clear(screen.getByLabelText("Phone"));
    await userEvent.type(screen.getByLabelText("Phone"), "+91 90000 22222");
    await userEvent.click(screen.getByRole("button", { name: "Save driver" }));
    await waitFor(() => expect(m.post).toHaveBeenCalledWith("/drivers", expect.objectContaining({ name: "Vik" })));
  });

  it("requires a name and a license before submitting", async () => {
    renderWithProviders(<Drivers />);
    await screen.findByText("Asha Rao");
    await userEvent.click(screen.getByRole("button", { name: /New driver/ }));
    // Submit a blank form: name, phone, and license all invalid.
    await userEvent.click(screen.getByRole("button", { name: "Save driver" }));
    expect(screen.getByText("Name is required.")).toBeInTheDocument();
    expect(screen.getByText("License is required.")).toBeInTheDocument();
    expect(m.post).not.toHaveBeenCalled();
  });

  it("passes the debounced search term as the q param", async () => {
    renderWithProviders(<Drivers />);
    await screen.findByText("Asha Rao");
    await userEvent.type(screen.getByPlaceholderText(/Search by name/), "asha");
    await waitFor(() =>
      expect(m.get).toHaveBeenCalledWith("/drivers", expect.objectContaining({ params: expect.objectContaining({ q: "asha" }) }))
    );
  });

  it("passes applied filters as the filters param", async () => {
    renderWithProviders(<Drivers />);
    await screen.findByText("Asha Rao");
    await userEvent.click(screen.getByText("Filters"));
    await userEvent.click(screen.getByRole("button", { name: /Add filter/ }));
    // Drivers expose only the always-on Created at / Updated at date filters.
    const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement;
    fireEvent.change(dateInput, { target: { value: "2026-01-01" } });
    await userEvent.click(screen.getByRole("button", { name: "Apply" }));
    await waitFor(() =>
      expect(m.get).toHaveBeenCalledWith(
        "/drivers",
        expect.objectContaining({ params: expect.objectContaining({ filters: expect.stringContaining("createdAt") }) })
      )
    );
  });

  it("edits a driver", async () => {
    renderWithProviders(<Drivers />);
    await userEvent.click((await screen.findAllByRole("button", { name: "Edit" }))[0]);
    const name = screen.getByLabelText("Name");
    await userEvent.clear(name);
    await userEvent.type(name, "Asha R");
    await userEvent.click(screen.getByRole("button", { name: "Save driver" }));
    await waitFor(() => expect(m.put).toHaveBeenCalledWith("/drivers/d1", expect.objectContaining({ name: "Asha R" })));
  });

  it("deletes a driver", async () => {
    renderWithProviders(<Drivers />);
    await userEvent.click((await screen.findAllByRole("button", { name: "Delete" }))[0]);
    const dels = screen.getAllByRole("button", { name: "Delete" });
    await userEvent.click(dels[dels.length - 1]);
    await waitFor(() => expect(m.delete).toHaveBeenCalledWith("/drivers/d1"));
  });

  it("loads the next page on scroll", async () => {
    m.get.mockImplementation((_u: string, o?: { params?: { cursor?: string } }) =>
      o?.params?.cursor
        ? Promise.resolve({ data: { items: [{ _id: "d2", name: "Vikram Nair", phone: "x", license: "y" }], nextCursor: null } })
        : Promise.resolve({ data: { items: [drv], nextCursor: "c1" } })
    );
    renderWithProviders(<Drivers />);
    await screen.findByText("Asha Rao");
    MockIntersectionObserver.last().trigger(true);
    expect(await screen.findByText("Vikram Nair")).toBeInTheDocument();
  });
});
