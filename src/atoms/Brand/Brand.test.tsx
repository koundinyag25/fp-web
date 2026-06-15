import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithProviders } from "@/test/utils";
import { Brand } from "./Brand";

describe("Brand", () => {
  it("renders the wordmark linking to the landing page", () => {
    renderWithProviders(<Brand />);
    expect(screen.getByText("FleetPanda")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /FleetPanda/i })).toHaveAttribute("href", "/");
  });
});
