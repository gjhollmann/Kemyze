# Sprint Commit (Unit Test → Smart Commit)

Invoke with `/sprint-commit.md` when a ticket's code is finished. Follows the course sprint cycle: Develop → Unit Test → Git Commit → Peer Review → Integration Test.

1. Run `git status` and `git branch --show-current`. If on `main`, stop and ask the user to create a `KM-<number>-...` branch.
2. Show `git diff --stat`, and confirm every changed file belongs to this ticket. Flag unrelated changes.
3. Confirm unit tests exist for the changed code (per `unitTest.md`). Run them:
   - Backend: `python manage.py test <app_name>`
   - Frontend: `cd frontEnd && npm test`
   Report pass/fail with the output. If tests fail, stop.
4. Check that no secrets, `.env` files, `node_modules/`, `venv/`, or `db.sqlite3` are staged.
5. Propose a one-line Smart Commit message per `smartCommits.md`, e.g. `KM-94 Add scanner auto search #comment Unit tests added #time 2h`. Ask whether to add `#done`.
6. Wait for approval, then run `git add` on the ticket's files only and `git commit`.
7. Do not push. Tell the user the next step is `git push -u origin <branch>` and opening a pull request for peer review.
