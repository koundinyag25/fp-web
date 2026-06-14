import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Card } from "./Card";

describe("Card", () => {
  it("renders children", () => {
    render(<Card className="x">hi</Card>);
    expect(screen.getByText("hi")).toBeInTheDocument();
  });
});
