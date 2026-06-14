import { describe, it, expect } from "vitest";
import { streamUrl } from "./sse";

// FR-LM-4 / FR-DM-4: clients open the live fleet SSE stream as an EventSource.
// streamUrl builds that endpoint; default base is "/api" (same-origin ingress).

describe("streamUrl", () => {
  it("returns the bare stream endpoint with no params", () => {
    expect(streamUrl()).toBe("/api/fleet/stream");
  });

  it("appends a single query param", () => {
    expect(streamUrl({ driverId: "d1" })).toBe("/api/fleet/stream?driverId=d1");
  });

  it("appends and encodes multiple params", () => {
    const url = streamUrl({ driverId: "d 1", vehicleId: "v&2" });
    expect(url.startsWith("/api/fleet/stream?")).toBe(true);
    expect(url).toContain("driverId=d+1");
    expect(url).toContain("vehicleId=v%262");
  });

  it("omits the query string for an empty params object", () => {
    expect(streamUrl({})).toBe("/api/fleet/stream");
  });
});
