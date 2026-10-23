// Single source of truth for the System Test Report (CSC 191).
// Every acceptance test is described here ONCE. The Run For Record generator reads this
// file, so the same automated tests count for the Jira ticket and the report without
// writing anything twice. Test titles in the *.test.js files start with these IDs.
//
// input: the exact input used. inputType: "Valid" or "Invalid" (the rubric requires both).

const TEST_CASES = [
  { id: 'AT-01', ticket: 'KM-68', feature: 'Login screen', inputType: 'Valid',
    description: 'The login screen renders all of its fields and buttons.',
    input: 'Open the app.',
    expected: 'Kemyze title, Email address and Password fields, Log In, Forgot Password and QR Scanner Bypass are shown.' },
  { id: 'AT-02', ticket: 'KM-68', feature: 'Log In', inputType: 'Invalid',
    description: 'Log In is pressed with no email or password.',
    input: 'Email: (empty), Password: (empty)',
    expected: 'Browser alert "Missing email / Please enter your email."' },
  { id: 'AT-03', ticket: 'KM-68', feature: 'Log In', inputType: 'Invalid',
    description: 'Log In is pressed with an email but no password.',
    input: 'Email: user@csus.edu, Password: (empty)',
    expected: 'Browser alert "Missing password / Please enter your password."' },
  { id: 'AT-04', ticket: 'KM-68', feature: 'Forgot Password', inputType: 'Invalid',
    description: 'Forgot Password is pressed with an empty email.',
    input: 'Email: (empty)',
    expected: 'Browser alert "Error / Please enter your email."' },
  { id: 'AT-05', ticket: 'KM-68', feature: 'Forgot Password', inputType: 'Invalid',
    description: 'Forgot Password is pressed with an invalid email address.',
    input: 'Email: not-an-email',
    expected: 'Browser alert "Error / Please enter a valid email address."' },
  { id: 'AT-06', ticket: 'KM-68', feature: 'Log In', inputType: 'Invalid',
    description: 'Log In with the test account email and a wrong password.',
    input: 'Email: test account, Password: wrong-password-for-acceptance-test',
    expected: 'The user stays on the login screen. (The "Login Failed" message uses Alert.alert, which shows nothing on the web; the unit tests check it.)' },
  { id: 'AT-07', ticket: 'KM-68', feature: 'Log In', inputType: 'Valid',
    description: 'Log In with the test account.',
    input: 'Email and password of the test account',
    expected: 'The app leaves the login screen and goes to the scanner.' },
  { id: 'AT-08', ticket: 'KM-68', feature: 'Forgot Password', inputType: 'Valid',
    description: 'Forgot Password with a valid email; the server answers that the email was sent.',
    input: 'Email: user@csus.edu; simulated server answer: 200 "Password reset email has been sent."',
    expected: 'Browser alert "Success / Password reset email has been sent." No real email is sent.' },
  { id: 'AT-09', ticket: 'KM-68', feature: 'Forgot Password', inputType: 'Invalid',
    description: 'Forgot Password when the server returns an error.',
    input: 'Email: user@csus.edu; simulated server answer: 400 "No account found with that email."',
    expected: 'Browser alert "Error / No account found with that email."' },
  { id: 'AT-10', ticket: 'KM-68', feature: 'Forgot Password', inputType: 'Invalid',
    description: 'Forgot Password when the server never answers.',
    input: 'Email: user@csus.edu; simulated server: no answer',
    expected: 'After 10 seconds, browser alert "Error / Request timed out. Please try again."' },
  { id: 'AT-11', ticket: 'KM-68', feature: 'Log In', inputType: 'Valid',
    description: 'Log In as a Primary user (access level 1).',
    input: 'Email and password of the Primary test account',
    expected: 'The app goes to the scanner and the navigation bar shows the "Accounts" tab.' },
  { id: 'AT-12', ticket: 'KM-68', feature: 'Log In', inputType: 'Valid',
    description: 'Log In as a Secondary user (access level 2).',
    input: 'Email and password of the Secondary test account',
    expected: 'The app goes to the scanner and the navigation bar shows the "Accounts" tab.' },
  { id: 'AT-13', ticket: 'KM-68', feature: 'Log In', inputType: 'Valid',
    description: 'Log In as a Tertiary user (access level 3).',
    input: 'Email and password of the Tertiary test account',
    expected: 'The app goes to the scanner and the navigation bar shows the "Accounts" tab.' },
];

