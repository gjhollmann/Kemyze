# System Test Report rules (CSC 191)

Follow these rules for any work on the System Test Report, the Run For Record, or the tests
that feed them. The report is worth 200 points. Professor Elliott will follow the report
himself to rerun the tests, so it must work for someone who has only the report.

Before saying any report work is done, check every item in "Rubric checklist" below and every
item under "Report readiness checks" at the end of the run's `run-for-record.md`. If any item
is not met, say which one.

## Writing rules

- Every set of steps is 3 steps or fewer, in plain American English, one action per step,
  with the exact command. If a step can be done by a script, the script does it.
- No jargon. Write so that someone outside the team cannot misread it.

## Do not deviate from the template

- Use `System-Test-Report_TeamName.docx` exactly. Keep every section, in its order, with its
  headings. Do not rename, merge, reorder or drop sections. The sample reports are guides only.
- If the template and these rules disagree, the template's structure wins and the rubric's
  content still applies.
- Write the report in Google Docs or OneDrive with change tracking on.
- No anonymous edits. Every editor must be signed in (−40 points otherwise).
- Invite the instructor as an editor: kenneth.elliott.csu@gmail.com (Google) or
  kenneth.elliott@csus.edu (Microsoft).

## Template structure (exact)

`System-Test-Report_TeamName.docx` (Guide to Preparing the System Test Report, CSc 191,
Version 3 Oct. 2023). Keep these pages and headings, in this order, with this wording:

1. **Front page**: the same front page design as every CSc 190/191 document. Replace the guide
   box with the project logo, then "System Test Report", "Project name:", "Team name:",
   "Team Members" (every member listed) and "Date:" (the date of the Run For Record).
2. **TABLE OF CONTENTS**: generated automatically by Word or Google Docs, not typed.
3. **"For each screen name"**, then the note "Note: Information provided in each subsection
   should provide sufficient information needed to run the test.", then these bullets:
   - Test Environment setup
   - Test software used with version #'s
   - Test Environment operating system & version\build #
   - Any test git repo locations
     - How to pull test scripts (the template misspells it "scrips"; always write "scripts")
   - Other important test setup procedures
4. **One numbered section per Screen/Action/Feature**, with exactly these headings:
   - `N.0 <Screen/Action/Feature>`
   - `N.1 Brief Description of Test`
   - `N.2 Valid Test Inputs: description and value or sequence of values entered`
   - `N.3 In-Valid Test Inputs: To test error handling/recovery`
   - `N.4 Tester Name`
   - `N.5 Recorder/Observer Name`
   - `N.6 Date Tested`
   - `N.7 Results`
     - `N.7.1 Did it pass?`
     - `N.7.2 If not, include Jira/Other link – Strikethrough when resolved`
5. **Signature page** (last page): "Digital or Physical signature required; integrity of the
   document must be kept intact. Do not copy and paste signatures.", then "Team Members:" and
   "System Test Verification Completed: Date:", then a Name / Signature row for every member.

Rubric items the template does not name go inside its sections, never in place of them:
- **Introduction**: a short paragraph right after the TABLE OF CONTENTS.
- **Test Author**: a line between N.3 and N.4 of each feature section.
- **Expected outcome, actual output, date and time, screenshots**: inside N.2, N.3 and N.7.
- **Deviations from the test plan**: under N.7 Results.
- **Failures**: under N.7.2, with the Jira link, what went wrong, the impact on the client, and
  the resolution.
- **Artifacts**: a section after the last feature section and before the signature page.
- **Accuracy statement**: a paragraph on the signature page, above the Name / Signature rows.

`npm run tester` writes `run-for-record.docx` in this structure. Copy its Test environment
items and feature sections into the team document and renumber the sections to fit. The front
page, table of contents, introduction, artifacts and signature page are written by the team.

## The three roles (required)

Professor Elliott: "I'm going to ask that the tester be separate from whoever the author of the
test was. And then the recorder is also a different person, right? So you're gonna have to
rotate around." He also said: "it is a requirement to have the recorder."

- **Author**: wrote the test. Set in `frontEnd/acceptance/roles.json`.
- **Tester**: runs `npm run tester` on their own computer and picks their name from the
  list. The Author cannot be picked.
- **Recorder**: on a separate computer, watches the Tester's screen share for the whole run,
  then runs `npm run record` and picks their name. The Author and the Tester cannot be
  picked. The Recorder then picks every deviation they saw (or none) and, for each failed test,
  types what went wrong, the impact on the client, the resolution and the Jira link.

Rules:
- For every test, the Author, Tester and Recorder are three different people. The code
  enforces this; never work around it.
- Never type Tester or Recorder names into files by hand. They come only from the name menus.
- Every team member writes at least one test and is the Tester of at least one test somewhere
  in the report. Rotate the roles.
- The Recorder answers only with y/n or a number from a list (no test IDs or other references
  to look up). The list is: Tester edited a file; Tester changed a setting; Tester stopped the
  run and started it again; An error or prompt appeared; Tester used AI; Something else
  (typed); A result in the report does not match what I saw (pick the test from a numbered
  list, then pick what was seen); I am finished. After each item it asks "Is there anything
  else to flag?" (y/n) until the Recorder is done.
  The computer also records extra command options, uncommitted code, and an unfinished
  earlier run.
- Any deviation means the README steps are updated and the run is repeated. The official run
  has no deviations.

## One source for everything (no duplicated work)

