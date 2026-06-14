import { http } from "@/utils/http";
import type { Driver, DriverStats, Page } from "@/types";

export const driverService = {
  list: async (params?: Record<string, string>): Promise<Page<Driver>> =>
    (await http.get("/drivers", { params })).data,
  create: (data: Partial<Driver>) => http.post("/drivers", data),
  update: (id: string, data: Partial<Driver>) => http.put(`/drivers/${id}`, data),
  remove: (id: string) => http.delete(`/drivers/${id}`),
  // Driver landing metrics over the last ~3 months.
  stats: async (driverId: string): Promise<DriverStats> =>
    (await http.get(`/drivers/${driverId}/stats`)).data,
  // simulated GPS controls (FR-DM-4)
  sendGps: (driverId: string) => http.post(`/drivers/${driverId}/gps`),
  // replay=true rewinds the current leg to its start (admin map "watch" flow).
  startDrive: (driverId: string, replay = false) =>
    http.post(`/drivers/${driverId}/drive/start`, { replay }),
  stopDrive: (driverId: string) => http.post(`/drivers/${driverId}/drive/stop`),
};
