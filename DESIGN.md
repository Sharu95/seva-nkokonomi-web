# DESIGN.md: NK Økonomi

The single source of truth for values is `tokens.json`. This file holds the intent: why the values are what they are, and how to use them. Run `npm run tokens` after changing `tokens.json`; it regenerates `styles/tokens.css` (never edit that file by hand).

## 1. Brand and personality

**Brand inputs**
| Input | Value | Source |
|---|---|---|
| Accent | Teal/petrol `#0E7490`: **accounting** and actions | Logo ring (end stop) |
| Secondary | Apricot `#F0A060` (warm surfaces): **advisory** | Between the logo's amber and orange |
| Highlight | Orange `#F97316` (amber `#FBBF24`) | Logo bars and trend line |
| Neutral | Sand (warm), cream background, warm ink text `#1E1A15` | Warmth requested ("too cold"), option B |
| Fonts | Manrope (display, UI and body) | Chosen for warmth and clear figures. The site lockup uses an outlined Manrope 800 wordmark (`logo-nk-okonomi-manrope.svg`); the original logo (`logo.svg`) keeps Unbounded. Pending the client's choice. |
| Density | Spacious | Landing page, calm reading |
| Materials | Glass for the sticky header only | |
| Platforms | Web (static now, React later) | |
| Dark mode | Not in v0. Semantic tokens are ready for a dark theme | placeholder |

**Adjectives:** trustworthy, calm, personal, clear, optimistic, warm.

**Brand structure:** "NK Økonomi" is the umbrella brand. Two areas, each delivered by its own company:
- **Regnskap** (accounting): NK Regnskap AS, org.nr. 937 920 326, approved accounting firm (Finanstilsynet). Teal.
- **Rådgivning** (advisory): NK Økonomi Bistand AS, org.nr. 922 859 469. Apricot.

The logo tells the same story: the ring (teal) is order and control, the bars and arrow (amber/orange) are growth.

**Dials**
| Dial | Position | In practice |
|---|---|---|
| Energy | Low-middle (calm, alive) | Default spring `smooth`, bounce 0. No bouncy motion. One slow ambient drift in the hero; everything else plays once or responds to the user. |
| Softness | Middle-high | Radius preset, but pill buttons and round shapes, echoing the logo ring. |
| Depth | Low-middle | Hairline + soft shadows. Glass only on the header. |
| Density | Spacious | Larger body (17px), 48px controls, 128px section spacing on desktop. |
| Contrast | Middle | Teal on key actions and the accounting area. Apricot as soft surfaces for the advisory area. Orange is a small spark (step numbers), never a surface. |

## 2. Principles
1. **Trust before flair.** Clear text, honest claims, visible company info (org.nr.). No fake numbers or testimonials.
2. **One action per view.** "Kontakt oss" (teal, primary) is the only strong call to action. Phone is the secondary action.
3. **Plain language.** Short sentences, no jargon. Norwegian Bokmål first.
4. **Calm motion.** Content arrives softly once and responds to the user. The only loop is the slow hero glow drift (`duration.ambient`), off for reduced motion. Nothing blinks or demands attention.
5. **Accessible by default.** WCAG 2.2 AA: contrast, focus, keyboard, reduced motion, 44px hit targets.

## 3. Foundations

### Color
Primitives are derived in OKLCH by `scripts/derive-palette.mjs` (12 steps per hue, the brand color as step 9). Teal tints lean towards the ring's green-teal start color so they read warm, not icy. Verified contrast:

| Pair | Ratio | Use |
|---|---|---|
| `text.primary` (sand 12) on `bg` (sand 1) | 16.5 | Body, headings |
| `text.secondary` (sand 11) on `bg` | 7.1 | Supporting text |
| `text.secondary` on `surface.sunken` (sand 2–3) | ≥ 6.4 | Text in sunken sections |
| `text.tertiary` (sand 10) on `bg` | 4.6 | Hints |
| white on `accent.default` (teal 9) | 5.4 | Primary button |
| `text.link` (teal 10) on `bg` | 6.4 | Links |
| `accent.text` (teal 11) on `surface.tint` (teal 2) | 7.7 | Eyebrows in the accounting area |
| `secondary.text` (apricot 11) on `surface.warm` (apricot 2) | 5.7 | Eyebrows in the advisory area |
| `secondary.text` on `secondary.subtle` (apricot 4) | ≥ 5.2 | Icons in warm badges |
| `text.primary` on `highlight.default` (orange 9) | 6.2 | Step numbers |
| `border.strong` (sand 9) on white | 4.0 | Control boundaries (≥ 3:1) |
| `focus` (orange 10) on `bg` | 3.2 | Focus ring (≥ 3:1) |

