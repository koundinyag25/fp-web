import type { ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Brand } from "@/atoms/Brand";
import { Button } from "@/atoms/Button";
import { Spinner } from "@/atoms/Spinner";
import { useToast } from "@/hooks/useToast";
import { useDriverStats } from "@/hooks/driver/useDriverStats";
import { useShiftActions } from "@/hooks/shift/useShiftActions";
import { useShiftToday } from "@/hooks/shift/useShiftToday";
import { DriverMetrics } from "@/molecules/DriverMetrics";
import { TripCard } from "@/molecules/TripCard";
import { VehicleCard } from "@/molecules/VehicleCard";

const Shell = ({
  children,
  max = "max-w-md",
}: {
  children: ReactNode;
  max?: string;
}) => (
  <div
    className={`mx-auto flex min-h-screen w-full ${max} flex-col px-4 pb-10`}
  >
    <header className="flex h-14 shrink-0 items-center justify-between">
      <Brand />
      <Link
        to="/"
        className="text-body-sm text-on-surface-variant hover:text-on-surface"
      >
        ← personas
      </Link>
    </header>
    {children}
  </div>
);

const DriverHome = () => {
  const { driverId = "" } = useParams();
  const navigate = useNavigate();
  const { show } = useToast();
  const { data, isLoading, isError } = useShiftToday(driverId);
  const stats = useDriverStats(driverId);
  const shift = useShiftActions(driverId);

  if (isLoading) {
    return (
      <Shell>
        <div className="flex flex-1 items-center justify-center">
          <Spinner label="Loading your day…" />
        </div>
      </Shell>
    );
  }
  if (isError || !data) {
    return (
      <Shell>
        <p className="text-on-surface-variant">Could not reach the API.</p>
      </Shell>
    );
  }

  const vehicle = data.vehicle ?? data.allocation?.vehicleId ?? null;

  // Active shift → reveal the day's trips, even if there's no allocation for
  // TODAY (a shift can still be open from a previous day — the fleet map shows
  // it as active, so the driver must see it too). Checked before the no-vehicle
  // block so an on-shift driver is never told "no vehicle today".
  if (data.activeShift) {
    // The active stop is the one in transit (the truck is on it); otherwise the
    // earliest stop still to do.
    const current =
      data.deliveries.find((d) => d.status === "in_transit") ??
      data.deliveries.find(
        (d) => d.status !== "completed" && d.status !== "failed",
      );

    // Openable: the active stop (to act on) or a finished one (to review). A
    // future pending stop is locked until the earlier trips are done.
    const canOpen = (status: string, id: string) =>
      status === "completed" || status === "failed" || id === current?._id;
    const openTrip = (status: string, id: string) => {
      if (canOpen(status, id)) navigate(`/driver/${driverId}/trip/${id}`);
      else
        show({
          tone: "info",
          message: "Finish your current trip before you start this one.",
        });
    };
    return (
      <Shell max="max-w-3xl">
        <div className="mb-3 flex items-center justify-between rounded border border-border-hairline bg-surface-container px-3 py-2">
          <span className="text-body-sm text-on-surface-variant">
            Vehicle{" "}
            <span className="font-mono text-on-surface">{vehicle?.reg ?? "—"}</span>
          </span>
          <Button
            variant="danger"
            onClick={() => shift.end.mutate(data.activeShift!._id)}
            disabled={shift.end.isPending}
          >
            End shift
          </Button>
        </div>
        <h2 className="mb-2 text-headline-md text-on-surface">Today's trips</h2>
        {data.deliveries.length === 0 ? (
          <p className="text-body-md text-on-surface-variant">
            No trips assigned for today.
          </p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {data.deliveries.map((d) => (
              <TripCard
                key={d._id}
                delivery={d}
                current={d._id === current?._id}
                locked={!canOpen(d.status, d._id)}
                onOpen={() => openTrip(d.status, d._id)}
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
            You don't have a vehicle allotted for {data.date}. Contact your
            admin for vehicle allotment.
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
      <VehicleCard
        reg={vehicle.reg}
        type={vehicle.type}
        capacity={vehicle.capacity}
      />
      <div className="mt-5">
        <p className="mb-2 font-mono text-label-caps uppercase tracking-wider text-on-surface-variant">
          Last 3 months
        </p>
        <DriverMetrics stats={stats.data} loading={stats.isLoading} />
      </div>
      <Button
        variant="primary"
        className="mt-6"
        disabled={!data.canStart || shift.start.isPending}
        onClick={() => shift.start.mutate()}
      >
        Start shift
      </Button>
    </Shell>
  );
};

export default DriverHome;
