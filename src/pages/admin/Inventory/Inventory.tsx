import { useMemo, useState } from "react";
import { Chip } from "@/atoms/Chip";
import { SearchInput } from "@/atoms/SearchInput";
import { INVENTORY_BAND_CLASS } from "@/config/inventory";
import { useDebounce } from "@/hooks/useDebounce";
import { useInventory } from "@/hooks/inventory/useInventory";
import { useLocationOptions } from "@/hooks/location/useLocationOptions";
import { useProductOptions } from "@/hooks/product/useProductOptions";
import { PageHeader } from "@/molecules/PageHeader";
import { FilterBuilder } from "@/organisms/FilterBuilder";
import { Table, type Column } from "@/organisms/Table";
import type { FilterFieldDef, InventoryCell, InventoryRow, ListFilter } from "@/types";

/**
 * Admin inventory dashboard (FR-IN). A location × product pivot: each hub/
 * terminal is a row, each product a column, cells colour-coded by low-stock band
 * (FR-IN-2). Search by location name + filter by location/product (FR-IN-3) —
 * all server-side via /inventory.
 */
const Inventory = () => {
  const [q, setQ] = useState("");
  const [filters, setFilters] = useState<ListFilter[]>([]);
  const debouncedQ = useDebounce(q, 250);

  const params = useMemo(() => {
    const p: Record<string, string> = {};
    if (debouncedQ.trim()) p.q = debouncedQ.trim();
    if (filters.length) p.filters = JSON.stringify(filters);
    return p;
  }, [debouncedQ, filters]);

  const { data, isLoading } = useInventory(params);
  const { data: locations = [] } = useLocationOptions();
  const { data: products = [] } = useProductOptions();

  // Same FilterBuilder fields as the master-data pages: filter by location
  // and/or product (FR-IN-3).
  const filterFields = useMemo<FilterFieldDef[]>(
    () => [
      { key: "locationId", label: "Location", type: "select", options: locations.map((l) => ({ value: l._id, label: l.name })) },
      { key: "productId", label: "Product", type: "select", options: products.map((p) => ({ value: p._id, label: p.name })) },
    ],
    [locations, products]
  );

  const rows = data?.rows ?? [];
  // The server maps the same product set onto every row, so the first row's
  // products define the pivot columns.
  const productCols = rows[0]?.products ?? [];

  const columns = useMemo<Column<InventoryRow>[]>(() => {
    const renderCell = (cell?: InventoryCell) =>
      cell ? (
        <span
          className={`inline-block rounded px-2 py-1 font-mono text-code-sm ${INVENTORY_BAND_CLASS[cell.band]}`}
        >
          {cell.qty}
          {cell.unit ? <span className="text-outline"> {cell.unit}</span> : null}
        </span>
      ) : (
        <span className="text-outline">—</span>
      );

    return [
      {
        key: "locationName",
        header: "Location",
        render: (row) => (
          <div className="flex items-center gap-2">
            <span className="text-on-surface">{row.locationName}</span>
            <Chip>{row.type}</Chip>
          </div>
        ),
      },
      ...productCols.map<Column<InventoryRow>>((p) => ({
        key: p.productId,
        header: p.productName,
        align: "right",
        render: (row) => renderCell(row.products.find((c) => c.productId === p.productId)),
      })),
    ];
  }, [productCols]);

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Inventory" />

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="md:max-w-sm md:flex-1">
          <SearchInput
            placeholder="Search locations…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            widthClass="w-full"
          />
        </div>
        <FilterBuilder fields={filterFields} value={filters} onApply={setFilters} />
        {data && (
          <span className="font-mono text-code-sm text-outline md:ml-auto">
            Low &lt; {data.thresholds.low} · Warn &lt; {data.thresholds.warn}
          </span>
        )}
      </div>

      <Table
        columns={columns}
        rows={rows}
        getRowId={(r) => r.locationId}
        isLoading={isLoading}
        emptyMessage="No inventory matches these filters."
        minWidth={Math.max(640, 220 + productCols.length * 130)}
      />
    </div>
  );
};

export default Inventory;
