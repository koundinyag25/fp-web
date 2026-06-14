import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Avatar } from "./Avatar";

describe("Avatar", () => {
  it("derives initials from a name", () => {
    render(<Avatar name="Asha Rao" />);
    expect(screen.getByText("AR")).toBeInTheDocument();
  });
  it("falls back to a glyph with no name", () => {
    const { container } = render(<Avatar />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });
});
