// Run For Record for the System Test Report. The Tester and the Recorder each run one command
// on their own computer:
//   npm run tester   (Tester) pick your name, then it installs packages, asks once for the test
//                    logins, builds and starts the app, checks the environment, runs the unit
//                    and acceptance tests, writes the report and logs, and packages the results
//                    folder. Nothing is uploaded.
//   npm run record   (Recorder) gets the latest uploaded run, asks you to pick your name and
//                    what you saw during the run, and rebuilds the report. It never changes a
//                    result. Nothing is uploaded.
//   npm run save     (either) uploads the latest run to GitHub when you are ready (git commit
//                    and push) and prints a link to the report.
//   npm run report   (anyone) gets the latest uploaded run, shows its summary and opens the
//                    report. It changes nothing.
// Everything is saved in acceptance/results/<date-time>/ and acceptance/results/<date-time>.tar.gz.
const fs = require('fs');
const http = require('http');
const https = require('https');
const os = require('os');
const path = require('path');
const readline = require('readline');
const { execSync, execFileSync, spawn, spawnSync } = require('child_process');

const frontEnd = path.join(__dirname, '..');
const resultsDir = path.join(__dirname, 'results');
const BACKEND = 'https://kemyze.vercel.app';
const interactive = Boolean(process.stdin.isTTY);

// What the Recorder can report seeing. The last one asks for a description.
const DEVIATIONS = [
  'Tester edited a file',
  'Tester changed a setting',
  'Tester stopped the run and started it again',
  'An error or prompt appeared',
  'Tester used AI',
  'Something else',
  'A result in the report does not match what I saw',
];

// The name lists and test authors. Read directly, so it works before packages are installed.
const readRoles = () => JSON.parse(fs.readFileSync(path.join(__dirname, 'roles.json'), 'utf8'));

const sh = (command) => execSync(command, { cwd: frontEnd, encoding: 'utf8' }).trim();
const stamp = () => {
  const now = new Date();
  return new Date(now - now.getTimezoneOffset() * 60000).toISOString().replace(/[:T]/g, '-').slice(0, 19);
};

// ---- Questions on screen -------------------------------------------------------------

function ask(question, { hidden = false } = {}) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    if (hidden) {
      rl._writeToOutput = (s) => rl.output.write(s.startsWith(question) ? question : s.replace(/[^\r\n]/g, '*'));
    }
    rl.question(question, (answer) => {
      rl.close();
      if (hidden) process.stdout.write('\n');
      resolve(answer.trim());
    });
  });
}

// Shows the name list and returns the chosen name. `refuse` maps a name to the reason it
// cannot be chosen; the question repeats until an allowed name is picked.
async function pickName(question, refuse = {}) {
  const roles = readRoles();
  const names = [...roles.team, ...(roles.others || [])];
  const list = names.map((name, i) => `  ${String(i + 1).padStart(2)}  ${name}`).join('\n');
  for (;;) {
    const answer = await ask(`\n${question} Type a number, then press Enter.\n${list}\n> `);
    const name = names[Number(answer) - 1];
    if (!/^\d+$/.test(answer) || !name) console.log(`Please type a number from 1 to ${names.length}.`);
    else if (refuse[name]) console.log(refuse[name]);
    else return name;
  }
}

// Saves a run to GitHub (git commit and push) so the other person can get it with git pull.
// Returns true when it worked.
function save(name, message) {
  const folder = `acceptance/results/${name}`;
  try {
    execFileSync('git', ['add', folder, `${folder}.tar.gz`], { cwd: frontEnd });
    execFileSync('git', ['commit', '-m', message], { cwd: frontEnd, stdio: 'ignore' });
    execSync('git push -u origin HEAD', { cwd: frontEnd, stdio: 'ignore' });
    return true;
  } catch (error) {
    console.log(`\nCould not save to GitHub: ${error.message.split('\n')[0]}`);
    console.log('The run is still on this computer. Fix the problem above, then run npm run save again.');
    return false;
  }
}

