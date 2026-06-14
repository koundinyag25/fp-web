import type { Config } from "tailwindcss";

// Pingala Forge design tokens mapped to Tailwind (ported from the Pingala repo).
// Source of truth: docs/DESIGN_SYSTEM.md.
const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx,html}"],
  theme: {
    extend: {
      colors: {
        // Surfaces (tonal layering = depth; darker = more recessed)
        surface: {
          DEFAULT: "#0b1326", // Level 0 base background
          "container-lowest": "#060e20",
          "container-low": "#131b2e", // recessed inputs / wells (Level 2)
          container: "#171f33", // cards, panels, headers (Level 1)
          "container-high": "#222a3d",
          "container-highest": "#2d3449", // hover rows, top elevation
          bright: "#31394d",
          recessed: "#131b2e",
          hover: "#2d3449",
        },
        // Text / lines
        "on-surface": {
          DEFAULT: "#dae2fd",
          variant: "#bdc8d1",
        },
        outline: {
          DEFAULT: "#87929a",
          variant: "#3e484f",
        },
        "border-hairline": "#2d3449",
        // Semantic / brand
        primary: {
          DEFAULT: "#38bdf8",
          on: "#00354a",
        },
        success: "#4de082",
        warning: "#ffc42f",
        critical: "#ffb4ab",
        info: "#60a5fa",
      },
      fontFamily: {
        ui: ["Inter", "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      fontSize: {
        "display-lg": ["32px", { lineHeight: "40px", letterSpacing: "-0.02em", fontWeight: "700" }],
        "headline-md": ["20px", { lineHeight: "28px", fontWeight: "600" }],
        "body-md": ["14px", { lineHeight: "20px" }],
        "body-sm": ["12px", { lineHeight: "16px" }],
        "code-md": ["13px", { lineHeight: "20px" }],
        "code-sm": ["11px", { lineHeight: "16px" }],
        "label-caps": ["10px", { lineHeight: "12px", letterSpacing: "0.05em", fontWeight: "700" }],
      },
      borderRadius: {
        sm: "0.125rem",
        DEFAULT: "0.25rem", // 4px — buttons/inputs/cards
        md: "0.375rem",
        lg: "0.5rem",
        xl: "0.75rem",
      },
      spacing: {
        panel: "12px",
        sidebar: "280px",
      },
    },
  },
  plugins: [],
};

export default config;
