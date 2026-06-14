import { useInfiniteList } from "@/hooks/useInfiniteList";
import { productService } from "@/lib/services/product";
import type { Product } from "@/types";

export const useProducts = (params: Record<string, string>) =>
  useInfiniteList<Product>(["products", params], (cursor) =>
    productService.list({ ...params, limit: "20", ...(cursor ? { cursor } : {}) })
  );
