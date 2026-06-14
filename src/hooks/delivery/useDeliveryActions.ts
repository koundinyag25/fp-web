import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/useToast";
import { deliveryService } from "@/lib/services/delivery";
import { apiError } from "@/utils/apiError";

export const useDeliveryActions = (driverId: string) => {
  const qc = useQueryClient();
  const { show } = useToast();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["today", driverId] });
  return {
    complete: useMutation({
      mutationFn: (id: string) => deliveryService.complete(id),
      onSuccess: () => {
        invalidate();
        show({ tone: "success", message: "Delivery completed — inventory updated." });
      },
      onError: (e) => show({ tone: "error", message: apiError(e, "Couldn't complete the delivery.") }),
    }),
    fail: useMutation({
      mutationFn: ({ id, reason }: { id: string; reason: string }) => deliveryService.fail(id, reason),
      onSuccess: () => {
        invalidate();
        show({ tone: "info", message: "Delivery marked as failed." });
      },
      onError: (e) => show({ tone: "error", message: apiError(e, "Couldn't update the delivery.") }),
    }),
  };
};
