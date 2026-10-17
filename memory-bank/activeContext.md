# Active Context

_Last updated: 2026-10-11. Update with `/update-memory-bank.md`._

## Current focus
- Sprint work on scanner, container add/edit, profiles, and change log.
- Recent / in-progress tickets: KM-94 (scanner auto search), KM-93 (scanner edit button), KM-72 (create profile auth options), KM-70 (edit profile role options), KM-88 / KM-52 (container change log), KM-96 (SDS upload), KM-98 (add container save).
- Setting up Cline (rules, skills, workflows, hooks, memory bank) so the whole team uses the same AI conventions.

## Next steps
- Add a JS unit test setup (`jest-expo`) and first tests for `frontEnd/utils/`.
- Add Django `TestCase` tests for `containers/views.py`.
- Fill the README "Reserved for 191" sections (Testing, Deployment, Developer Instructions).

## Open decisions
- Which access level each profile-management screen (tertiary vs quaternary) is meant for. Not yet confirmed; don't change gating until it is.
- No view sets `@current_user_id`, so trigger-written audit rows may lack `changed_by`.
