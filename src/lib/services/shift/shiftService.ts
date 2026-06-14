import { http } from "@/utils/http";
import { todayStr } from "@/utils/date";
import type { TodayResponse } from "@/types";

// "Today" must be resolved in the CLIENT's local frame — allocations and orders
// are saved against the admin's local calendar day (dayjs), while the server's
// default day is UTC. Sending our local day keeps the driver's today in step
// with what the admin allocated, regardless of server timezone.
export const shiftService = {
  today: async (driverId: string): Promise<TodayResponse> =>
    (
      await http.get("/shifts/today", {
        params: { driverId, date: todayStr() },
      })
    ).data,
  start: (driverId: string) =>
    http.post("/shifts", { driverId, date: todayStr() }),
  end: (shiftId: string) => http.post(`/shifts/${shiftId}/end`),
};
