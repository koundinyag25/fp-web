import { ConfirmDialog } from "@/organisms/ConfirmDialog";
import { ResourceList } from "@/organisms/ResourceList";
import { getProductColumns, PRODUCT_FILTER_FIELDS } from "./products.config";
import { ProductFormModal } from "./ProductFormModal";
import { useProductsPage } from "./useProductsPage";

const Products = () => {
  const p = useProductsPage();
  const columns = getProductColumns({ onEdit: p.openEdit, onDelete: p.setDeleteTarget });

  return (
    <>
      <ResourceList
        title="Products"
        newLabel="New product"
        onNew={p.openNew}
        search={p.search}
        onSearch={p.setSearch}
        searchPlaceholder="Search products…"
        filterFields={PRODUCT_FILTER_FIELDS}
        filters={p.filters}
        onFiltersChange={p.setFilters}
        columns={columns}
        rows={p.rows}
        getRowId={(prod) => prod._id}
        isLoading={p.isLoading}
        emptyMessage="No products yet — add one to get started."
        hasMore={p.hasMore}
        isLoadingMore={p.isLoadingMore}
        onLoadMore={p.loadMore}
      />
      <ProductFormModal
        open={p.modalOpen}
        editing={p.editing}
        onClose={p.closeModal}
        onSave={p.save}
        saving={p.saving}
      />
      <ConfirmDialog
        open={!!p.deleteTarget}
        title="Delete product?"
        message={`Delete "${p.deleteTarget?.name}"? This can't be undone.`}
        onConfirm={p.confirmDelete}
        onCancel={() => p.setDeleteTarget(null)}
        pending={p.deleting}
      />
    </>
  );
};

export default Products;
