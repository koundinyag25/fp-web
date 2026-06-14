import { User } from "lucide-react";

interface AvatarProps {
  name?: string; // initials derived from this; falls back to a person glyph
}

const initials = (name: string): string =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

export const Avatar = ({ name }: AvatarProps) => (
  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border-hairline bg-surface-hover">
    {name ? (
      <span className="font-mono text-code-sm text-on-surface-variant">{initials(name)}</span>
    ) : (
      <User size={18} strokeWidth={1.75} className="text-on-surface-variant" />
    )}
  </div>
);
