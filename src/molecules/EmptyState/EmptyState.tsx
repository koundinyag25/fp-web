import type { ReactNode } from "react";

interface EmptyStateProps {
  message: string;
  action?: ReactNode;
}

export const EmptyState = ({ message, action }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center gap-3 rounded border border-border-hairline bg-surface-container p-8 text-center text-on-surface-variant">
      <p>{message}</p>
      {action}
    </div>
  );
}