| What | Where |
|---|---|
| Test cases: ID, feature, description, input, Valid or Invalid, expected outcome | `frontEnd/acceptance/test-cases.js` |
| Author of each test, and the name list | `frontEnd/acceptance/roles.json` |
| Tester and Recorder of a run | Picked from the menus; saved in the run's `testbed.json` and `run-notes.json` |
| How to run the tests | `frontEnd/acceptance/README.md` (the report uses the same steps) |
| Results, logs, screenshots, report sections, package | `frontEnd/acceptance/results/<date-time>/` and `<date-time>.tar.gz` |

- Add or change a test case only in `test-cases.js`, and start the test's title with its ID,
  for example `it('AT-01 ...')`.
- Copy results into the report from `run-for-record.docx`. Never retype results by hand.
- The same tests count for the Jira tickets and the report.

## Rubric checklist (200 points)

### Cover Page (10)
- [ ] Project logo (replacing the template's guide box)
- [ ] Project name (Kemyze) and team name (Reverse Engineers)
- [ ] Team Members: every member listed
- [ ] Date of the Run For Record

### Introduction and Table of Contents (10)
- [ ] Table of Contents generated automatically, matching the sections and page numbers
- [ ] Introduction stating the purpose and scope of the testing, right after the TABLE OF CONTENTS

### Test Environment Setup (50)
The report must stand on its own: the grader follows only these steps on his own computer.
- [ ] The run steps, word for word from the README (3 steps or fewer)
- [ ] Repository URL, commit and branch tested, and links to every test script at that commit
- [ ] Version of every tool: Node.js, npm, Google Chrome, ChromeDriver, Jest, jest-expo,
      React Native Testing Library, Selenium WebDriver, Expo, React Native, React
- [ ] Operating system with version and build number
- [ ] The live server address (https://kemyze.vercel.app) and a note that results can change
      if it is updated after the run date
- [ ] How the grader knows the environment is ready: the run prints "Environment ready"
- [ ] "Test account details are provided to the verifier separately." Send them privately to
      the instructor, in the submission comment or by email. Never in the report or the repo.

### Test Suite (30)
- [ ] Every feature promised in the Product Charter, Section 2.3, has at least one test.
      Below that minimum, this section scores 0 of 30. Check it across all tickets.
- [ ] Most of the rest of the application is tested too
- [ ] Every feature has at least one Valid and one Invalid input test (or none is possible)
- [ ] Automated tests are included: unit tests and Selenium acceptance tests

### Run For Record (50)
For every test:
- [ ] Test ID and a brief description
- [ ] Expected outcome, clearly labeled
- [ ] Input and actual output
- [ ] A clear PASS or FAIL
- [ ] Screenshot showing the output and PASS or FAIL
- [ ] Date and time, after the last code change
- [ ] Author, Tester and Recorder: three different people, picked from the name menus
- [ ] Deviations from the test plan: "None" (any deviation means the run is repeated)
- [ ] Failed test: kept in the report, with what went wrong, the impact on the client, the
      resolution, and a Jira link (struck through when resolved)

For the whole run:
- [ ] Run after the last code change was committed and pushed
- [ ] No test is NOT RUN

### Artifacts (30)
- [ ] A section that says where the artifacts are
- [ ] Links to the test scripts in the repository
- [ ] `results.log` (one timestamped PASS or FAIL line per test) and `run.log` (the full run
      output, timestamped)
- [ ] The `.tar.gz` package submitted to the assignment portal and given to the client
- [ ] The official results folder committed to git

### Signatures (20)
- [ ] Last page is the template's signature page, with "System Test Verification Completed:
      Date:" filled in
- [ ] A paragraph stating the test results are accurate, above the Name / Signature rows
- [ ] Every member signs digitally (BoldSign or Adobe eSign) or by hand. Never copy and paste
      a signature.

### Submission
- [ ] The report, the `.tar.gz` package and a copy of the eSign transaction report
- [ ] The document link posted in the submission comments

## Run For Record steps

The Tester and the Recorder each do one command, on separate computers:

- **Tester:** start a screen share with the Recorder, run `npm run tester` in the
  `Kemyze/frontEnd` folder and pick your name. When ready, run `npm run save` to upload it,
  then send the Recorder the commands it prints (`git fetch`, `git checkout <branch>`,
  `npm run record`). The Recorder must be on the Tester's branch to get the run.
- **Recorder:** watch the screen share. In the `Kemyze/frontEnd` folder, run the commands the
  Tester sent (`git fetch`, `git checkout <branch>`, `npm run record`), then pick your name and
  what you saw. When ready, run `npm run save` to upload the final report.

Anyone can open the latest report with `npm run report` (it changes nothing).

Then fix everything under "Report readiness checks" in `run-for-record.md`, and copy
`run-for-record.docx` into the report. Do the official run after the last code change is
committed and pushed. Delete practice runs.

## Safety

- Tests use the live server, so they only read and search. Never add a test that creates,
  edits or deletes live data, or sends a real email. Use `fakeServer` in
  `frontEnd/acceptance/helpers.js` to simulate those server answers.
- Never run `npm run tester`, `npm run record` or `npm run save`. Only the human
  Tester and Recorder run them, and `save` commits and pushes.
- Never open, read or print `frontEnd/acceptance/logins.json`. It can hold test passwords.
- The test accounts come from the seed users in `db-testing/ec-users-testing.sql`;
  `frontEnd/acceptance/logins.json` (git ignores it) overrides them. Never commit
  `logins.json`. Never put a password in the report, a screenshot or a log. (The login
  screen shows the masked password and the typed email in some screenshots; that is fine.)
- Screenshots support results. They never replace the written expected outcome, PASS or FAIL,
  or the logs.
- Kemyze is iOS only. Do not add Android tests or wording.
