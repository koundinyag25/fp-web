import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Spinner } from "./Spinner";

describe("Spinner", () => {
  it("renders an optional label", () => {
    render(<Spinner label="loading" />);
    expect(screen.getByText("loading")).toBeInTheDocument();
  });
});
