import { Plus } from "lucide-react";
import { Button } from "@/atoms/Button";
import { DateRangeFilter } from "@/molecules/DateRangeFilter";
import { PageHeader } from "@/molecules/PageHeader";
import { StatusFilterBar } from "@/molecules/StatusFilterBar";
import { Table } from "@/organisms/Table";
import { OrderFormModal } from "./OrderFormModal";
import { buildStatusOptions, getOrderColumns } from "./orders.config";
import { useOrdersPage } from "./useOrdersPage";

const Orders = () => {
  const p = useOrdersPage();
  const columns = getOrderColumns({ onAssign: p.assign, onEdit: p.openEdit });

  return (
    <>
      <PageHeader
        title="Orders"
        actions={
          <Button variant="primary" onClick={p.openNew} className="flex items-center justify-center gap-1">
            <Plus size={16} strokeWidth={1.75} />
            New order
          </Button>
        }
      />
      <StatusFilterBar options={buildStatusOptions(p.counts)} value={p.status} onChange={p.setStatus} />
      <div className="flex flex-wrap items-center justify-end gap-3 pt-1">
        <DateRangeFilter
          from={p.from}
          to={p.to}
          onFromChange={p.setFrom}
          onToChange={p.setTo}
          onClear={p.clearDates}
        />
      </div>
      <Table
        columns={columns}
        rows={p.rows}
        getRowId={(o) => o._id}
        isLoading={p.isLoading}
        emptyMessage="No orders match this filter."
        hasMore={p.hasMore}
        isLoadingMore={p.isLoadingMore}
        onLoadMore={p.loadMore}
      />
      <OrderFormModal
        open={p.modalOpen}
        editing={p.editing}
        hubs={p.options.hubs}
        terminals={p.options.terminals}
        products={p.options.products}
        onClose={p.closeModal}
        onSave={p.save}
        saving={p.saving}
      />
    </>
  );
};

export default Orders;
