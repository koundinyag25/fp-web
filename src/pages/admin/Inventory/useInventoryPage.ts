import { useCallback, useMemo, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { useInventory } from "@/hooks/inventory/useInventory";
import { useInventoryMutations } from "@/hooks/inventory/useInventoryMutations";
import { useLocationOptions } from "@/hooks/location/useLocationOptions";
import { useProductOptions } from "@/hooks/product/useProductOptions";
import type { FilterFieldDef, InventoryCell, InventoryRow, ListFilter } from "@/types";
import type { AdjustTarget } from "./AdjustStockModal";

/**
 * View-model for the inventory dashboard (FR-IN): debounced search + structured
 * filters drive the server-side /inventory query; exposes the rows, the pivot's
 * product columns, and the location/product filter fields.
 */
export const useInventoryPage = () => {
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

  // Same FilterBuilder fields as the master-data pages: by location and/or
  // product (FR-IN-3).
  const filterFields = useMemo<FilterFieldDef[]>(
    () => [
      {
        key: "locationId",
        label: "Location",
        type: "select",
        options: locations.map((l) => ({ value: l._id, label: l.name })),
      },
      {
        key: "productId",
        label: "Product",
        type: "select",
        options: products.map((p) => ({ value: p._id, label: p.name })),
      },
    ],
    [locations, products],
  );

  const rows = data?.rows ?? [];
  const productCols = rows[0]?.products ?? [];

  // Manual stock adjustment (FR-IN extension): click a cell → edit its on-hand qty.
  const { adjust } = useInventoryMutations();
  const [editing, setEditing] = useState<AdjustTarget | null>(null);

  const openAdjust = useCallback(
    (row: InventoryRow, cell: InventoryCell) =>
      setEditing({
        locationId: row.locationId,
        locationName: row.locationName,
        productId: cell.productId,
        productName: cell.productName,
        unit: cell.unit,
        qty: cell.qty,
      }),
    [],
  );
  const closeAdjust = useCallback(() => setEditing(null), []);
  const saveAdjust = (quantity: number) => {
    if (!editing) return;
    adjust.mutate(
      { locationId: editing.locationId, productId: editing.productId, quantity },
      { onSuccess: closeAdjust },
    );
  };

  return {
    q, setQ, filters, setFilters, data, isLoading, rows, productCols, filterFields,
    editing, openAdjust, closeAdjust, saveAdjust, saving: adjust.isPending,
  };
};
