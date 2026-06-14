import { useQuery } from "@tanstack/react-query";
import { movementService } from "@/lib/services/movement";
import type { Movement } from "@/types";

export const useMovements = (params?: Record<string, string>) =>
  useQuery<Movement[]>({
    queryKey: ["movements", params ?? {}],
    queryFn: () => movementService.list(params),
  });
