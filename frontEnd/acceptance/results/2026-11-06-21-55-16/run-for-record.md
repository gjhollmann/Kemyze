# Run For Record

Commit fc698fc8 on main, run 11/6/2026, 9:55:18 PM. The report sections are in run-for-record.docx.

Tester: Matthew Fronda. Recorder: no notes yet.

Deviations from the test plan: Detected: the code had uncommitted changes.

## Test environment

| Item | Value |
|---|---|
| Operating system | Windows 11 Home (Windows_NT 10.0.26300, x64) |
| Node.js | v24.11.0 |
| npm | 11.19.1 |
| Google Chrome | 156.0.8078.74 |
| ChromeDriver | 156.0.8078.80 |
| jest | 29.7.0 |
| jest-expo | 55.0.22 |
| @testing-library/react-native | 14.1.0 |
| selenium-webdriver | 4.51.0 |
| expo | 55.0.32 |
| react-native | 0.83.10 |
| react | 19.2.0 |
| Repository | https://github.com/gjhollmann/Kemyze.git |
| Backend | https://kemyze.vercel.app |
| Command | npm run tester |

## Results

| Test ID | Description | Input type | Input | Expected outcome | Actual outcome | Result | Date and time | Author | Tester | Recorder |
|---|---|---|---|---|---|---|---|---|---|---|
| UT-ALL | Runs every unit test in the repository with npm test. The login tests call handleLogin, onPressLogin, handleForgotPassword and showPopup directly with the server mocked, and run as iOS. | Valid and Invalid | npm test (all unit tests) | Every unit test passes. | 209 passed, 0 failed, 209 total (see unit-tests.md). | PASS | 11/6/2026, 9:56:01 PM | Joshua Zamora | Matthew Fronda |  |
| AT-01 | The login screen renders all of its fields and buttons. | Valid | Open the app. | Kemyze title, Email address and Password fields, Log In, Forgot Password and QR Scanner Bypass are shown. | Confirmed: Kemyze title, Email address and Password fields, Log In, Forgot Password and QR Scanner Bypass are shown. | PASS | 11/6/2026, 9:56:07 PM | Joshua Zamora | Matthew Fronda |  |
| AT-02 | Log In is pressed with no email or password. | Invalid | Email: (empty), Password: (empty) | Browser alert "Missing email / Please enter your email." | Browser alert "Missing email / Please enter your email.", as expected. | PASS | 11/6/2026, 9:56:08 PM | Joshua Zamora | Matthew Fronda |  |
| AT-03 | Log In is pressed with an email but no password. | Invalid | Email: user@csus.edu, Password: (empty) | Browser alert "Missing password / Please enter your password." | Browser alert "Missing password / Please enter your password.", as expected. | PASS | 11/6/2026, 9:56:09 PM | Joshua Zamora | Matthew Fronda |  |
| AT-04 | Forgot Password is pressed with an empty email. | Invalid | Email: (empty) | Browser alert "Error / Please enter your email." | Browser alert "Error / Please enter your email.", as expected. | PASS | 11/6/2026, 9:56:09 PM | Joshua Zamora | Matthew Fronda |  |
| AT-05 | Forgot Password is pressed with an invalid email address. | Invalid | Email: not-an-email | Browser alert "Error / Please enter a valid email address." | Browser alert "Error / Please enter a valid email address.", as expected. | PASS | 11/6/2026, 9:56:10 PM | Joshua Zamora | Matthew Fronda |  |
| AT-06 | Log In with the test account email and a wrong password. | Invalid | Email: test account, Password: wrong-password-for-acceptance-test | The user stays on the login screen. (The "Login Failed" message uses Alert.alert, which shows nothing on the web; the unit tests check it.) | Confirmed: The user stays on the login screen. (The "Login Failed" message uses Alert.alert, which shows nothing on the web; the unit tests check it.) | PASS | 11/6/2026, 9:56:16 PM | Joshua Zamora | Matthew Fronda |  |
| AT-07 | Log In with the test account. | Valid | Email and password of the test account | The app leaves the login screen and goes to the scanner. | Confirmed: The app leaves the login screen and goes to the scanner. | PASS | 11/6/2026, 9:56:18 PM | Joshua Zamora | Matthew Fronda |  |
| AT-08 | Forgot Password with a valid email; the server answers that the email was sent. | Valid | Email: user@csus.edu; simulated server answer: 200 "Password reset email has been sent." | Browser alert "Success / Password reset email has been sent." No real email is sent. | Browser alert "Success / Password reset email has been sent.", as expected. | PASS | 11/6/2026, 9:56:19 PM | Joshua Zamora | Matthew Fronda |  |
| AT-09 | Forgot Password when the server returns an error. | Invalid | Email: user@csus.edu; simulated server answer: 400 "No account found with that email." | Browser alert "Error / No account found with that email." | Browser alert "Error / No account found with that email.", as expected. | PASS | 11/6/2026, 9:56:20 PM | Joshua Zamora | Matthew Fronda |  |
| AT-10 | Forgot Password when the server never answers. | Invalid | Email: user@csus.edu; simulated server: no answer | After 10 seconds, browser alert "Error / Request timed out. Please try again." | Browser alert "Error / Request timed out. Please try again.", as expected. | PASS | 11/6/2026, 9:56:30 PM | Joshua Zamora | Matthew Fronda |  |
| AT-11 | Log In as a Primary user (access level 1). | Valid | Email and password of the Primary test account | The app goes to the scanner and the navigation bar shows the "Accounts" tab. | Confirmed: The app goes to the scanner and the navigation bar shows the "Accounts" tab. | PASS | 11/6/2026, 9:56:33 PM | Joshua Zamora | Matthew Fronda |  |
| AT-12 | Log In as a Secondary user (access level 2). | Valid | Email and password of the Secondary test account | The app goes to the scanner and the navigation bar shows the "Accounts" tab. | Confirmed: The app goes to the scanner and the navigation bar shows the "Accounts" tab. | PASS | 11/6/2026, 9:56:35 PM | Joshua Zamora | Matthew Fronda |  |
| AT-13 | Log In as a Tertiary user (access level 3). | Valid | Email and password of the Tertiary test account | The app goes to the scanner and the navigation bar shows the "Accounts" tab. | Confirmed: The app goes to the scanner and the navigation bar shows the "Accounts" tab. | PASS | 11/6/2026, 9:56:38 PM | Joshua Zamora | Matthew Fronda |  |

