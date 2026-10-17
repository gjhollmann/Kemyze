// Builds run-for-record.docx in the structure of the CSC 191 template
// System-Test-Report_TeamName.docx: the "For each screen name" list, then one numbered section per
// Screen/Action/Feature with subsections N.1 to N.7.2. Copy these sections into the team's
// System Test Report (renumber them to fit). Front page, table of contents and signatures are
// team pages and are not generated here.
const fs = require('fs');
const path = require('path');
const {
  BorderStyle,
  Document,
  ExternalHyperlink,
  HeadingLevel,
  ImageRun,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} = require('docx');

const FONT = 'Times New Roman';
const border = { style: BorderStyle.SINGLE, size: 4, color: '999999' };
const borders = { top: border, bottom: border, left: border, right: border };

const text = (value, options = {}) => new TextRun({ text: String(value ?? ''), font: FONT, size: 22, ...options });

// PASS and FAIL are bold green and red so the result is clearly visible.
const resultRun = (value, size = 22) =>
  value === 'PASS' || value === 'FAIL'
    ? text(value, { bold: true, size, color: value === 'PASS' ? '1B7F3B' : 'B3261E' })
    : text(value, { size });

const para = (children, options = {}) =>
  new Paragraph({ spacing: { after: 100 }, ...options, children: Array.isArray(children) ? children : [text(children)] });

const heading = (value, level) =>
  new Paragraph({ heading: level, spacing: { before: 240, after: 100 }, children: [new TextRun({ text: value, font: FONT, bold: true })] });

// "1.4 Tester Name" followed by its content, indented like the template.
const sub = (number, label, children) => [
  para([text(`${number} ${label}`, { bold: true })], { indent: { left: 360 } }),
  ...children,
];
const body = (value) => para([text(value)], { indent: { left: 720 } });

const cell = (value, header = false) =>
  new TableCell({
    borders,
    shading: header ? { type: ShadingType.CLEAR, fill: 'E8E8E8', color: 'auto' } : undefined,
    margins: { top: 40, bottom: 40, left: 80, right: 80 },
    children: String(value ?? '')
      .split(/\r?\n/)
      .map((line) => new Paragraph({ children: [header ? text(line, { bold: true, size: 18 }) : resultRun(line, 18)] })),
  });

const table = (headers, rows) =>
  new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ tableHeader: true, children: headers.map((h) => cell(h, true)) }),
      ...rows.map((row) => new TableRow({ children: row.map((value) => cell(value)) })),
    ],
  });

// The inputs table for N.2 (Valid) and N.3 (In-Valid).
const inputsTable = (tests) =>
  table(
    ['Test ID', 'Description', 'Input (value or sequence entered)', 'Expected outcome', 'Actual outcome', 'Result', 'Date and time'],
    tests.map((t) => [t.id, t.description, t.input, t.expected, t.actual, t.status, t.when || 'Not run']),
  );

// PNG width and height are stored in the file header.
const pngSize = (buffer) => ({ width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) });

function screenshot(runDir, test) {
  const file = path.join(runDir, 'screenshots', `${test.id}.png`);
  if (!fs.existsSync(file)) {
    return [body(`${test.id}: no screenshot (${test.status}).`)];
  }
  const data = fs.readFileSync(file);
  const { width, height } = pngSize(data);
  const shown = 220;
  return [
    para([text(`Figure ${test.id}: `, { bold: true }), text(`${test.description} `), resultRun(test.status)], { indent: { left: 720 } }),
    para([new ImageRun({ type: 'png', data, transformation: { width: shown, height: Math.round((height / width) * shown) } })], {
      indent: { left: 720 },
    }),
  ];
}

const unique = (values) => [...new Set(values.filter(Boolean))];
const local = (iso) => (iso ? new Date(iso).toLocaleString('en-US') : '');

// A clickable link in the document.
const link = (label, url) =>
  new ExternalHyperlink({ link: url, children: [new TextRun({ text: label, font: FONT, size: 22, style: 'Hyperlink' })] });
const scriptUrl = (testBed, file) => `${String(testBed.repository || '').replace(/\.git$/, '')}/blob/${testBed.commitFull}/${file}`;

