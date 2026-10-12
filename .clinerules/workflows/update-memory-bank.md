# Update Memory Bank

Invoke with `/update-memory-bank.md` at the end of a ticket or sprint.

1. Read every file in `memory-bank/`, even ones you think are unchanged.
2. Run `git log --oneline -15 main` and `git branch --show-current` to see recent work.
3. Update `activeContext.md` (current focus, recent changes, next steps) and `progress.md` (what works, what's left, known issues).
4. Update `systemPatterns.md` or `techContext.md` only if architecture, dependencies, or setup changed.
5. Show the user the diff of `memory-bank/` and wait for approval before finishing.
