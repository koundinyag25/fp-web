import { useMemo, useState } from "react";
import { ArrowLeft, MapPin, PackageCheck, Warehouse } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Badge } from "@/atoms/Badge";
import { Button } from "@/atoms/Button";
import { Spinner } from "@/atoms/Spinner";
import { useDeliveryActions } from "@/hooks/delivery/useDeliveryActions";
import { useDriverGps } from "@/hooks/driver/useDriverGps";
import { useFleetRoute } from "@/hooks/fleet/useFleetRoute";
import { useFleetStream } from "@/hooks/fleet/useFleetStream";
import { useShiftToday } from "@/hooks/shift/useShiftToday";
import { FailReasonModal } from "@/organisms/FailReasonModal";
import { TripMap } from "@/organisms/TripMap";

const statusTone = (
  status: string,
): "success" | "critical" | "info" | "warning" => {
  if (status === "completed") return "success";
  if (status === "failed") return "critical";
  if (status === "in_transit") return "info";
  return "warning";
};

const TripDetail = () => {
  const { driverId = "", deliveryId = "" } = useParams();
  const navigate = useNavigate();
  const back = () => navigate(`/driver/${driverId}`);

  const { data, isLoading } = useShiftToday(driverId);
  const { pings } = useFleetStream();
  const { data: route } = useFleetRoute(deliveryId);
  const gps = useDriverGps(driverId);
  const actions = useDeliveryActions(driverId);

  const [started, setStarted] = useState(false);
  const [failOpen, setFailOpen] = useState(false);
  console.log("TripDetail data:", data);
  // Key the live marker off the ACTIVE SHIFT's vehicle — that's what GPS pings
  // are keyed by. The today allocation can be absent (e.g. a shift still open
  // from a previous day) or point at a different vehicle, which would leave the
  // truck marker keyed wrong and never gliding. Fall back to the allocation.
  const vehicleId =
    data?.activeShift?.vehicleId ?? data?.allocation?.vehicleId?._id ?? "";

  const delivery = useMemo(
    () => data?.deliveries.find((d) => d._id === deliveryId),
    [data, deliveryId],
  );
  // The active stop is the one in transit (truck is on it), else the earliest to do.
  const current =
    data?.deliveries.find((d) => d.status === "in_transit") ??
    data?.deliveries.find(
      (d) => d.status !== "completed" && d.status !== "failed",
    );

  if (isLoading || !data) {
    return (
      <div className="mx-auto flex min-h-screen max-w-md items-center justify-center">
        <Spinner label="Loading trip…" />
      </div>
    );
  }
  if (!delivery) {
    return (
      <div className="mx-auto max-w-md p-4">
        <button
          type="button"
          onClick={back}
          className="flex items-center gap-1 text-on-surface-variant"
        >
          <ArrowLeft size={18} strokeWidth={1.75} /> Back
        </button>
        <p className="mt-4 text-on-surface-variant">Trip not found.</p>
      </div>
    );
  }

  const order = delivery.orderId;
  const terminal =
    delivery.status === "completed" || delivery.status === "failed";
  const isCurrent = delivery._id === current?._id;
  // Under way once the driver taps start (or it's already in transit) — then they
  // can finish the order; before that, they start the trip.
  const driving = started || delivery.status === "in_transit";

  const startTrip = () => {
    setStarted(true);
    gps.startDrive.mutate(true); // replay=true → drive the whole leg from the source
  };
  const endTrip = () =>
    actions.complete.mutate(delivery._id, { onSuccess: back });
  const submitFail = (reason: string) =>
    actions.fail.mutate(
      { id: delivery._id, reason },
      {
        onSuccess: () => {
          setFailOpen(false);
          back();
        },
      },
    );

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col lg:max-w-none">
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border-hairline px-4">
        <button
          type="button"
          onClick={back}
          aria-label="Back"
          className="text-on-surface-variant hover:text-on-surface"
        >
          <ArrowLeft size={20} strokeWidth={1.75} />
        </button>
        <span className="font-mono text-code-md text-on-surface">
          Stop {delivery.sequence + 1}
        </span>
        <Badge tone={statusTone(delivery.status)}>{delivery.status}</Badge>
      </header>

      {/* Stacked on mobile (map over details); side-by-side on desktop (map fills
          the left, details + actions in a scrollable right panel). */}
      <div className="flex flex-1 flex-col lg:flex-row lg:overflow-hidden">
        <div className="h-[40vh] min-h-[260px] w-full shrink-0 lg:h-auto lg:flex-1">
          <TripMap vehicleId={vehicleId} route={route} pingsRef={pings} />
        </div>

        <div className="flex flex-1 flex-col gap-4 p-4 lg:w-[400px] lg:flex-none lg:overflow-y-auto lg:border-l lg:border-border-hairline">
          <div className="rounded-lg border border-border-hairline bg-surface-container p-4">
            <p className="text-headline-md text-on-surface">
              {order?.productId?.name} · {order?.quantity}
              {order?.productId?.unit ? ` ${order.productId.unit}` : ""}
            </p>
            <div className="mt-3 flex flex-col gap-2 text-body-sm">
              <p className="flex items-center gap-2 text-on-surface-variant">
                <Warehouse size={14} strokeWidth={1.75} />{" "}
                {order?.sourceHubId?.name ?? "—"}
              </p>
              <p className="flex items-center gap-2 text-on-surface">
                <MapPin size={14} strokeWidth={1.75} />{" "}
                {order?.destinationId?.name ?? "—"}
              </p>
              {order?.startTime && (
                <p className="text-on-surface-variant">
                  Scheduled {order.startTime}
                </p>
              )}
            </div>
          </div>

          <div className="mt-auto flex flex-col gap-2">
            {terminal ? (
              <div className="rounded-lg border border-border-hairline bg-surface-container p-3 text-center text-body-md text-on-surface-variant">
                This stop is {delivery.status}.
              </div>
            ) : !isCurrent ? (
              <p className="py-2 text-center text-body-sm text-on-surface-variant">
                Complete your earlier stops first.
              </p>
            ) : (
              <>
                {driving ? (
                  <Button
                    variant="primary"
                    onClick={endTrip}
                    disabled={actions.complete.isPending}
                  >
                    <span className="flex items-center justify-center gap-2">
                      <PackageCheck size={16} strokeWidth={1.75} /> Finish order
                    </span>
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    onClick={startTrip}
                    disabled={gps.startDrive.isPending}
                  >
                    Start trip
                  </Button>
                )}
                <Button variant="danger" onClick={() => setFailOpen(true)}>
                  Mark failed
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <FailReasonModal
        open={failOpen}
        onClose={() => setFailOpen(false)}
        onSubmit={submitFail}
        pending={actions.fail.isPending}
      />
    </div>
  );
};

export default TripDetail;
