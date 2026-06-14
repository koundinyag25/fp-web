import { ConfirmDialog } from "@/organisms/ConfirmDialog";
import { ResourceList } from "@/organisms/ResourceList";
import { LocationFormModal } from "./LocationFormModal";
import { getLocationColumns, LOCATION_FILTER_FIELDS } from "./locations.config";
import { useLocationsPage } from "./useLocationsPage";

const Locations = () => {
  const p = useLocationsPage();
  const columns = getLocationColumns({ onEdit: p.openEdit, onDelete: p.setDeleteTarget });

  return (
    <>
      <ResourceList
        title="Locations"
        newLabel="New location"
        onNew={p.openNew}
        search={p.search}
        onSearch={p.setSearch}
        searchPlaceholder="Search by name…"
        filterFields={LOCATION_FILTER_FIELDS}
        filters={p.filters}
        onFiltersChange={p.setFilters}
        columns={columns}
        rows={p.rows}
        getRowId={(l) => l._id}
        isLoading={p.isLoading}
        emptyMessage="No locations yet — create a hub or terminal."
        hasMore={p.hasMore}
        isLoadingMore={p.isLoadingMore}
        onLoadMore={p.loadMore}
      />
      <LocationFormModal
        open={p.modalOpen}
        editing={p.editing}
        products={p.products}
        onClose={p.closeModal}
        onSave={p.save}
        saving={p.saving}
      />
      <ConfirmDialog
        open={!!p.deleteTarget}
        title="Delete location?"
        message={`Delete "${p.deleteTarget?.name}"? This can't be undone.`}
        onConfirm={p.confirmDelete}
        onCancel={() => p.setDeleteTarget(null)}
        pending={p.deleting}
      />
    </>
  );
};

export default Locations;
