import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCrudToasts } from "@/hooks/useCrudToasts";
import { productService } from "@/lib/services/product";
import type { Product } from "@/types";

export const useProductMutations = () => {
  const qc = useQueryClient();
  const toast = useCrudToasts("Product");
  const invalidate = () => qc.invalidateQueries({ queryKey: ["products"] });
  return {
    create: useMutation({
      mutationFn: (data: Partial<Product>) => productService.create(data),
      onSuccess: () => {
        invalidate();
        toast.created();
      },
      onError: toast.failed("create"),
    }),
    update: useMutation({
      mutationFn: ({ id, data }: { id: string; data: Partial<Product> }) => productService.update(id, data),
      onSuccess: () => {
        invalidate();
        toast.updated();
      },
      onError: toast.failed("update"),
    }),
    remove: useMutation({
      mutationFn: (id: string) => productService.remove(id),
      onSuccess: () => {
        invalidate();
        toast.deleted();
      },
      onError: toast.failed("delete"),
    }),
  };
};
