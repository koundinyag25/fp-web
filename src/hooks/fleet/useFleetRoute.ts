import { useQuery } from "@tanstack/react-query";
import { fleetService } from "@/lib/services/fleet";
import type { FleetRoute } from "@/types";

/** The selected vehicle's planned route (FR-MV-2). The geometry is static once
 *  fetched (the marker moves along it via the live SSE stream, not by refetching),
 *  so this is fetched once per selection — no polling. */
export const useFleetRoute = (deliveryId?: string) =>
  useQuery<FleetRoute>({
    queryKey: ["fleet", "route", deliveryId],
    queryFn: () => fleetService.route(deliveryId as string),
    enabled: Boolean(deliveryId),
  });
