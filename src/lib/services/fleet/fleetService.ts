import { http } from "@/utils/http";
import type { ActiveVehicle, FleetRoute } from "@/types";

export const fleetService = {
  active: async (params?: Record<string, string>): Promise<ActiveVehicle[]> =>
    (await http.get("/fleet/active", { params })).data,
  route: async (deliveryId: string): Promise<FleetRoute> =>
    (await http.get(`/fleet/route/${deliveryId}`)).data,
};