## Requirement coverage (KM-68 acceptance requirements)

| Requirement | Item | Unit test | Acceptance test |
|---|---|---|---|
| handleForgotPassword | empty email | handleForgotPassword: rejects "" without a request (PASS) | AT-04 (PASS) |
| handleForgotPassword | invalid email | handleForgotPassword: rejects not-an-email, user@csus, user @csus.edu (PASS) | AT-05 (PASS) |
| handleForgotPassword | success | handleForgotPassword: sends the reset request and shows the success message (PASS) | AT-08 (PASS) |
| handleForgotPassword | server error | handleForgotPassword: shows the server error message (PASS) | AT-09 (PASS) |
| handleForgotPassword | request timeout | handleForgotPassword: reports a timeout when the request is aborted (PASS) | AT-10 (PASS) |
| showPopup | web uses window.alert | showPopup: uses window.alert on web (PASS) | AT-02 (PASS), AT-03 (PASS), AT-04 (PASS), AT-05 (PASS), AT-08 (PASS), AT-09 (PASS), AT-10 (PASS) |
| showPopup | iOS uses Alert.alert | showPopup: uses Alert.alert on iOS (PASS) | Unit test only |
| onPressLogin | missing email | onPressLogin: empty and whitespace email (PASS) | AT-02 (PASS) |
| onPressLogin | missing password | onPressLogin: empty and whitespace password (PASS) | AT-03 (PASS) |
| onPressLogin | failed login | onPressLogin: shows the server message when login fails (PASS) | AT-06 (PASS) |
| onPressLogin | successful login sets the active user and goes to the scanner | onPressLogin: sets the active user and opens the scanner on success (PASS) | AT-07 (PASS), AT-11 (PASS), AT-12 (PASS), AT-13 (PASS) |
| handleLogin | input validation | handleLogin: rejects empty or whitespace email and password (PASS) | Unit test only |
| handleLogin | 200 success | handleLogin: sends trimmed credentials and returns the user on 200 (PASS) | AT-07 (PASS), AT-11 (PASS), AT-12 (PASS), AT-13 (PASS) |
| handleLogin | error response | handleLogin: returns the server message on an error response (PASS) | AT-06 (PASS) |
| handleLogin | server unreachable | handleLogin: reports when the server is unreachable (PASS) | Unit test only |
| Screen renders | title, email and password fields, Log In, Forgot Password, QR Scanner Bypass | login screen renders: shows the title, both fields and all buttons (PASS) | AT-01 (PASS) |

## Report readiness checks

- [ ] The code had uncommitted changes. Commit everything, then run npm run tester again.
- [ ] Commit fc698fc8 is not on GitHub yet, so the script links in the report do not work. Push it.
- [ ] The Recorder has not added notes yet. The Recorder runs npm run record.
- [ ] The run had deviations from the test plan. Update the steps in the README, then repeat the run.
