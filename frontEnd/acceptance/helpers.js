// Shared helpers for the Selenium acceptance tests.
// These tests drive the real web build of Kemyze in Chrome against the live backend,
// so they only read and search. They never confirm a delete or change data, and never send a
// real password reset email (fakeServer answers that request instead).
const fs = require('fs');
const os = require('os');
const path = require('path');
const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

const BASE_URL = process.env.KEMYZE_WEB_URL || 'http://localhost:8082';
const WAIT = 15000;

// Test logins come from the seed test accounts in db-testing/ec-users-testing.sql (already in
// the repo), so the Tester types nothing. acceptance/logins.json, which git ignores, overrides
// them if it exists. After login each role sees the "Accounts" tab (KM-117), which shows the
// app set the right access level.
const LOGINS_FILE = path.join(__dirname, 'logins.json');
const SEED_FILE = path.join(__dirname, '..', '..', 'db-testing', 'ec-users-testing.sql');
const SEED_EMAILS = { Primary: 'something1@mail.com', Secondary: 'john1@mymail.com', Tertiary: 'mjj123@mymail.com' };
const ROLE_NAMES = ['Primary', 'Secondary', 'Tertiary'];

// Seed rows are (id, first, last, 'email', 'phone', 'password', level, location).
function seedLogins() {
  try {
    const sql = fs.readFileSync(SEED_FILE, 'utf8');
    return Object.fromEntries(
      Object.entries(SEED_EMAILS).flatMap(([name, email]) => {
        const escaped = email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const row = sql.match(new RegExp(`'${escaped}',\\s*'[^']*',\\s*'([^']*)'`));
        return row ? [[name, { email, password: row[1] }]] : [];
      }),
    );
  } catch {
    return {};
  }
}

function readLogins() {
  let saved = {};
  try {
    saved = JSON.parse(fs.readFileSync(LOGINS_FILE, 'utf8'));
  } catch {
    // No logins.json: the seed accounts are used.
  }
  return { ...seedLogins(), ...saved };
}

const logins = readLogins();
const loginFor = (name) => (logins[name]?.email && logins[name]?.password ? logins[name] : null);
const ROLES = ROLE_NAMES.map((name, index) => ({ level: index + 1, name, tab: 'Accounts', account: loginFor(name) }));

// AT-06 and AT-07 use the Tertiary login.
const account = loginFor('Tertiary') || {};
const hasAccount = Boolean(loginFor('Tertiary'));

// Chrome runs headless unless KEMYZE_HEADED=1, sized like an iPhone screen.
async function startBrowser() {
  const options = new chrome.Options().addArguments(
    '--window-size=430,932',
    '--use-fake-ui-for-media-stream',
    '--use-fake-device-for-media-stream',
  );
  if (process.env.KEMYZE_HEADED !== '1') {
    options.addArguments('--headless=new');
  }
  const driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();
  // Shared with record-environment.js, which saves a screenshot after every test of a Run For Record.
  global.__acceptanceDriver = driver;
  return driver;
}

// Print the test bed so a third party can reproduce the run (CSC 191 acceptance report).
async function logTestBed(driver) {
  const caps = await driver.getCapabilities();
  if (process.env.RUN_DIR) {
    fs.writeFileSync(
      path.join(process.env.RUN_DIR, 'browser.json'),
      JSON.stringify({
        name: caps.get('browserName'),
        version: caps.get('browserVersion'),
        driver: String(caps.get('chrome')?.chromedriverVersion || '').split(' ')[0],
      }),
    );
  }
  console.log(
    [
      'Acceptance test bed',
      `  OS: ${os.type()} ${os.release()} (${os.arch()})`,
      `  Node: ${process.version}`,
      `  Browser: ${caps.get('browserName')} ${caps.get('browserVersion')}`,
      `  ChromeDriver: ${String(caps.get('chrome')?.chromedriverVersion || '').split(' ')[0]}`,
      `  Selenium WebDriver: ${require('selenium-webdriver/package.json').version}`,
      `  Expo: ${require('expo/package.json').version}`,
      `  App URL: ${BASE_URL}`,
    ].join('\n'),
  );
}

async function open(driver, route = '/') {
  await driver.get(BASE_URL + route);
}

// React Native Web renders <Text> as plain elements, so find them by their visible text.
function byText(text) {
  return By.xpath(`//*[normalize-space(text())=${JSON.stringify(text)}]`);
}

async function waitForText(driver, text) {
  return driver.wait(until.elementLocated(byText(text)), WAIT, `"${text}" never appeared`);
}

async function clickText(driver, text) {
  const element = await waitForText(driver, text);
  await driver.wait(until.elementIsVisible(element), WAIT);
  await element.click();
}

async function inputs(driver) {
  return driver.findElements(By.css('input'));
}

// On the web the login screen shows messages with window.alert. Read it and close it.
async function readAlert(driver, timeout = WAIT) {
  await driver.wait(until.alertIsPresent(), timeout, 'no alert appeared');
  const alert = await driver.switchTo().alert();
  const text = await alert.getText();
  // Shown on the Run For Record screenshot, which is taken after the alert is closed.
  global.__lastAlert = text;
  await alert.accept();
  return text;
}

// Test double for the backend: answer requests whose URL contains `urlPart` inside the
// browser, so cases that cannot be run against the live server (a real reset email, a server
// error, a timeout) still run through the real screen. Every other request goes to the server.
//   { status, body }  answers with that response
//   'hang'            never answers, so the app's own abort timer fires
async function fakeServer(driver, urlPart, reply) {
  await driver.executeScript(
    `const [urlPart, reply] = arguments;
     const realFetch = window.fetch;
     window.fetch = (url, options = {}) => {
       if (!String(url).includes(urlPart)) return realFetch(url, options);
       if (reply === 'hang') {
         return new Promise((resolve, reject) => options.signal?.addEventListener('abort',
           () => reject(new DOMException('The operation was aborted.', 'AbortError'))));
       }
       return Promise.resolve(new Response(JSON.stringify(reply.body),
         { status: reply.status, headers: { 'Content-Type': 'application/json' } }));
     };`,
    urlPart,
    reply,
  );
}

// Log in with the test account and wait for the QR Scanner to open.
// The login result is shown with Alert.alert, which shows nothing on the web, so the
// only sign of success is the QR Scanner opening.
async function logIn(driver, user = account) {
  await open(driver, '/');
  await waitForText(driver, 'Log In');
  const [email, password] = await inputs(driver);
  await email.sendKeys(user.email);
  await password.sendKeys(user.password);
  await clickText(driver, 'Log In');
  await driver.wait(
    until.urlContains('/Pages/scanner'),
    WAIT,
    'Login failed (still on the login screen). Check the email and password environment variables.',
  );
}

module.exports = {
  BASE_URL,
  account,
  hasAccount,
  ROLES,
  ROLE_NAMES,
  LOGINS_FILE,
  readLogins,
  startBrowser,
  logTestBed,
  open,
  byText,
  waitForText,
  clickText,
  inputs,
  readAlert,
  logIn,
  fakeServer,
  until,
  WAIT,
};
