import { createRef, type MutableRefObject } from "react";
import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, it, expect, vi } from "vitest";
import { useFleetAnimation, type Movable } from "./useFleetAnimation";
import type { LivePing } from "./useFleetStream";
import { PING_INTERVAL_MS } from "@/config/fleet";

// Capture the rAF callback so we can step frames deterministically.
let frameCb: FrameRequestCallback | null = null;

const setup = () => {
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
    frameCb = cb;
    return 1;
  });
  vi.stubGlobal("cancelAnimationFrame", () => {});
};

afterEach(() => {
  frameCb = null;
  vi.unstubAllGlobals();
});

const refOf = <T,>(v: T): MutableRefObject<T> => {
  const r = createRef<T>() as MutableRefObject<T>;
  r.current = v;
  return r;
};

describe("useFleetAnimation", () => {
  it("seeds a marker then glides it toward a new ping", () => {
    setup();
    const calls: [number, number][] = [];
    const marker: Movable = { setLatLng: ([lat, lng]) => calls.push([lat, lng]) };

    const markersRef = refOf(new Map<string, Movable>([["v1", marker]]));
    const pingsRef = refOf(new Map<string, LivePing>());
    const seedsRef = refOf(new Map<string, LivePing>([["v1", { lat: 0, lng: 0, ts: "t0" }]]));

    renderHook(() => useFleetAnimation(markersRef, pingsRef, seedsRef));

    const last = () => calls[calls.length - 1];

    // Frame 1: places at the seed, no tween.
    act(() => frameCb!(0));
    expect(last()).toEqual([0, 0]);

    // A new ping arrives → this frame retargets (startT = now), still at origin.
    const pingAt = 1000;
    pingsRef.current.set("v1", { lat: 10, lng: 20, ts: "t1" });
    act(() => frameCb!(pingAt));
    expect(last()).toEqual([0, 0]);

    // A frame halfway through the tween window is mid-glide toward the target.
    act(() => frameCb!(pingAt + PING_INTERVAL_MS / 2));
    const [lat, lng] = last();
    expect(lat).toBeGreaterThan(0);
    expect(lat).toBeLessThan(10);
    expect(lng).toBeGreaterThan(0);

    // At/after the full interval it lands on the target.
    act(() => frameCb!(pingAt + PING_INTERVAL_MS));
    expect(last()).toEqual([10, 20]);
  });
});
