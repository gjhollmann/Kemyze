// During a Run For Record (RUN_DIR is set by record.js), save a screenshot after every
// acceptance test as screenshots/<test ID>.png. A banner with the test ID, PASS or FAIL, the
// date and any alert the test read is drawn on the page first, so the screenshot shows the
// output and the result.
// Normal runs skip this.
const fs = require('fs');
const path = require('path');
const NodeEnvironment = require('jest-environment-node').TestEnvironment;

class RecordEnvironment extends NodeEnvironment {
  async handleTestEvent(event) {
    const runDir = process.env.RUN_DIR;
    const driver = this.global.__acceptanceDriver;
    const id = event.name === 'test_done' && event.test.name.match(/AT-\d+/)?.[0];
    if (!runDir || !driver || !id) {
      return;
    }
    const result = event.test.errors.length ? 'FAIL' : 'PASS';
    const alert = this.global.__lastAlert;
    this.global.__lastAlert = undefined;
    // The actual output for the report's "Actual outcome" column.
    const outputs = path.join(runDir, 'outputs');
    fs.mkdirSync(outputs, { recursive: true });
    fs.writeFileSync(path.join(outputs, `${id}.txt`), alert ? `Browser alert "${alert.replace(/\n+/g, ' / ')}"` : '');
    const banner = `${id}  ${result}  ${new Date().toLocaleString()}${alert ? `\nAlert: ${alert.replace(/\n+/g, ' / ')}` : ''}`;
    try {
      await driver.executeScript(
        `const b = document.createElement('div');
         b.id = '__record_banner';
         b.textContent = arguments[0];
         b.style.cssText = 'position:fixed;left:0;right:0;bottom:0;z-index:99999;padding:8px;' +
           'font:bold 16px sans-serif;text-align:center;white-space:pre-line;color:#fff;background:' + arguments[1];
         document.body.appendChild(b);`,
        banner,
        result === 'PASS' ? '#1b7f3b' : '#b3261e',
      );
      const png = await driver.takeScreenshot();
      const dir = path.join(runDir, 'screenshots');
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, `${id}.png`), png, 'base64');
      await driver.executeScript("document.getElementById('__record_banner')?.remove()");
    } catch (error) {
      // A browser alert left open blocks screenshots; the report marks the screenshot as missing.
      console.warn(`No screenshot for ${id}: ${error.message}`);
    }
  }
}

module.exports = RecordEnvironment;
