// Builds the Run For Record from a results folder: run-for-record.docx (the report sections),
// run-for-record.md (all tables and the readiness checks), and results.log (one timestamped
// line per test). It reads the saved results, the Tester's name (testbed.json) and the
// Recorder's notes (run-notes.json), and never reruns a test, so `npm run record` can
// rebuild it on the Recorder's computer.
const fs = require('fs');
const path = require('path');
const { TEST_CASES, FEATURES, UNIT_TESTS, REQUIREMENTS } = require('./test-cases');
const { writeDocx } = require('./record-docx');

const readJson = (file, fallback) => {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
};

const readText = (file) => {
  try {
    return fs.readFileSync(file, 'utf8').trim();
  } catch {
    return '';
  }
};

const cell = (text) => String(text ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, '<br>');
const mdTable = (headers, rows) =>
  [`| ${headers.join(' | ')} |`, `|${headers.map(() => '---').join('|')}|`, ...rows.map((r) => `| ${r.map(cell).join(' | ')} |`)].join('\n');
const local = (iso) => (iso ? new Date(iso).toLocaleString('en-US') : '');

const readRoles = () => readJson(path.join(__dirname, 'roles.json'), { team: [], others: [], authors: {} });

// Deviations from the test plan for the whole run: what the computer detected, then what the
// Recorder saw. An empty list means none.
function deviationsOf(testBed, notes) {
  return [...(testBed.detected || []).map((d) => `Detected: ${d}`), ...(notes?.deviations || [])];
}

// Every test of the run, with its result, people and the Recorder's notes.
function collectTests(runDir) {
  const testBed = readJson(path.join(runDir, 'testbed.json'), {});
  const unit = readJson(path.join(runDir, 'unit-tests.json'), null);
  const results = readJson(path.join(runDir, 'results.json'), {});
  const notes = readJson(path.join(runDir, 'run-notes.json'), null);
  const roles = readRoles();

  const unitStatus = !unit ? 'NOT RUN' : unit.numTotalTests > 0 && unit.numFailedTests === 0 ? 'PASS' : 'FAIL';
  const tests = [
    {
      id: 'UT-ALL', unit: true, feature: 'Unit tests', description: UNIT_TESTS.description, inputType: 'Valid and Invalid',
      input: 'npm test (all unit tests)', expected: 'Every unit test passes.',
      actual: unit ? `${unit.numPassedTests} passed, ${unit.numFailedTests} failed, ${unit.numTotalTests} total (see unit-tests.md).` : 'Not run.',
      status: unitStatus, finishedAt: testBed.unitFinishedAt,
    },
    ...TEST_CASES.map((testCase) => {
      const result = results[testCase.id];
      const status = result?.status || 'NOT RUN';
      // What the app showed, saved by record-environment.js. A passing test without a message
      // confirmed every check in its expected outcome.
      const shown = readText(path.join(runDir, 'outputs', `${testCase.id}.txt`));
      const actual =
        status === 'PASS' ? (shown ? `${shown}, as expected.` : `Confirmed: ${testCase.expected}`)
          : status === 'FAIL' ? result.failure
            : 'Not run.';
      return {
        ...testCase, status, actual, finishedAt: result?.finishedAt,
        screenshot: fs.existsSync(path.join(runDir, 'screenshots', `${testCase.id}.png`)),
      };
    }),
  ];
  for (const test of tests) {
    Object.assign(test, {
      author: roles.authors[test.id] || '',
      tester: testBed.tester || '',
      recorder: notes?.recorder || '',
      failureNotes: notes?.failures?.[test.id],
      when: local(test.finishedAt),
    });
  }
  return { tests, testBed, unit, roles, notes, deviations: deviationsOf(testBed, notes) };
}

// Everything that would lose rubric points, in plain words.
function readinessProblems({ tests, testBed, roles, notes, deviations }) {
  const problems = [];
  if (testBed.dirty) problems.push('The code had uncommitted changes. Commit everything, then run npm run tester again.');
  if (!testBed.pushed) problems.push(`Commit ${testBed.commit} is not on GitHub yet, so the script links in the report do not work. Push it.`);
  if (!testBed.tester) problems.push('No Tester was picked. Run npm run tester again.');
  if (!notes) problems.push('The Recorder has not added notes yet. The Recorder runs npm run record.');
  if (deviations.length) problems.push('The run had deviations from the test plan. Update the steps in the README, then repeat the run.');

  const allowed = [...roles.team, ...(roles.others || [])];
  for (const t of tests) {
    if (t.status === 'NOT RUN') problems.push(`${t.id} did not run. Every test in the report needs a result.`);
    if (!t.unit && t.status !== 'NOT RUN' && !t.screenshot) problems.push(`${t.id} has no screenshot.`);
    if (t.status === 'FAIL' && notes) {
      const n = t.failureNotes || {};
      if (!n.whatWentWrong) problems.push(`${t.id} failed. The Recorder must say what went wrong (npm run record).`);
      if (!n.clientImpact) problems.push(`${t.id} failed. The Recorder must say how this affects the client (npm run record).`);
      if (!n.jira) problems.push(`${t.id} failed. The Recorder must add a Jira link (npm run record).`);
    }
    // The professor's rule: the author, the tester and the recorder are three different people.
    if (!t.author) problems.push(`${t.id} has no Author in acceptance/roles.json.`);
    if (t.author && t.author === t.tester) problems.push(`${t.id}: the Tester cannot be the Author (${t.author}).`);
    if (t.recorder && (t.recorder === t.tester || t.recorder === t.author)) {
      problems.push(`${t.id}: the Recorder must be a different person from the Author and the Tester.`);
    }
    if (t.author && !allowed.includes(t.author)) problems.push(`${t.id}: Author "${t.author}" is not in the name list in roles.json.`);
  }

  for (const { feature, ticket, renderOnly } of FEATURES) {
    const own = TEST_CASES.filter((t) => t.feature === feature);
    const hasValid = own.some((t) => t.inputType === 'Valid');
    const hasInvalid = own.some((t) => t.inputType === 'Invalid');
    if (!own.length) problems.push(`${feature} (${ticket}) has no test.`);
    else if (!hasValid || (!hasInvalid && !renderOnly)) problems.push(`${feature} (${ticket}) needs both a Valid and an Invalid test.`);
  }
  for (const { requirement, item, unit, acceptance } of REQUIREMENTS) {
    if (!unit && !acceptance.length) problems.push(`Requirement "${requirement}: ${item}" has no test.`);
  }
  return problems;
}

