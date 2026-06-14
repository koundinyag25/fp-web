import type { DriverStats } from "@/types";

interface DriverMetricsProps {
  stats?: DriverStats;
  loading?: boolean;
}

const Stat = ({ value, label }: { value: string; label: string }) => (
  <div className="flex-1 rounded border border-border-hairline bg-surface-container px-3 py-3 text-center">
    <p className="font-mono text-headline-md text-on-surface">{value}</p>
    <p className="mt-1 text-label-caps uppercase tracking-wider text-on-surface-variant">{label}</p>
  </div>
);

/** Driver landing metrics over the last ~3 months (FR-SV-1 flavour). */
export const DriverMetrics = ({ stats, loading }: DriverMetricsProps) => {
  if (loading || !stats) {
    return (
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-[72px] flex-1 animate-pulse rounded border border-border-hairline bg-surface-hover" />
        ))}
      </div>
    );
  }
  const rate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 100;
  return (
    <div className="flex gap-2">
      <Stat value={String(stats.completed)} label="Completed" />
      <Stat value={String(stats.failed)} label="Failed" />
      <Stat value={`${rate}%`} label="Success" />
    </div>
  );
};
