import { http } from "@/utils/http";
import type { Page, Product } from "@/types";

export const productService = {
  list: async (params?: Record<string, string>): Promise<Page<Product>> =>
    (await http.get("/products", { params })).data,
  create: (data: Partial<Product>) => http.post("/products", data),
  update: (id: string, data: Partial<Product>) => http.put(`/products/${id}`, data),
  remove: (id: string) => http.delete(`/products/${id}`),
};
