import { useQuery } from "@tanstack/react-query";
import { orderService } from "@/lib/services/order";
import type { OrderCounts } from "@/types";

export const useOrderCounts = (params: Record<string, string> = {}) =>
  useQuery<OrderCounts>({
    queryKey: ["orders", "counts", params],
    queryFn: () => orderService.counts(params),
    refetchInterval: 15_000,
  });