// GitHub page for a file in the saved run, on the current branch.
const githubLink = (name, file) => {
  const repo = sh('git remote get-url origin').replace(/\.git$/, '');
  const branch = sh('git rev-parse --abbrev-ref HEAD');
  return `${repo}/blob/${branch}/frontEnd/acceptance/results/${name}/${file}`;
};

// Opens a run's report with the computer's default app (Word on Windows). It waits until the
// file has been handed over, so the command does not exit before the file opens.
function openReport(runDir) {
  const file = path.join(runDir, 'run-for-record.docx');
  console.log('\nOpening the report...');
  const opened =
    process.platform === 'win32'
      ? spawnSync('powershell', ['-NoProfile', '-Command', `Start-Process -FilePath '${file.replace(/'/g, "''")}'`])
      : spawnSync(process.platform === 'darwin' ? 'open' : 'xdg-open', [file]);
  if (opened.status !== 0) {
    console.log(`Could not open it automatically. Open this file yourself: ${file}`);
  }
}

// Asks whether to open the report now. Only y or n is accepted.
async function offerToOpen(runDir) {
  for (;;) {
    const answer = (await ask('Open the report now? Type y or n, then press Enter: ')).toLowerCase();
    if (answer === 'y' || answer === 'yes') return openReport(runDir);
    if (answer === 'n' || answer === 'no') {
      console.log('Not opened. Open it later with: npm run report');
      return;
    }
    console.log('Please type y or n.');
  }
}

// ---- Tester: install, logins, build, check, test -----------------------------------------

function install() {
  if (!fs.existsSync(path.join(frontEnd, 'node_modules', '.bin', 'jest'))) {
    console.log('Installing packages (first run only)...');
    execSync('npm ci', { cwd: frontEnd, stdio: 'inherit' });
  }
}

async function askForLogins() {
  const { ROLE_NAMES, LOGINS_FILE, readLogins } = require('./helpers');
  const logins = readLogins();
  const missing = ROLE_NAMES.filter((name) => !logins[name]?.email || !logins[name]?.password);
  if (!missing.length || !interactive) return;
  console.log('\nEnter the test account details you were given. They are saved only on this computer.');
  for (const name of missing) {
    const email = await ask(`${name} account email: `);
    const password = await ask(`${name} account password: `, { hidden: true });
    logins[name] = { email, password };
  }
  fs.writeFileSync(LOGINS_FILE, JSON.stringify(logins, null, 2));
}

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.ttf': 'font/ttf', '.woff': 'font/woff', '.woff2': 'font/woff2' };

// Serves the static web build (dist/): /Pages/scanner is dist/Pages/scanner.html.
function startServer(port = 8082) {
  const dist = path.join(frontEnd, 'dist');
  const server = http.createServer((req, res) => {
    const route = decodeURIComponent(req.url.split('?')[0]);
    const candidates = [route, `${route}.html`, path.join(route, 'index.html')].map((p) => path.join(dist, p));
    const file = candidates.find((p) => p.startsWith(dist) && fs.existsSync(p) && fs.statSync(p).isFile());
    const target = file || path.join(dist, '+not-found.html');
    res.writeHead(file ? 200 : 404, { 'Content-Type': TYPES[path.extname(target)] || 'application/octet-stream' });
    fs.createReadStream(target).pipe(res);
  });
  return new Promise((resolve) => {
    server.once('error', () => resolve(startServer(port + 1)));
    server.listen(port, () => resolve({ server, url: `http://localhost:${port}` }));
  });
}

// Any HTTP answer counts as reachable; the login URL with no details answers 400 and changes nothing.
const reachable = (url) =>
  new Promise((resolve) => {
    (url.startsWith('https') ? https : http)
      .get(url, (res) => {
        res.resume();
        resolve(true);
      })
      .on('error', () => resolve(false))
      .setTimeout(15000, function () {
        this.destroy();
        resolve(false);
      });
  });

