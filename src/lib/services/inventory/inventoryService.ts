import { http } from "@/utils/http";
import type { InventoryResponse } from "@/types";

export const inventoryService = {
  get: async (params?: Record<string, string>): Promise<InventoryResponse> =>
    (await http.get("/inventory", { params })).data,
};
