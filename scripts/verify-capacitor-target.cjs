const fs = require("fs");

const expectedUrl = process.argv[2];
if (!expectedUrl) {
  console.error("Usage: node scripts/verify-capacitor-target.cjs <expected-url>");
  process.exit(2);
}

const rawConfig = fs.readFileSync("capacitor.config.json", "utf8").replace(/^\uFEFF/, "");
const config = JSON.parse(rawConfig);
const actualUrl = config.server?.url || "";

if (actualUrl !== expectedUrl) {
  console.error(`Expected Capacitor server URL ${expectedUrl}, got ${actualUrl || "<bundled assets>"}`);
  process.exit(1);
}

console.log(`Capacitor server target verified: ${actualUrl}`);
