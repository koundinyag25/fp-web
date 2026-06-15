import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import dayjs from "dayjs";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { MockIntersectionObserver } from "@/test/mocks";
import { renderWithProviders } from "@/test/utils";
import { mondayOf, weekDays } from "@/utils/date";

vi.mock("@/utils/http", () => ({
  http: { get: vi.fn(), post: vi.fn(), delete: vi.fn() },
}));
import { http } from "@/utils/http";
import Allocations from "./Allocations";

const m = http as unknown as { get: Mock; post: Mock; delete: Mock };

// Derive the rendered week the same way the page does, so cell dates are
// deterministic on any run date.
const days = weekDays(mondayOf(dayjs()));
const vehicles = [
  { _id: "v1", reg: "KA01AB1234", type: "tanker", capacity: 1000 },
  { _id: "v2", reg: "KA02CD5678", type: "rigid", capacity: 500 },
];
const allocations = [
  { _id: "a1", vehicleId: { _id: "v1", reg: "KA01AB1234", type: "tanker" }, driverId: { _id: "d1", name: "Asha Rao" }, date: days[0].date },
];

beforeEach(() => {
  vi.clearAllMocks();
  m.get.mockImplementation((url: string) => {
    if (url === "/vehicles") return Promise.resolve({ data: { items: vehicles, nextCursor: null } });
    if (url === "/allocations") return Promise.resolve({ data: allocations });
    if (url === "/allocations/summary") return Promise.resolve({ data: { fleet: 1000, allocated: 42 } });
    if (url === "/allocations/available-drivers")
      return Promise.resolve({ data: { items: [{ _id: "d1", name: "Asha Rao" }], nextCursor: null } });
    return Promise.resolve({ data: {} });
  });
  m.post.mockResolvedValue({ data: {} });
  m.delete.mockResolvedValue({ data: {} });
});

const allocateCell = async (label: string) => {
  await userEvent.click(await screen.findByLabelText(label));
  // Driver picker is a searchable combobox of drivers free that day.
  await userEvent.click(screen.getByRole("button", { name: "Select driver…" })); // open dropdown
  await userEvent.click(await screen.findByRole("button", { name: "Asha Rao" }));
  await userEvent.click(screen.getByRole("button", { name: "Allocate" }));
};

describe("Allocations page (week calendar)", () => {
  it("renders the vehicle×day grid, driver chip, and fleet summary", async () => {
    renderWithProviders(<Allocations />);
    expect(await screen.findByText("KA01AB1234")).toBeInTheDocument(); // row gutter
    expect(screen.getByText("KA02CD5678")).toBeInTheDocument();
    expect(screen.getByText("Asha Rao")).toBeInTheDocument(); // allocated chip
    expect(screen.getByText("1000")).toBeInTheDocument(); // fleet
    expect(screen.getByText("42")).toBeInTheDocument(); // allocated this week
  });

  it("allocates from an empty cell (vehicle + date come from the cell)", async () => {
    renderWithProviders(<Allocations />);
    await screen.findByText("KA02CD5678");
    await allocateCell(`Allocate KA02CD5678 on ${days[1].date}`);
    await waitFor(() =>
      expect(m.post).toHaveBeenCalledWith("/allocations", { vehicleId: "v2", driverId: "d1", date: days[1].date })
    );
  });

  it("shows the 409 conflict banner and keeps the modal open", async () => {
    m.post.mockRejectedValueOnce({ response: { status: 409 } });
    renderWithProviders(<Allocations />);
    await screen.findByText("KA02CD5678");
    await allocateCell(`Allocate KA02CD5678 on ${days[1].date}`);
    expect(await screen.findByText(/already allocated/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Allocate vehicle" })).toBeInTheDocument();
  });

  it("shows a generic error banner for non-409 failures", async () => {
    // A server error (not a 409 conflict) takes the fallback message branch.
    m.post.mockRejectedValueOnce({ response: { status: 500 } });
    renderWithProviders(<Allocations />);
    await screen.findByText("KA02CD5678");
    await allocateCell(`Allocate KA02CD5678 on ${days[1].date}`);
    expect(await screen.findByText("Could not allocate. Please try again.")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Allocate vehicle" })).toBeInTheDocument();
  });

  it("removes an allocation from its chip", async () => {
    renderWithProviders(<Allocations />);
    await screen.findByText("Asha Rao");
    await userEvent.click(screen.getByLabelText(`Remove KA01AB1234 on ${days[0].date}`));
    await waitFor(() => expect(m.delete).toHaveBeenCalledWith("/allocations/a1"));
  });

  it("refetches allocations when navigating to the next week", async () => {
    renderWithProviders(<Allocations />);
    await screen.findByText("KA01AB1234");
    const nextWeek = weekDays(mondayOf(dayjs().add(7, "day")));
    await userEvent.click(screen.getByLabelText("Next week"));
    await waitFor(() =>
      expect(m.get).toHaveBeenCalledWith(
        "/allocations",
        expect.objectContaining({ params: expect.objectContaining({ from: nextWeek[0].date }) })
      )
    );
  });

  it("debounce-searches the vehicle rows", async () => {
    renderWithProviders(<Allocations />);
    await screen.findByText("KA01AB1234");
    await userEvent.type(screen.getByPlaceholderText("Search registration or type…"), "tanker");
    await waitFor(() =>
      expect(m.get).toHaveBeenCalledWith("/vehicles", expect.objectContaining({ params: expect.objectContaining({ q: "tanker" }) }))
    );
  });

  it("loads more vehicle rows on scroll", async () => {
    m.get.mockImplementation((url: string, opts?: { params?: { cursor?: string } }) => {
      if (url === "/vehicles")
        return opts?.params?.cursor
          ? Promise.resolve({ data: { items: [{ _id: "v9", reg: "KA09ZZ9999", type: "van", capacity: 200 }], nextCursor: null } })
          : Promise.resolve({ data: { items: [vehicles[0]], nextCursor: "c1" } });
      if (url === "/allocations") return Promise.resolve({ data: [] });
      if (url === "/allocations/summary") return Promise.resolve({ data: { fleet: 1000, allocated: 0 } });
      if (url === "/drivers") return Promise.resolve({ data: { items: [], nextCursor: null } });
      return Promise.resolve({ data: {} });
    });
    renderWithProviders(<Allocations />);
    await screen.findByText("KA01AB1234");
    MockIntersectionObserver.last().trigger(true);
    expect(await screen.findByText("KA09ZZ9999")).toBeInTheDocument();
  });
});
