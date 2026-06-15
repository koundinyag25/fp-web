import { Chip } from "@/atoms/Chip";
import { INVENTORY_BAND_CLASS } from "@/config/inventory";
import type { Column } from "@/organisms/Table";
import type { InventoryCell, InventoryRow } from "@/types";

type AdjustHandler = (row: InventoryRow, cell: InventoryCell) => void;

// Each balance is a button: click to manually adjust the on-hand stock.
const renderCell = (row: InventoryRow, cell: InventoryCell | undefined, onAdjust: AdjustHandler) =>
  cell ? (
    <button
      type="button"
      title="Adjust stock"
      onClick={() => onAdjust(row, cell)}
      className={`inline-block rounded px-2 py-1 font-mono text-code-sm transition hover:ring-1 hover:ring-primary/50 focus:outline-none focus-visible:ring-1 focus-visible:ring-primary ${INVENTORY_BAND_CLASS[cell.band]}`}
    >
      {cell.qty}
      {cell.unit ? <span className="text-outline"> {cell.unit}</span> : null}
    </button>
  ) : (
    <span className="text-outline">—</span>
  );

/**
 * Location-name column + one right-aligned column per product — the inventory
 * pivot. Columns are dynamic (the server maps the same product set onto every
 * row), so they're built from the first row's products. Each cell is clickable
 * to adjust stock (FR-IN extension).
 */
export const getInventoryColumns = (
  productCols: InventoryRow["products"],
  onAdjust: AdjustHandler,
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
    render: (row) => renderCell(row, row.products.find((c) => c.productId === p.productId), onAdjust),
  })),
];
