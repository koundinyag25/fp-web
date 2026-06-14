import { useEffect, useState, type MutableRefObject } from "react";
import type { StreamStatus } from "@/hooks/fleet/useFleetStream";

interface LiveIndicatorProps {
  status: StreamStatus;
  lastPingAt: MutableRefObject<number | null>;
}

const agoLabel = (ms: number | null): string => {
  if (ms == null) return "no pings yet";
  const s = Math.max(0, Math.round((Date.now() - ms) / 1000));
  return `last ping ${s}s ago`;
};

/** SSE connection state + freshness of the last ping (FR-LM-4). Ticks once a
 *  second to age the "last ping" label — one render/s, never per ping. */
export const LiveIndicator = ({ status, lastPingAt }: LiveIndicatorProps) => {
  const [, tick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const live = status === "open";
  const label = status === "error" ? "RECONNECTING…" : live ? "LIVE · SSE CONNECTED" : "CONNECTING…";

  return (
    <div className="flex items-center gap-3">
      <span className="flex items-center gap-2">
        <span
          className={`h-2 w-2 rounded-full ${live ? "animate-pulse bg-success" : "bg-on-surface-variant"}`}
        />
        <span className={`font-mono text-label-caps uppercase ${live ? "text-success" : "text-on-surface-variant"}`}>
          {label}
        </span>
      </span>
      <span className="h-4 border-l border-border-hairline" />
      <span className="font-mono text-label-caps lowercase text-on-surface-variant">{agoLabel(lastPingAt.current)}</span>
    </div>
  );
};
