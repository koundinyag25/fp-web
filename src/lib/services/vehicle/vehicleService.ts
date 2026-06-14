import { http } from "@/utils/http";
import type { Page, Vehicle } from "@/types";

export const vehicleService = {
  list: async (params?: Record<string, string>): Promise<Page<Vehicle>> =>
    (await http.get("/vehicles", { params })).data,
  create: (data: Partial<Vehicle>) => http.post("/vehicles", data),
  update: (id: string, data: Partial<Vehicle>) => http.put(`/vehicles/${id}`, data),
  remove: (id: string) => http.delete(`/vehicles/${id}`),
};
