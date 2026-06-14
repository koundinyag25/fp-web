/** Expected server ping cadence (mirrors fp-server DRIVE_INTERVAL_MS). Markers
 *  tween over this window so each glide finishes as the next ping lands. */
export const PING_INTERVAL_MS = 6000;

/** How many active vehicles the map loads at once. The render cost is in the
 *  markers + roster, so we cap the set rather than draw the whole fleet. Bump
 *  this (or move to viewport-bounded / clustered loading) to show more. */
export const FLEET_ACTIVE_LIMIT = 10;

/** Initial map view (FR-LM). Centered on the San Jose / South Bay service area
 *  (seed bbox lat 37.2–37.55, lng −122.1..−121.7) so the fleet is in frame on
 *  first paint, before the data-driven flyTo kicks in. */
export const MAP_DEFAULT_CENTER: [number, number] = [37.375, -121.9];
export const MAP_DEFAULT_ZOOM = 11;

/** Marker tone per delivery status (FR-LM-2). */
export const FLEET_STATUS_COLOR: Record<string, string> = {
  in_transit: "#38bdf8", // teal — moving
  pending: "#f59e0b", // amber — queued
  completed: "#22c55e", // green
  failed: "#ef4444", // red
  idle: "#64748b", // slate
};
