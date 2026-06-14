import { Plus } from "lucide-react";
import { Button } from "@/atoms/Button";
import { SearchInput } from "@/atoms/SearchInput";
import { PageHeader } from "@/molecules/PageHeader";
import { FilterBuilder } from "@/organisms/FilterBuilder";
import { Table, type Column } from "@/organisms/Table";
import type { FilterFieldDef, ListFilter } from "@/types";

interface ResourceListProps<T> {
  title: string;
  newLabel: string;
  onNew: () => void;
  search: string;
  onSearch: (v: string) => void;
  searchPlaceholder?: string;
  filterFields?: FilterFieldDef[];
  filters?: ListFilter[];
  onFiltersChange?: (next: ListFilter[]) => void;
  columns: Column<T>[];
  rows: T[];
  getRowId: (row: T) => string;
  isLoading?: boolean;
  emptyMessage?: string;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
}

/** Master-data list page body: header + search + filter chips + table. */
export const ResourceList = <T,>({
  title,
  newLabel,
  onNew,
  search,
  onSearch,
  searchPlaceholder,
  filterFields,
  filters,
  onFiltersChange,
  columns,
  rows,
  getRowId,
  isLoading,
  emptyMessage,
  hasMore,
  isLoadingMore,
  onLoadMore,
}: ResourceListProps<T>) => {
  return (
    <>
    <PageHeader
      title={title}
      actions={
        <Button variant="primary" onClick={onNew} className="flex items-center justify-center gap-1">
          <Plus size={16} strokeWidth={1.75} />
          {newLabel}
        </Button>
      }
    />
    <div className="flex flex-col gap-4 md:flex-row md:items-center">
      <div className="md:max-w-sm md:flex-1">
        <SearchInput
          widthClass="w-full"
          placeholder={searchPlaceholder}
          value={search}
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>
      {onFiltersChange && (
        <FilterBuilder fields={filterFields ?? []} value={filters ?? []} onApply={onFiltersChange} />
      )}
    </div>
    <Table
      columns={columns}
      rows={rows}
      getRowId={getRowId}
      isLoading={isLoading}
      emptyMessage={emptyMessage}
      hasMore={hasMore}
      isLoadingMore={isLoadingMore}
      onLoadMore={onLoadMore}
    />
    </>
  );
};
