import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

type Tone = "default" | "warning";

interface MetricCardProps {
  label: string;
  value: number | string;
  tone?: Tone; // 'warning' tints the label + value amber (e.g. low-stock)
  icon?: ReactNode; // optional glyph shown in a tinted chip, top-right
  hint?: string; // optional sub-label under the value
  to?: string; // when set, the whole card becomes a drill-in link
}

export const MetricCard = ({ label, value, tone = "default", icon, hint, to }: MetricCardProps) => {
  const isWarning = tone === "warning";

  const body = (
    <>
      <div className="flex items-start justify-between gap-2">
        <span
          className={`font-mono text-label-caps uppercase ${isWarning ? "text-warning" : "text-outline"}`}
        >
          {label}
        </span>
        {icon ? (
          <span
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded ${
              isWarning ? "bg-warning/10 text-warning" : "bg-primary/10 text-primary"
            }`}
          >
            {icon}
          </span>
        ) : to ? (
          <ArrowUpRight
            size={16}
            strokeWidth={1.75}
            className="shrink-0 text-outline opacity-0 transition-opacity group-hover:opacity-100"
          />
        ) : null}
      </div>
      <div className={`mt-3 font-mono text-3xl font-bold ${isWarning ? "text-warning" : "text-on-surface"}`}>
        {value}
      </div>
      {hint ? <span className="mt-1 block text-body-sm text-on-surface-variant">{hint}</span> : null}
    </>
  );

  const base =
    "relative block overflow-hidden rounded border border-border-hairline bg-surface-container p-4";

  if (to) {
    return (
      <Link
        to={to}
        className={`group ${base} transition-colors hover:border-primary/40 hover:bg-surface-hover`}
      >
        {body}
      </Link>
    );
  }

  return <div className={base}>{body}</div>;
};
