import { useQuery } from "@tanstack/react-query";
import { locationService } from "@/lib/services/location";
import type { Location } from "@/types";

/** Flat location list for form selects, optionally narrowed by type. */
export const useLocationOptions = (type?: "hub" | "terminal") =>
  useQuery<Location[]>({
    queryKey: ["locations", "options", type ?? "all"],
    queryFn: async () => (await locationService.list({ limit: "100", ...(type ? { type } : {}) })).items,
  });
