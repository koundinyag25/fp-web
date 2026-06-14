import { ConfirmDialog } from "@/organisms/ConfirmDialog";
import { ResourceList } from "@/organisms/ResourceList";
import { VehicleFormModal } from "./VehicleFormModal";
import { getVehicleColumns, VEHICLE_FILTER_FIELDS } from "./vehicles.config";
import { useVehiclesPage } from "./useVehiclesPage";

const Vehicles = () => {
  const p = useVehiclesPage();
  const columns = getVehicleColumns({ onEdit: p.openEdit, onDelete: p.setDeleteTarget });

  return (
    <>
      <ResourceList
        title="Vehicles"
        newLabel="New vehicle"
        onNew={p.openNew}
        search={p.search}
        onSearch={p.setSearch}
        searchPlaceholder="Search by reg…"
        filterFields={VEHICLE_FILTER_FIELDS}
        filters={p.filters}
        onFiltersChange={p.setFilters}
        columns={columns}
        rows={p.rows}
        getRowId={(v) => v._id}
        isLoading={p.isLoading}
        emptyMessage="No vehicles yet — add one to start managing your fleet."
        hasMore={p.hasMore}
        isLoadingMore={p.isLoadingMore}
        onLoadMore={p.loadMore}
      />
      <VehicleFormModal
        open={p.modalOpen}
        editing={p.editing}
        onClose={p.closeModal}
        onSave={p.save}
        saving={p.saving}
      />
      <ConfirmDialog
        open={!!p.deleteTarget}
        title="Delete vehicle?"
        message={`Delete "${p.deleteTarget?.reg}"? This can't be undone.`}
        onConfirm={p.confirmDelete}
        onCancel={() => p.setDeleteTarget(null)}
        pending={p.deleting}
      />
    </>
  );
};

export default Vehicles;
