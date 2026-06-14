import { AlertTriangle, CheckCircle, Info, X } from "lucide-react";
import type { ToastTone } from "@/hooks/useToast";

interface ToastProps {
  tone: ToastTone;
  message: string;
  onClose: () => void;
}

const TONE = {
  success: { Icon: CheckCircle, color: "text-success", border: "border-success/40" },
  error: { Icon: AlertTriangle, color: "text-critical", border: "border-critical/40" },
  info: { Icon: Info, color: "text-info", border: "border-info/40" },
} as const;

/** A single transient notification (success / error / info). */
export const Toast = ({ tone, message, onClose }: ToastProps) => {
  const { Icon, color, border } = TONE[tone];
  return (
    <div
      role="status"
      className={`pg-glass flex items-start gap-3 rounded border ${border} p-3 shadow-xl`}
    >
      <Icon size={18} strokeWidth={1.75} className={`mt-0.5 shrink-0 ${color}`} />
      <p className="flex-1 text-body-sm text-on-surface">{message}</p>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={onClose}
        className="shrink-0 text-on-surface-variant hover:text-on-surface"
      >
        <X size={16} strokeWidth={1.75} />
      </button>
    </div>
  );
};