async function checkEnvironment(appUrl) {
  const { ROLE_NAMES, readLogins } = require('./helpers');
  const logins = readLogins();
  const problems = [];
  if (!(await reachable(appUrl))) problems.push(`The app did not start at ${appUrl}.`);
  if (!(await reachable(`${BACKEND}/login/`))) problems.push(`The server ${BACKEND} cannot be reached. Check the internet connection.`);
  for (const name of ROLE_NAMES) {
    if (!logins[name]?.email || !logins[name]?.password) problems.push(`The ${name} test account details are missing.`);
  }
  return problems;
}

// Runs a command and writes every line of its output to run.log with the time. `quiet` keeps
// the output off the screen (it still goes to the log).
function run(command, log, { env = {}, quiet = false } = {}) {
  return new Promise((resolve) => {
    const child = spawn(command, { cwd: frontEnd, shell: true, env: { ...process.env, FORCE_COLOR: '0', ...env } });
    const write = (chunk, stream) => {
      if (!quiet) stream.write(chunk);
      const time = new Date().toLocaleString('en-US');
      for (const line of String(chunk).split(/\r?\n/)) if (line.trim()) log.write(`${time}  ${line}\n`);
    };
    child.stdout.on('data', (c) => write(c, process.stdout));
    child.stderr.on('data', (c) => write(c, process.stderr));
    child.on('close', resolve);
  });
}

function writeUnitSummary(runDir, finished) {
  try {
    const unit = JSON.parse(fs.readFileSync(path.join(runDir, 'unit-tests.json'), 'utf8'));
    const lines = ['# Unit test results (UT-ALL)', '', `${unit.numPassedTests} passed, ${unit.numFailedTests} failed, ${unit.numTotalTests} total. Finished ${finished}.`, ''];
    for (const file of unit.testResults) {
      lines.push(`## ${path.relative(frontEnd, file.name).replace(/\\/g, '/')}`, '');
      for (const test of file.assertionResults) lines.push(`- ${test.status === 'passed' ? 'PASS' : test.status.toUpperCase()}: ${test.fullName}`);
      lines.push('');
    }
    fs.writeFileSync(path.join(runDir, 'unit-tests.md'), lines.join('\n'));
  } catch {
    console.warn('The unit tests did not write a result file.');
  }
}

// Deviations the computer can see by itself.
function detectDeviations(runName, extra, dirty) {
  const detected = [];
  if (extra.length) detected.push(`the command had extra options (${extra.join(' ')})`);
  if (dirty) detected.push('the code had uncommitted changes');
  const today = runName.slice(0, 10);
  const unfinished = fs
    .readdirSync(resultsDir)
    .filter((n) => n.startsWith(today) && n !== runName && !n.endsWith('.tar.gz') && !fs.existsSync(path.join(resultsDir, n, 'results.json')));
  if (unfinished.length) detected.push(`an earlier run today did not finish (${unfinished.join(', ')})`);
  return detected;
}

// Prints the run's summary with the exact command to open the report.
function summary(runDir, problemCount) {
  const { collectTests } = require('./record-report');
  const name = path.basename(runDir);
  const { tests, unit, notes } = collectTests(runDir);
  const acceptance = tests.filter((t) => !t.unit);
  const passed = acceptance.filter((t) => t.status === 'PASS').length;
  const shots = fs.existsSync(path.join(runDir, 'screenshots')) ? fs.readdirSync(path.join(runDir, 'screenshots')).length : 0;
  const folder = path.join(resultsDir, name);
  console.log(`
==================================================================
 Run For Record ${name}
==================================================================
 Unit tests:        ${unit ? `${unit.numPassedTests} of ${unit.numTotalTests} passed` : 'not run'}
 Acceptance tests:  ${passed} of ${acceptance.length} passed
 Screenshots:       ${shots} saved
 Tester:            ${tests[0].tester || 'not picked'}
 Recorder:          ${notes ? notes.recorder : 'not added yet'}

 Open the report at any time with: npm run report
 Or copy and paste this line into PowerShell:
   start "${path.join(folder, 'run-for-record.docx')}"

 Things to fix before the official run: ${problemCount}
   They are listed at the end of ${path.join(folder, 'run-for-record.md')}
==================================================================`);
}

