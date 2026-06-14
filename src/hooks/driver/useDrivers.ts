import { useQuery } from "@tanstack/react-query";
import { driverService } from "@/lib/services/driver";
import type { Driver } from "@/types";

/** Flat driver list (first page, high limit) — for pickers like the role switcher. */
export const useDrivers = () =>
  useQuery<Driver[]>({
    queryKey: ["drivers", "picker"],
    queryFn: async () => (await driverService.list({ limit: "100" })).items,
  });
