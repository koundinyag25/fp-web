import { useEffect, useMemo, useRef, type MutableRefObject } from "react";
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from "react-leaflet";
import { divIcon, latLngBounds } from "leaflet";
import { MAP_DEFAULT_CENTER } from "@/config/fleet";
import { useFleetAnimation, type Movable } from "@/hooks/fleet/useFleetAnimation";
import type { LivePing } from "@/hooks/fleet/useFleetStream";
import type { FleetRoute } from "@/types";

const DEFAULT_CENTER: [number, number] = MAP_DEFAULT_CENTER;

const TRUCK_SVG =
  '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" ' +
  'stroke-linejoin="round" style="width:60%;height:60%"><path d="M14 18V6a1 1 0 0 0-1-1H3a1 1 0 0 0-1 ' +
  '1v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62' +
  'l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>';

const TRUCK_ICON = divIcon({
  className: "",
  html:
    '<div style="width:30px;height:30px;border-radius:50%;background:#38bdf8;border:2px solid #fff;' +
    `display:flex;align-items:center;justify-content:center;box-shadow:0 0 6px rgba(0,0,0,.55)">${TRUCK_SVG}</div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

const DEST_ICON = divIcon({
  className: "",
  html:
    '<svg width="22" height="28" viewBox="0 0 24 24" fill="#22c55e" stroke="#0b1326" ' +
    'stroke-width="1.5" stroke-linejoin="round"><path d="M12 2C8.1 2 5 5.1 5 9c0 4.9 7 13 ' +
    '7 13s7-8.1 7-13c0-3.9-3.1-7-7-7z"/><circle cx="12" cy="9" r="2.6" fill="#0b1326"/></svg>',
  iconSize: [22, 28],
  iconAnchor: [11, 28],
});

/** Fit the view to the route and re-sync Leaflet's cached size on mount. */
const FitRoute = ({ path }: { path: { lat: number; lng: number }[] }) => {
  const map = useMap();
  useEffect(() => {
    if (typeof map?.invalidateSize === "function") map.invalidateSize();
    if (path.length > 0 && typeof map?.fitBounds === "function") {
      map.fitBounds(latLngBounds(path.map((p) => [p.lat, p.lng] as [number, number])), { padding: [40, 40] });
    }
  }, [path, map]);
  return null;
};

interface TripMapProps {
  vehicleId: string;
  route?: FleetRoute;
  pingsRef: MutableRefObject<Map<string, LivePing>>;
}

/**
 * Single-vehicle live map for the driver's trip detail (FR-DM-1/2/3): the route
 * polyline, a destination pin, and the driver's truck marker glided toward each
 * SSE ping via the shared rAF engine.
 */
export const TripMap = ({ vehicleId, route, pingsRef }: TripMapProps) => {
  const markersRef = useRef<Map<string, Movable>>(new Map());
  const seedsRef = useRef<Map<string, LivePing>>(new Map());
  seedsRef.current = useMemo(() => {
    const m = new Map<string, LivePing>();
    const from = route?.from;
    if (from?.lat != null && from.lng != null) m.set(vehicleId, { lat: from.lat, lng: from.lng, ts: "seed" });
    return m;
  }, [route, vehicleId]);

  useFleetAnimation(markersRef, pingsRef, seedsRef);

  const path = route?.path ?? [];
  const from = route?.from;
  const center: [number, number] =
    from?.lat != null && from.lng != null ? [from.lat, from.lng] : DEFAULT_CENTER;
  const seed = pingsRef.current.get(vehicleId) ?? seedsRef.current.get(vehicleId);

  return (
    <MapContainer
      center={center}
      zoom={12}
      preferCanvas
      className="isolate"
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap, &copy; CARTO"
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      <FitRoute path={path} />
      {path.length > 1 && (
        <Polyline
          positions={path.map((p) => [p.lat, p.lng] as [number, number])}
          pathOptions={{ color: "#38bdf8", weight: 3, opacity: 0.7, dashArray: "4 6" }}
        />
      )}
      {route?.to?.lat != null && route.to.lng != null && (
        <Marker position={[route.to.lat, route.to.lng]} icon={DEST_ICON}>
          <Popup>{route.to.name}</Popup>
        </Marker>
      )}
      {seed && (
        <Marker
          position={[seed.lat, seed.lng]}
          icon={TRUCK_ICON}
          ref={(layer: Movable | null) => {
            if (layer) markersRef.current.set(vehicleId, layer);
            else markersRef.current.delete(vehicleId);
          }}
        />
      )}
    </MapContainer>
  );
};
