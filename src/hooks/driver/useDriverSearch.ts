import { driverService } from "@/lib/services/driver";
import { useInfiniteList } from "@/hooks/useInfiniteList";
import type { Driver } from "@/types";

/** Searchable, cursor-paginated driver list (search by name). Backs the order
 *  assign-driver picker so a long roster stays usable. */
export const useDriverSearch = (search: string) =>
  useInfiniteList<Driver>(["drivers", "search", search], (cursor) => {
    const params: Record<string, string> = { limit: "20" };
    if (search) params.q = search;
    if (cursor) params.cursor = cursor;
    return driverService.list(params);
  });
