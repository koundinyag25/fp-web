import { useQuery } from "@tanstack/react-query";
import { allocationService } from "@/lib/services/allocation";
import type { Allocation } from "@/types";

/** Allocations within a date range — the visible calendar week (FR-VA-2). */
export const useAllocations = (params: Record<string, string>) =>
  useQuery<Allocation[]>({
    queryKey: ["allocations", "range", params],
    queryFn: () => allocationService.list(params),
  });
