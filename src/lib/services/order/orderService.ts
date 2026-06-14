import { http } from "@/utils/http";
import type { Order, OrderCounts, Page } from "@/types";

export const orderService = {
  list: async (params?: Record<string, string>): Promise<Page<Order>> =>
    (await http.get("/orders", { params })).data,
  counts: async (params?: Record<string, string>): Promise<OrderCounts> =>
    (await http.get("/orders/counts", { params })).data,
  create: (data: Record<string, unknown>) => http.post("/orders", data),
  update: (id: string, data: Record<string, unknown>) => http.patch(`/orders/${id}`, data),
  assign: (id: string, driverId: string) => http.patch(`/orders/${id}/assign`, { driverId }),
};
