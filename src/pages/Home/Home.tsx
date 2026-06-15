import { useState } from "react";
import { ArrowRight, LayoutDashboard, Truck, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/atoms/Button";
import { Card } from "@/atoms/Card";
import { useDriverSearch } from "@/hooks/driver/useDriverSearch";
import { useDebounce } from "@/hooks/useDebounce";
import { Combobox } from "@/molecules/Combobox";

/**
 * Entrance / role switch (S0, FRD §8.6). No login — a persona is picked by route.
 * Two ways in: enter the admin console, or pick a driver from the dropdown and
 * drop into that driver's app.
 */
const Home = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const debounced = useDebounce(search);
  const drivers = useDriverSearch(debounced);

  return (
    <div className="flex min-h-full items-center justify-center p-6">
      <div className="w-full max-w-[680px] py-8">
        {/* Brand + tagline */}
        <div className="mb-2 flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded bg-primary text-primary-on">
            <Truck size={18} strokeWidth={2} />
          </span>
          <h1 className="font-mono text-headline-md font-bold tracking-tight text-on-surface">
            FleetPanda
          </h1>
        </div>
        <p className="mb-6 text-body-sm text-on-surface-variant">
          Live fleet-tracking console — manage the operation as an admin, or run today's shift as a
          driver. No login; your persona is the route.
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Access as Admin */}
          <Card className="flex flex-col">
            <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <LayoutDashboard size={20} strokeWidth={1.75} />
            </span>
            <h2 className="text-headline-md text-on-surface">Access as Admin</h2>
            <p className="mt-1 text-body-sm text-on-surface-variant">
              Master data, orders, allocation, inventory, and the live fleet map.
            </p>
            <Button
              variant="primary"
              className="mt-4 flex w-full items-center justify-center gap-1"
              onClick={() => navigate("/admin")}
            >
              Enter admin <ArrowRight size={16} strokeWidth={1.75} />
            </Button>
          </Card>

          {/* Access as Driver */}
          <Card className="flex flex-col">
            <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <UserRound size={20} strokeWidth={1.75} />
            </span>
            <h2 className="text-headline-md text-on-surface">Access as Driver</h2>
            <p className="mt-1 text-body-sm text-on-surface-variant">
              Run today's shift, drive deliveries, send GPS.
            </p>
            <div className="mt-4">
              <Combobox
                value={null}
                onSelect={(o) => navigate(`/driver/${o.id}`)}
                search={search}
                onSearchChange={setSearch}
                options={drivers.items.map((d) => ({
                  id: d._id,
                  label: d.name,
                  sublabel: d.phone,
                }))}
                isLoading={drivers.isLoading}
                hasMore={drivers.hasNextPage}
                isLoadingMore={drivers.isFetchingNextPage}
                onLoadMore={drivers.fetchNextPage}
                placeholder="Select a driver…"
                searchPlaceholder="Search driver by name…"
                emptyLabel="No drivers — seed the backend"
              />
            </div>
          </Card>
        </div>

        <p className="mt-6 text-center font-mono text-code-sm text-outline">
          No authentication — persona is selected by route (/admin · /driver/:id).
        </p>
      </div>
    </div>
  );
};

export default Home;
