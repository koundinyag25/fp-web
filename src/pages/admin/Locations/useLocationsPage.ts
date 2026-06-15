import { useMemo, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { useLocations } from "@/hooks/location/useLocations";
import { useLocationMutations } from "@/hooks/location/useLocationMutations";
import { useProductOptions } from "@/hooks/product/useProductOptions";
import type { ListFilter, Location } from "@/types";

/** Page view-model for admin Locations: owns search/filter/modal/delete UI state,
 *  composes the locations query + mutations. */
export const useLocationsPage = () => {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<ListFilter[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Location | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Location | null>(null);

  const debouncedSearch = useDebounce(search, 300);
  const params = useMemo(() => {
    const p: Record<string, string> = {};
    if (debouncedSearch.trim()) p.q = debouncedSearch.trim();
    if (filters.length) p.filters = JSON.stringify(filters);
    return p;
  }, [debouncedSearch, filters]);

  const list = useLocations(params);
  const products = useProductOptions(); // for the hub opening-stock editor
  const mutations = useLocationMutations();

  const openNew = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (loc: Location) => {
    setEditing(loc);
    setModalOpen(true);
  };
  const closeModal = () => setModalOpen(false);

  const save = (data: Partial<Location>) => {
    const opts = { onSuccess: closeModal };
    if (editing) mutations.update.mutate({ id: editing._id, data }, opts);
    else mutations.create.mutate(data, opts);
  };

  const confirmDelete = () => {
    /* v8 ignore next -- defensive guard: confirmDelete is only wired to the ConfirmDialog, which mounts its confirm button solely when deleteTarget is set */
    if (!deleteTarget) return;
    mutations.remove.mutate(deleteTarget._id, { onSuccess: () => setDeleteTarget(null) });
  };

  return {
    rows: list.items,
    products: products.data ?? [],
    isLoading: list.isLoading,
    hasMore: list.hasNextPage,
    isLoadingMore: list.isFetchingNextPage,
    loadMore: list.fetchNextPage,
    search,
    setSearch,
    filters,
    setFilters,
    modalOpen,
    editing,
    openNew,
    openEdit,
    closeModal,
    save,
    saving: mutations.create.isPending || mutations.update.isPending,
    deleteTarget,
    setDeleteTarget,
    confirmDelete,
    deleting: mutations.remove.isPending,
  };
};
