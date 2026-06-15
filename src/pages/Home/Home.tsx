import { Link } from "react-router-dom";
import { Truck } from "lucide-react";
import { Badge } from "@/atoms/Badge";
import { Button } from "@/atoms/Button";
import { Card } from "@/atoms/Card";
import { useDrivers } from "@/hooks/driver/useDrivers";

/** Entrance / role switch (S0, FRD §8.6). No login — a persona is picked by
 *  route. Calm and centered on the dot-grid canvas: a short AIM blurb frames
 *  what FleetPanda is, then Admin and Driver cards route into the two modules. */
const Home = () => {
  const { data: drivers, isLoading, isError } = useDrivers();

  return (
    <div className="flex min-h-full items-center justify-center p-6">
      <div className="w-full max-w-[560px] py-8">
        {/* Brand mark + subtitle */}
        <div className="mb-2 flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded bg-primary text-primary-on">
            <Truck size={18} strokeWidth={2} />
          </span>
          <h1 className="font-mono text-headline-md font-bold tracking-tight text-on-surface">
            FleetPanda
          </h1>
        </div>
        <p className="mb-6 text-body-sm text-on-surface-variant">
          Fleet tracking console — pick a persona to continue.
        </p>

        {/* AIM — what this is, in one breath */}
        <Card className="relative mb-4 overflow-hidden">
          <span className="pg-scanline" />
          <p className="mb-1.5 font-mono text-label-caps uppercase text-primary">
            Aim
          </p>
          <p className="text-body-md text-on-surface-variant">
            FleetPanda is a live fleet-tracking console. Dispatchers manage
            master data, orders, inventory and vehicle allocation, then watch
            the fleet on a live map. Drivers run today's shift and emit
            simulated GPS updates — each ping glides their vehicle across the
            admin map in near-real-time. One shared data layer, two views of the
            same operation.
          </p>
        </Card>

        {/* Admin / Dispatcher */}
        <Card className="mb-3">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-headline-md text-on-surface">
                Admin / Dispatcher
              </h2>
              <p className="mt-0.5 text-body-sm text-on-surface-variant">
                Manage master data, orders, allocation, inventory, and the live
                fleet map.
              </p>
            </div>
            <span className="shrink-0 font-mono text-label-caps uppercase text-outline">
              desktop
            </span>
          </div>
          <Link to="/admin">
            <Button variant="primary">Enter admin dashboard →</Button>
          </Link>
        </Card>

        {/* Driver */}
        <Card>
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-headline-md text-on-surface">Driver</h2>
              <p className="mt-0.5 text-body-sm text-on-surface-variant">
                Run today's shift, drive deliveries, send GPS.
              </p>
            </div>
            <span className="shrink-0 font-mono text-label-caps uppercase text-outline">
              mobile
            </span>
          </div>

          {isLoading && (
            <div
              role="status"
              aria-label="Loading drivers"
              className="grid grid-cols-1 gap-2 sm:grid-cols-2"
            >
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="h-12 animate-pulse rounded border border-border-hairline bg-surface-hover"
                />
              ))}
            </div>
          )}

          {isError && (
            <p className="text-body-sm text-on-surface-variant">
              Couldn't reach the API — is the backend running and seeded?
            </p>
          )}

          {!isLoading && !isError && drivers?.length === 0 && (
            <Badge>No drivers yet — seed the backend</Badge>
          )}

          {drivers && drivers.length > 0 && (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {drivers.map((d) => (
                <Link key={d._id} to={`/driver/${d._id}`} className="block">
                  <Button
                    variant="secondary"
                    className="flex min-h-[44px] w-full flex-col items-start justify-center gap-0.5 py-1.5"
                  >
                    <span className="text-body-md text-on-surface">
                      {d.name}
                    </span>
                    {d.phone && (
                      <span className="font-mono text-label-caps uppercase text-on-surface-variant">
                        {d.phone}
                      </span>
                    )}
                  </Button>
                </Link>
              ))}
            </div>
          )}
        </Card>

        <p className="mt-4 text-center font-mono text-code-sm text-outline">
          No authentication — persona is selected by route (/admin,
          /driver/:id).
        </p>
      </div>
    </div>
  );
};

export default Home;
