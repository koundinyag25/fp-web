import { useInfiniteList } from "@/hooks/useInfiniteList";
import { orderService } from "@/lib/services/order";
import type { Order } from "@/types";

export const useOrders = (params: Record<string, string>) =>
  useInfiniteList<Order>(["orders", params], (cursor) =>
    orderService.list({ ...params, limit: "20", ...(cursor ? { cursor } : {}) })
  );
