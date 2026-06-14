import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/useToast";
import { orderService } from "@/lib/services/order";
import { apiError } from "@/utils/apiError";

export const useOrderMutations = () => {
  const qc = useQueryClient();
  const { show } = useToast();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["orders"] });
    qc.invalidateQueries({ queryKey: ["orders", "counts"] });
  };
  return {
    create: useMutation({
      mutationFn: (data: Record<string, unknown>) => orderService.create(data),
      onSuccess: () => {
        invalidate();
        show({ tone: "success", message: "Order created." });
      },
      onError: (e) => show({ tone: "error", message: apiError(e, "Couldn't create the order.") }),
    }),
    update: useMutation({
      mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) => orderService.update(id, data),
      onSuccess: () => {
        invalidate();
        show({ tone: "success", message: "Order updated." });
      },
      onError: (e) => show({ tone: "error", message: apiError(e, "Couldn't update the order.") }),
    }),
    assign: useMutation({
      mutationFn: ({ id, driverId }: { id: string; driverId: string }) => orderService.assign(id, driverId),
      onSuccess: () => {
        invalidate();
        show({ tone: "success", message: "Driver assigned." });
      },
      onError: (e) => show({ tone: "error", message: apiError(e, "Couldn't assign the driver.") }),
    }),
  };
};
