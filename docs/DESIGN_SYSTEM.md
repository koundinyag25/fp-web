# FleetPanda Design System — Pingala Forge

We reuse **Pingala Forge** (ported from the Pingala repo's `pg-design` skill). Forge is a dark,
dense "dev-tooling" aesthetic: deep-navy dot-grid canvas, teal primary, dual-font (Inter for UI,
JetBrains Mono for IDs/metadata/status), 4px radius, **elevation by tone not shadow**.

Tokens are implemented in [fp-web/tailwind.config.ts](../fp-web/tailwind.config.ts) and
[fp-web/src/index.css](../fp-web/src/index.css). This file is the human reference; the Stitch style
prompt is [prompts/screens/00-design-system.txt](prompts/screens/00-design-system.txt).

## Color roles

### Surfaces (darker = more recessed)
| Token | Hex | Use |
|---|---|---|
| `surface` | `#0b1326` | app base background (L0) |
| `surface-container` | `#171f33` | cards, panels, headers (L1) |
| `surface-container-low` / `surface-recessed` | `#131b2e` | recessed inputs, wells (L2) |
| `surface-container-high` | `#222a3d` | raised sections |
| `surface-container-highest` / `surface-hover` | `#2d3449` | hover rows, top elevation |
| `surface-bright` | `#31394d` | brightest accent |

### Text / lines
| Token | Hex | Use |
|---|---|---|
| `on-surface` | `#dae2fd` | primary text |
| `on-surface-variant` | `#bdc8d1` | secondary/muted |
| `outline` | `#87929a` | strong dividers |
| `border-hairline` / `outline-variant` | `#2d3449` / `#3e484f` | 1px hairline borders |

### Semantic / brand
| Role | Hex | Meaning (mapped to FleetPanda) |
|---|---|---|
| `primary` (teal) | `#38bdf8` | actions, active, focus, selection · on-primary text `#00354a` |
| `success` (green) | `#4de082` | completed / active shift / ok stock |
| `warning` (amber) | `#ffc42f` | pending / assigned / low-warn stock |
| `critical` (red) | `#ffb4ab` | failed / errors / low stock / 409 double-book |
| `info` (blue) | `#60a5fa` | in_transit / neutral emphasis (distinct from teal) |

### Canvas + glass primitives
- **Dot-grid canvas** on `body`: `radial-gradient(rgb(135 146 154 / 0.16) 1px, transparent 1px)` @ 22px.
- **`.pg-glass`** — `rgb(23 31 51 / 0.7)` + `backdrop-filter: blur(12px)` for modals/floating bars.
- **`.pg-scanline`** — animated teal scan-line for empty/loading states.

## Typography (dual-font — load-bearing)
**Inter** = all functional UI text. **JetBrains Mono** = every ID, reg/license, coordinate, status/
band chip, and keyboard hint.

| Style | Font | Size/Line | Weight |
|---|---|---|---|
| `display-lg` | Inter | 32/40 | 700 |
| `headline-md` | Inter | 20/28 | 600 |
| `body-md` | Inter | 14/20 | 400 |
| `body-sm` | Inter | 12/16 | 400 |
| `code-md` / `code-sm` | JetBrains Mono | 13/20 · 11/16 | 400 |
| `label-caps` | JetBrains Mono | 10/12, uppercase, 0.05em | 700 |

## Shape, spacing, elevation
- Radius: default **4px** (buttons/inputs/cards); `full` only for pills/dots/status.
- 4px baseline grid; internal padding 8–12px; gutter 12px; sidebar **280px**; container max ~1200px.
- Density is encouraged — whitespace separates major sections, not every element.
- Elevation via **tone** (L0/L1/L2) + **1px hairline borders**, not shadows. Soft shadow only for floating overlays.
- Icons: 1.5–2px stroke, linear/geometric.

## Component conventions (see also [COMPONENTS.md](COMPONENTS.md))
- **Buttons:** primary = solid teal + dark text; secondary = transparent + 1px teal border; tertiary = borderless, hover `surface-hover`.
- **Inputs:** recessed bg, 1px hairline, focus → teal border + subtle 2px glow.
- **Chips/status pills:** mono label, bg ≈10% of the role color, text = role color; full radius for pills.
- **List rows:** hover `surface-hover`; selected row gets a **left 2px teal accent**; horizontal dividers only (no vertical rules).
