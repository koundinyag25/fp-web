import { useEffect, useMemo, useRef, useState } from "react";
import { RefreshCw } from "lucide-react";
import { AutoSizer } from "react-virtualized-auto-sizer";
import { MapContainer, Marker, Polyline, Popup, TileLayer } from "react-leaflet";
import { SearchInput } from "@/atoms/SearchInput";
import { FLEET_STATUS_COLOR, MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM } from "@/config/fleet";
import { useDebounce } from "@/hooks/useDebounce";
import { useFleetActive } from "@/hooks/fleet/useFleetActive";
import {
  useFleetAnimation,
  type Movable,
} from "@/hooks/fleet/useFleetAnimation";
import { useFleetRoute } from "@/hooks/fleet/useFleetRoute";
import { useFleetStream, type LivePing } from "@/hooks/fleet/useFleetStream";
import { ActiveFleetList } from "@/molecules/ActiveFleetList";
import { LiveIndicator } from "@/molecules/LiveIndicator";
import { PageHeader } from "@/molecules/PageHeader";
import { FleetMapController, MapInvalidate } from "./MapControls";
import { END_ICON, START_ICON, truckIcon } from "./markers";

/**
 * Live fleet map (FR-LM). Full-bleed dark map with a floating live-status pill
 * (top-right) and an active-fleet roster (left). Seeds from
 * /fleet/active, then a single rAF loop glides each canvas marker toward its
 * latest SSE ping (FR-LM-4) — React never re-renders on a ping, so it scales to
 * 100+ vehicles. Selecting a card or marker focuses the vehicle on the map.
 */
