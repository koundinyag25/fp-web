# fp-web — Code Structure (Atomic)

Enforced by the `fe-code-structure` skill. The invariant is **import direction**: a layer may import
the ones to its left, never to its right.

```
utils  ←  lib/services  ←  hooks  ←  pages  ←  organisms  ←  molecules  ←  atoms
```

## Layers

| Folder | Holds | May import |
|---|---|---|
| `src/utils/` | pure helpers + the http client (`http.ts`, `date.ts`) — no React, no app imports | (nothing app-specific) |
| `src/lib/services/<entity>/` | per-entity API modules; the **only** callers of `utils/http` | utils, types |
| `src/lib/queryClient.ts` | React Query client config | — |
| `src/hooks/<module>/` | React Query hooks (`use<Module>.ts`) wrapping services | services, utils, types |
| `src/atoms/` | leaf UI primitives (Button, Badge, Card, Spinner) | React, utils |
| `src/molecules/` | compositions of atoms (PageHeader, EmptyState) | atoms, utils |
| `src/organisms/` | complex composites incl. layout shells (FleetMap) | molecules, atoms, hooks, utils |
| `src/pages/` | route-level screens (+ colocated `*.config.tsx` column/filter configs, `use<Name>Page` hook, form modals) | organisms, molecules, atoms, hooks, utils, config |
| `src/config/` | pure app config — no React, no app imports (e.g. `filters.ts`: operators, timestamp fields) | types only |
| `src/types/` | shared TS types | — |

**Config conventions:**
- **Pure/shared config** (no JSX) lives in `src/config/` (a leaf, importable by any layer) — e.g.
  `config/filters.ts` holds the FilterBuilder operators + the always-on created/updated date fields.
- **Page-specific config** (columns, filter-field defs — which reference atoms/handlers) is
  **colocated** with the page as `<entity>.config.tsx`, exposing `get<Entity>Columns(actions)` and
  `<ENTITY>_FILTER_FIELDS`. The page component just wires them. Keeps pages declarative and the
  column/filter definitions in one obvious place per entity.

## Rules

- **Data flow:** `utils/http → lib/services/<entity> → hooks/<module> → components`. Components **never**
  call `axios`/`fetch` directly — only services do; components get data via hooks.
- **Folder-per-component** with an `index.ts` barrel: `atoms/Button/{Button.tsx, index.ts}`. Colocate
  tests (`Button.test.tsx`) and `constants.ts` in the same folder.
- **Path alias** `@/* → src/*` (configured in `vite.config.ts` + `tsconfig.json`). Import via the
  barrel: `@/atoms/Button`, never `../../../atoms/Button/Button` or deep paths past the barrel.
- **Naming:** components `PascalCase`; hooks `use<Module>` under `hooks/<module>/`; services
  `<entity>Service.ts` under `lib/services/<entity>/`; utils lowercase (`http.ts`, `date.ts`).

## Audit

```
node ~/.claude/skills/fe-code-structure/scripts/import_graph.mjs src --layers layers.json
```
(`layers.json` is in the skill's `references/atomic-structure.md`.) Or just ask to "audit the FE
structure" and the `fe-code-structure` skill runs the full check.
