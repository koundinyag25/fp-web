import { RefreshCw } from "lucide-react";
import { Button } from "@/atoms/Button";
import { IconButton } from "@/atoms/IconButton";
import { Spinner } from "@/atoms/Spinner";
import { DriverMetrics } from "@/molecules/DriverMetrics";
import { TripCard } from "@/molecules/TripCard";
import { VehicleCard } from "@/molecules/VehicleCard";
import { Shell } from "./Shell";
import { useDriverHomePage } from "./useDriverHomePage";

const DriverHome = () => {
  const vm = useDriverHomePage();

  if (vm.isLoading) {
    return (
      <Shell>
        <div className="flex flex-1 items-center justify-center">
          <Spinner label="Loading your day…" />
        </div>
      </Shell>
    );
  }
  if (vm.failed || !vm.data) {
    return (
      <Shell>
        <p className="text-on-surface-variant">Could not reach the API.</p>
      </Shell>
    );
  }

  const { data, vehicle } = vm;

  // Active shift → reveal the day's trips, even if there's no allocation for
  // TODAY (a shift can still be open from a previous day — the fleet map shows
  // it active, so the driver must see it too). Checked before the no-vehicle
  // block so an on-shift driver is never told "no vehicle today".
  if (data.activeShift) {
    return (
      <Shell max="max-w-3xl">
        <div className="mb-3 flex items-center justify-between rounded border border-border-hairline bg-surface-container px-3 py-2">
          <span className="text-body-sm text-on-surface-variant">
            Vehicle <span className="font-mono text-on-surface">{vehicle?.reg ?? "—"}</span>
          </span>
          <Button variant="danger" onClick={vm.endShift} disabled={vm.ending}>
            End shift
          </Button>
        </div>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-headline-md text-on-surface">Today's trips</h2>
          <IconButton
            icon={RefreshCw}
            label="Refresh trips"
            onClick={() => vm.refresh()}
            disabled={vm.refreshing}
            className={vm.refreshing ? "animate-spin" : ""}
          />
        </div>
        {vm.deliveries.length === 0 ? (
          <p className="text-body-md text-on-surface-variant">No trips assigned for today.</p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {vm.deliveries.map((d) => (
              <TripCard
                key={d._id}
                delivery={d}
                current={d._id === vm.current?._id}
                locked={!vm.canOpen(d.status, d._id)}
                onOpen={() => vm.openTrip(d.status, d._id)}
              />
            ))}
          </div>
        )}
      </Shell>
    );
  }

  // No active shift and nothing allocated today → blocked, contact admin.
  if (!data.allocation || !vehicle) {
    return (
      <Shell>
        <div className="rounded-lg border border-border-hairline bg-surface-container p-5">
          <p className="text-headline-md text-on-surface">No vehicle today</p>
          <p className="mt-2 text-body-md text-on-surface-variant">
            You don't have a vehicle allotted for {data.date}. Contact your admin for vehicle
            allotment.
          </p>
        </div>
        <Button variant="primary" className="mt-4" disabled>
          Start shift
        </Button>
      </Shell>
    );
  }

  // Allocated, no active shift → landing: hero vehicle + metrics + Start shift.
  return (
    <Shell>
      <VehicleCard reg={vehicle.reg} type={vehicle.type} capacity={vehicle.capacity} />
      <div className="mt-5">
        <p className="mb-2 font-mono text-label-caps uppercase tracking-wider text-on-surface-variant">
          Last 3 months
        </p>
        <DriverMetrics stats={vm.stats} loading={vm.statsLoading} />
      </div>
      <Button
        variant="primary"
        className="mt-6"
        disabled={!data.canStart || vm.starting}
        onClick={vm.startShift}
      >
        Start shift
      </Button>
    </Shell>
  );
};

export default DriverHome;
