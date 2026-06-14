export const Spinner = ({ label }: { label?: string }) => {
  return (
    <div className="flex items-center gap-2 text-body-sm text-on-surface-variant">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-border-hairline border-t-primary" />
      {label}
    </div>
  );
}