// Builds the report and the package, then prints the summary.
async function finish(runDir) {
  const { buildReport } = require('./record-report');
  let problems;
  for (;;) {
    try {
      problems = await buildReport(runDir);
      break;
    } catch (error) {
      if (!['EBUSY', 'EPERM'].includes(error.code) || !interactive) throw error;
      await ask('\nThe report is open in Word, so it cannot be updated. Close it, then press Enter. ');
    }
  }
  const name = path.basename(runDir);
  execFileSync('tar', ['-czf', `${name}.tar.gz`, name], { cwd: resultsDir });
  summary(runDir, problems.length);
  return name;
}

async function tester() {
  if (!interactive) {
    console.error('Run npm run tester in a terminal, so the Tester can pick their name.');
    process.exit(1);
  }
  const authors = [...new Set(Object.values(readRoles().authors))];
  const tester = await pickName('Tester: who is running the tests?', Object.fromEntries(
    authors.map((a) => [a, `${a} wrote these tests, so ${a} cannot be the Tester. Pick someone else.`]),
  ));

  install();
  await askForLogins();

  const runName = stamp();
  const runDir = path.join(resultsDir, runName);
  fs.mkdirSync(runDir, { recursive: true });
  const log = fs.createWriteStream(path.join(runDir, 'run.log'));
  const version = (name) => require(require.resolve(`${name}/package.json`, { paths: [frontEnd] })).version;
  const commit = sh('git rev-parse HEAD');
  const extra = process.argv.slice(2);
  const dirty = sh('git status --porcelain -- . ":(exclude)acceptance/results"') !== '';
  const testBed = {
    tester,
    testerPickedAt: new Date().toISOString(),
    command: ['npm run tester', ...extra].join(' '),
    os: `${os.version()} (${os.type()} ${os.release()}, ${os.arch()})`,
    node: process.version,
    npm: sh('npm -v'),
    packages: Object.fromEntries(
      ['jest', 'jest-expo', '@testing-library/react-native', 'selenium-webdriver', 'expo', 'react-native', 'react'].map((name) => [name, version(name)]),
    ),
    repository: sh('git remote get-url origin'),
    branch: sh('git rev-parse --abbrev-ref HEAD'),
    commit: commit.slice(0, 8),
    commitFull: commit,
    commitDate: sh('git log -1 --format=%ci'),
    dirty,
    pushed: sh(`git branch -r --contains ${commit}`) !== '',
    backend: BACKEND,
    runStartedAt: new Date().toISOString(),
    detected: detectDeviations(runName, extra, dirty),
  };
  const saveTestBed = () => fs.writeFileSync(path.join(runDir, 'testbed.json'), JSON.stringify(testBed, null, 2));
  saveTestBed();
  log.write(`${new Date().toLocaleString('en-US')}  Tester: ${tester}  Command: ${testBed.command}\n`);

  process.stdout.write('\nBuilding the app... ');
  await run('npx expo export --platform web', log, { quiet: true });
  console.log('done');
  const { server, url } = await startServer();
  const problems = await checkEnvironment(url);
  if (problems.length) {
    console.error(`\nNot ready. Fix this, then run npm run tester again:\n- ${problems.join('\n- ')}`);
    server.close();
    process.exit(1);
  }
  console.log('Environment ready.');
  log.write(`${new Date().toLocaleString('en-US')}  Environment ready (app ${url}, server ${BACKEND})\n`);

  process.stdout.write('Running the tests. This takes about a minute... ');
  await run(`npx jest --json --outputFile="${path.join(runDir, 'unit-tests.json')}"`, log, { quiet: true });
  testBed.unitFinishedAt = new Date().toISOString();
  saveTestBed();
  writeUnitSummary(runDir, new Date().toLocaleString('en-US'));

  const extraArgs = extra.map((arg) => `"${arg}"`).join(' ');
  await run(`npx jest --config acceptance/jest.config.js --runInBand ${extraArgs}`, log, { env: { RUN_DIR: runDir, KEMYZE_WEB_URL: url }, quiet: true });
  console.log('Tests finished.');
  server.close();
  log.end();

  await finish(runDir);
  console.log(`
 What happens next
   1. When you are ready, upload this run to GitHub: npm run save
      It prints the exact commands to send the Recorder.
`);
  await offerToOpen(runDir);
}

