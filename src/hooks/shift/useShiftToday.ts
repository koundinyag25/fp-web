import { useQuery } from "@tanstack/react-query";
import { shiftService } from "@/lib/services/shift";
import type { TodayResponse } from "@/types";

export const useShiftToday = (driverId: string) => {
  return useQuery<TodayResponse>({
    queryKey: ["today", driverId],
    queryFn: () => shiftService.today(driverId),
    refetchInterval: 5_000,
  });
}
