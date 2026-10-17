# Git & Jira Smart Commit Rule

The repo is linked to Jira through GitHub for Jira. Commit messages drive Jira issues.

- Never commit directly to `main`.
- Ticket work: branch `KM-<number>-short-description`, and every commit message starts with the Jira key: `KM-<number> <summary>`.
- Work with no Jira ticket (tooling, docs): use a short descriptive branch (e.g. `cline-setup`) and a plain one-line message. Do not add Smart Commit commands.
- Smart Commit commands must stay on **one line**. Never put a carriage return inside a command. Multiple commands may share the line:
  - Comment: `KM-94 Add auto search to scanner #comment Searches after each scan`
  - Time: `KM-94 Add auto search #time 2h 30m`
  - Transition: `KM-94 Finish scanner auto search #done`
  - Combined: `KM-94 Add auto search #comment Unit tests added #time 1h #done`
- Only use `#done` when the ticket's acceptance criteria are fully met and unit tests pass.
- Never add AI attribution lines (e.g. `Co-Authored-By`) to commit messages.
- Always propose the commit message and wait for approval before running `git commit`. Never run `git push` without asking.
