const fs = require("fs");

const index = fs.readFileSync("index.html", "utf8");
const app = fs.readFileSync("app.js", "utf8");
const styles = fs.readFileSync("styles.css", "utf8");

const checks = [
  ["settings modal markup", index.includes('id="settingsModal"')],
  ["settings close button", index.includes('id="settingsCloseButton"')],
  ["sound toggle", index.includes('id="soundToggle"')],
  ["vibration toggle", index.includes('id="vibrationToggle"')],
  ["privacy link in settings", index.includes('href="privacy.html"')],
  ["account deletion mail link", index.includes("mailto:mkwdbet@gmail.com")],
  ["settings modal query", app.includes('document.querySelector("#settingsModal")')],
  ["sound preference key", app.includes("memorySnapSoundEnabled")],
  ["vibration preference key", app.includes("memorySnapVibrationEnabled")],
  ["settings modal styles", styles.includes(".settings-list")],
  ["toggle switch styles", styles.includes(".toggle-switch")],
];

const missing = checks.filter(([, passed]) => !passed).map(([name]) => name);
if (missing.length) {
  console.error(`Missing launch polish pieces:\n- ${missing.join("\n- ")}`);
  process.exit(1);
}

console.log("Launch polish structure verified.");
