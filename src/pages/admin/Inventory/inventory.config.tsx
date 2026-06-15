import { Chip } from "@/atoms/Chip";
import { INVENTORY_BAND_CLASS } from "@/config/inventory";
import type { Column } from "@/organisms/Table";
import type { InventoryCell, InventoryRow } from "@/types";

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

/**
 * Location-name column + one right-aligned column per product — the inventory
 * pivot. Columns are dynamic (the server maps the same product set onto every
 * row), so they're built from the first row's products.
 */
export const getInventoryColumns = (
  productCols: InventoryRow["products"],
): Column<InventoryRow>[] => [
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
