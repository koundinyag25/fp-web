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

  it("skips markers with no ping/seed and ones lacking setLatLng", () => {
    setup();
    const calls: [number, number][] = [];
    const good: Movable = { setLatLng: ([lat, lng]) => calls.push([lat, lng]) };
    // No setLatLng function → must be skipped without throwing.
    const broken = {} as unknown as Movable;

    const markersRef = refOf(
      new Map<string, Movable>([
        ["good", good],
        ["noTarget", good], // present in markers but absent from pings + seeds
        ["broken", broken],
      ])
    );
    const pingsRef = refOf(new Map<string, LivePing>());
    const seedsRef = refOf(new Map<string, LivePing>([["good", { lat: 5, lng: 6, ts: "s0" }]]));

    renderHook(() => useFleetAnimation(markersRef, pingsRef, seedsRef));

    act(() => frameCb!(0));
    // Only the one with both a target and a setLatLng got placed.
    expect(calls).toEqual([[5, 6]]);
  });

  it("does not re-target when the same ping ts arrives again", () => {
    setup();
    const calls: [number, number][] = [];
    const marker: Movable = { setLatLng: ([lat, lng]) => calls.push([lat, lng]) };
    const markersRef = refOf(new Map<string, Movable>([["v1", marker]]));
    const pingsRef = refOf(new Map<string, LivePing>([["v1", { lat: 0, lng: 0, ts: "t0" }]]));
    const seedsRef = refOf(new Map<string, LivePing>());

    renderHook(() => useFleetAnimation(markersRef, pingsRef, seedsRef));

    act(() => frameCb!(0)); // seed → places at origin
    // Same ts, already settled at the target → snap guard skips setLatLng.
    act(() => frameCb!(PING_INTERVAL_MS + 1));
    expect(calls).toEqual([[0, 0]]);
  });

  it("prunes animation state for markers that leave the fleet", () => {
    setup();
    const calls: [number, number][] = [];
    const marker: Movable = { setLatLng: ([lat, lng]) => calls.push([lat, lng]) };
    const markersRef = refOf(
      new Map<string, Movable>([
        ["v1", marker],
        ["v2", marker],
      ])
    );
    const pingsRef = refOf(
      new Map<string, LivePing>([
        ["v1", { lat: 1, lng: 1, ts: "a" }],
        ["v2", { lat: 2, lng: 2, ts: "b" }],
      ])
    );
    const seedsRef = refOf(new Map<string, LivePing>());

    renderHook(() => useFleetAnimation(markersRef, pingsRef, seedsRef));

    act(() => frameCb!(0)); // seeds both → anim state has v1 + v2
    expect(calls).toHaveLength(2);

    // v2 leaves the fleet; next frame must drop its stale anim state (lines 95-99)
    // without error and only place the survivor.
    calls.length = 0;
    markersRef.current.delete("v2");
    act(() => frameCb!(PING_INTERVAL_MS + 1));
    // v1 is already settled (same ts) so nothing new is drawn, but the pruning
    // branch runs because anim size (2) > markers size (1).
    expect(calls).toHaveLength(0);
    // A fresh ping for v1 proves the loop still works after pruning. The frame
    // that sees the new ts re-targets (startT = now), then a later frame settles
    // it on the target.
    pingsRef.current.set("v1", { lat: 9, lng: 9, ts: "c" });
    act(() => frameCb!(PING_INTERVAL_MS * 3)); // retarget from (1,1)
    act(() => frameCb!(PING_INTERVAL_MS * 5)); // elapsed >= interval → snap to (9,9)
    expect(calls[calls.length - 1]).toEqual([9, 9]);
  });

  it("no-ops when requestAnimationFrame is unavailable", () => {
    vi.stubGlobal("requestAnimationFrame", undefined);
    const markersRef = refOf(new Map<string, Movable>());
    const pingsRef = refOf(new Map<string, LivePing>());
    const seedsRef = refOf(new Map<string, LivePing>());
    // Mounting must not throw even though there's no rAF to schedule.
    expect(() => renderHook(() => useFleetAnimation(markersRef, pingsRef, seedsRef))).not.toThrow();
  });
});
