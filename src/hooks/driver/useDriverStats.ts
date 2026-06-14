import { useQuery } from "@tanstack/react-query";
import { driverService } from "@/lib/services/driver";
import type { DriverStats } from "@/types";

/** Driver landing metrics (completed/failed over the last ~3 months). */
export const useDriverStats = (driverId: string) =>
  useQuery<DriverStats>({
    queryKey: ["driver", "stats", driverId],
    queryFn: () => driverService.stats(driverId),
    enabled: Boolean(driverId),
  });
