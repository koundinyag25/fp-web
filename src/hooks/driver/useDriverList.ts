import { useInfiniteList } from "@/hooks/useInfiniteList";
import { driverService } from "@/lib/services/driver";
import type { Driver } from "@/types";

/** Cursor-paginated driver list for the admin Drivers screen. */
export const useDriverList = (params: Record<string, string>) =>
  useInfiniteList<Driver>(["drivers", params], (cursor) =>
    driverService.list({ ...params, limit: "20", ...(cursor ? { cursor } : {}) })
  );
