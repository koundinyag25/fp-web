import { ChevronLeft, ChevronRight } from "lucide-react";

interface WeekNavigatorProps {
  label: string;
  onPrev: () => void;
  onNext: () => void;
  onToday?: () => void;
}

export const WeekNavigator = ({ label, onPrev, onNext, onToday }: WeekNavigatorProps) => (
  <div className="flex flex-wrap items-center gap-3">
    <div className="flex items-center rounded border border-border-hairline">
      <button
        type="button"
        aria-label="Previous week"
        onClick={onPrev}
        className="p-1.5 text-on-surface-variant hover:bg-surface-hover"
      >
        <ChevronLeft size={18} strokeWidth={1.75} />
      </button>
      <span className="border-x border-border-hairline px-4 py-1.5 font-mono text-code-md text-on-surface">
        {label}
      </span>
      <button
        type="button"
        aria-label="Next week"
        onClick={onNext}
        className="p-1.5 text-on-surface-variant hover:bg-surface-hover"
      >
        <ChevronRight size={18} strokeWidth={1.75} />
      </button>
    </div>
    {onToday && (
      <button
        type="button"
        onClick={onToday}
        className="font-mono text-code-sm text-primary hover:underline"
      >
        Today
      </button>
    )}
  </div>
);
