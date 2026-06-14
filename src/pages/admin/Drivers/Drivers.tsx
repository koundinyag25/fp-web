import { ConfirmDialog } from "@/organisms/ConfirmDialog";
import { ResourceList } from "@/organisms/ResourceList";
import { DriverFormModal } from "./DriverFormModal";
import { getDriverColumns, DRIVER_FILTER_FIELDS } from "./drivers.config";
import { useDriversPage } from "./useDriversPage";

const Drivers = () => {
  const p = useDriversPage();
  const columns = getDriverColumns({ onEdit: p.openEdit, onDelete: p.setDeleteTarget });

  return (
    <>
      <ResourceList
        title="Drivers"
        newLabel="New driver"
        onNew={p.openNew}
        search={p.search}
        onSearch={p.setSearch}
        searchPlaceholder="Search by name, phone, or license…"
        filterFields={DRIVER_FILTER_FIELDS}
        filters={p.filters}
        onFiltersChange={p.setFilters}
        columns={columns}
        rows={p.rows}
        getRowId={(d) => d._id}
        isLoading={p.isLoading}
        emptyMessage="No drivers yet — add one to get started."
        hasMore={p.hasMore}
        isLoadingMore={p.isLoadingMore}
        onLoadMore={p.loadMore}
      />
      <DriverFormModal
        open={p.modalOpen}
        editing={p.editing}
        onClose={p.closeModal}
        onSave={p.save}
        saving={p.saving}
      />
      <ConfirmDialog
        open={!!p.deleteTarget}
        title="Delete driver?"
        message={`Delete "${p.deleteTarget?.name}"? This can't be undone.`}
        onConfirm={p.confirmDelete}
        onCancel={() => p.setDeleteTarget(null)}
        pending={p.deleting}
      />
    </>
  );
};

export default Drivers;
