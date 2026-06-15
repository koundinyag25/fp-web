import { useMemo } from "react";
import { SearchInput } from "@/atoms/SearchInput";
import { PageHeader } from "@/molecules/PageHeader";
import { FilterBuilder } from "@/organisms/FilterBuilder";
import { Table } from "@/organisms/Table";
import { AdjustStockModal } from "./AdjustStockModal";
import { getInventoryColumns } from "./inventory.config";
import { useInventoryPage } from "./useInventoryPage";

/**
 * Admin inventory dashboard (FR-IN). A location × product pivot: each hub/
 * terminal is a row, each product a column, cells colour-coded by low-stock band
 * (FR-IN-2). Search by location name + filter by location/product (FR-IN-3) —
 * all server-side via /inventory.
 */
const Inventory = () => {
  const vm = useInventoryPage();
  const columns = useMemo(
    () => getInventoryColumns(vm.productCols, vm.openAdjust),
    [vm.productCols, vm.openAdjust],
  );

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Inventory" />

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="md:max-w-sm md:flex-1">
          <SearchInput
            placeholder="Search locations…"
            value={vm.q}
            onChange={(e) => vm.setQ(e.target.value)}
            widthClass="w-full"
          />
        </div>
        <FilterBuilder fields={vm.filterFields} value={vm.filters} onApply={vm.setFilters} />
        {vm.data && (
          <span className="font-mono text-code-sm text-outline md:ml-auto">
            Low &lt; {vm.data.thresholds.low} · Warn &lt; {vm.data.thresholds.warn}
          </span>
        )}
      </div>

      <Table
        columns={columns}
        rows={vm.rows}
        getRowId={(r) => r.locationId}
        isLoading={vm.isLoading}
        emptyMessage="No inventory matches these filters."
        minWidth={Math.max(640, 220 + vm.productCols.length * 130)}
      />

      <AdjustStockModal
        target={vm.editing}
        onClose={vm.closeAdjust}
        onSave={vm.saveAdjust}
        saving={vm.saving}
      />
    </div>
  );
};

export default Inventory;
