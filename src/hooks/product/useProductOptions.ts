import { useQuery } from "@tanstack/react-query";
import { productService } from "@/lib/services/product";
import type { Product } from "@/types";

/** Flat product list for form selects. */
export const useProductOptions = () =>
  useQuery<Product[]>({
    queryKey: ["products", "options"],
    queryFn: async () => (await productService.list({ limit: "100" })).items,
  });
