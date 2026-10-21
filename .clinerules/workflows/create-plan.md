# Create Implementation Plan

Use in **Plan mode**. Invoke with `/create-plan.md` and name the Jira ticket, e.g. `/create-plan.md KM-94 scanner auto search`.

1. Ask for the Jira ticket key and its full acceptance criteria if they were not provided. Do not guess requirements.
2. Read `memory-bank/` (all core files) and any reference PDFs the user `@`-mentions from `Documents/` (e.g. Project Charter, Figma export).
3. Search the codebase for the screens, utils, and views involved. List each file you will create or change, and why.
4. Check the plan against `.clinerules/` (ReactStyle, djangoBackend, unitTest) and the relevant skill (`kemyze-access-control`, `django-container-api`, `sds-qr-scanning`).
5. Write the plan to `Documents/plans/KM-<number>-<short-name>.md` with these sections:
   - Ticket & acceptance criteria
   - Files to change
   - Step-by-step implementation
   - Access-level impact
   - Unit tests to add (and the command to run them)
   - Risks / open questions
6. Stop and ask the user to review. Only switch to Act mode after approval.
