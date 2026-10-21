# Code Hygiene Rule

Applies to every file you create or change. Do not rewrite untouched code to meet these rules.

## Always
- Remove `console.log` (frontend) and `print()` (backend) debug lines you added before finishing. Use `console.error` only inside `catch` blocks.
- Give new values real types. Do not add new `any`.
- Use the `@/` import alias (`@/constants/theme`) in new imports instead of long `../../../` paths.
- Put shared components in `frontEnd/components/`, never inside `frontEnd/src/app/` (Expo Router treats files there as routes).
- Keep new files under ~500 lines. Split large screens into components, hooks, or utils.
- Remove commented-out code and placeholder/sample data (e.g. `SAMPLE_USERS`, `USER_TEST`) from code you touch once real data is wired up.
- Keep comments short and only where the code isn't obvious.

## Never
- Never leave TODOs without a Jira key (`// TODO KM-123: ...`).
- Never commit unused imports or unused variables.
