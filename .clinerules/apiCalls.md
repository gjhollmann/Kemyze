---
paths:
  - "frontEnd/**"
---
# API Call Rule

## Always
- Build request URLs from one `BASE_URL` constant (`"https://kemyze.vercel.app/"`). Never type the full backend URL inside a `fetch` call.
- Pass query values with `encodeURIComponent` (or `URLSearchParams`).
- Wrap every `fetch` in `try/catch`.
- Check `response.ok` before reading the body. On failure, show the user a clear `Alert` that names what failed (e.g. "Could not save container").
- Send JSON bodies with `headers: { 'Content-Type': 'application/json' }` and `JSON.stringify`.
- Use the logged-in user from `useUserState()` for `user_id`. Never use a hardcoded test user ID in finished code.
- Guard against double submits (disable the button or use a ref while a request is in flight).

## Never
- Never show raw server error text or stack traces to the user.
- Never log passwords, tokens, or full user records.
