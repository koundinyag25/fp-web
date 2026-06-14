import { useFleetActive } from "@/hooks/fleet/useFleetActive";
import { useInventory } from "@/hooks/inventory/useInventory";
import { useMovements } from "@/hooks/movement/useMovements";
import { useOrderCounts } from "@/hooks/order/useOrderCounts";
import { ORDER_STATUSES } from "@/types/constants";

/**
 * Page-level view-model for the admin dashboard. Composes the reusable
 * react-query hooks and shapes them for the view; owns no server state itself.
 */
export const useDashboardPage = () => {
  const counts = useOrderCounts();
  // "Active vehicles / on the road now" = vehicles actually in transit, matching
  // the live fleet map (which also shows only in-transit vehicles).
  const fleet = useFleetActive({ deliveryStatus: "in_transit" });
  const movements = useMovements();
  const inventory = useInventory();

  const c = counts.data ?? {};
  const lowStockCells =
    inventory.data?.rows.flatMap((r) => r.products).filter((p) => p.band === "low").length ?? 0;

  const statusCounts = ORDER_STATUSES.map((status) => ({ status, count: c[status] ?? 0 }));
  const totalOrders = statusCounts.reduce((sum, s) => sum + s.count, 0);

  return {
    metrics: {
      activeVehicles: fleet.data?.length ?? 0,
      openOrders: (c.pending ?? 0) + (c.assigned ?? 0),
      inTransit: c.in_transit ?? 0,
      lowStockCells,
    },
    statusCounts,
    totalOrders,
    movements: (movements.data ?? []).slice(0, 5),
    isLoading: counts.isLoading || fleet.isLoading || movements.isLoading,
  };
};
