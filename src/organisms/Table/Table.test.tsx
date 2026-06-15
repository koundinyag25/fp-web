import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Table, type Column } from "./Table";

interface Row {
  _id: string;
  name: string;
}
const columns: Column<Row>[] = [
  { key: "name", header: "Name" },
  { key: "x", header: "X", align: "center", render: (r) => <span>x-{r.name}</span> },
];

describe("Table", () => {
  it("renders rows via key and render fn", () => {
    render(<Table columns={columns} rows={[{ _id: "1", name: "Alpha" }]} getRowId={(r) => r._id} />);
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("x-Alpha")).toBeInTheDocument();
  });
  it("right-aligns a column and renders a blank cell for a nullish value", () => {
    interface R {
      _id: string;
      label?: string | null;
    }
    const cols: Column<R>[] = [
      { key: "label", header: "Label", align: "right" },
    ];
    const { container } = render(
      <Table columns={cols} rows={[{ _id: "1", label: null }]} getRowId={(r) => r._id} />
    );
    const cell = container.querySelector("tbody td");
    expect(cell).not.toBeNull();
    expect(cell?.className).toContain("text-right");
    expect(cell?.textContent).toBe(""); // null → String("")
  });

  it("shows skeletons while loading and empty state when empty", () => {
    const { rerender, container } = render(<Table columns={columns} rows={[]} getRowId={(r) => r._id} isLoading />);
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
    rerender(<Table columns={columns} rows={[]} getRowId={(r) => r._id} emptyMessage="Nothing here" />);
    expect(screen.getByText("Nothing here")).toBeInTheDocument();
  });
});
