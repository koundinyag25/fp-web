import { http } from "@/utils/http";
import type { InventoryResponse } from "@/types";

export const inventoryService = {
  get: async (params?: Record<string, string>): Promise<InventoryResponse> =>
    (await http.get("/inventory", { params })).data,
  /** Manual stock adjustment — set the absolute on-hand qty for a location+product. */
  adjust: (locationId: string, productId: string, quantity: number) =>
    http.patch("/inventory", { locationId, productId, quantity }),
};
