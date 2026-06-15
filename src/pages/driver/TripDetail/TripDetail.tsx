import { ArrowLeft, MapPin, PackageCheck, RefreshCw, Warehouse } from "lucide-react";
import { Badge } from "@/atoms/Badge";
import { Button } from "@/atoms/Button";
import { IconButton } from "@/atoms/IconButton";
import { Spinner } from "@/atoms/Spinner";
import { FailReasonModal } from "@/organisms/FailReasonModal";
import { TripMap } from "@/organisms/TripMap";
import { useTripDetailPage } from "./useTripDetailPage";

const statusTone = (status: string): "success" | "critical" | "info" | "warning" => {
  if (status === "completed") return "success";
  if (status === "failed") return "critical";
  if (status === "in_transit") return "info";
  return "warning";
};

const TripDetail = () => {
  const vm = useTripDetailPage();

  if (vm.loading) {
    return (
      <div className="mx-auto flex min-h-screen max-w-md items-center justify-center">
        <Spinner label="Loading trip…" />
      </div>
    );
  }
  if (!vm.delivery) {
    return (
      <div className="mx-auto max-w-md p-4">
        <button
          type="button"
          onClick={vm.back}
          className="flex items-center gap-1 text-on-surface-variant"
        >
          <ArrowLeft size={18} strokeWidth={1.75} /> Back
        </button>
        <p className="mt-4 text-on-surface-variant">Trip not found.</p>
      </div>
    );
  }

  const delivery = vm.delivery;
  const order = delivery.orderId;

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col lg:max-w-none">
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border-hairline px-4">
        <button
          type="button"
          onClick={vm.back}
          aria-label="Back"
          className="text-on-surface-variant hover:text-on-surface"
        >
          <ArrowLeft size={20} strokeWidth={1.75} />
        </button>
        <span className="font-mono text-code-md text-on-surface">Stop {delivery.sequence + 1}</span>
        <Badge tone={statusTone(delivery.status)}>{delivery.status}</Badge>
        <IconButton
          icon={RefreshCw}
          label="Refresh trip"
          onClick={() => vm.refresh()}
          disabled={vm.refreshing}
          className={`ml-auto ${vm.refreshing ? "animate-spin" : ""}`}
        />
      </header>

      {/* Stacked on mobile (map over details); side-by-side on desktop (map fills
          the left, details + actions in a scrollable right panel). */}
      <div className="flex flex-1 flex-col lg:flex-row lg:overflow-hidden">
        <div className="h-[40vh] min-h-[260px] w-full shrink-0 lg:h-auto lg:flex-1">
          <TripMap vehicleId={vm.vehicleId} route={vm.route} pingsRef={vm.pings} />
        </div>

        <div className="flex flex-1 flex-col gap-4 p-4 lg:w-[400px] lg:flex-none lg:overflow-y-auto lg:border-l lg:border-border-hairline">
          <div className="rounded-lg border border-border-hairline bg-surface-container p-4">
            <p className="text-headline-md text-on-surface">
              {order?.productId?.name} · {order?.quantity}
              {order?.productId?.unit ? ` ${order.productId.unit}` : ""}
            </p>
            <div className="mt-3 flex flex-col gap-2 text-body-sm">
              <p className="flex items-center gap-2 text-on-surface-variant">
                <Warehouse size={14} strokeWidth={1.75} /> {order?.sourceHubId?.name ?? "—"}
              </p>
              <p className="flex items-center gap-2 text-on-surface">
                <MapPin size={14} strokeWidth={1.75} /> {order?.destinationId?.name ?? "—"}
              </p>
              {order?.startTime && (
                <p className="text-on-surface-variant">Scheduled {order.startTime}</p>
              )}
            </div>
          </div>

          <div className="mt-auto flex flex-col gap-2">
            {vm.terminal ? (
              <div className="rounded-lg border border-border-hairline bg-surface-container p-3 text-center text-body-md text-on-surface-variant">
                This stop is {delivery.status}.
              </div>
            ) : !vm.isCurrent ? (
              <p className="py-2 text-center text-body-sm text-on-surface-variant">
                Complete your earlier stops first.
              </p>
            ) : (
              <>
                {vm.driving ? (
                  <Button variant="primary" onClick={vm.endTrip} disabled={vm.completing}>
                    <span className="flex items-center justify-center gap-2">
                      <PackageCheck size={16} strokeWidth={1.75} /> Finish order
                    </span>
                  </Button>
                ) : (
                  <Button variant="primary" onClick={vm.startTrip} disabled={vm.starting}>
                    Start trip
                  </Button>
                )}
                <Button variant="danger" onClick={vm.openFail}>
                  Mark failed
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <FailReasonModal
        open={vm.failOpen}
        onClose={vm.closeFail}
        onSubmit={vm.submitFail}
        pending={vm.failing}
      />
    </div>
  );
};

export default TripDetail;
