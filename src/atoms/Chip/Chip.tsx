import type { ReactNode } from "react";

// Generic tinted label chip (entity types, tags). Static class strings for JIT.
const TONES = {
  primary: "bg-primary/10 text-primary border-primary/30",
  info: "bg-info/10 text-info border-info/30",
  success: "bg-success/10 text-success border-success/30",
  warning: "bg-warning/10 text-warning border-warning/30",
  neutral: "bg-surface-hover text-on-surface-variant border-border-hairline",
} as const;

type Tone = keyof typeof TONES;

export const Chip = ({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) => (
  <span className={`inline-block rounded border px-2 py-0.5 font-mono text-label-caps uppercase ${TONES[tone]}`}>
    {children}
  </span>
);
