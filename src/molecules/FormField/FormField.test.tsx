import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FormField } from "./FormField";

describe("FormField", () => {
  it("shows error over hint", () => {
    const { rerender } = render(
      <FormField label="Lat" hint="degrees">
        <input aria-label="lat" />
      </FormField>
    );
    expect(screen.getByText("degrees")).toBeInTheDocument();
    rerender(
      <FormField label="Lat" hint="degrees" error="Out of range">
        <input aria-label="lat" />
      </FormField>
    );
    expect(screen.getByText("Out of range")).toBeInTheDocument();
    expect(screen.queryByText("degrees")).not.toBeInTheDocument();
  });

  it("renders a non-element child as-is", () => {
    render(<FormField label="Plain">just text</FormField>);
    expect(screen.getByText("just text")).toBeInTheDocument();
    expect(screen.getByText("Plain")).toBeInTheDocument();
  });
});
