import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { MockIntersectionObserver } from "@/test/mocks";
import { renderWithProviders } from "@/test/utils";

vi.mock("@/utils/http", () => ({ http: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() } }));
import { http } from "@/utils/http";
import Vehicles from "./Vehicles";

const m = http as unknown as { get: Mock; post: Mock; put: Mock; delete: Mock };
const veh = { _id: "v1", reg: "KA01AB1234", type: "tanker", capacity: 1000 };

beforeEach(() => {
  vi.clearAllMocks();
  m.get.mockResolvedValue({ data: { items: [veh], nextCursor: null } });
  m.post.mockResolvedValue({ data: {} });
  m.put.mockResolvedValue({ data: {} });
  m.delete.mockResolvedValue({ data: {} });
});

describe("Vehicles page", () => {
  it("renders and creates a vehicle", async () => {
    renderWithProviders(<Vehicles />);
    expect(await screen.findByText("KA01AB1234")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /New vehicle/ }));
    await userEvent.type(screen.getByLabelText("Reg"), "KA09XY9999");
    await userEvent.selectOptions(screen.getByLabelText("Type"), "van");
    await userEvent.type(screen.getByLabelText(/Capacity/), "400");
    await userEvent.click(screen.getByRole("button", { name: "Save vehicle" }));
    await waitFor(() => expect(m.post).toHaveBeenCalledWith("/vehicles", { reg: "KA09XY9999", type: "van", capacity: 400 }));
  });

  it("colors each vehicle type", async () => {
    m.get.mockResolvedValue({
      data: {
        items: [
          { _id: "v1", reg: "KA01", type: "tanker", capacity: 1000 },
          { _id: "v2", reg: "KA02", type: "van", capacity: 400 },
          { _id: "v3", reg: "KA03", type: "truck", capacity: 2000 },
          { _id: "v4", reg: "KA04", type: "bike", capacity: 5 },
        ],
        nextCursor: null,
      },
    });
    renderWithProviders(<Vehicles />);
    expect(await screen.findByText("tanker")).toHaveClass("text-info");
    expect(screen.getByText("van")).toHaveClass("text-warning");
    expect(screen.getByText("truck")).toHaveClass("text-success");
    expect(screen.getByText("bike")).toHaveClass("text-on-surface-variant");
  });

  it("edits a vehicle", async () => {
    renderWithProviders(<Vehicles />);
    await userEvent.click((await screen.findAllByRole("button", { name: "Edit" }))[0]);
    const cap = screen.getByLabelText(/Capacity/);
    await userEvent.clear(cap);
    await userEvent.type(cap, "1200");
    await userEvent.click(screen.getByRole("button", { name: "Save vehicle" }));
    await waitFor(() => expect(m.put).toHaveBeenCalledWith("/vehicles/v1", expect.objectContaining({ capacity: 1200 })));
  });

  it("deletes a vehicle", async () => {
    renderWithProviders(<Vehicles />);
    await userEvent.click((await screen.findAllByRole("button", { name: "Delete" }))[0]);
    const dels = screen.getAllByRole("button", { name: "Delete" });
    await userEvent.click(dels[dels.length - 1]);
    await waitFor(() => expect(m.delete).toHaveBeenCalledWith("/vehicles/v1"));
  });

  it("loads the next page on scroll", async () => {
    m.get.mockImplementation((_u: string, o?: { params?: { cursor?: string } }) =>
      o?.params?.cursor
        ? Promise.resolve({ data: { items: [{ _id: "v2", reg: "KA05CJ8821", type: "van", capacity: 400 }], nextCursor: null } })
        : Promise.resolve({ data: { items: [veh], nextCursor: "c1" } })
    );
    renderWithProviders(<Vehicles />);
    await screen.findByText("KA01AB1234");
    MockIntersectionObserver.last().trigger(true);
    expect(await screen.findByText("KA05CJ8821")).toBeInTheDocument();
  });
});
