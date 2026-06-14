import { useEffect, useRef, useState, type MutableRefObject } from "react";
import { streamUrl } from "@/utils/sse";
import type { PingEvent } from "@/types";

export interface LivePing {
  lat: number;
  lng: number;
  ts: string;
}

export type StreamStatus = "connecting" | "open" | "error";

export interface FleetStream {
  /** Latest ping per vehicle — a ref, read by the animation loop (no renders). */
  pings: MutableRefObject<Map<string, LivePing>>;
  /** Wall-clock ms of the last ping received (ref; drives the "last ping" label). */
  lastPingAt: MutableRefObject<number | null>;
  /** SSE connection state for the live indicator (FR-LM-4). */
  status: StreamStatus;
}

/**
 * Subscribes to the live GPS SSE stream. Pings land in a **ref** (not state):
 * at 100 vehicles × ~1 ping/2s that's ~50 events/s, and routing each through
 * setState would re-render the marker list 50×/s. The animation loop reads the
 * ref every frame, so pings cost zero React renders. Only the connection
 * status (rare) is React state.
 */
export const useFleetStream = (params: Record<string, string> = {}): FleetStream => {
  const pings = useRef<Map<string, LivePing>>(new Map());
  const lastPingAt = useRef<number | null>(null);
  const [status, setStatus] = useState<StreamStatus>("connecting");
  const key = JSON.stringify(params);

  useEffect(() => {
    setStatus("connecting");
    const es = new EventSource(streamUrl(params));
    es.addEventListener("open", () => setStatus("open"));
    es.addEventListener("error", () => setStatus("error")); // EventSource auto-reconnects
    es.addEventListener("ping", (ev) => {
      const p: PingEvent = JSON.parse((ev as MessageEvent).data);
      pings.current.set(p.vehicleId, { lat: p.lat, lng: p.lng, ts: p.ts });
      lastPingAt.current = Date.now();
    });
    return () => es.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return { pings, lastPingAt, status };
};
