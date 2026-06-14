import { useInfiniteList } from "@/hooks/useInfiniteList";
import { locationService } from "@/lib/services/location";
import type { Location } from "@/types";

export const useLocations = (params: Record<string, string>) =>
  useInfiniteList<Location>(["locations", params], (cursor) =>
    locationService.list({ ...params, limit: "20", ...(cursor ? { cursor } : {}) })
  );
