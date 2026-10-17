# Progress

_Last updated: 2026-10-11._

## What works
- Login with hashed passwords, and forgot password.
- QR scanning with duplicate-scan protection, guest scanner bypass, scan popup.
- Container lookup, search, recent search, add container, edit container, location hierarchy.
- SDS upload (PDF) and viewing.
- QR label popup and printing.
- Container change log (MySQL triggers + edit page view).
- Profile screens (tertiary management, quaternary profile, create/edit profile).

## What's left
- Automated unit tests (frontend and backend are both empty).
- Expiration and low-supply reports, monthly reports.
- README developer, testing, and deployment instructions.
- Move `SECRET_KEY` and other secrets to environment variables.

## Known issues
- Audit log `changed_by` depends on `@current_user_id`, which no view sets.
- Some views still contain debug `print()` calls.
