# Kemyze acceptance tests and Run For Record

These tests open the real Kemyze login screen in Google Chrome (using Selenium WebDriver) and
check the KM-68 requirements. They also run the unit tests. One command runs everything and
writes the System Test Report sections.

## How to run the tests

The Tester and the Recorder work on separate computers. You need Node.js and Google Chrome
installed. The first time only, get the code: `git clone https://github.com/gjhollmann/Kemyze.git`

**Tester**
1. Start a screen share with the Recorder (Zoom, Discord or Teams). Keep it on for the whole run.
2. In the `Kemyze/frontEnd` folder, run `npm run tester`. Pick your name from the list. At the
   end, type `y` to open the report or `n` to skip.
3. When you are ready, run `npm run save`. It uploads the run to GitHub and prints the exact
   commands to send the Recorder, including the branch name.

**Recorder**
1. Watch the Tester's screen share for the whole run.
2. In the `Kemyze/frontEnd` folder, run the commands the Tester sent you:
   `git fetch`, then `git checkout <branch>`, then `npm run record`. Pick your name, then
   pick anything you saw from the list. At the end, type `y` to open the report or `n` to skip.
3. When you are ready, run `npm run save`. It uploads the final report and prints a GitHub
   link that anyone on the team can open.

**Anyone** can open the latest report at any time with `npm run report`. If that ever fails,
run this in PowerShell from the `frontEnd` folder:

```powershell
start (Get-ChildItem .\acceptance\results -Directory | Sort-Object Name | Select-Object -Last 1 | ForEach-Object { "$($_.FullName)\run-for-record.docx" })
```

`npm run report` gets the latest uploaded run on your current branch from GitHub, shows its
summary and opens the report. It changes nothing.

`npm run tester` installs the packages the first time and fills in the test accounts by
itself from `db-testing/ec-users-testing.sql`. It builds and starts the app, checks everything is
ready and prints **Environment ready**, runs the unit and acceptance tests, and prints
**Tests finished**. The test details are not shown on screen; they are all in the report and
in `run.log`. It saves the report, logs, screenshots and a `.tar.gz` package. If something is missing, it stops before
testing and says what to fix.

## The three roles

Every test needs three different people. This is the professor's rule: "I'm going to ask that
the tester be separate from whoever the author of the test was. And then the recorder is also
a different person."

| Role | What they do |
|---|---|
| **Author** | Wrote the test. Set in [`roles.json`](roles.json). |
| **Tester** | Runs `npm run tester` and picks their name. The Author cannot be picked. |
| **Recorder** | Watches the Tester's screen share, then runs `npm run record` and picks their name. The Author and the Tester cannot be picked. |

The Recorder answers by typing y, n or a number. First: "Did you see anything during the run
that should be flagged?" If yes, they pick one item from this list:

1. Tester edited a file
2. Tester changed a setting
3. Tester stopped the run and started it again
4. An error or prompt appeared
5. Tester used AI
6. Something else (the Recorder types what happened)
7. A result in the report does not match what I saw
8. I am finished

For 7, it lists every test in plain words with its result, the Recorder picks the number of
the test, then picks what they saw: "It did not work, but the report says PASS", "It worked,
but the report says FAIL", or "Something else" (typed).

After each item it asks "Is there anything else to flag?" (y or n). When the answer is n, or
the Recorder picks 8, it says "You are complete. Press Enter to finish."

The computer also records some deviations by itself: extra options on the command, code that
was not committed, and an earlier run that day that did not finish. For any failed test, the
Recorder also types what went wrong, how it affects the client, how it was fixed, and the Jira
link.

If there was any deviation, update these steps and repeat the run. The official run must have
none.

## What each run saves

Everything is in `acceptance/results/<date-time>/`, and the whole folder is also packed as
`acceptance/results/<date-time>.tar.gz`.

| File | What it is |
|---|---|
| `run-for-record.docx` | The report sections in the course template's structure: the "For each screen name" list (the test environment), then one section per screen or feature (N.1 to N.7.2) with screenshots. Copy them into the team's System Test Report. |
| `run-for-record.md` | All results as tables, plus the **report readiness checks**. |
| `results.log` | One line per test: date, time, test ID, PASS or FAIL. |
| `run.log` | Everything the run printed, with the time on every line. |
| `unit-tests.md`, `unit-tests.json` | Unit test results. |
| `screenshots/AT-xx.png` | Each test's screen, with a banner showing PASS or FAIL. |
| `run-notes.json` | The Recorder's name, answers and the time they were recorded. |

The end of `run-for-record.md` lists anything that would lose points, such as missing
Recorder notes, a deviation, a failed test without an explanation, or code that is not
committed and pushed. Fix every item before the official run.

## The official run

Run it after the last code change is committed and pushed. The Tester and the Recorder each
upload it with `npm run save`. Submit its `.tar.gz` package with the report. Delete practice
runs from `acceptance/results/` before the official run.

## Good to know

- The test cases are written once, in [`test-cases.js`](test-cases.js). Each test's title
  starts with its ID, for example `AT-01`.
- The test accounts (Primary, Secondary, Tertiary) are the seed users in
  `db-testing/ec-users-testing.sql`, so the Tester never types them. To use other accounts,
  put them in `acceptance/logins.json` (git ignores it). Never put a password in the report.
- No test changes live data or sends a real password reset email. Forgot Password success,
  server error and timeout use a simulated server answer (`fakeServer` in `helpers.js`).
- The login result ("Login Failed" or "Success") uses `Alert.alert`, which shows nothing in a
  web browser. So AT-06, AT-07 and AT-11 to AT-13 check where the app goes instead. The unit
  tests check the messages.
- The acceptance tests log in to the live server at https://kemyze.vercel.app. Results can
  change if that server is updated later.
