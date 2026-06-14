import { useQuery } from "@tanstack/react-query";
import { fleetService } from "@/lib/services/fleet";
import type { ActiveVehicle } from "@/types";

export const useFleetActive = (params: Record<string, string> = {}) =>
  useQuery<ActiveVehicle[]>({
    queryKey: ["fleet", "active", params],
    queryFn: () => fleetService.active(params),
    refetchInterval: 30_000, // reconcile fallback for the SSE stream
  });
