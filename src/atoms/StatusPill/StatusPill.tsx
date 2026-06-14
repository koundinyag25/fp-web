// Maps order/delivery/shift statuses to a Forge tone. Static class strings so
// Tailwind's JIT keeps them (never build class names dynamically).
const STYLES = {
  warning: "bg-warning/10 text-warning border-warning/30",
  info: "bg-info/10 text-info border-info/30",
  success: "bg-success/10 text-success border-success/30",
  critical: "bg-critical/10 text-critical border-critical/30",
  neutral: "bg-surface-hover text-on-surface-variant border-border-hairline",
} as const;

type Tone = keyof typeof STYLES;

const TONE_BY_STATUS: Record<string, Tone> = {
  pending: "warning",
  assigned: "warning",
  in_transit: "info",
  active: "success",
  completed: "success",
  failed: "critical",
};

export const StatusPill = ({ status }: { status: string }) => {
  const tone = TONE_BY_STATUS[status] ?? "neutral";
  return (
    <span
      className={`inline-block rounded-full border px-2 py-0.5 font-mono text-label-caps uppercase ${STYLES[tone]}`}
    >
      {status}
    </span>
  );
};
