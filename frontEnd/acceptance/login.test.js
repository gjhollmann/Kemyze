// Acceptance tests for the login screen (KM-68), run in Chrome against the web build.
// Test case details are in test-cases.js; the IDs here must match.
const {
  account,
  hasAccount,
  ROLES,
  startBrowser,
  logTestBed,
  open,
  waitForText,
  clickText,
  inputs,
  readAlert,
  logIn,
  fakeServer,
} = require('./helpers');

const RESET_URL = '/login/forgot-password/';

let driver;

beforeAll(async () => {
  driver = await startBrowser();
  await logTestBed(driver);
});

afterAll(async () => {
  await driver?.quit();
});

beforeEach(async () => {
  await open(driver, '/');
  await waitForText(driver, 'Log In');
});

describe('Login (KM-68)', () => {
  it('AT-01 shows the title, email and password fields, and all buttons', async () => {
    await waitForText(driver, 'Kemyze');
    await waitForText(driver, 'Email address');
    await waitForText(driver, 'Password');
    await waitForText(driver, 'Forgot Password');
    await waitForText(driver, 'QR Scanner Bypass');
    expect(await inputs(driver)).toHaveLength(2);
  });

  it('AT-02 asks for an email when Log In is pressed with empty fields', async () => {
    await clickText(driver, 'Log In');

    expect(await readAlert(driver)).toBe('Missing email\n\nPlease enter your email.');
  });

  it('AT-03 asks for a password when Log In is pressed with only an email', async () => {
    const [email] = await inputs(driver);
    await email.sendKeys('user@csus.edu');

    await clickText(driver, 'Log In');

    expect(await readAlert(driver)).toBe('Missing password\n\nPlease enter your password.');
  });

  it('AT-04 asks for an email when Forgot Password is pressed with an empty email', async () => {
    await clickText(driver, 'Forgot Password');

    expect(await readAlert(driver)).toBe('Error\n\nPlease enter your email.');
  });

  it('AT-05 rejects an invalid email for Forgot Password', async () => {
    const [email] = await inputs(driver);
    await email.sendKeys('not-an-email');

    await clickText(driver, 'Forgot Password');

    expect(await readAlert(driver)).toBe('Error\n\nPlease enter a valid email address.');
  });

  (hasAccount ? it : it.skip)('AT-06 keeps the user on the login screen after a wrong password', async () => {
    const [email, password] = await inputs(driver);
    await email.sendKeys(account.email);
    await password.sendKeys('wrong-password-for-acceptance-test');

    await clickText(driver, 'Log In');

    // "Login Failed" uses Alert.alert, which shows nothing on the web (the unit tests check
    // the message), so check the user is kept on the login screen.
    await driver.sleep(5000);
    expect(await driver.getCurrentUrl()).not.toContain('/Pages/');
    await waitForText(driver, 'Log In');
  });

  (hasAccount ? it : it.skip)('AT-07 logs in with the test account and goes to the scanner', async () => {
    await logIn(driver);

    expect(await driver.getCurrentUrl()).toContain('/Pages/scanner');
  });

  // The next three use a fake server answer (see fakeServer in helpers.js), so no real reset
  // email is sent and the server error and timeout can be produced on demand.
  it('AT-08 shows the success message when the reset email is sent', async () => {
    await fakeServer(driver, RESET_URL, { status: 200, body: { message: 'Password reset email has been sent.' } });
    const [email] = await inputs(driver);
    await email.sendKeys('user@csus.edu');

    await clickText(driver, 'Forgot Password');

    expect(await readAlert(driver)).toBe('Success\n\nPassword reset email has been sent.');
  });

  it('AT-09 shows the server error message when the reset request fails', async () => {
    await fakeServer(driver, RESET_URL, { status: 400, body: { error: 'No account found with that email.' } });
    const [email] = await inputs(driver);
    await email.sendKeys('user@csus.edu');

    await clickText(driver, 'Forgot Password');

    expect(await readAlert(driver)).toBe('Error\n\nNo account found with that email.');
  });

  it('AT-10 reports a timeout when the server does not answer', async () => {
    await fakeServer(driver, RESET_URL, 'hang');
    const [email] = await inputs(driver);
    await email.sendKeys('user@csus.edu');

    await clickText(driver, 'Forgot Password');

    // The app aborts the request after 10 seconds.
    expect(await readAlert(driver, 20000)).toBe('Error\n\nRequest timed out. Please try again.');
  });

  // Log in as Primary, Secondary and Tertiary. Each is skipped if its login is missing.
  ROLES.forEach(({ level, name, tab, account: user }, index) => {
    const id = `AT-${11 + index}`;
    (user ? it : it.skip)(`${id} logs in as ${name} (level ${level}) and shows the ${tab} tab`, async () => {
      await logIn(driver, user);

      expect(await driver.getCurrentUrl()).toContain('/Pages/scanner');
      await waitForText(driver, tab);
    });
  });
});
