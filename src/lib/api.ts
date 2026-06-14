import axios from "axios";

// Same-origin /api in production (App Platform ingress); proxied in dev.
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE ?? "/api",
});

// SSE stream URL for the live fleet map (EventSource can't use axios).
export function streamUrl(params: Record<string, string> = {}): string {
  const base = import.meta.env.VITE_API_BASE ?? "/api";
  const qs = new URLSearchParams(params).toString();
  return `${base}/fleet/stream${qs ? `?${qs}` : ""}`;
}
