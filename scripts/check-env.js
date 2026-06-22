const fs = require("node:fs");
const path = require("node:path");

const major = Number(process.versions.node.split(".")[0]);
const root = path.resolve(__dirname, "..");
const tailwindPkg = path.join(root, "node_modules", "@tailwindcss", "cli", "package.json");
const hugoPkg = path.join(root, "node_modules", "hugo-extended", "package.json");

if (major < 22) {
  console.error(
    [
      "",
      `Node ${process.versions.node} is too old. Hugo 0.163+ with Tailwind CSS v4 needs Node 22+.`,
      "",
      "Install Node 22+ using your platform's usual method:",
      "  https://nodejs.org/          (macOS, Windows, Linux installers)",
      "  nvm install 22 && nvm use 22 (macOS, Linux, WSL)",
      "",
      "Then rerun: npm install && npm run dev",
      "",
    ].join("\n"),
  );
  process.exit(1);
}

if (!fs.existsSync(hugoPkg)) {
  console.error(
    [
      "",
      "hugo-extended is missing.",
      "",
      "Run:",
      "  npm install",
      "",
    ].join("\n"),
  );
  process.exit(1);
}

if (!fs.existsSync(tailwindPkg)) {
  console.error(
    [
      "",
      "Tailwind CSS CLI is missing. Hugo needs the local @tailwindcss/cli package.",
      "",
      "Run:",
      "  npm install",
      "",
      "Then start the site with:",
      "  npm run dev",
      "",
    ].join("\n"),
  );
  process.exit(1);
}
