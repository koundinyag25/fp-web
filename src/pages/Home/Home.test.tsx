import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { renderWithProviders } from "@/test/utils";

vi.mock("@/utils/http", () => ({ http: { get: vi.fn() } }));
import { http } from "@/utils/http";
import Home from "./Home";

const m = http as unknown as { get: Mock };

// Render Home alongside marker routes so we can assert the persona navigation.
const renderHome = () =>
  renderWithProviders(
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/admin" element={<div>admin console</div>} />
      <Route path="/driver/:driverId" element={<div>driver view</div>} />
    </Routes>,
    { route: "/" },
  );

beforeEach(() => vi.clearAllMocks());

describe("Home", () => {
  it("enters the admin console", async () => {
    m.get.mockResolvedValue({ data: { items: [], nextCursor: null } });
    renderHome();
    await userEvent.click(screen.getByRole("button", { name: /Enter admin/ }));
    expect(await screen.findByText("admin console")).toBeInTheDocument();
  });

  it("picks a driver from the dropdown and opens their app", async () => {
    m.get.mockResolvedValue({
      data: { items: [{ _id: "d1", name: "Asha Rao", phone: "+1 555" }], nextCursor: null },
    });
    renderHome();
    await userEvent.click(screen.getByRole("button", { name: "Select a driver…" }));
    await userEvent.click(await screen.findByRole("button", { name: /Asha Rao/ }));
    expect(await screen.findByText("driver view")).toBeInTheDocument();
  });

  it("shows an empty hint in the dropdown when there are no drivers", async () => {
    m.get.mockResolvedValue({ data: { items: [], nextCursor: null } });
    renderHome();
    await userEvent.click(screen.getByRole("button", { name: "Select a driver…" }));
    expect(await screen.findByText(/seed the backend/i)).toBeInTheDocument();
  });
});
