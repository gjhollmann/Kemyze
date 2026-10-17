---
name: kemyze-access-control
description: Enforce Kemyze user access levels (primary, secondary, tertiary, quaternary, guest/bypass) on both the Django backend and the Expo app. Use when adding or changing login, profiles, create/edit user screens, or any view that reads or edits containers, users, or SDS files.
---

# Kemyze Access Control Skill

Use this skill whenever a change touches who can see or do something.

## Core Principles
- Always enforce access on the **server**. The app may hide buttons, but Django must reject the request.
- Never trust an `accessLevel` sent by the client for create, edit, or delete. Look the user up by `user_id`.
- Never widen access unless the Jira ticket explicitly says so. If the ticket is unclear, ask.

## How levels work in this codebase
- `Users.access_level` is a positive integer. **Lower number = more privilege.**
- `1` is `PRIMARY_LEVEL` (see `createprofile.tsx`, `editprofile.tsx`).
- Container create/edit views reject users with `access_level > 3` (`HttpResponseForbidden`). See `containers/views.py`.
- `5` is used by `scannerbypass.tsx` (`BYPASS_ACCESS_LEVEL`) for guest-style SDS viewing.
- Login (`login/views.py`) returns `{ userID, accessLevel }`, stored in the app via `useUserState()`.
- Screen names map to levels: `tertiaryprofilemanagement.tsx`, `quaternaryprofile.tsx`. Confirm the exact level for a screen with the team before changing gating.

## Follow this order
1. Identify which levels should be allowed. Quote the ticket's acceptance criteria.
2. Backend: look up `Users.objects.get(user_id=...)`, check `access_level`, and return `HttpResponseForbidden()` when not allowed. Handle `Users.DoesNotExist` with `HttpResponseBadRequest`.
3. Frontend: read `activeUser` from `useUserState()` and hide or disable controls the user can't use.
4. Tests: one allowed level, one denied level, and a missing/unknown user.

## Common Pitfalls
- Comparing `accessLevel` as a string vs a number (`ActiveUser.accessLevel` is typed `string` in `UserState.tsx`). Convert with `Number()` before comparing.
- Using `>=` vs `>` incorrectly. Remember lower is more powerful.
- Gating only in the UI.
