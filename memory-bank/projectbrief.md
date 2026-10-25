# Project Brief

**Kemyze** — a chemical container management mobile app. Senior project for CSC 190/191 at California State University, Sacramento, built by Team Reverse Engineers (George Hollmann, Alexander Apolonio-Flores, Joshua Zamora, Reese Nelson, Matthew Fronda).

## Core requirements
- Track chemical containers: name, CAS number, acquisition date, expiration date, quantity, and location (building → room → cabinet → shelf).
- Each container gets a QR code label. Scanning it in the app shows container information and its Safety Data Sheet (SDS).
- Role-based access: higher levels manage users and inventory; guests can scan and view SDS without a permanent account.
- Keep a change history for every container.
- Expiration tracking, low-supply visibility, and inventory reports.

## Scope source of truth
- Jira project `KM` (tickets `KM-<number>`). Acceptance criteria in Jira define "done".
- `readme.md` for the public description of the project.
