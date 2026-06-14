import { useInfiniteList } from "@/hooks/useInfiniteList";
import { vehicleService } from "@/lib/services/vehicle";
import type { Vehicle } from "@/types";

export const useVehicles = (params: Record<string, string>) =>
  useInfiniteList<Vehicle>(["vehicles", params], (cursor) =>
    vehicleService.list({ ...params, limit: "20", ...(cursor ? { cursor } : {}) })
  );