// ---- Recorder: notes for the latest run ------------------------------------------------

async function recorder() {
  if (!interactive) {
    console.error('Run npm run record in a terminal, so the Recorder can answer the questions.');
    process.exit(1);
  }
  try {
    execSync('git pull --ff-only', { cwd: frontEnd, stdio: 'ignore' });
    console.log('Got the latest results.');
  } catch {
    console.log('Could not download new results, so the results on this computer are used.');
  }
  install();
  const runs = fs.existsSync(resultsDir) ? fs.readdirSync(resultsDir).filter((n) => fs.existsSync(path.join(resultsDir, n, 'results.json'))).sort() : [];
  if (!runs.length) {
    console.error('There is no run yet. The Tester runs npm run tester first.');
    process.exit(1);
  }
  const runDir = path.join(resultsDir, runs[runs.length - 1]);
  const { collectTests } = require('./record-report');
  const { tests, testBed } = collectTests(runDir);
  const counts = ['PASS', 'FAIL', 'NOT RUN'].map((s) => `${tests.filter((t) => t.status === s).length} ${s}`).join(', ');
  console.log(`\nRun ${path.basename(runDir)}  Tester: ${testBed.tester}  Results: ${counts}`);

  const authors = [...new Set(tests.map((t) => t.author).filter(Boolean))];
  const recorder = await pickName('Recorder: who watched this run?', {
    [testBed.tester]: `${testBed.tester} ran the tests, so ${testBed.tester} cannot be the Recorder. Pick someone else.`,
    ...Object.fromEntries(authors.map((a) => [a, `${a} wrote these tests, so ${a} cannot be the Recorder. Pick someone else.`])),
  });

  if (testBed.detected?.length) console.log(`\nThe computer detected: ${testBed.detected.join('; ')}.`);
  // Ask until the Recorder has nothing else to flag. Every answer is a y/n or a number from a
  // list; only "Something else" asks for typed words.
  const deviations = [];
  const FINISHED = DEVIATIONS.length + 1;
  const menu = [...DEVIATIONS, 'I am finished'].map((d, i) => `  ${i + 1}  ${d}`).join('\n');
  const testMenu = tests.map((t, i) => `  ${String(i + 1).padStart(2)}  ${t.unit ? 'All unit tests' : t.description} (${t.status})`).join('\n');
  const MISMATCH = ['It did not work, but the report says PASS', 'It worked, but the report says FAIL', 'Something else'];
  const mismatchMenu = MISMATCH.map((m, i) => `  ${i + 1}  ${m}`).join('\n');
  const pickOne = async (question, list, count) => {
    for (;;) {
      const answer = await ask(`\n${question} Type a number, then press Enter.\n${list}\n> `);
      if (/^\d+$/.test(answer) && Number(answer) >= 1 && Number(answer) <= count) return Number(answer);
      console.log(`Please type a number from 1 to ${count}.`);
    }
  };
  const yesNo = async (question) => {
    for (;;) {
      const answer = (await ask(`\n${question} Type y or n, then press Enter: `)).toLowerCase();
      if (answer === 'y' || answer === 'yes') return true;
      if (answer === 'n' || answer === 'no') return false;
      console.log('Please type y or n.');
    }
  };

  let more = await yesNo('Did you see anything during the run that should be flagged?');
  while (more) {
    const pick = await pickOne('What did you see?', menu, FINISHED);
    if (pick === FINISHED) break;
    if (pick === 6) {
      let other = '';
      while (!other) other = await ask('Describe what happened: ');
      deviations.push(`Something else: ${other}`);
    } else if (pick === 7) {
      const test = tests[(await pickOne('Which test does not match what you saw?', testMenu, tests.length)) - 1];
      const how = await pickOne('What did you see?', mismatchMenu, MISMATCH.length);
      let saw = MISMATCH[how - 1];
      if (how === MISMATCH.length) {
        saw = '';
        while (!saw) saw = await ask('Describe what you saw: ');
      }
      const name = test.unit ? 'All unit tests' : test.description.replace(/\.$/, '');
      deviations.push(`The report does not match what the Recorder saw for ${test.id}, "${name}": ${saw}`);
    } else if (!deviations.includes(DEVIATIONS[pick - 1])) {
      deviations.push(DEVIATIONS[pick - 1]);
    }
    more = await yesNo('Is there anything else to flag?');
  }
  await ask(`\nYou are complete. Press Enter to finish. `);

  const failures = {};
  for (const t of tests.filter((test) => test.status === 'FAIL')) {
    console.log(`\n${t.id} FAILED: ${t.description}`);
    failures[t.id] = {
      whatWentWrong: await ask('What went wrong? '),
      clientImpact: await ask('How does this affect the client? '),
      resolution: await ask('How was it fixed? Press Enter if it is not fixed yet: '),
      jira: await ask('Jira link: '),
    };
  }

  fs.writeFileSync(path.join(runDir, 'run-notes.json'), JSON.stringify({ recorder, recordedAt: new Date().toISOString(), deviations, failures }, null, 2));
  await finish(runDir);
  console.log(`
 What happens next
   When you are ready, upload the final report to GitHub: npm run save
   It prints a link that anyone on the team can open.
`);
  await offerToOpen(runDir);
}

