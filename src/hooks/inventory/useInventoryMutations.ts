import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/useToast";
import { inventoryService } from "@/lib/services/inventory";
import { apiError } from "@/utils/apiError";

interface AdjustArgs {
  locationId: string;
  productId: string;
  quantity: number;
}

/** Manual stock adjustment — refetches the inventory dashboard on success. */
export const useInventoryMutations = () => {
  const qc = useQueryClient();
  const { show } = useToast();
  return {
    adjust: useMutation({
      mutationFn: ({ locationId, productId, quantity }: AdjustArgs) =>
        inventoryService.adjust(locationId, productId, quantity),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ["inventory"] });
        show({ tone: "success", message: "Stock updated." });
      },
      onError: (e: unknown) => show({ tone: "error", message: apiError(e, "Couldn't update stock.") }),
    }),
  };
};
