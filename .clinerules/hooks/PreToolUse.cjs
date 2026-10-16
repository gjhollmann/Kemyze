// Kemyze Cline hook: runs before every tool call (Windows, macOS, Linux).
// Cline runs .cjs hooks with `node`, which every teammate has for Expo.
// Requires: Cline Settings > Features > "Enable Hooks".
//
// Blocks:
//   - reading or editing secret/local files (.env*, secrets.json, providers.json, db.sqlite3,
//     and logins.json, which holds the acceptance test passwords)
//   - edits inside node_modules/ or venv/
//   - destructive commands (force push, reset --hard, clean -f, rm -rf, migrate/flush)
// Fails open: any unexpected input lets the tool call through.

const EDIT_TOOLS = new Set(['editor', 'apply_patch', 'write_to_file', 'replace_in_file', 'apply_diff']);
const READ_TOOLS = new Set(['read_file']);
const COMMAND_TOOLS = new Set(['run_commands', 'execute_command']);

const PROTECTED_FILE = /(^|[\\/])(\.env(\.[^\\/]*)?|secrets\.json|providers\.json|db\.sqlite3|logins\.json)$/i;
const PROTECTED_DIR = /(^|[\\/])(node_modules|venv|\.venv)[\\/]/i;
const DESTRUCTIVE = [
  /git\s+push\b.*(\s--force\b|\s-f\b|\s--force-with-lease\b)/i,
  /git\s+reset\s+--hard\b/i,
  /git\s+clean\s+-[a-z]*f/i,
  /\brm\s+-[a-z]*r[a-z]*f|\brm\s+-[a-z]*f[a-z]*r/i,
  /Remove-Item\b.*-Recurse/i,
  /manage\.py\s+(migrate|flush)\b/i,
];

function respond(cancel, errorMessage) {
  process.stdout.write(JSON.stringify(cancel ? { cancel: true, errorMessage } : { cancel: false }));
  process.exit(0);
}

function parseList(value) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.map((v) => (typeof v === 'string' ? v : JSON.stringify(v)));
  } catch {}
  return [String(value)];
}

function check(raw) {
  const payload = JSON.parse(raw);
  const pre = payload.preToolUse || {};
  const tool = String(pre.toolName || payload.tool_call?.name || '');
  const params = pre.parameters || {};

  if (EDIT_TOOLS.has(tool)) {
    const paths = [];
    if (params.path) paths.push(String(params.path));
    // apply_patch sends one text block: "*** Update File: path"
    const patch = String(params.input || params.diff || '');
    for (const m of patch.matchAll(/^\*\*\* (?:Add|Update|Delete) File:\s*(.+?)\s*$|^\*\*\* Move to:\s*(.+?)\s*$/gm)) {
      paths.push(m[1] || m[2]);
    }
    for (const p of paths) {
      if (PROTECTED_FILE.test(p)) {
        respond(true, `Kemyze rule: '${p}' holds secrets or local data and must not be edited by Cline.`);
      }
      if (PROTECTED_DIR.test(p)) {
        respond(true, `Kemyze rule: do not edit files inside node_modules or venv ('${p}').`);
      }
    }
  }

  if (READ_TOOLS.has(tool) && params.path && PROTECTED_FILE.test(String(params.path))) {
    respond(true, `Kemyze rule: '${params.path}' holds secrets and must not be read by Cline.`);
  }

  if (COMMAND_TOOLS.has(tool)) {
    const commands = [...parseList(params.commands), ...parseList(params.command), ...parseList(params.cmd)];
    for (const cmd of commands) {
      if (DESTRUCTIVE.some((re) => re.test(cmd))) {
        respond(true, `Kemyze rule: '${cmd}' is destructive. Ask the user to run it manually if it is really needed.`);
      }
    }
  }

  respond(false);
}

let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => (input += chunk));
process.stdin.on('end', () => {
  try {
    check(input);
  } catch {
    respond(false);
  }
});