export const FleetMap = () => {
  // The live map tracks vehicles actually out on a delivery. Pending (not yet
  // departed) and idle (a shift with no stop left to run) aren't "live", so we
  // only load in-transit vehicles — the map stays purely the moving fleet.
  const { data, refetch, isFetching } = useFleetActive({ deliveryStatus: "in_transit" });
  const {
    pings: pingsRef,
    lastPingAt,
    status: streamStatus,
  } = useFleetStream();
  const [q, setQ] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const debouncedQ = useDebounce(q, 250);

  const rows = useMemo(() => {
    let r = data ?? [];
    if (debouncedQ.trim()) {
      const s = debouncedQ.trim().toLowerCase();
      r = r.filter(
        (x) =>
          x.vehicle?.reg?.toLowerCase().includes(s) ||
          x.driver?.name?.toLowerCase().includes(s),
      );
    }
    return r.filter(
      (x) =>
        x.vehicle?._id && (pingsRef.current.get(x.vehicle._id) || x.position),
    );
  }, [data, debouncedQ, pingsRef]);

  const seedsRef = useRef<Map<string, LivePing>>(new Map());
  seedsRef.current = useMemo(() => {
    const m = new Map<string, LivePing>();
    for (const r of data ?? []) {
      if (r.vehicle?._id && r.position) m.set(r.vehicle._id, { ...r.position });
    }
    return m;
  }, [data]);

  const markersRef = useRef<Map<string, Movable>>(new Map());
  useFleetAnimation(markersRef, pingsRef, seedsRef);

  // Selected vehicle's driven path (FR-MV-2) — fetched + periodically refreshed
  // so the trail grows as it moves.
  const selectedRow = useMemo(
    () =>
      selectedId
        ? (data ?? []).find((r) => r.vehicle?._id === selectedId)
        : undefined,
    [selectedId, data],
  );
  const { data: route } = useFleetRoute(selectedRow?.currentDelivery?._id);

  // The whole fleet moves on its own (server fleet stepper) — clicking a vehicle
  // just focuses it and draws its route. Center on the route's START so the run
  // reads from the beginning rather than jumping to the destination end.
  const focus = useMemo<[number, number] | null>(() => {
    const f = route?.from;
    return f?.lat != null && f.lng != null ? [f.lat, f.lng] : null;
  }, [route?.from?.lat, route?.from?.lng]);

  // Open the selected vehicle's popup automatically (no need to click the
  // marker). Deferred a tick so the marker is registered/re-rendered first.
  useEffect(() => {
    if (!selectedId) return;
    const id = setTimeout(
      () => markersRef.current.get(selectedId)?.openPopup?.(),
      50,
    );
    return () => clearTimeout(id);
  }, [selectedId]);

  // Search + refresh live in the page header (next to the "Live fleet" title)
  // rather than floating over the map.
  const headerActions = (
    <div className="flex flex-wrap items-center gap-2">
      <SearchInput
        placeholder="Driver / vehicle"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <span className="h-6 border-l border-border-hairline" />
      <button
        type="button"
        onClick={() => refetch()}
        disabled={isFetching}
        aria-label="Refresh"
        className="flex h-8 items-center gap-1 rounded px-2 font-mono text-code-sm text-on-surface-variant hover:bg-surface-hover disabled:opacity-60"
      >
        <RefreshCw
          size={14}
          strokeWidth={1.75}
          className={isFetching ? "animate-spin" : ""}
        />
        Refresh
      </button>
    </div>
  );

  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Live fleet" actions={headerActions} />
      <div className="flex min-h-0 flex-1 flex-col gap-3 lg:flex-row">
        {/* Docked roster — its own column, so it never occludes the map/markers. */}
        <aside className="flex max-h-72 w-full shrink-0 flex-col overflow-hidden rounded border border-border-hairline bg-surface-container lg:max-h-none lg:w-72">
          <ActiveFleetList
            rows={rows}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </aside>

        <div className="relative min-h-[420px] flex-1 overflow-hidden rounded border border-border-hairline">
          <AutoSizer
            renderProp={({ width, height }) =>
              !width || !height ? null : (
                <MapContainer
                  center={MAP_DEFAULT_CENTER}
                  zoom={MAP_DEFAULT_ZOOM}
                  preferCanvas
                  style={{ height, width }}
                >
                  <TileLayer
                    attribution="&copy; OpenStreetMap, &copy; CARTO"
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  />
                  <MapInvalidate width={width} height={height} />
                  <FleetMapController focus={focus} />
                  {/* Selected vehicle's route: driven path + source/destination (FR-MV-2). */}
                  {route && route.path.length > 1 && (
                    <Polyline
                      positions={route.path.map(
                        (p) => [p.lat, p.lng] as [number, number],
                      )}
                      pathOptions={{
                        color: "#38bdf8",
                        weight: 3,
                        opacity: 0.7,
                        dashArray: "4 6",
                      }}
                    />
                  )}
                  {route?.from?.lat != null && route.from.lng != null && (
                    <Marker
                      position={[route.from.lat, route.from.lng]}
                      icon={START_ICON}
                    >
                      <Popup>Start: {route.from.name}</Popup>
                    </Marker>
                  )}
                  {route?.to?.lat != null && route.to.lng != null && (
                    <Marker
                      position={[route.to.lat, route.to.lng]}
                      icon={END_ICON}
                    >
                      <Popup>Destination: {route.to.name}</Popup>
                    </Marker>
                  )}
                  {rows.map((v) => {
                    const vid = v.vehicle!._id;
                    const seed = pingsRef.current.get(vid) ?? v.position!;
                    const color =
                      FLEET_STATUS_COLOR[v.deliveryStatus ?? "idle"] ??
                      FLEET_STATUS_COLOR.idle;
                    const selected = vid === selectedId;
                    return (
                      <Marker
                        key={vid}
                        position={[seed.lat, seed.lng]}
                        icon={truckIcon(color, selected)}
                        eventHandlers={{ click: () => setSelectedId(vid) }}
                        ref={(layer: Movable | null) => {
                          if (layer) markersRef.current.set(vid, layer);
                          else markersRef.current.delete(vid);
                        }}
                      >
                        <Popup>
                          <strong>{v.vehicle?.reg}</strong> ({v.vehicle?.type})
                          <br />
                          {v.driver?.name}
                          <br />
                          status: {v.deliveryStatus ?? "idle"}
                          {v.currentDelivery?.orderId?.destinationId?.name ? (
                            <>
                              <br />→{" "}
                              {v.currentDelivery.orderId.destinationId.name}
                            </>
                          ) : null}
                        </Popup>
                      </Marker>
                    );
                  })}
                </MapContainer>
              )
            }
          />

          {/* Floating live-status pill (top-right) — doesn't meaningfully occlude. */}
          <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-end gap-3 p-3">
            <div className="pg-glass pointer-events-auto flex h-8 items-center rounded-full border border-border-hairline px-4">
              <LiveIndicator status={streamStatus} lastPingAt={lastPingAt} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
