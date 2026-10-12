# Tech Context

## Frontend (`frontEnd/`)
- Expo SDK ~55, React 19.2, React Native 0.83, TypeScript ~5.9 (strict), Expo Router ~55.
- Key packages: `expo-camera` (QR scanning), `expo-document-picker` (SDS upload), `expo-print` / `expo-sharing` (labels, PDFs), `react-native-qrcode-svg`.
- Scripts: `npm start` (expo start), `npm run android`, `npm run ios`, `npm run web`, `npm run lint`.
- Path alias: `@/*` → `./src/*`.
- No JS test runner installed yet (planned: `jest-expo` + `@testing-library/react-native`).

## Backend (repo root)
- Python, Django 6.0.3, Django REST Framework 3.16, django-cors-headers, django-filter, PyMySQL. See `requirements.txt`.
- Run: `python manage.py runserver`. Tests: `python manage.py test <app>` (current `tests.py` files are empty).
- Deployed on Vercel (`vercel.json`, `build_files.sh`).

## Tooling
- Git + GitHub (`gjhollmann/Kemyze`), Jira project `KM` with GitHub for Jira Smart Commits.
- GitHub Action: Discord alert when a PR is opened (`.github/workflows/discord-peer-review.yml`).
- AI tooling: Cline in VS Code with Google Gemini (BYO API key). Rules in `.clinerules/`, skills in `.cline/skills/`, workflows in `.clinerules/workflows/`, hooks in `.clinerules/hooks/`.

## Constraints
- Gemini free tier is rate limited (e.g. Gemini 3.5 Flash: 5 requests/min, 20 requests/day). Keep tasks focused.
- `kemyze/settings.py` currently contains a hardcoded `SECRET_KEY`; new secrets must come from environment variables.
