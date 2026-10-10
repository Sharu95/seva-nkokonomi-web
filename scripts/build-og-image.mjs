// Renders scripts/og-image.html to assets/og-image.png (1200×630) with headless Chrome.
// Usage: npm run og   (override the browser with CHROME_PATH=/path/to/chrome)
import { spawn } from "node:child_process";
import { copyFileSync, existsSync, mkdtempSync, readFileSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const WIDTH = 1200;
const HEIGHT = 630;

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const template = join(root, "scripts/og-image.html");
const output = join(root, "assets/og-image.png");

const candidates = [
  process.env.CHROME_PATH,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
].filter(Boolean);
const chrome = candidates.find((p) => existsSync(p));
if (!chrome) {
  console.error("Fant ikke Chrome/Chromium. Sett CHROME_PATH.");
  process.exit(1);
}

// Headless Chrome on macOS sometimes writes the screenshot but never exits,
// so wait for the file to appear and then stop the browser ourselves.
const profile = mkdtempSync(join(tmpdir(), "og-chrome-"));
const shot = join(profile, "og-image.png");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let child;
try {
  child = spawn(
    chrome,
    [
      "--headless=new",
      "--disable-gpu",
      "--no-first-run",
      "--no-default-browser-check",
      "--allow-file-access-from-files",
      `--user-data-dir=${profile}`,
      "--hide-scrollbars",
      "--force-device-scale-factor=1",
      `--window-size=${WIDTH},${HEIGHT}`,
      "--virtual-time-budget=3000",
      `--screenshot=${shot}`,
      pathToFileURL(template).href,
    ],
    { stdio: "ignore" },
  );
  let exited = false;
  child.on("exit", () => (exited = true));

  const deadline = Date.now() + 60_000;
  let lastSize = -1;
  for (;;) {
    if (Date.now() > deadline) throw new Error("Tidsavbrudd: Chrome lagde ikke skjermbilde.");
    await sleep(250);
    if (!existsSync(shot)) {
      if (exited) throw new Error("Chrome avsluttet uten å lage skjermbilde.");
      continue;
    }
    const size = statSync(shot).size;
    if (size > 0 && size === lastSize) break; // size stable: file fully written
    lastSize = size;
  }
  copyFileSync(shot, output);
} finally {
  if (child && child.exitCode === null) child.kill("SIGKILL");
  await sleep(200);
  rmSync(profile, { recursive: true, force: true });
}

// Verify dimensions from the PNG IHDR chunk.
const buf = readFileSync(output);
const w = buf.readUInt32BE(16);
const h = buf.readUInt32BE(20);
if (w !== WIDTH || h !== HEIGHT) {
  console.error(`Feil størrelse: ${w}×${h}, forventet ${WIDTH}×${HEIGHT}`);
  process.exit(1);
}
console.log(`Skrev ${output} (${w}×${h}, ${Math.round(statSync(output).size / 1024)} KB)`);
