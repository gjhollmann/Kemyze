# Kemyze Project Context

Kemyze is a chemical container inventory app (CSC 190/191, Sacramento State, Team Reverse Engineers). Always read this before planning.

## Stack
- Mobile app: Expo SDK 55 + React Native 0.83 + TypeScript (strict), Expo Router. Lives in `frontEnd/`.
- Backend: Django 6 + Django REST Framework on MySQL. Settings in `kemyze/`; apps `common/`, `containers/`, `login/`, `tester/`.
- Deployed backend: `https://kemyze.vercel.app`.

## Layout
- `frontEnd/src/app/` — Expo Router routes. `Pages/` = main screens, `SubPages/` = pushed screens, `contexts/` = React context (`UserState.tsx`).
- `frontEnd/components/` — shared UI. `frontEnd/utils/` — non-UI helpers.
- `common/models.py` — shared models: Containers, Locations, Users, ContainerAuditLog.
- `memory-bank/` — project memory (see `memory-bank.md`). `Documents/` — plans and reference PDFs.

## Always
- Start features, bugs, and architecture changes in Plan mode. Name every file you intend to change before switching to Act. Use Act alone only for small, known fixes.
- Keep each change scoped to one Jira ticket (`KM-<number>`).
- Ask before adding any npm or pip dependency.
- Respect access levels. Never widen what a level can see or edit unless the ticket says so.

## Never
- Never read, print, or commit API keys, passwords, `.env` files, or Cline's `secrets.json` / `providers.json`.
- Never edit `node_modules/`, `venv/`, `db.sqlite3`, or hand-write files in `migrations/`.
- Never run `git push`, `git push --force`, `git reset --hard`, or commands that change the shared MySQL database without asking first.
