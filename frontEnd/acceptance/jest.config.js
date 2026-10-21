// Jest config for the Selenium acceptance tests only (run by npm run tester).
// The unit tests use the jest-expo config in package.json and skip this folder.
module.exports = {
  rootDir: __dirname,
  testMatch: ['<rootDir>/**/*.test.js'],
  transform: {},
  testTimeout: 60000,
  // Run For Record (npm run tester): screenshot with PASS/FAIL after every test,
  // and write the report tables. Both do nothing in a normal run.
  testEnvironment: '<rootDir>/record-environment.js',
  reporters: ['default', '<rootDir>/record-reporter.js'],
};
