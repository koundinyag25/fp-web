import { useState } from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import type { Product } from "@/types";
import { InventoryEditor, type StockRow } from "./InventoryEditor";

const products: Product[] = [
  {
    _id: "p1",
    name: "Diesel",
    unit: "litre",
    costPrice: 3.1,
    sellingPrice: 3.89,
  },
  {
    _id: "p2",
    name: "Petrol",
    unit: "litre",
    costPrice: 2.95,
    sellingPrice: 3.75,
  },
];

// Stateful harness so user interactions flow through value/onChange.
const Harness = () => {
  const [value, setValue] = useState<StockRow[]>([]);
  return (
    <InventoryEditor products={products} value={value} onChange={setValue} />
  );
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
    expect(
      within(row2).getByRole("option", { name: "Petrol" }),
    ).toBeInTheDocument();
    expect(
      within(row2).queryByRole("option", { name: "Diesel" }),
    ).not.toBeInTheDocument();
  });

  it("removes a row", async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole("button", { name: /add product/i }));
    expect(screen.getByLabelText("Product 1")).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole("button", { name: "Remove product 1" }),
    );
    expect(screen.queryByLabelText("Product 1")).not.toBeInTheDocument();
    expect(screen.getByText(/no stock yet/i)).toBeInTheDocument();
  });

  it("updates only the edited row, leaving the others untouched", async () => {
    const onChange = vi.fn();
    const Seeded = () => {
      const [value, setValue] = useState<StockRow[]>([
        { productId: "p1", quantity: 10 },
        { productId: "p2", quantity: 20 },
      ]);
      return (
        <InventoryEditor
          products={products}
          value={value}
          onChange={(rows) => {
            onChange(rows);
            setValue(rows);
          }}
        />
      );
    };
    render(<Seeded />);
    await userEvent.clear(screen.getByLabelText("Quantity 1"));
    await userEvent.type(screen.getByLabelText("Quantity 1"), "5");
    // the second row is carried through every update (idx !== i branch)
    const last = onChange.mock.calls[
      onChange.mock.calls.length - 1
    ][0] as StockRow[];
    expect(last[0]).toEqual({ productId: "p1", quantity: 5 });
    expect(last[1]).toEqual({ productId: "p2", quantity: 20 });
  });

  it("renders an empty quantity field when the quantity is not finite", () => {
    render(
      <InventoryEditor
        products={products}
        value={[{ productId: "p1", quantity: Number.NaN }]}
        onChange={vi.fn()}
      />,
    );
    expect(screen.getByLabelText("Quantity 1")).toHaveValue(null);
  });
});
