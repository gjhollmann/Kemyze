# Cline Setup for Kemyze

Every teammate follows these steps once. The rules, skills, workflows, hooks, and memory bank come with the repo when you pull. API keys stay on your own machine and are never committed.

References: [Cline docs](https://docs.cline.bot/cline-overview), CSC 191 "AI Coding IDEs" slides 13–34.

## 1. Install
1. VS Code → Extensions → search **Cline** → Install (publisher: Cline).
2. Onboarding: select **Start with a Goal, Not Just a Prompt** → **Mark Done**.
3. In the Cline sidebar choose **Bring my own API key**.

## 2. Gemini API key
1. Sign in to [Google AI Studio](https://aistudio.google.com) with your **@csus.edu** account (claim the student plan at gemini.google/students).
2. **API Keys → Create API key**. Name it `Cline` and attach it to the course project. Copy it right away.
3. Never paste the key into a file in this repo, a commit, Discord, or a screenshot.

## 3. Configure the provider (most common cause of errors)
Cline ⚙️ → **API Configuration**:
- **Plan Mode** tab: API Provider = **Google Gemini**, paste key, Model = `gemini-3.5-flash`.
- **Act Mode** tab: API Provider = **Google Gemini**, paste key, Model = `gemini-3.5-flash`.
- Check **Use different models for Plan and Act modes**.

Both tabs must be set. If one still says Anthropic or OpenRouter, Cline will fail with "API key is missing" or "requires more credits".

Confirm the status bar under the chat box reads `gemini:gemini-3.5-flash` before sending a task.

## 4. Auto-approve (keep conservative)
- ✅ Read project files
- ✅ Edit project files (optional; Checkpoints let you undo)
- ❌ **Execute commands — leave unchecked.** Read every command before clicking Run Command.
- ❌ Use the browser, ❌ Use MCP servers, ❌ YOLO mode

## 5. Turn on hooks
Cline ⚙️ → **Features** → check **Enable Hooks**. This activates `.clinerules/hooks/PreToolUse.cjs`, which blocks edits to `.env` / secret files and `node_modules`/`venv`, and destructive commands (`git push --force`, `git reset --hard`, `rm -rf`, `manage.py migrate`, …).
- Runs with Node.js on Windows, Mac, and Linux. Nothing else to install.
- If the hook ever fails, Cline logs it and continues. It never blocks normal work.

## 6. Check that everything loaded
- **Rules** (⚖️ icon below the chat box → Rules tab): `projectContext`, `ReactStyle`, `uiDesignSystem`, `apiCalls`, `accessLevels`, `codeHygiene`, `djangoBackend`, `unitTest`, `readMeUpdate`, `smartCommits`, `memory-bank` should be listed and toggled on. `ReactStyle`, `uiDesignSystem`, and `apiCalls` only activate for `frontEnd/` files, and `djangoBackend` only for `.py` files.
- **Skills** tab: `kemyze-ui-screen`, `kemyze-access-control`, `django-container-api`, `sds-qr-scanning`.
- **Workflows** tab: `create-plan`, `sprint-commit`, `peer-review`, `update-memory-bank`.

## 7. Daily use
| Step | What to do |
|---|---|
| Start a ticket | Plan mode → `/create-plan.md KM-<number> <description>` |
| Build | Review the plan, switch to Act |
| Finish | `/sprint-commit.md` (runs unit tests, writes a Jira Smart Commit message) |
| Review a teammate's PR | `/peer-review.md <branch>` |
| End of ticket/sprint | `/update-memory-bank.md` |

First time only: in Plan mode say **"follow your custom instructions"** so Cline reads the memory bank.

## 8. Gemini free-tier limits
- Gemini 3.5 Flash free tier: **5 requests/min, 20 requests/day**. One agent task can use 5–10 requests.
- Error `429 TooManyRequests` / "You exceeded your current quota" → wait out the full countdown. Pressing Retry early resets the timer. Switching models also works.
- Check usage at [aistudio.google.com/usage](https://aistudio.google.com/usage).
- Keep tasks small, `@`-mention only the files needed, and start a new task instead of one very long one.

## Troubleshooting
| Error | Fix |
|---|---|
| "Anthropic API key is missing" | Plan or Act provider is still Anthropic. Redo step 3 on both tabs. |
| "This request requires more credits…" (OpenRouter) | OpenRouter key has no credit. Switch to Gemini, or add credits/raise the key limit at openrouter.ai. |
| 429 / quota exceeded | Free-tier limit hit. See step 8. |
| Rules or skills not showing | Open the repo **root** folder (`Kemyze/`) in VS Code, not `frontEnd/`. |
| Hook not running | Enable Hooks (step 5); on Mac/Linux check the file is executable. |
| Behind a proxy / connection errors | Cline uses VS Code's proxy settings. See [networking docs](https://docs.cline.bot/troubleshooting/networking-and-proxies). Logs: `~/.cline/data/logs/`. |
