import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import FleetMap from "../../components/FleetMap";
import { api } from "../../lib/api";

export default function AdminDashboard() {
  const { data: counts } = useQuery<Record<string, number>>({
    queryKey: ["orders", "counts"],
    queryFn: async () => (await api.get("/orders/counts")).data,
    refetchInterval: 15_000,
  });

  return (
    <div className="container">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <h1>Admin dashboard</h1>
        <Link to="/" className="muted">
          ← personas
        </Link>
      </div>

      <div className="card">
        <h2>Live fleet</h2>
        <FleetMap />
      </div>

      <div className="card">
        <h2>Orders</h2>
        <div className="row">
          {counts ? (
            Object.entries(counts).map(([status, n]) => (
              <span key={status} className="badge">
                {status}: {n}
              </span>
            ))
          ) : (
            <span className="muted">loading…</span>
          )}
        </div>
        <p className="muted" style={{ marginTop: "0.75rem" }}>
          Master data, order, allocation, inventory and movement screens are wired on the API and
          land here next.
        </p>
      </div>
    </div>
  );
}
