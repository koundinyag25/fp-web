import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { ResourceList } from "./ResourceList";
import type { Column } from "@/organisms/Table";

interface Row {
  _id: string;
  name: string;
}
const columns: Column<Row>[] = [{ key: "name", header: "Name" }];
const rows: Row[] = [{ _id: "1", name: "Alpha" }];

const base = {
  title: "Items",
  newLabel: "New item",
  onNew: vi.fn(),
  search: "",
  onSearch: vi.fn(),
  columns,
  rows,
  getRowId: (r: Row) => r._id,
};

describe("ResourceList", () => {
  it("shows the loading-more spinner when fetching the next page", () => {
    render(
      <MemoryRouter>
        <ResourceList {...base} hasMore isLoadingMore onLoadMore={vi.fn()} />
      </MemoryRouter>
    );
    expect(screen.getByText("Loading more…")).toBeInTheDocument();
    expect(screen.getByText("Alpha")).toBeInTheDocument();
  });

  it("renders the filter builder only when filters are wired", () => {
    const { rerender } = render(
      <MemoryRouter>
        <ResourceList {...base} />
      </MemoryRouter>
    );
    expect(screen.queryByText("Filters")).not.toBeInTheDocument();
    rerender(
      <MemoryRouter>
        <ResourceList {...base} filterFields={[]} filters={[]} onFiltersChange={vi.fn()} />
      </MemoryRouter>
    );
    expect(screen.getByText("Filters")).toBeInTheDocument();
  });
});
