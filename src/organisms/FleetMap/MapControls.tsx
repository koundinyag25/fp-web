import { useEffect } from "react";
import { useMap } from "react-leaflet";

// Headless react-leaflet helpers for the fleet map — each reaches the map via
// useMap and renders nothing.

/** Flies to a focus point (the selected route's start) when it changes. */
export const FleetMapController = ({ focus }: { focus: [number, number] | null }) => {
  const map = useMap();
  useEffect(() => {
    if (focus && typeof map?.flyTo === "function") {
      map.flyTo(focus, Math.max(map.getZoom?.() ?? 12, 13), { duration: 0.6 });
    }
  }, [focus, map]);
  return null;
};

/**
 * Leaflet caches its container size at init and doesn't notice CSS resizes, so a
 * flex/responsive layout leaves it grey or mis-sized. AutoSizer feeds the map
 * explicit pixel dims; whenever they change (mount, window resize) we re-sync
 * Leaflet with invalidateSize.
 */
export const MapInvalidate = ({ width, height }: { width: number; height: number }) => {
  const map = useMap();
  useEffect(() => {
    if (map && typeof map.invalidateSize === "function") map.invalidateSize();
  }, [map, width, height]);
  return null;
};
