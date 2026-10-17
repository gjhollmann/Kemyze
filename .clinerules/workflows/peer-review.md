# Peer Review a Pull Request

Invoke with `/peer-review.md` and a PR number or branch name. Read-only: do not edit files or post anything.

1. Get the diff: `git fetch origin` then `git diff origin/main...origin/<branch>` (or `gh pr diff <number>` if the GitHub CLI is installed).
2. Find the Jira key in the branch/PR title and ask the user for the ticket's acceptance criteria.
3. Check the diff against:
   - Acceptance criteria — is anything missing?
   - `.clinerules/ReactStyle.md` and `djangoBackend.md`
   - Access levels (`kemyze-access-control` skill) — is anything gated only in the UI?
   - `unitTest.md` — were tests added and do they cover error paths?
   - Leftover `print()` / `console.log`, hardcoded URLs or secrets, unrelated file changes
4. Report findings as a short list: file, line, what is wrong, and why it matters. Separate "must fix" from "suggestions".
5. Keep the written review comment to about four plain sentences of observations. Do not say "approving this".
