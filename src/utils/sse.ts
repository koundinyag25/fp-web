// Pure URL helper for the live fleet SSE stream. Lives apart from the axios
// client (http.ts) because EventSource can't use axios — any layer may import
// this; only lib/services may import http.ts.
export const streamUrl = (params: Record<string, string> = {}): string => {
  const base = import.meta.env.VITE_API_BASE ?? "/api";
  const qs = new URLSearchParams(params).toString();
  return `${base}/fleet/stream${qs ? `?${qs}` : ""}`;
};
