import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Brand } from "./Brand";

describe("Brand", () => {
  it("renders the FleetPanda wordmark", () => {
    render(<Brand />);
    expect(screen.getByText("FleetPanda")).toBeInTheDocument();
  });
});
