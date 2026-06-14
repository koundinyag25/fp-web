import { useQuery } from "@tanstack/react-query";
import { inventoryService } from "@/lib/services/inventory";
import type { InventoryResponse } from "@/types";

export const useInventory = (params?: Record<string, string>) =>
  useQuery<InventoryResponse>({
    queryKey: ["inventory", params ?? {}],
    queryFn: () => inventoryService.get(params),
  });
