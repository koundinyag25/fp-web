import { useQuery } from "@tanstack/react-query";
import { shiftService } from "@/lib/services/shift";
import type { TodayResponse } from "@/types";

export const useShiftToday = (driverId: string) => {
  return useQuery<TodayResponse>({
    queryKey: ["today", driverId],
    queryFn: () => shiftService.today(driverId),
    // The driver's own actions already invalidate this key (instant), and live
    // position is SSE — so this slow poll only picks up dispatch's external
    // changes (a newly assigned trip). The screens also expose a manual refresh.
    refetchInterval: 20_000,
  });
}
