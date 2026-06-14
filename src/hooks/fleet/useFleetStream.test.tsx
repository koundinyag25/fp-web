import { act, renderHook } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { MockEventSource } from "@/test/mocks";
import { useFleetStream } from "./useFleetStream";

describe("useFleetStream", () => {
  it("opens the SSE stream, tracks status, and records the latest ping per vehicle in a ref", () => {
    const { result } = renderHook(() => useFleetStream());
    expect(MockEventSource.last().url).toContain("/fleet/stream");
    expect(result.current.status).toBe("connecting");

    act(() => MockEventSource.last().emit("open", {}));
    expect(result.current.status).toBe("open");

    act(() => {
      MockEventSource.last().emit("ping", { vehicleId: "v1", driverId: "d1", lat: 1.5, lng: 2.5, ts: "t1" });
      MockEventSource.last().emit("ping", { vehicleId: "v1", driverId: "d1", lat: 3, lng: 4, ts: "t2" });
    });

    expect(result.current.pings.current.get("v1")).toEqual({ lat: 3, lng: 4, ts: "t2" });
    expect(result.current.lastPingAt.current).not.toBeNull();
  });
});
