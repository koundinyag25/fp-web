import type { ReactNode } from "react";

type Tone = "neutral" | "info" | "success" | "warning" | "critical";

interface BadgeProps {
  children: ReactNode;
  tone?: Tone;
}

const TONES: Record<Tone, string> = {
  neutral: "text-on-surface-variant border-border-hairline",
  info: "text-info border-info/40",
  success: "text-success border-success/40",
  warning: "text-warning border-warning/40",
  critical: "text-critical border-critical/40",
};

export const Badge = ({ children, tone = "neutral" }: BadgeProps) => {
  return (
    <span className={`inline-block rounded-full border px-2 py-0.5 font-mono text-code-sm ${TONES[tone]}`}>
      {children}
    </span>
  );
}
