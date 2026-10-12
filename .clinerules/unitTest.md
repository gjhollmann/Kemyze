# Unit Testing Rule for New Code

Whenever you create or significantly modify code, you **must** also create or update corresponding unit tests in the same task.

## Core Requirements
- Write unit tests for every new function, component, hook, module, or Django view.
- Prefer testing **behavior and public API** over implementation details.
- Tests should be readable, focused, and deterministic. Mock network calls, the camera, and dates.
- Aim for meaningful coverage of the happy path + important edge cases and error states (bad input, failed request, insufficient access level).

## Preferred Stack (React Native / Expo — `frontEnd/`)
- **Test runner**: Jest with the `jest-expo` preset. (Vitest from the course example does not support React Native.)
- **Component testing**: React Native Testing Library (`@testing-library/react-native`). Do not use `@testing-library/react` — it is for web React.
- **User interactions**: `fireEvent` / `userEvent` from `@testing-library/react-native`.
- These packages are not installed yet. If they are missing, stop and ask before installing. Proposed setup: `npx expo install jest-expo jest @testing-library/react-native`, then add `"test": "jest"` to `frontEnd/package.json`.

## Preferred Stack (Django — backend)
- `django.test.TestCase` in each app's `tests.py`; call views with `self.client`.
- Assert status codes and JSON bodies.
- Run with `python manage.py test <app_name>`.

## Test File Conventions
- Place test files next to the source file when possible: `ScanResUtils.ts` → `ScanResUtils.test.ts`.
- Backend tests go in the app's `tests.py` (e.g. `containers/tests.py`).

## Before Finishing
- Run unit tests before the git commit (sprint cycle: Develop → Unit Test → Git Commit → Peer Review → Integration Test).
- List the tests you added and the exact command to run them.
