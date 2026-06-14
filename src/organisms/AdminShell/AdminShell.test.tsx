import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { renderWithProviders } from "@/test/utils";
import { AdminShell } from "./AdminShell";

const renderShell = () =>
  renderWithProviders(
    <Routes>
      <Route path="/admin" element={<AdminShell />}>
        <Route index element={<div>dashboard content</div>} />
        <Route path="*" element={<div>other content</div>} />
      </Route>
    </Routes>,
    { route: "/admin" }
  );

describe("AdminShell", () => {
  it("renders nav, breadcrumb and the outlet", () => {
    renderShell();
    expect(screen.getAllByText("FleetPanda").length).toBeGreaterThan(0);
    expect(screen.getByText("dashboard content")).toBeInTheDocument();
    expect(screen.getByText("admin / dashboard")).toBeInTheDocument();
  });

  it("opens the mobile drawer and closes it on nav", async () => {
    renderShell();
    expect(screen.getAllByText("FleetPanda")).toHaveLength(1);
    await userEvent.click(screen.getByRole("button", { name: "Open menu" }));
    expect(screen.getAllByText("FleetPanda")).toHaveLength(2);
    const links = screen.getAllByRole("link", { name: /Locations/ });
    await userEvent.click(links[links.length - 1]);
    expect(screen.getAllByText("FleetPanda")).toHaveLength(1);
  });

  it("closes the drawer when the overlay is clicked", async () => {
    const { container } = renderShell();
    await userEvent.click(screen.getByRole("button", { name: "Open menu" }));
    expect(screen.getAllByText("FleetPanda")).toHaveLength(2);
    await userEvent.click(container.querySelector('[aria-hidden="true"]')!);
    expect(screen.getAllByText("FleetPanda")).toHaveLength(1);
  });
});
