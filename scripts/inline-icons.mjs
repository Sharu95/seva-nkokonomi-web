// Inlines the icon sprite into each HTML page, so icons work everywhere (file://, any host)
// without an extra request. Source of truth: assets/icons.svg.
// Usage: node scripts/inline-icons.mjs   (or: npm run icons)
//
// In the pages, reference icons as <use href="#id" />. Only symbols a page uses are inlined,
// between the markers <!-- icons:start --> and <!-- icons:end --> right after <body>.

import { readFile, writeFile } from "node:fs/promises";

const root = new URL("..", import.meta.url);
const pages = ["index.html", "personvern.html"];

const sprite = await readFile(new URL("assets/icons.svg", root), "utf8");
const symbols = new Map(
  [...sprite.matchAll(/<symbol id="([^"]+)"[\s\S]*?<\/symbol>/g)].map((m) => [m[1], m[0]]),
);

const START = "<!-- icons:start -->";
const END = "<!-- icons:end -->";

for (const page of pages) {
  const url = new URL(page, root);
  let html = await readFile(url, "utf8");

  // Normalise any external sprite references to in-page ones.
  html = html.replaceAll('href="assets/icons.svg#', 'href="#');

  const used = [...new Set([...html.matchAll(/<use href="#([^"]+)"/g)].map((m) => m[1]))].sort();
  const missing = used.filter((id) => !symbols.has(id));
  if (missing.length) throw new Error(`${page}: unknown icon(s): ${missing.join(", ")}`);

  const block = used.length
    ? `${START}\n    <svg class="icon-sprite" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">\n${used
        .map((id) => `      ${symbols.get(id)}`)
        .join("\n")}\n    </svg>\n    ${END}`
    : `${START}\n    ${END}`;

  if (html.includes(START)) {
    html = html.replace(new RegExp(`${START}[\\s\\S]*?${END}`), block);
  } else {
    html = html.replace(/<body>\n/, `<body>\n    ${block}\n`);
  }

  await writeFile(url, html);
  console.log(`${page}: ${used.length} icons inlined`);
}
