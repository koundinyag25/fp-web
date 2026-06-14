import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCrudToasts } from "@/hooks/useCrudToasts";
import { locationService } from "@/lib/services/location";
import type { Location } from "@/types";

export const useLocationMutations = () => {
  const qc = useQueryClient();
  const toast = useCrudToasts("Location");
  const invalidate = () => qc.invalidateQueries({ queryKey: ["locations"] });
  return {
    create: useMutation({
      mutationFn: (data: Partial<Location>) => locationService.create(data),
      onSuccess: () => {
        invalidate();
        toast.created();
      },
      onError: toast.failed("create"),
    }),
    update: useMutation({
      mutationFn: ({ id, data }: { id: string; data: Partial<Location> }) => locationService.update(id, data),
      onSuccess: () => {
        invalidate();
        toast.updated();
      },
      onError: toast.failed("update"),
    }),
    remove: useMutation({
      mutationFn: (id: string) => locationService.remove(id),
      onSuccess: () => {
        invalidate();
        toast.deleted();
      },
      onError: toast.failed("delete"),
    }),
  };
};
