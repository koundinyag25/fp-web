import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithProviders } from "@/test/utils";
import ComingSoon from "./ComingSoon";

describe("ComingSoon", () => {
  it("titles itself from the route segment", () => {
    renderWithProviders(<ComingSoon />, { route: "/admin/orders" });
    expect(screen.getByRole("heading", { name: "Orders" })).toBeInTheDocument();
    expect(screen.getByText(/coming in a later flow/)).toBeInTheDocument();
  });

  it("falls back to a generic title with no segment", () => {
    renderWithProviders(<ComingSoon />, { route: "/admin" });
    expect(screen.getByRole("heading", { name: "Section" })).toBeInTheDocument();
  });
});
