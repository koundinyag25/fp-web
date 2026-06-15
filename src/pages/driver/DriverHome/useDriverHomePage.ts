import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/hooks/useToast";
import { useDriverStats } from "@/hooks/driver/useDriverStats";
import { useShiftActions } from "@/hooks/shift/useShiftActions";
import { useShiftToday } from "@/hooks/shift/useShiftToday";

/**
 * View-model for the driver home screen: today's shift, the resolved vehicle,
 * trip open/lock rules, and the start/end-shift actions. The page component just
 * picks the right render state from these.
 */
export const useDriverHomePage = () => {
  const { driverId = "" } = useParams();
  const navigate = useNavigate();
  const { show } = useToast();
  const { data, isLoading, isError, refetch, isFetching } = useShiftToday(driverId);
  const stats = useDriverStats(driverId);
  const shift = useShiftActions(driverId);

  // Resolved on-shift vehicle: today's allocation, or (for a shift open from a
  // previous day with no allocation) the active shift's own vehicle.
  const vehicle = data?.vehicle ?? data?.allocation?.vehicleId ?? null;

  const deliveries = data?.deliveries ?? [];
  // The active stop is the one in transit (the truck is on it); else the earliest
  // stop still to do.
  const current =
    deliveries.find((d) => d.status === "in_transit") ??
    deliveries.find((d) => d.status !== "completed" && d.status !== "failed");

  // Openable: the active stop (to act on) or a finished one (to review). A future
  // pending stop is locked until the earlier trips are done.
  const canOpen = (status: string, id: string) =>
    status === "completed" || status === "failed" || id === current?._id;
  const openTrip = (status: string, id: string) => {
    if (canOpen(status, id)) navigate(`/driver/${driverId}/trip/${id}`);
    else show({ tone: "info", message: "Finish your current trip before you start this one." });
  };

  return {
    isLoading,
    failed: isError || !data,
    refresh: refetch,
    refreshing: isFetching,
    data,
    vehicle,
    deliveries,
    current,
    canOpen,
    openTrip,
    stats: stats.data,
    statsLoading: stats.isLoading,
    startShift: () => shift.start.mutate(),
    starting: shift.start.isPending,
    endShift: () => {
      if (data?.activeShift) shift.end.mutate(data.activeShift._id);
    },
    ending: shift.end.isPending,
  };
};
