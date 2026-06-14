import { http } from "@/utils/http";
import type { Allocation, AllocationSummary, Driver, Page } from "@/types";

export const allocationService = {
  list: async (params?: Record<string, string>): Promise<Allocation[]> =>
    (await http.get("/allocations", { params })).data,
  create: (data: { vehicleId: string; driverId: string; date: string }) =>
    http.post("/allocations", data),
  remove: (id: string) => http.delete(`/allocations/${id}`),
  /** Fleet size + allocations in a date or range (date / from+to). */
  summary: async (params: Record<string, string>): Promise<AllocationSummary> =>
    (await http.get("/allocations/summary", { params })).data,
  /** Drivers not yet allotted a vehicle on a date — cursor-paginated, searchable. */
  availableDrivers: async (params: Record<string, string>): Promise<Page<Driver>> =>
    (await http.get("/allocations/available-drivers", { params })).data,
};
