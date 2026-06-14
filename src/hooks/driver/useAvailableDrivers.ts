import { allocationService } from "@/lib/services/allocation";
import { useInfiniteList } from "@/hooks/useInfiniteList";
import type { Driver } from "@/types";

/** Drivers free to take a vehicle on `date` (not already allotted one),
 *  searchable by name + cursor-paginated. Backs the allocate dialog's driver
 *  picker so it scales and never offers a double-booked driver. */
export const useAvailableDrivers = (date: string, search: string) =>
  useInfiniteList<Driver>(["drivers", "available", date, search], (cursor) => {
    const params: Record<string, string> = { date, limit: "20" };
    if (search) params.q = search;
    if (cursor) params.cursor = cursor;
    return allocationService.availableDrivers(params);
  });
