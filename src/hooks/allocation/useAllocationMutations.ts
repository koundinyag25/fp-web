import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/useToast";
import { allocationService } from "@/lib/services/allocation";
import { apiError } from "@/utils/apiError";

export const useAllocationMutations = () => {
  const qc = useQueryClient();
  const { show } = useToast();
  // Allocating/removing changes the week's filled cells and the summary counts
  // — both live under the "allocations" key.
  const invalidate = () => qc.invalidateQueries({ queryKey: ["allocations"] });
  return {
    create: useMutation({
      mutationFn: (data: { vehicleId: string; driverId: string; date: string }) =>
        allocationService.create(data),
      // The double-booking (409) error is shown inline in the dialog, so here we
      // only celebrate success.
      onSuccess: () => {
        invalidate();
        show({ tone: "success", message: "Vehicle allocated." });
      },
    }),
    remove: useMutation({
      mutationFn: (id: string) => allocationService.remove(id),
      onSuccess: () => {
        invalidate();
        show({ tone: "success", message: "Allocation removed." });
      },
      onError: (e) => show({ tone: "error", message: apiError(e, "Couldn't remove the allocation.") }),
    }),
  };
};