// Screens/actions/features, in the order they appear in the System Test Report. Each becomes
// a numbered section (N.0) of the report template. Each needs at least one test; the team goal
// is at least one Valid AND one Invalid test per feature. renderOnly: the screen has no input to
// make invalid, so it needs only a Valid test. scripts: the test files, linked in the report.
const LOGIN_SCRIPT = 'frontEnd/acceptance/login.test.js';
const FEATURES = [
  { feature: 'Login screen', ticket: 'KM-68', renderOnly: true, scripts: [LOGIN_SCRIPT],
    title: 'Login Screen: Screen Render',
    description: 'Opens the app and checks that the login screen shows the Kemyze title, the Email address and Password fields, and the Log In, Forgot Password and QR Scanner Bypass buttons.' },
  { feature: 'Log In', ticket: 'KM-68', scripts: [LOGIN_SCRIPT],
    title: 'Login Screen: Log In',
    description: 'Presses Log In with missing, wrong and correct credentials, and logs in once each as a Primary, Secondary and Tertiary user. Checks the messages shown, that a failed login stays on the login screen, and that a successful login goes to the QR Scanner with the Accounts tab for those access levels.' },
  { feature: 'Forgot Password', ticket: 'KM-68', scripts: [LOGIN_SCRIPT],
    title: 'Login Screen: Forgot Password',
    description: 'Presses Forgot Password with an empty and an invalid email, and with a valid email while the server answers with success, an error, or no answer. The server answers are simulated in the browser, so no real reset email is sent.' },
];

// The automated unit test suite (npm test), reported as its own section (UT-ALL).
const UNIT_TESTS = {
  title: 'Automated Unit Tests (Jest and React Native Testing Library)',
  scripts: ['frontEnd/src/__tests__/index.test.tsx', 'frontEnd/src/utils/handleLogin.test.ts'],
  description: 'Runs every unit test in the repository with npm test. The login tests call handleLogin, onPressLogin, handleForgotPassword and showPopup directly with the server mocked, and run as iOS.',
  valid: 'Correct email and password (server answers 200 with the user); valid email for Forgot Password (server answers success); login screen render.',
  invalid: 'Empty and whitespace email and password; invalid emails not-an-email, user@csus and user @csus.edu; server error response; request timeout; server unreachable.',
};

// KM-68 acceptance requirements and the tests that cover each one. "unit" names the
// describe block and test in src/__tests__/index.test.tsx or src/utils/handleLogin.test.ts.
// Forgot Password success, server error and timeout run in the browser with a simulated
// server answer (fakeServer). Items with no acceptance test cannot be seen in a browser
// (iOS Alert.alert, handleLogin's own validation behind onPressLogin's, a forced login outage).
const REQUIREMENTS = [
  { requirement: 'handleForgotPassword', item: 'empty email', unit: 'handleForgotPassword: rejects "" without a request', acceptance: ['AT-04'] },
  { requirement: 'handleForgotPassword', item: 'invalid email', unit: 'handleForgotPassword: rejects not-an-email, user@csus, user @csus.edu', acceptance: ['AT-05'] },
  { requirement: 'handleForgotPassword', item: 'success', unit: 'handleForgotPassword: sends the reset request and shows the success message', acceptance: ['AT-08'] },
  { requirement: 'handleForgotPassword', item: 'server error', unit: 'handleForgotPassword: shows the server error message', acceptance: ['AT-09'] },
  { requirement: 'handleForgotPassword', item: 'request timeout', unit: 'handleForgotPassword: reports a timeout when the request is aborted', acceptance: ['AT-10'] },
  { requirement: 'showPopup', item: 'web uses window.alert', unit: 'showPopup: uses window.alert on web', acceptance: ['AT-02', 'AT-03', 'AT-04', 'AT-05', 'AT-08', 'AT-09', 'AT-10'] },
  { requirement: 'showPopup', item: 'iOS uses Alert.alert', unit: 'showPopup: uses Alert.alert on iOS', acceptance: [] },
  { requirement: 'onPressLogin', item: 'missing email', unit: 'onPressLogin: empty and whitespace email', acceptance: ['AT-02'] },
  { requirement: 'onPressLogin', item: 'missing password', unit: 'onPressLogin: empty and whitespace password', acceptance: ['AT-03'] },
  { requirement: 'onPressLogin', item: 'failed login', unit: 'onPressLogin: shows the server message when login fails', acceptance: ['AT-06'] },
  { requirement: 'onPressLogin', item: 'successful login sets the active user and goes to the scanner', unit: 'onPressLogin: sets the active user and opens the scanner on success', acceptance: ['AT-07', 'AT-11', 'AT-12', 'AT-13'] },
  { requirement: 'handleLogin', item: 'input validation', unit: 'handleLogin: rejects empty or whitespace email and password', acceptance: [] },
  { requirement: 'handleLogin', item: '200 success', unit: 'handleLogin: sends trimmed credentials and returns the user on 200', acceptance: ['AT-07', 'AT-11', 'AT-12', 'AT-13'] },
  { requirement: 'handleLogin', item: 'error response', unit: 'handleLogin: returns the server message on an error response', acceptance: ['AT-06'] },
  { requirement: 'handleLogin', item: 'server unreachable', unit: 'handleLogin: reports when the server is unreachable', acceptance: [] },
  { requirement: 'Screen renders', item: 'title, email and password fields, Log In, Forgot Password, QR Scanner Bypass', unit: 'login screen renders: shows the title, both fields and all buttons', acceptance: ['AT-01'] },
];

module.exports = { TEST_CASES, FEATURES, UNIT_TESTS, REQUIREMENTS };