Rules:
- **Teal = accounting and action.** Buttons, links, the accounting section (`surface.tint`), teal icon badges.
- **Apricot = advisory.** The advisory section (`surface.warm`), warm icon badges (`.icon-badge--warm`). `secondary.default` (apricot 9) is decorative only.
- **Orange = small spark** (step numbers). Never body text, never large surfaces.
- **Red (`#DC2626`) belongs to the logo.** On the site, red means error (`danger`) and nothing else.
- Neutrals are warm (sand): cream page, sand for sunken sections, warm ink for text. White is kept for cards so they lift off the cream.
- The logo has a white outline on its trend line and navy text, so place it on light surfaces only.

### Typography
| Role | Font | Size / LH / tracking | Weight |
|---|---|---|---|
| display | Manrope | 60 / 1.04 / −0.04em (mobile 40 / 1.08) | 800 |
| heading.lg | Manrope | 40 / 1.12 / −0.03em (mobile 26) | 700 |
| heading.md | Manrope | 26 / 1.2 / −0.02em | 700 |
| heading.sm | Manrope | 19 / 1.3 / −0.015em | 700 |
| lead | Manrope | 20 / 1.55 / −0.01em (mobile 17) | 450 |
| body | Manrope | 17 / 1.6 | 450 |
| label | Manrope | 15 / 1.4 | 600 |
| small / caption | Manrope | 14 / 13 | 400–500 |
| eyebrow | Manrope | 13 / 0.09em, uppercase | 700 |

Tuning: one family for everything; hierarchy comes from weight (800/700 headings, 450 body) and tight tracking on large sizes. Body uses 450 because Manrope's 400 reads a little light on the cream background. Numbers that align use `.t-tabular`.

Manrope is self-hosted as a variable woff2 (latin subset, covers æ ø å, weights 200–800), `font-display: swap`, with a metric-adjusted Arial fallback (approximate). Not loaded from the Google Fonts CDN, so no visitor data goes to Google. **Tamil (planned):** Manrope has no Tamil glyphs. Add Noto Sans Tamil, raise line height (~1.7) and use 0 tracking for `lang="ta"`.

### Space, size, radius
4px base scale (`space.0–14`). Semantic: `inset.xs–lg` 12/16/24/32, `stack.xs–xl` 8/12/24/40/64, `section` 128 (mobile 80), `gutter` 20. Content max width 1160px, prose 64ch. Radius preset (4–32, full). Nested rule: outer = inner + padding. Buttons are pills, cards `xl` (24), inputs `md` (12).

## 4. Materials
| Surface | Token | Use |
|---|---|---|
| Page | `color.bg` | Default background |
| Card / benefit / form | `surface.raised` + `shadow.sm` (hover `md`) | Content blocks |
| Accounting section | `surface.tint` (teal 2) | `#regnskap` |
| Advisory section | `surface.warm` (apricot 2) | `#radgivning` |
| Sunken | `surface.sunken` (sand 2) | About section, footer |
| Header | `material.glass.regular` | Transparent at rest; floats as a glass pill once the page scrolls. Fallback fill when `backdrop-filter` is unsupported or `prefers-reduced-transparency`. |

## 5. Motion
- Default spring `smooth` (0.45s, bounce 0); `gentle` for hero enter; `micro` for press.
- CSS gets springs as generated `linear()` easings plus a settle duration.
- Hero enter: fade-up 16px, stagger 50ms per item, max 5 items. Plays once.
- Scroll reveals (`js/reveal.js`, `reveal.css`), each plays once when the element enters view:
  - Headings (`data-reveal="chars"`): letters go from transparent + `motion.blur.enter` blur to sharp, `duration.reveal` with `easing.enter`, `motion.staggerChar` between letters. Screen readers get the plain text.
  - Eyebrows: settle from `motion.distance.sm` above and `motion.scale.enter`.
  - Text, cards, steps (`data-reveal="up"`, `data-reveal-group`): fade up `motion.distance.lg`, `motion.staggerGroup` between items.
  - Hidden states apply only under `.js-reveal` (set before first paint, removed for reduced motion), so no-JS visitors see everything.
- Hero illustration (`hero.css`, no real figures): the overview card enters, the ring fills and its check draws, bars grow left to right, the orange trend line draws (`duration.chart`) and its dot lands, then the task cards arrive one by one (blur + rise) and their checks draw. Plays once. On pointer devices the layers follow the pointer slightly by `--depth` (`js/hero.js`).
- Hero glow drifts very slowly (`duration.ambient`, alternate). The only looping motion on the site.
- Nav: an active-section pill slides between links as you scroll (`js/nav.js`, smooth spring) and fades out over sections without a link.
- Steps: the connectors draw left to right as the steps scroll into view (CSS scroll-driven animation; finished line where unsupported).
- Cards lift 2px on hover, the icon badge tilts slightly and the icon redraws its strokes once (pointer devices only). Buttons scale to 0.97 on press; a trailing arrow nudges forward on hover.
- Page transitions: cross-document view transitions between pages; the header stays put, the content fades.
- Header float (after crafted.so): the shape contracts first (`duration.morph`, `easing.inOut`), then the glass, border and shadow fade in (`duration.base`, delayed `duration.quick`). Returning to rest morphs everything together. The pill hugs its content (width measured in `js/header.js`).
- `prefers-reduced-motion`: animations and transitions become near-instant (no delays), smooth scroll is off, scroll reveals, hero draw-in, tilt, glow drift, steps drawing and page transitions are skipped (final states shown).

