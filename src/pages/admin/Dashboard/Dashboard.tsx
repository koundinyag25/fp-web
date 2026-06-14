import dayjs from "dayjs";
import {
  AlertTriangle,
  ArrowRight,
  ClipboardList,
  Navigation,
  Truck,
} from "lucide-react";
import { Link } from "react-router-dom";
import { StatusPill } from "@/atoms/StatusPill";
import { MetricCard } from "@/molecules/MetricCard";
import { PageHeader } from "@/molecules/PageHeader";
import { useDashboardPage } from "./useDashboardPage";

const Dashboard = () => {
  const { metrics, statusCounts, totalOrders, movements } = useDashboardPage();

  return (
    <>
      <PageHeader
        title="Dashboard"
        actions={
          <span className="flex items-center gap-2 text-body-sm text-on-surface-variant">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            Updated just now
          </span>
        }
      />

      {/* Metric cards — each drills into its source screen */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Active vehicles"
          value={metrics.activeVehicles}
          icon={<Truck size={16} strokeWidth={1.75} />}
          hint="on the road now"
          to="/admin/fleet"
        />
        <MetricCard
          label="Open orders"
          value={metrics.openOrders}
          icon={<ClipboardList size={16} strokeWidth={1.75} />}
          hint="pending + assigned"
          to="/admin/orders"
        />
        <MetricCard
          label="In transit"
          value={metrics.inTransit}
          icon={<Navigation size={16} strokeWidth={1.75} />}
          hint="out for delivery"
          to="/admin/fleet"
        />
        <MetricCard
          label="Low-stock cells"
          value={metrics.lowStockCells}
          tone="warning"
          icon={<AlertTriangle size={16} strokeWidth={1.75} />}
          hint="need restock"
          to="/admin/inventory"
        />
      </div>

      {/* Recent movements + orders by status */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent movements */}
        <div className="flex flex-col overflow-hidden rounded border border-border-hairline bg-surface-container lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border-hairline p-4">
            <h2 className="text-body-md font-medium text-on-surface">Recent movements</h2>
            <Link
              to="/admin/inventory"
              className="flex items-center gap-1 font-mono text-code-sm text-primary"
            >
              Inventory <ArrowRight size={14} strokeWidth={1.75} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] border-collapse text-left">
              <thead className="border-b border-border-hairline bg-surface-recessed font-mono text-label-caps uppercase text-outline">
                <tr>
                  <th className="p-3 pl-4 font-normal">Product</th>
                  <th className="p-3 font-normal">Route</th>
                  <th className="p-3 font-normal">Qty</th>
                  <th className="p-3 font-normal">Time</th>
                </tr>
              </thead>
              <tbody className="font-mono text-body-md text-on-surface">
                {movements.map((m) => (
                  <tr
                    key={m._id}
                    className="border-b border-border-hairline last:border-0 hover:bg-surface-hover"
                  >
                    <td className="p-3 pl-4">{m.productId?.name ?? "—"}</td>
                    <td className="p-3 text-on-surface-variant">
                      <span className="text-on-surface">{m.fromLocationId?.name}</span>
                      <span className="mx-1 text-primary">→</span>
                      {m.toLocationId?.name}
                    </td>
                    <td className="p-3">{`${m.quantity}${m.productId?.unit ? ` ${m.productId.unit}` : ""}`}</td>
                    <td className="p-3 text-on-surface-variant">
                      {dayjs(m.completedAt).format("HH:mm")}
                    </td>
                  </tr>
                ))}
                {movements.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-6 text-center font-ui text-on-surface-variant">
                      No movements yet — complete a delivery to populate the ledger.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Orders by status — proportional bars */}
        <div className="flex flex-col rounded border border-border-hairline bg-surface-container">
          <div className="flex items-center justify-between border-b border-border-hairline p-4">
            <h2 className="text-body-md font-medium text-on-surface">Orders by status</h2>
            <Link
              to="/admin/orders"
              className="flex items-center gap-1 font-mono text-code-sm text-primary"
            >
              All orders <ArrowRight size={14} strokeWidth={1.75} />
            </Link>
          </div>
          <div className="flex flex-1 flex-col gap-1 p-2">
            {statusCounts.map(({ status, count }) => {
              const pct = totalOrders > 0 ? Math.round((count / totalOrders) * 100) : 0;
              return (
                <div key={status} className="rounded p-2 hover:bg-surface-hover">
                  <div className="flex items-center justify-between">
                    <StatusPill status={status} />
                    <span className="font-mono text-body-md text-on-surface">{count}</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-recessed">
                    <div
                      className="h-full rounded-full bg-primary/60 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="border-t border-border-hairline p-4 font-mono text-code-sm text-on-surface-variant">
            {totalOrders} total orders
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
