import { useMemo, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { useVehicles } from "@/hooks/vehicle/useVehicles";
import { useVehicleMutations } from "@/hooks/vehicle/useVehicleMutations";
import type { ListFilter, Vehicle } from "@/types";

export const useVehiclesPage = () => {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<ListFilter[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Vehicle | null>(null);

  const debouncedSearch = useDebounce(search, 300);
  const params = useMemo(() => {
    const p: Record<string, string> = {};
    if (debouncedSearch.trim()) p.q = debouncedSearch.trim();
    if (filters.length) p.filters = JSON.stringify(filters);
    return p;
  }, [debouncedSearch, filters]);

  const list = useVehicles(params);
  const mutations = useVehicleMutations();

  const openNew = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (vehicle: Vehicle) => {
    setEditing(vehicle);
    setModalOpen(true);
  };
  const closeModal = () => setModalOpen(false);

  const save = (data: Partial<Vehicle>) => {
    const opts = { onSuccess: closeModal };
    if (editing) mutations.update.mutate({ id: editing._id, data }, opts);
    else mutations.create.mutate(data, opts);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    mutations.remove.mutate(deleteTarget._id, { onSuccess: () => setDeleteTarget(null) });
  };

  return {
    rows: list.items,
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
