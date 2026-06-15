import { useMemo, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { useInventory } from "@/hooks/inventory/useInventory";
import { useLocationOptions } from "@/hooks/location/useLocationOptions";
import { useProductOptions } from "@/hooks/product/useProductOptions";
import type { FilterFieldDef, ListFilter } from "@/types";

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

  return { q, setQ, filters, setFilters, data, isLoading, rows, productCols, filterFields };
};