## 6. Components
All live in `styles/components/` (one file per component, class names map 1:1 to future React components).

| Component | File | Notes |
|---|---|---|
| Button | `button.css` | `--primary`, `--secondary`, `--sm`, `--block` |
| Icon / IconBadge | `icon.css` | Sprite `assets/icons.svg` (Lucide-style, 1.75 stroke). Badges: default (teal), `--warm` (apricot), `--highlight` (orange) |
| Card | `card.css` | `--interactive` adds hover lift; `.card-grid` 1/2/3 columns |
| Badge / Provider | `badge.css` | Verified-fact pill (Finanstilsynet link), "Leveres av …" line |
| Form / Field | `form.css` | Ready for the contact form; **not imported** until the form returns |
| SiteHeader | `header.css` + `js/header.js` + `js/nav.js` | Rest: full-width, transparent, `size.headerInset` (24px) from the top. Scrolled (`[data-scrolled]`): floating glass pill, `size.floatingHeader.offset` (24px; `offsetCompact` 16px below 900px) from the top. The header is `display: flow-root` so the bar's margin stays inside the sticky box (otherwise it collapses and the pill sits flush at 0px). Constant outer height, so no layout shift. Active-section pill via `js/nav.js`. Works without JS (stays at rest). Mobile menu via `<details>`. |
| SiteFooter | `footer.css` | Org.nr., contact, links |
| Pill / PillFilter | `pill.css` | Small audience label: `--bedrift` (teal, like accounting), `--person` (apricot). `.pill-filter`: toggle pills with `aria-pressed`, visually 36px, 44px hit area |
| Deadline | `deadline.css` + `js/feeds.js` | Tax deadline link card: orange date chip (day + month, a small mark like the step numbers), pill and "Om n dager", title below at full width. Lifts on hover like cards |

Sections (`styles/sections/`): hero, frister, aktuelt, steps, about, contact, prose.

**Frister and Aktuelt (feed content).** Deadlines and a-ordningen news come from Skatteetaten's RSS feeds, fetched daily by CI into `data/*.json` (Skatteetaten blocks cross-origin requests). Rules:
- Ships hidden, shown only with data. Missing data or a failed request means no strip on the front page; on `aktuelt.html` a link to Skatteetaten's calendars is shown instead. Nothing ever breaks.
- Past deadlines are filtered out in the browser (Norwegian date), so stale data never shows an expired date. A filter needs at least 2 upcoming deadlines to be offered; Bedrift is the default.
- `aktuelt.html` has two pill filters on top: **Vis** (Frister | A-ordningen, default Frister) and **For** (Bedrift | Person, default Bedrift, shown only for Frister). Options without content are hidden; a filter with one option is hidden. The choice lives in the URL (`?vis=a-ordningen`, `?for=person`); the front page's "Se alle frister" opens the same filter. Deadlines there are rows (`.deadline--row`, no audience pill) grouped by month. Skatteetaten's deadline feed has no description, so deadlines show the title only; news shows its summary.
- Static: the front-page row is a grid on wide screens and a swipe row with snap points below 1100px. No auto-scrolling (calm motion, WCAG 2.2.2). It fades in once.
- Feed text is inserted as text only, never as HTML. Always credit Skatteetaten and say these are general deadlines.

## 7. Do / don't
- **Do** use semantic tokens (`--ds-color-text-secondary`), **don't** use primitives or hex in components.
- **Do** keep orange to small marks. **Don't** use it for text on white or for large fills.
- **Don't** use red except for errors.
- **Do** attribute every service to the company that delivers it ("Leveres av …").
- **Do** say "godkjent regnskapsselskap" **only about NK Regnskap AS** (Finanstilsynet, verified October 2026). NK Økonomi Bistand AS has no licence: never imply it does accounting, auditing or investment advice.
- **Don't** list auditing (revisjon) or investment advice until the customer has confirmed scope and licences.
- **Do** show both companies with org.nr. in the footer. Only NK Økonomi Bistand AS is VAT-registered (MVA); NK Regnskap AS is not (checked October 2026).
- **Don't** use primitives directly, except in the decorative hero (glow `teal.3`, `apricot.2–3`; highlighted chart bar `apricot.6`).
- **Don't** put real-looking figures in the hero illustration. It shows tasks and a shape of growth, never amounts.
- **Don't** put the logo on dark backgrounds.
