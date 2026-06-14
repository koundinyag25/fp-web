import { useQuery } from "@tanstack/react-query";
import { allocationService } from "@/lib/services/allocation";
import type { AllocationSummary } from "@/types";

/** Fleet size + allocation counts for a date or range (keyed under
 *  "allocations" so allocate/remove mutations invalidate it too). */
export const useAllocationSummary = (params: Record<string, string>) =>
  useQuery<AllocationSummary>({
    queryKey: ["allocations", "summary", params],
    queryFn: () => allocationService.summary(params),
  });
