#!/usr/bin/env node
const { spawnSync } = require("node:child_process");
const path = require("node:path");

const script = process.argv[2];
if (!script) {
  console.error("Usage: node scripts/run-python.js <script.py> [args...]");
  process.exit(1);
}

const scriptPath = path.resolve(process.cwd(), script);
const args = [scriptPath, ...process.argv.slice(3)];
const candidates =
  process.platform === "win32" ? ["python", "py", "python3"] : ["python3", "python"];

for (const command of candidates) {
  const result = spawnSync(command, args, { stdio: "inherit", shell: false });
  if (result.error?.code === "ENOENT") continue;
  process.exit(result.status ?? 1);
}

console.error(
  [
    "",
    "Python not found. Install Python 3 to run validation scripts.",
    "",
    "  https://www.python.org/downloads/",
    "",
  ].join("\n"),
);
process.exit(1);
