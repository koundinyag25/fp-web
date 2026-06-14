import { useMemo, useState } from "react";
import { useLocationOptions } from "@/hooks/location/useLocationOptions";
import { useOrderCounts } from "@/hooks/order/useOrderCounts";
import { useOrderMutations } from "@/hooks/order/useOrderMutations";
import { useOrders } from "@/hooks/order/useOrders";
import { useProductOptions } from "@/hooks/product/useProductOptions";
import type { Order } from "@/types";

export const useOrdersPage = () => {
  const [status, setStatus] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Order | null>(null);

  // Delivery-date range — shared by the list and the status counts so the chips
  // stay consistent with the filtered table.
  const dateParams = useMemo(() => {
    const p: Record<string, string> = {};
    if (from) p.from = from;
    if (to) p.to = to;
    return p;
  }, [from, to]);
  const params = useMemo(() => {
    const p: Record<string, string> = { ...dateParams };
    if (status !== "all") p.status = status;
    return p;
  }, [status, dateParams]);

  const list = useOrders(params);
  const counts = useOrderCounts(dateParams);
  const mutations = useOrderMutations();

  const hubs = useLocationOptions("hub");
  const terminals = useLocationOptions("terminal");
  const products = useProductOptions();

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };
  const openNew = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (order: Order) => {
    setEditing(order);
    setModalOpen(true);
  };
  const save = (data: Record<string, unknown>) => {
    if (editing) {
      mutations.update.mutate({ id: editing._id, data }, { onSuccess: closeModal });
    } else {
      mutations.create.mutate(data, { onSuccess: closeModal });
    }
  };
  const assign = (orderId: string, driverId: string) =>
    mutations.assign.mutate({ id: orderId, driverId });

  return {
    rows: list.items,
    isLoading: list.isLoading,
    hasMore: list.hasNextPage,
    isLoadingMore: list.isFetchingNextPage,
    loadMore: list.fetchNextPage,
    counts: counts.data ?? {},
    status,
    setStatus,
    from,
    to,
    setFrom,
    setTo,
    clearDates: () => {
      setFrom("");
      setTo("");
    },
    modalOpen,
    editing,
    openNew,
    openEdit,
    closeModal,
    save,
    saving: mutations.create.isPending || mutations.update.isPending,
    assign,
    options: {
      hubs: hubs.data ?? [],
      terminals: terminals.data ?? [],
      products: products.data ?? [],
    },
  };
};
