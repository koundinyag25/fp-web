import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDeliveryActions } from "@/hooks/delivery/useDeliveryActions";
import { useDriverGps } from "@/hooks/driver/useDriverGps";
import { useFleetRoute } from "@/hooks/fleet/useFleetRoute";
import { useFleetStream } from "@/hooks/fleet/useFleetStream";
import { useShiftToday } from "@/hooks/shift/useShiftToday";

/**
 * View-model for the driver trip-detail screen: composes the shift / route / GPS
 * hooks, derives the current + openable state, and exposes the trip actions. The
 * page component stays declarative.
 */
export const useTripDetailPage = () => {
  const { driverId = "", deliveryId = "" } = useParams();
  const navigate = useNavigate();
  const back = () => navigate(`/driver/${driverId}`);

  const { data, isLoading, refetch, isFetching } = useShiftToday(driverId);
  const { pings } = useFleetStream();
  const { data: route } = useFleetRoute(deliveryId);
  const gps = useDriverGps(driverId);
  const actions = useDeliveryActions(driverId);

  const [started, setStarted] = useState(false);
  const [failOpen, setFailOpen] = useState(false);

  // Key the live marker off the ACTIVE SHIFT's vehicle — that's what GPS pings
  // are keyed by. The today allocation can be absent (a shift still open from a
  // previous day) or point at a different vehicle. Fall back to the allocation.
  const vehicleId = data?.activeShift?.vehicleId ?? data?.allocation?.vehicleId?._id ?? "";

  const delivery = useMemo(
    () => data?.deliveries.find((d) => d._id === deliveryId),
    [data, deliveryId],
  );
  // The active stop is the one in transit (truck is on it), else the earliest to do.
  const current =
    data?.deliveries.find((d) => d.status === "in_transit") ??
    data?.deliveries.find((d) => d.status !== "completed" && d.status !== "failed");

  const terminal = delivery?.status === "completed" || delivery?.status === "failed";
  const isCurrent = !!delivery && delivery._id === current?._id;
  // Under way once the driver taps start (or it's already in transit).
  const driving = started || delivery?.status === "in_transit";

  const startTrip = () => {
    setStarted(true);
    gps.startDrive.mutate(true); // replay=true → drive the whole leg from the source
  };
  const endTrip = () => {
    if (delivery) actions.complete.mutate(delivery._id, { onSuccess: back });
  };
  const submitFail = (reason: string) => {
    if (!delivery) return;
    actions.fail.mutate(
      { id: delivery._id, reason },
      {
        onSuccess: () => {
          setFailOpen(false);
          back();
        },
      },
    );
  };

  return {
    loading: isLoading || !data,
    refresh: refetch,
    refreshing: isFetching,
    delivery,
    route,
    pings,
    vehicleId,
    terminal,
    isCurrent,
    driving,
    failOpen,
    openFail: () => setFailOpen(true),
    closeFail: () => setFailOpen(false),
    starting: gps.startDrive.isPending,
    completing: actions.complete.isPending,
    failing: actions.fail.isPending,
    back,
    startTrip,
    endTrip,
    submitFail,
  };
};
