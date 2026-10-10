// Derives the 12-step primitive color scales from the logo colors (OKLCH method,
// see DESIGN.md → Color). Prints JSON to paste into tokens.json → primitive.
// Usage: node scripts/derive-palette.mjs
// Not part of the build: run it only when a brand color changes.

const srgbToLinear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const linearToSrgb = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

const hexToRgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
const rgbToHex = (rgb) =>
  "#" + rgb.map((c) => Math.round(Math.min(1, Math.max(0, c)) * 255).toString(16).padStart(2, "0")).join("");

function rgbToOklch(hex) {
  const [r, g, b] = hexToRgb(hex).map(srgbToLinear);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return { L, C: Math.hypot(A, B), H: ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360 };
}

function oklchToLinear({ L, C, H }) {
  const a = C * Math.cos((H * Math.PI) / 180);
  const b = C * Math.sin((H * Math.PI) / 180);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

const inGamut = (lin) => lin.every((c) => c >= -0.0001 && c <= 1.0001);

// Reduce chroma until the color fits in sRGB.
function oklchToHex(color) {
  let { C } = color;
  while (C > 0 && !inGamut(oklchToLinear({ ...color, C }))) C -= 0.002;
  return rgbToHex(oklchToLinear({ ...color, C: Math.max(0, C) }).map(linearToSrgb));
}

const luminance = (hex) => {
  const [r, g, b] = hexToRgb(hex).map(srgbToLinear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
export const contrast = (a, b) => {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

// Chroma profile per step, as a share of the brand chroma.
const CHROMA = [0.06, 0.1, 0.18, 0.28, 0.4, 0.52, 0.66, 0.85, 1, 1, 0.9, 0.6];

// lightHue: optional hue for steps 1–8 (tints), so light steps can lean warmer than the brand.
function scale(brandHex, lightness, { lightHue } = {}) {
  const brand = rgbToOklch(brandHex);
  return Object.fromEntries(
    lightness.map((L, i) => {
      const step = i + 1;
      const H = lightHue !== undefined && step <= 8 ? lightHue : brand.H;
      const hex = step === 9 ? brandHex.toLowerCase() : oklchToHex({ L, C: brand.C * CHROMA[i], H });
      return [step, hex];
    }),
  );
}

// Teal: logo ring end color #0E7490 is step 9 (L ≈ 0.52, dark brand: steps 10–12 stay darker).
// Tints lean towards the ring's start color (#14B8A6, hue ≈ 182) so they read green-teal, not icy blue.
const teal = scale("#0E7490", [0.99, 0.975, 0.955, 0.93, 0.895, 0.85, 0.79, 0.7, 0, 0.47, 0.42, 0.27], {
  lightHue: 195,
});
// Orange: logo bars/trend #F97316 is step 9 (light brand: only for fills with dark text).
const orange = scale("#F97316", [0.99, 0.975, 0.955, 0.93, 0.9, 0.86, 0.81, 0.75, 0, 0.66, 0.53, 0.3]);
// Apricot: warm secondary between the logo's amber and orange. Used for surfaces (2–5) and text (11).
const apricot = scale("#F0A060", [0.985, 0.965, 0.94, 0.915, 0.89, 0.865, 0.835, 0.8, 0, 0.66, 0.5, 0.3]);

// Sand neutral: warm, low-chroma grey (hue ≈ 70) from cream background to warm ink.
const SAND_HUE = 70;
const sandL = [0.985, 0.97, 0.95, 0.925, 0.9, 0.87, 0.82, 0.74, 0.6, 0.55, 0.45, 0.22];
const sandC = [0.008, 0.01, 0.012, 0.014, 0.015, 0.016, 0.017, 0.018, 0.018, 0.018, 0.016, 0.012];
const sand = Object.fromEntries(sandL.map((L, i) => [i + 1, oklchToHex({ L, C: sandC[i], H: SAND_HUE })]));

// Status: subtle background (step 3) and text-safe default (step 11).
const status = (hex) => {
  const s = scale(hex, [0.99, 0.975, 0.955, 0.93, 0.9, 0.86, 0.8, 0.72, 0, 0.5, 0.45, 0.27]);
  return { 3: s[3], 9: s[9], 11: s[11] };
};

const out = {
  teal,
  orange,
  apricot,
  sand,
  green: status("#16a34a"),
  red: status("#dc2626"),
  amber: status("#d97706"),
};

console.log(JSON.stringify(out, null, 2));
console.error("\nContrast checks:");
const W = "#ffffff";
const checks = [
  ["sand.12 on sand.1 (body)", sand[12], sand[1]],
  ["sand.12 on white (card body)", sand[12], W],
  ["sand.11 on sand.1 (secondary)", sand[11], sand[1]],
  ["sand.11 on sand.3 (secondary on sunken)", sand[11], sand[3]],
  ["sand.10 on sand.1 (tertiary)", sand[10], sand[1]],
  ["sand.9 on white (control border ≥ 3)", sand[9], W],
  ["white on teal.9 (primary button)", W, teal[9]],
  ["teal.10 on sand.1 (link)", teal[10], sand[1]],
  ["teal.11 on teal.2 (eyebrow on teal tint)", teal[11], teal[2]],
  ["teal.11 on teal.3", teal[11], teal[3]],
  ["apricot.11 on apricot.2 (eyebrow on apricot tint)", apricot[11], apricot[2]],
  ["apricot.11 on apricot.3", apricot[11], apricot[3]],
  ["apricot.11 on white", apricot[11], W],
  ["sand.11 on apricot.2", sand[11], apricot[2]],
  ["sand.12 on orange.9 (step number)", sand[12], orange[9]],
  ["orange.10 on sand.1 (focus ≥ 3)", orange[10], sand[1]],
  ["red.11 on white", out.red[11], W],
];
for (const [label, a, b] of checks) console.error(`${contrast(a, b).toFixed(2).padStart(6)}  ${label}`);
