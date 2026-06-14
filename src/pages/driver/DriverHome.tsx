import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { api } from "../../lib/api";

interface TodayResponse {
  date: string;
  canStart: boolean;
  allocation: { _id: string; vehicleId: { reg: string; type: string } } | null;
  activeShift: { _id: string; status: string } | null;
  deliveries: Delivery[];
  orders: { _id: string }[];
}

interface Delivery {
  _id: string;
  sequence: number;
  status: string;
  orderId: {
    quantity: number;
    destinationId?: { name: string };
    productId?: { name: string; unit: string };
  } | null;
}

export default function DriverHome() {
  const { driverId = "" } = useParams();
  const qc = useQueryClient();
  const todayKey = ["today", driverId];

  const { data, isLoading, isError } = useQuery<TodayResponse>({
    queryKey: todayKey,
    queryFn: async () => (await api.get("/shifts/today", { params: { driverId } })).data,
    refetchInterval: 5_000,
  });

  const onSuccess = () => qc.invalidateQueries({ queryKey: todayKey });

  const startShift = useMutation({ mutationFn: () => api.post("/shifts", { driverId }), onSuccess });
  const sendGps = useMutation({ mutationFn: () => api.post(`/drivers/${driverId}/gps`), onSuccess });
  const startDrive = useMutation({ mutationFn: () => api.post(`/drivers/${driverId}/drive/start`), onSuccess });
  const stopDrive = useMutation({ mutationFn: () => api.post(`/drivers/${driverId}/drive/stop`), onSuccess });
  const endShift = useMutation({
    mutationFn: (shiftId: string) => api.post(`/shifts/${shiftId}/end`),
    onSuccess,
  });
  const complete = useMutation({
    mutationFn: (id: string) => api.post(`/deliveries/${id}/complete`),
    onSuccess,
  });
  const fail = useMutation({
    mutationFn: (id: string) => api.post(`/deliveries/${id}/fail`, { reason: "Could not deliver" }),
    onSuccess,
  });

  if (isLoading) return <div className="container">Loading…</div>;
  if (isError || !data) return <div className="container">Could not reach the API.</div>;

  return (
    <div className="container">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <h1>Driver</h1>
        <Link to="/" className="muted">
          ← personas
        </Link>
      </div>

      <div className="card">
        <h2>Today · {data.date}</h2>
        {!data.allocation ? (
          <p className="muted">No vehicle allocated today — shift can't start (FR-SV-2).</p>
        ) : (
          <p>
            Vehicle <strong>{data.allocation.vehicleId.reg}</strong> ({data.allocation.vehicleId.type})
          </p>
        )}

        {!data.activeShift ? (
          <button disabled={!data.canStart || startShift.isPending} onClick={() => startShift.mutate()}>
            Start shift
          </button>
        ) : (
          <div className="row">
            <button onClick={() => sendGps.mutate()} disabled={sendGps.isPending}>
              Send GPS update
            </button>
            <button onClick={() => startDrive.mutate()}>Start driving</button>
            <button onClick={() => stopDrive.mutate()}>Stop</button>
            <button onClick={() => endShift.mutate(data.activeShift!._id)}>End shift</button>
          </div>
        )}
      </div>

      {data.deliveries.length > 0 && (
        <div className="card">
          <h2>Deliveries</h2>
          {data.deliveries.map((d) => (
            <div key={d._id} className="row" style={{ justifyContent: "space-between" }}>
              <span>
                #{d.sequence + 1} · {d.orderId?.productId?.name} {d.orderId?.quantity}
                {d.orderId?.productId?.unit ? ` ${d.orderId.productId.unit}` : ""} →{" "}
                {d.orderId?.destinationId?.name} <span className="badge">{d.status}</span>
              </span>
              {d.status !== "completed" && d.status !== "failed" && (
                <span className="row">
                  <button onClick={() => complete.mutate(d._id)}>Complete</button>
                  <button onClick={() => fail.mutate(d._id)}>Fail</button>
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
