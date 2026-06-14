import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCrudToasts } from "@/hooks/useCrudToasts";
import { driverService } from "@/lib/services/driver";
import type { Driver } from "@/types";

export const useDriverMutations = () => {
  const qc = useQueryClient();
  const toast = useCrudToasts("Driver");
  const invalidate = () => qc.invalidateQueries({ queryKey: ["drivers"] });
  return {
    create: useMutation({
      mutationFn: (data: Partial<Driver>) => driverService.create(data),
      onSuccess: () => {
        invalidate();
        toast.created();
      },
      onError: toast.failed("create"),
    }),
    update: useMutation({
      mutationFn: ({ id, data }: { id: string; data: Partial<Driver> }) => driverService.update(id, data),
      onSuccess: () => {
        invalidate();
        toast.updated();
      },
      onError: toast.failed("update"),
    }),
    remove: useMutation({
      mutationFn: (id: string) => driverService.remove(id),
      onSuccess: () => {
        invalidate();
        toast.deleted();
      },
      onError: toast.failed("delete"),
    }),
  };
};
