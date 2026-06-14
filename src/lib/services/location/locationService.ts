import { http } from "@/utils/http";
import type { Location, Page } from "@/types";

export const locationService = {
  list: async (params?: Record<string, string>): Promise<Page<Location>> =>
    (await http.get("/locations", { params })).data,
  create: (data: Partial<Location>) => http.post("/locations", data),
  update: (id: string, data: Partial<Location>) => http.put(`/locations/${id}`, data),
  remove: (id: string) => http.delete(`/locations/${id}`),
};
