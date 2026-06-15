import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { renderWithProviders } from "@/test/utils";

vi.mock("@/utils/http", () => ({ http: { get: vi.fn() } }));
import { http } from "@/utils/http";
import Home from "./Home";

const m = http as unknown as { get: Mock };

beforeEach(() => vi.clearAllMocks());

describe("Home", () => {
  it("lists drivers and links to admin", async () => {
    m.get.mockResolvedValue({
      data: { items: [{ _id: "d1", name: "Asha Rao" }] },
    });
    renderWithProviders(<Home />);
    expect(
      await screen.findByRole("button", { name: /Asha Rao/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /admin dashboard/i }),
    ).toBeInTheDocument();
  });
  it("renders a driver's phone when present", async () => {
    m.get.mockResolvedValue({
      data: {
        items: [
          { _id: "d1", name: "Asha Rao", phone: "+91 90000 11111" },
          { _id: "d2", name: "Bala Iyer" },
        ],
      },
    });
    renderWithProviders(<Home />);
    // Driver with a phone → number is shown.
    expect(await screen.findByText("+91 90000 11111")).toBeInTheDocument();
    // Driver without a phone → still listed, just no number row.
    expect(
      screen.getByRole("button", { name: /Bala Iyer/ }),
    ).toBeInTheDocument();
  });
  it("shows loading skeletons", () => {
    m.get.mockReturnValue(new Promise(() => {}));
    renderWithProviders(<Home />);
    expect(
      screen.getByRole("status", { name: /loading drivers/i }),
    ).toBeInTheDocument();
  });
  it("shows an error message", async () => {
    m.get.mockRejectedValue(new Error("boom"));
    renderWithProviders(<Home />);
    expect(await screen.findByText(/reach the API/i)).toBeInTheDocument();
  });
  it("shows an empty hint when there are no drivers", async () => {
    m.get.mockResolvedValue({ data: { items: [] } });
    renderWithProviders(<Home />);
    expect(await screen.findByText(/seed the backend/i)).toBeInTheDocument();
  });
});
