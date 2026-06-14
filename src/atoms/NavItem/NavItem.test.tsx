import { render, screen } from "@testing-library/react";
import { Bell } from "lucide-react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { NavItem } from "./NavItem";

describe("NavItem", () => {
  it("marks the active route", () => {
    render(
      <MemoryRouter initialEntries={["/admin/locations"]}>
        <NavItem to="/admin/locations" icon={Bell} label="Locations" />
        <NavItem to="/admin/products" icon={Bell} label="Products" />
      </MemoryRouter>
    );
    expect(screen.getByRole("link", { name: /Locations/ })).toHaveClass("text-on-surface");
    expect(screen.getByRole("link", { name: /Products/ })).toHaveClass("text-on-surface-variant");
  });
});
