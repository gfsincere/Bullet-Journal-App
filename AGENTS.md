# AGENTS.md

## Cursor Cloud specific instructions

This is a **Bullet Journal Planner** — a client-side React SPA with no backend, no database, and no external services. All state lives in browser `localStorage`.

### Services

| Service | Command | Notes |
|---|---|---|
| Vite Dev Server | `npm run dev` | The only service. Add `-- --host 0.0.0.0` if you need external access. |

### Standard commands

All commands are defined in `package.json`:

- **Dev server:** `npm run dev`
- **Lint:** `npm run lint` (ESLint; the codebase has some pre-existing lint errors)
- **Build:** `npm run build` (runs `tsc -b && vite build`)
- **Preview:** `npm run preview`

### Gotchas

- The project uses **npm** (not pnpm/yarn). The lockfile is `package-lock.json`.
- Vite 7.x requires Node >= 18. The VM ships with Node 22 which works fine.
- There are no automated tests (no test framework configured). Validation is done via lint + build + manual testing.
- The app persists layouts to `localStorage`, so clearing browser data resets all saved state.
