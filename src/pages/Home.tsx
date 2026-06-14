import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api } from "../lib/api";

interface Driver {
  _id: string;
  name: string;
}

export default function Home() {
  const { data: drivers, isLoading, isError } = useQuery<Driver[]>({
    queryKey: ["drivers"],
    queryFn: async () => (await api.get("/drivers")).data,
  });

  return (
    <div className="container">
      <h1>FleetPanda</h1>
      <p className="muted">Pick a persona — no login (route-based, FRD §8.6).</p>

      <div className="card">
        <h2>Admin</h2>
        <Link to="/admin">
          <button>Open admin dashboard →</button>
        </Link>
      </div>

      <div className="card">
        <h2>Driver</h2>
        {isLoading && <p className="muted">Loading drivers…</p>}
        {isError && (
          <p className="muted">
            Could not reach the API. Is the backend running and seeded?
          </p>
        )}
        {drivers?.length === 0 && <p className="muted">No drivers yet — seed the backend.</p>}
        <div className="row">
          {drivers?.map((d) => (
            <Link key={d._id} to={`/driver/${d._id}`}>
              <button>{d.name}</button>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
