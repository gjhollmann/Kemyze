// Jest reporter for the Run For Record. It only runs during `npm run tester` (RUN_DIR set)
// and saves the raw result of every acceptance test to results.json. record-report.js builds
// the report from that file, so the Recorder's notes can be added later without rerunning tests.
const fs = require('fs');
const path = require('path');

class RecordReporter {
  constructor() {
    this.results = {};
  }

  onTestCaseResult(test, testCaseResult) {
    const id = testCaseResult.title.match(/AT-\d+/)?.[0];
    if (id) {
      this.results[id] = {
        status: { passed: 'PASS', failed: 'FAIL' }[testCaseResult.status] || 'NOT RUN',
        finishedAt: new Date().toISOString(),
        failure: (testCaseResult.failureMessages || [])
          .join('\n')
          .replace(/\u001b\[\d+m/g, '')
          .split('\n')
          .slice(0, 4)
          .join(' '),
      };
    }
  }

  onRunComplete() {
    const runDir = process.env.RUN_DIR;
    if (runDir) {
      fs.writeFileSync(path.join(runDir, 'results.json'), JSON.stringify(this.results, null, 2));
    }
  }
}

module.exports = RecordReporter;