async function buildReport(runDir) {
  const data = collectTests(runDir);
  const { tests, testBed, notes, deviations } = data;
  const browser = readJson(path.join(runDir, 'browser.json'), {});
  const problems = readinessProblems(data);
  const status = (id) => tests.find((t) => t.id === id)?.status || 'NOT RUN';

  // results.log: one timestamped line per test, the plain-text proof of the run.
  const log = [
    `Kemyze Run For Record  commit ${testBed.commit} (${testBed.branch})  started ${local(testBed.runStartedAt)}`,
    `Tester: ${testBed.tester || 'not picked'}  Recorder: ${notes?.recorder || 'not yet'}${notes ? ` (notes ${local(notes.recordedAt)})` : ''}`,
    ...[...tests]
      .sort((a, b) => String(a.finishedAt).localeCompare(String(b.finishedAt)))
      .map((t) => `${t.when || 'not run'}  ${t.id}  ${t.status}  ${t.description}`),
  ];
  fs.writeFileSync(path.join(runDir, 'results.log'), `${log.join('\n')}\n`);

  // run-for-record.md: every table plus the readiness checks, kept with the code.
  const software = [
    ['Node.js', testBed.node],
    ['npm', testBed.npm],
    ['Google Chrome', browser.version || 'not recorded'],
    ['ChromeDriver', browser.driver || 'not recorded'],
    ...Object.entries(testBed.packages || {}),
  ];
  const markdown = [
    '# Run For Record',
    '',
    `Commit ${testBed.commit} on ${testBed.branch}, run ${local(testBed.runStartedAt)}. The report sections are in run-for-record.docx.`,
    '',
    `Tester: ${testBed.tester || 'not picked'}. Recorder: ${notes ? `${notes.recorder} (notes ${local(notes.recordedAt)})` : 'no notes yet'}.`,
    '',
    `Deviations from the test plan: ${notes || deviations.length ? deviations.join('; ') || 'None' : 'not recorded yet'}.`,
    '',
    '## Test environment',
    '',
    mdTable(['Item', 'Value'], [['Operating system', testBed.os], ...software, ['Repository', testBed.repository], ['Backend', testBed.backend], ['Command', testBed.command]]),
    '',
    '## Results',
    '',
    mdTable(
      ['Test ID', 'Description', 'Input type', 'Input', 'Expected outcome', 'Actual outcome', 'Result', 'Date and time', 'Author', 'Tester', 'Recorder'],
      tests.map((t) => [t.id, t.description, t.inputType, t.input, t.expected, t.actual, t.status, t.when, t.author, t.tester, t.recorder]),
    ),
    '',
    '## Requirement coverage (KM-68 acceptance requirements)',
    '',
    mdTable(
      ['Requirement', 'Item', 'Unit test', 'Acceptance test'],
      REQUIREMENTS.map(({ requirement, item, unit, acceptance }) => [
        requirement, item, unit ? `${unit} (${status('UT-ALL')})` : 'NONE',
        acceptance.map((id) => `${id} (${status(id)})`).join(', ') || 'Unit test only',
      ]),
    ),
    '',
    '## Report readiness checks',
    '',
    ...(problems.length ? problems.map((p) => `- [ ] ${p}`) : ['- [x] No problems found. This run can be used as the Run For Record.']),
    '',
  ].join('\n');
  fs.writeFileSync(path.join(runDir, 'run-for-record.md'), markdown);

  // run-for-record.docx: the report sections in the template's structure.
  const byId = Object.fromEntries(tests.map((t) => [t.id, t]));
  const features = FEATURES.map(({ feature, title, description, renderOnly, scripts }) => {
    const own = TEST_CASES.filter((t) => t.feature === feature).map((t) => byId[t.id]);
    return {
      title, description, renderOnly, scripts, tests: own,
      valid: own.filter((t) => t.inputType === 'Valid'),
      invalid: own.filter((t) => t.inputType === 'Invalid'),
    };
  });
  features.push({
    title: UNIT_TESTS.title, description: UNIT_TESTS.description, scripts: UNIT_TESTS.scripts,
    validText: UNIT_TESTS.valid, invalidText: UNIT_TESTS.invalid, tests: [byId['UT-ALL']],
  });
  await writeDocx(runDir, { testBed, software, features, notes, deviations });
  return problems;
}

module.exports = { buildReport, collectTests, readRoles };
