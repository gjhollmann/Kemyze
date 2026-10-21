# System Patterns

## Architecture
- Expo/React Native app (`frontEnd/`) calls the Django backend over HTTPS with `fetch` (deployed at `https://kemyze.vercel.app`).
- Django apps: `login/` (auth, forgot password), `containers/` (container CRUD, search, SDS, locations, change log), `tester/` (early test endpoints), `common/` (shared models only).
- MySQL database. Models in `common/models.py` are `managed = False`; the schema is owned by MySQL and changed via SQL files in `sql/`.
- Container history is written by MySQL triggers (`sql/container_audit_log_triggers.sql`) into `container_audit_log`, using the session variable `@current_user_id` for `changed_by`.

## Key decisions
- Access levels are integers; **lower = more privilege**. `1` = primary. Container create/edit rejects `access_level > 3`. `5` = scanner bypass (guest).
- Server-side access checks look up the user by `user_id`.
- SDS PDFs are stored as MEDIUMBLOB and returned to the app as base64.
- Views use `@csrf_exempt` because the client is a mobile app.

## Frontend patterns
- Expo Router file-based routing: `src/app/Pages/` (main screens), `src/app/SubPages/` (pushed screens).
- Logged-in user lives in React context: `useUserState()` → `{ userID, accessLevel }`.
- Shared UI in `frontEnd/components/`; non-UI logic in `frontEnd/utils/` (`ScanResUtils`, `PDFUtils`, `PrintLabelUtils`).
- Styles via `StyleSheet.create`, using tokens from `frontEnd/src/constants/theme.ts` (design system taken from the add/edit container and profile screens: `#020617` screen, translucent navy panels, `#09091C` inputs, `#3B82F6` accent, JetBrains Mono, `GradientButton`). Older screens (inventory, quaternaryprofile, NavBar, ScanPopup, QRLabelPopup, scanner pages) still use their own colors and need migrating.
- Scanner prevents duplicate scans with refs (`scanLockRef`, `isFetchingRef`, `lastScanRef`), not state.

## Backend view pattern
Docstring (Route / Method / Parameters / Returns) → method check → parameter validation (`HttpResponseBadRequest`) → user/access lookup (`HttpResponseForbidden`) → ORM query → `JsonResponse`.
