import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCrudToasts } from "@/hooks/useCrudToasts";
import { vehicleService } from "@/lib/services/vehicle";
import type { Vehicle } from "@/types";

export const useVehicleMutations = () => {
  const qc = useQueryClient();
  const toast = useCrudToasts("Vehicle");
  const invalidate = () => qc.invalidateQueries({ queryKey: ["vehicles"] });
  return {
    create: useMutation({
      mutationFn: (data: Partial<Vehicle>) => vehicleService.create(data),
      onSuccess: () => {
        invalidate();
        toast.created();
      },
      onError: toast.failed("create"),
    }),
    update: useMutation({
      mutationFn: ({ id, data }: { id: string; data: Partial<Vehicle> }) => vehicleService.update(id, data),
      onSuccess: () => {
        invalidate();
        toast.updated();
      },
      onError: toast.failed("update"),
    }),
    remove: useMutation({
      mutationFn: (id: string) => vehicleService.remove(id),
      onSuccess: () => {
        invalidate();
        toast.deleted();
      },
      onError: toast.failed("delete"),
    }),
  };
};