// ---- Upload: the latest run, when the person is ready ---------------------------------

const latestRun = () =>
  fs.existsSync(resultsDir)
    ? fs.readdirSync(resultsDir).filter((n) => fs.existsSync(path.join(resultsDir, n, 'results.json'))).sort().pop()
    : undefined;

async function upload() {
  const name = latestRun();
  if (!name) {
    console.error('There is no run to upload yet. Run npm run tester first.');
    process.exit(1);
  }
  const runDir = path.join(resultsDir, name);
  const testBed = JSON.parse(fs.readFileSync(path.join(runDir, 'testbed.json'), 'utf8'));
  const notesFile = path.join(runDir, 'run-notes.json');
  const notes = fs.existsSync(notesFile) ? JSON.parse(fs.readFileSync(notesFile, 'utf8')) : null;
  const message = notes
    ? `KM-161 Run For Record ${name} with Recorder notes (Tester: ${testBed.tester}, Recorder: ${notes.recorder})`
    : `KM-161 Run For Record ${name} (Tester: ${testBed.tester})`;
  console.log(`Uploading run ${name} (${notes ? 'final report with the Recorder notes' : 'Tester results, no Recorder notes yet'})...`);
  if (!save(name, message)) process.exit(1);
  console.log(`
Uploaded. Open the report on GitHub:
   ${githubLink(name, 'run-for-record.docx')}
Anyone can also get it with git pull. It is in frontEnd/acceptance/results/${name}/`);
  if (!notes) {
    const branch = sh('git rev-parse --abbrev-ref HEAD');
    console.log(`
Send the Recorder these commands. They run them in the Kemyze/frontEnd folder:
   git fetch
   git checkout ${branch}
   npm run record`);
  }
}

// ---- Report: open the latest run's report (anyone, any time) ----------------------------

async function report() {
  try {
    execSync('git pull --ff-only', { cwd: frontEnd, stdio: 'ignore' });
  } catch {
    // Offline or nothing uploaded yet: show the newest run on this computer.
  }
  const name = latestRun();
  if (!name) {
    console.error('There is no run yet. The Tester runs npm run tester first.');
    process.exit(1);
  }
  install();
  const runDir = path.join(resultsDir, name);
  const md = fs.readFileSync(path.join(runDir, 'run-for-record.md'), 'utf8');
  summary(runDir, (md.match(/^- \[ \]/gm) || []).length);
  openReport(runDir);
}

// Exit when done: the on-screen questions keep the input open, which would leave the terminal waiting.
const mode = process.argv.includes('--recorder') ? recorder
  : process.argv.includes('--save') ? upload
    : process.argv.includes('--report') ? report
      : tester;
mode().then(
  () => process.exit(0),
  (error) => {
    console.error(error);
    process.exit(1);
  },
);
