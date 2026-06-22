#!/usr/bin/env node
const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const hugoArgs = process.argv.slice(2);
const hugoExtended = path.join(root, "node_modules", "hugo-extended");
const hugoCli = path.join(hugoExtended, "dist", "cli.mjs");
const hugoBinName = process.platform === "win32" ? "hugo.exe" : "hugo";
const hugoBin = path.join(hugoExtended, "bin", hugoBinName);
const localBin = path.join(root, "node_modules", ".bin");

// Hugo resolves tailwindcss from node_modules/.bin first; keep it on PATH too.
const env = {
  ...process.env,
  PATH: `${localBin}${path.delimiter}${process.env.PATH || ""}`,
};

let command;
let args;

// cli.mjs picks the platform binary (hugo vs hugo.exe) and reinstalls if missing.
if (fs.existsSync(hugoCli)) {
  command = process.execPath;
  args = [hugoCli, ...hugoArgs];
} else if (fs.existsSync(hugoBin)) {
  command = hugoBin;
  args = hugoArgs;
} else {
  console.error("Hugo not found. Run: npm install");
  process.exit(1);
}

const result = spawnSync(command, args, { cwd: root, env, stdio: "inherit", shell: false });
process.exit(result.status ?? 1);