// One numbered Screen/Action/Feature section, exactly as the template lists it.
function featureSection(runDir, testBed, run, n, { title, description, valid, invalid, validText, invalidText, tests, renderOnly, scripts = [] }) {
  const ran = tests.filter((t) => t.status !== 'NOT RUN');
  const failed = tests.filter((t) => t.status === 'FAIL');
  const notRun = tests.filter((t) => t.status === 'NOT RUN');
  const passed = ran.length > 0 && !failed.length && !notRun.length;
  const dates = unique(ran.map((t) => t.finishedAt && new Date(t.finishedAt).toLocaleDateString('en-US')));

  return [
    heading(`${n}.0 ${title}`, HeadingLevel.HEADING_2),
    ...sub(`${n}.1`, 'Brief Description of Test', [
      body(description),
      ...scripts.map((file) => para([text('Test script: '), link(file, scriptUrl(testBed, file))], { indent: { left: 720 } })),
    ]),
    ...sub(`${n}.2`, 'Valid Test Inputs: description and value or sequence of values entered', validText ? [body(validText)] : valid.length ? [inputsTable(valid)] : [body('None.')]),
    ...sub(
      `${n}.3`,
      'In-Valid Test Inputs: To test error handling/recovery',
      invalidText
        ? [body(invalidText)]
        : invalid.length
          ? [inputsTable(invalid)]
          : [body(renderOnly ? 'Not applicable: this test only opens the screen and takes no input.' : 'None.')],
    ),
    para([text('Test Author', { bold: true })], { indent: { left: 360 } }),
    body(unique(tests.map((t) => t.author)).join(', ') || 'Not assigned'),
    ...sub(`${n}.4`, 'Tester Name', [body(unique(tests.map((t) => t.tester)).join(', ') || 'Not assigned')]),
    ...sub(`${n}.5`, 'Recorder/Observer Name', [body(unique(tests.map((t) => t.recorder)).join(', ') || 'Not assigned')]),
    ...sub(`${n}.6`, 'Date Tested', [body(dates.join(', ') || 'Not run')]),
    ...sub(`${n}.7`, 'Results', [
      body(
        run.deviations.length
          ? `Deviations from the test plan: ${run.deviations.join('; ')}.`
          : run.notes ? 'Deviations from the test plan: None.' : 'Deviations from the test plan: not recorded yet.',
      ),
    ]),
    para([text(`${n}.7.1 Did it pass? `, { bold: true }), resultRun(passed ? 'PASS' : failed.length ? 'FAIL' : 'NOT RUN')], {
      indent: { left: 720 },
    }),
    body(
      passed
        ? ran.length === 1
          ? `Yes. ${ran[0].id} passed.`
          : `Yes. All ${ran.length} tests passed: ${ran.map((t) => t.id).join(', ')}.`
        : [
            failed.length && `No. Failed: ${failed.map((t) => t.id).join(', ')}.`,
            notRun.length && `Not run: ${notRun.map((t) => t.id).join(', ')}.`,
          ]
            .filter(Boolean)
            .join(' '),
    ),
    para([text(`${n}.7.2 If not, include Jira/Other link – Strikethrough when resolved`, { bold: true })], {
      indent: { left: 720 },
    }),
    ...(failed.length || notRun.length
      ? [...failed, ...notRun].flatMap((t) => {
          const notes = t.failureNotes || {};
          return [
            body(`${t.id}: ${notes.jira || 'Jira link not added yet'}`),
            body(`What went wrong: ${notes.whatWentWrong || t.actual}`),
            body(`Impact on the client: ${notes.clientImpact || 'not recorded yet'}`),
            body(`Resolution: ${notes.resolution || 'not resolved yet'}`),
          ];
        })
      : [body('Not applicable: every test passed.')]),
    ...(tests.some((t) => !t.unit) ? [body('Screenshots (the banner on each shows the test ID, PASS or FAIL, the date and time, and any message the app showed):')] : []),
    ...tests.filter((t) => !t.unit).flatMap((t) => screenshot(runDir, t)),
  ];
}

// testBed: from record.js; software: [name, version] rows; features: report sections.
async function writeDocx(runDir, { testBed, software, features, notes, deviations }) {
  // The template's opening list, word for word ("scripts" is spelled correctly here; the
  // template has the typo "scrips"). Each template item is a bullet; the details sit under it.
  const item = (value, level = 0) => new Paragraph({ bullet: { level }, spacing: { before: 120, after: 60 }, children: [text(value)] });
  const detail = (...children) => new Paragraph({ indent: { left: 1080 }, spacing: { after: 60 }, children });
  const line = (value) => detail(text(value));
  const environment = [
    para([text('For each screen name')]),
    para([text('Note: Information provided in each subsection should provide sufficient information needed to run the test.')], { indent: { left: 360 } }),
    item('Test Environment setup'),
    line(`The tests open the Kemyze web app in Google Chrome (using Selenium WebDriver) and log in to the live server at ${testBed.backend}. Results can change if that server is updated after ${local(testBed.runStartedAt)}.`),
    line('The unit tests run with the server replaced by test data, so they do not need the internet.'),
    line('Test account details are provided to the verifier separately. They are never stored in the repository or in this report.'),
    item("Test software used with version #'s"),
    table(['Software', 'Version'], software),
    item('Test Environment operating system & version\\build #'),
    line(testBed.os || 'not recorded'),
    item('Any test git repo locations'),
    line(`Repository: ${testBed.repository || 'not recorded'}`),
    line(`Commit tested: ${testBed.commit} on branch ${testBed.branch} (${testBed.commitDate})`),
    ...unique(features.flatMap((f) => f.scripts || [])).map((file) => detail(text('Test script: '), link(file, scriptUrl(testBed, file)))),
    item('How to pull test scripts', 1),
    line(`1. Get the code: git clone ${testBed.repository}, then cd Kemyze, then git checkout ${testBed.commit}, then cd frontEnd.`),
    line('2. Run the tests: npm run tester'),
    item('Other important test setup procedures'),
    line('You need Node.js and Google Chrome installed. npm run tester installs everything else, builds and starts the app, asks once for the test account details, and asks the Tester to pick their name from a list.'),
    line('Before testing, it checks the app, the server and the test accounts, and prints "Environment ready". If something is missing, it stops and says what to fix.'),
    line("The Tester and the Recorder work from separate computers. The Recorder watches the Tester's screen share for the whole run, then runs npm run record on their own computer to pick their name and record what they saw."),
    line('Each run saves the logs, screenshots, this document and a .tar.gz package in frontEnd/acceptance/results/.'),
    line('No test changes live data or sends a real password reset email.'),
  ];

  const doc = new Document({
    styles: { default: { document: { run: { font: FONT, size: 22 } } } },
    sections: [
      {
        properties: { page: { margin: { top: 1080, bottom: 1080, left: 1080, right: 1080 } } },
        children: [...environment, ...features.flatMap((feature, index) => featureSection(runDir, testBed, { notes, deviations }, index + 1, feature))],
      },
    ],
  });
  fs.writeFileSync(path.join(runDir, 'run-for-record.docx'), await Packer.toBuffer(doc));
}

module.exports = { writeDocx };
