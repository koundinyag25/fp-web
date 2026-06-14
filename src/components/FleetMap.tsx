import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";
import { api, streamUrl } from "../lib/api";

interface ActiveVehicle {
  shiftId: string;
  driver: { _id: string; name: string } | null;
  vehicle: { _id: string; reg: string; type: string } | null;
  position: { lat: number; lng: number; ts: string } | null;
  deliveryStatus: string | null;
}

interface PingEvent {
  vehicleId: string;
  driverId: string;
  lat: number;
  lng: number;
  ts: string;
}

const DEFAULT_CENTER: [number, number] = [12.9716, 77.5946];

/**
 * Live fleet map (FR-LM-1/4). Seeds from /fleet/active, then applies live SSE
 * pings to move markers. This is a foundation — smooth tweening (rAF glide)
 * and per-driver/vehicle filters come next.
 */
export default function FleetMap() {
  const { data: initial } = useQuery<ActiveVehicle[]>({
    queryKey: ["fleet", "active"],
    queryFn: async () => (await api.get("/fleet/active")).data,
    refetchInterval: 30_000, // reconcile fallback (FRD §6)
  });

  // vehicleId -> live position, layered over the initial snapshot.
  const [positions, setPositions] = useState<Record<string, { lat: number; lng: number }>>({});
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const es = new EventSource(streamUrl());
    esRef.current = es;
    es.addEventListener("ping", (ev) => {
      const p: PingEvent = JSON.parse((ev as MessageEvent).data);
      setPositions((prev) => ({ ...prev, [p.vehicleId]: { lat: p.lat, lng: p.lng } }));
    });
    return () => es.close();
  }, []);

  const vehicles = (initial ?? []).filter((v) => v.position || v.vehicle);

  return (
    <MapContainer center={DEFAULT_CENTER} zoom={12} style={{ height: 420, borderRadius: 12 }}>
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {vehicles.map((v) => {
        const vid = v.vehicle?._id ?? "";
        const live = positions[vid];
        const pos = live ?? v.position;
        if (!pos) return null;
        return (
          <CircleMarker
            key={v.shiftId}
            center={[pos.lat, pos.lng]}
            radius={9}
            pathOptions={{ color: "#3b82f6", fillColor: "#3b82f6", fillOpacity: 0.8 }}
          >
            <Popup>
              <strong>{v.vehicle?.reg}</strong> ({v.vehicle?.type})
              <br />
              {v.driver?.name}
              <br />
              status: {v.deliveryStatus ?? "idle"}
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
