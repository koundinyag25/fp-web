import { useState } from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import type { Product } from "@/types";
import { InventoryEditor, type StockRow } from "./InventoryEditor";

const products: Product[] = [
  { _id: "p1", name: "Diesel", unit: "litre" },
  { _id: "p2", name: "Petrol", unit: "litre" },
];

// Stateful harness so user interactions flow through value/onChange.
const Harness = () => {
  const [value, setValue] = useState<StockRow[]>([]);
  return <InventoryEditor products={products} value={value} onChange={setValue} />;
};

describe("InventoryEditor", () => {
  it("shows an empty hint with no rows", () => {
    render(<Harness />);
    expect(screen.getByText(/no stock yet/i)).toBeInTheDocument();
  });

  it("adds a product row with a quantity and its unit", async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole("button", { name: /add product/i }));
    await userEvent.selectOptions(screen.getByLabelText("Product 1"), "p1");
    await userEvent.type(screen.getByLabelText("Quantity 1"), "50");

    expect(screen.getByLabelText("Product 1")).toHaveValue("p1");
    expect(screen.getByLabelText("Quantity 1")).toHaveValue(50);
    expect(screen.getByText("litre")).toBeInTheDocument();
  });

  it("excludes an already-chosen product from other rows", async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole("button", { name: /add product/i }));
    await userEvent.selectOptions(screen.getByLabelText("Product 1"), "p1");
    await userEvent.click(screen.getByRole("button", { name: /add product/i }));

    const row2 = screen.getByLabelText("Product 2");
    expect(within(row2).getByRole("option", { name: "Petrol" })).toBeInTheDocument();
    expect(within(row2).queryByRole("option", { name: "Diesel" })).not.toBeInTheDocument();
  });

  it("removes a row", async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole("button", { name: /add product/i }));
    expect(screen.getByLabelText("Product 1")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Remove product 1" }));
    expect(screen.queryByLabelText("Product 1")).not.toBeInTheDocument();
    expect(screen.getByText(/no stock yet/i)).toBeInTheDocument();
  });
});
