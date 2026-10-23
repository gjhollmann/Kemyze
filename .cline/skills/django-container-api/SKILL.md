---
name: django-container-api
description: Add or change Kemyze Django models and container API views (containers, locations, users, container audit log). Use when creating or editing endpoints in containers/, login/, or tester/, changing common/models.py, or wiring a new fetch call from the Expo app to the backend.
---

# Django Container API Skill

## Core Principles
- Shared models live in `common/models.py`, map to existing MySQL tables via `db_table`, and are `managed = False`. Django migrations do not create or alter these tables. Never rename a table or column without a team decision.
- Container history (`ContainerAuditLog`) is written by MySQL triggers in `sql/container_audit_log_triggers.sql` (insert/update/delete on `containers`). Do not write audit rows manually from views. The triggers take `changed_by` from the MySQL session variable `@current_user_id`.
- Validate input and access level before touching the database.

## Data model (current)
- `Containers`: `container_id`, `chemical_name`, `cas_number` (≤12 chars), `expr_date`, `acqn_date`, `location` (FK → Locations), `quantity` (≤6 chars), `sds_sheet` (MEDIUMBLOB PDF, sent to the app as base64).
- `Locations`: `location_id`, `name`, `type` — a parent/child hierarchy (building → room → cabinet → shelf). Use `getLocationChildren`.
- `Users`: `user_id`, names, `email` (unique), `phone`, `password` (hashed), `access_level`.
- `ContainerAuditLog`: change history shown in the edit container page.

## Follow this order for a new endpoint
1. Add the view in the app's `views.py` with a docstring: Route, Method, Parameters, Returns.
2. Check the method → return `HttpResponseNotAllowed([...])` otherwise.
3. Parse input (`request.GET` for GET, `json.loads(request.body)` for POST). Return `HttpResponseBadRequest("Missing '<param>' Parameter")` for missing values.
4. Check access level (see the `kemyze-access-control` skill).
5. Query with the ORM. Return `JsonResponse`.
6. Register the route in the app's `urls.py` using the existing camelCase style (`path('getContainer', views.getContainer, name='getContainer')`).
7. Add `TestCase` tests in the app's `tests.py`.
8. Frontend: call `https://kemyze.vercel.app/<app>/<route>` with `try/catch` and `response.ok`.

## Common Pitfalls
- Existing views use `@csrf_exempt` for the mobile client. Keep it consistent and don't remove it from existing views without a team decision.
- Running `makemigrations`/`migrate` against unmanaged models. Schema changes go in `sql/*.sql` and need team approval.
- Forgetting `@current_user_id`. No view currently sets it, so trigger-written audit rows may have an empty `changed_by`. If a ticket touches audit history, raise this in Plan mode.
- Leaving `print(data)` debug lines in views.
- Returning raw exception text to the client in new code. Log it and return a generic error.
