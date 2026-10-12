# Access Level Rule

Kemyze access levels are integers. **Lower number = more privilege.**

| Level | Meaning in code |
|---|---|
| 1 | `PRIMARY_LEVEL` (highest) |
| 2–3 | Can create and edit containers |
| 4 | Signed-in user who cannot edit containers |
| 5 | `BYPASS_ACCESS_LEVEL` — guest scanner (SDS view only) |

## Always
- The backend is the source of truth. Container create/edit views reject `access_level > 3`.
- Any frontend check for the same permission must use the same boundary as the backend (`accessLevel <= 3` to edit containers). Never use a different number for the same permission.
- Convert before comparing: `Number(activeUser.accessLevel)` (it is typed `string` in `UserState.tsx`).
- Put the threshold in a named constant (e.g. `const MAX_EDIT_LEVEL = 3;`). Never compare against a bare number.
- Enforce on the server by looking up the user by `user_id`. The UI check is only for hiding controls.

## Never
- Never change which levels can do something unless the Jira ticket's acceptance criteria say so. If unclear, ask.
- Never trust an `accessLevel` sent by the client for create, edit, or delete.
- Never put SDS viewing behind a level. Guests (level 5) must always see SDS.
