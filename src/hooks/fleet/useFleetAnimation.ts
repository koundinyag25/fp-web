import { useEffect, useRef, type MutableRefObject } from "react";
import { PING_INTERVAL_MS } from "@/config/fleet";
import { easeOut, lerp } from "@/utils/geo";
import type { LivePing } from "./useFleetStream";

/** Minimal Leaflet marker surface we drive — keeps this hook leaflet-type-free. */
export interface Movable {
  setLatLng: (latlng: [number, number]) => void;
  openPopup?: () => void;
}

interface Anim {
  lat: number;
  lng: number;
  fromLat: number;
  fromLng: number;
  toLat: number;
  toLng: number;
  startT: number;
  lastTs: string;
}

/**
 * One requestAnimationFrame loop that glides every marker from its current
 * rendered position toward its latest ping over ~one ping interval. Because the
 * server emits a ping every DRIVE_INTERVAL_MS, each marker finishes its tween
 * just as the next target arrives → continuous, snap-free motion (FR-LM-4).
 *
 * Cost is O(markers) per frame of pure number-crunching + one `setLatLng` each
 * (a canvas redraw, not a React render), so 100+ vehicles stay at 60fps.
 */
export const useFleetAnimation = (
  markersRef: MutableRefObject<Map<string, Movable>>,
  pingsRef: MutableRefObject<Map<string, LivePing>>,
  seedsRef: MutableRefObject<Map<string, LivePing>>
): void => {
  const animRef = useRef<Map<string, Anim>>(new Map());

  useEffect(() => {
    if (typeof requestAnimationFrame === "undefined") return;
    let raf = 0;

    const frame = (now: number) => {
      markersRef.current.forEach((marker, vid) => {
        const target = pingsRef.current.get(vid) ?? seedsRef.current.get(vid);
        if (!target || typeof marker.setLatLng !== "function") return;

        let st = animRef.current.get(vid);
        if (!st) {
          // First sighting — place it, no tween.
          st = {
            lat: target.lat,
            lng: target.lng,
            fromLat: target.lat,
            fromLng: target.lng,
            toLat: target.lat,
            toLng: target.lng,
            startT: now,
            lastTs: target.ts,
          };
          animRef.current.set(vid, st);
          marker.setLatLng([st.lat, st.lng]);
          return;
        }

        // A new ping (different ts) re-targets the glide from where we are now.
        if (target.ts !== st.lastTs) {
          st.fromLat = st.lat;
          st.fromLng = st.lng;
          st.toLat = target.lat;
          st.toLng = target.lng;
          st.startT = now;
          st.lastTs = target.ts;
        }

        const elapsed = now - st.startT;
        if (elapsed >= PING_INTERVAL_MS) {
          // Settled at the target — snap once, then skip further frames so idle
          // markers cost nothing (important now that vehicles are DOM markers).
          if (st.lat !== st.toLat || st.lng !== st.toLng) {
            st.lat = st.toLat;
            st.lng = st.toLng;
            marker.setLatLng([st.lat, st.lng]);
          }
          return;
        }

        const t = easeOut(elapsed / PING_INTERVAL_MS);
        st.lat = lerp(st.fromLat, st.toLat, t);
        st.lng = lerp(st.fromLng, st.toLng, t);
        marker.setLatLng([st.lat, st.lng]);
      });

      // Drop anim state for markers that have left the fleet.
      if (animRef.current.size > markersRef.current.size) {
        for (const vid of animRef.current.keys()) {
          if (!markersRef.current.has(vid)) animRef.current.delete(vid);
        }
      }

      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [markersRef, pingsRef, seedsRef]);
};
