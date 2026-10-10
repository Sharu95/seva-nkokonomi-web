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
| Fonts | Unbounded (display), Geist (UI/body) | Logo wordmark (Unbounded 600 + Geist 500) |
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
| Energy | Low (calm) | Default spring `smooth`, bounce 0, durations one step slower than the preset. No bouncy motion. |
| Softness | Middle-high | Radius preset, but pill buttons and round shapes, echoing the logo ring and Unbounded's round forms. |
| Depth | Low-middle | Hairline + soft shadows. Glass only on the header. |
| Density | Spacious | Larger body (17px), 48px controls, 128px section spacing on desktop. |
| Contrast | Middle | Teal on key actions and the accounting area. Apricot as soft surfaces for the advisory area. Orange is a small spark (step numbers), never a surface. |

## 2. Principles
1. **Trust before flair.** Clear text, honest claims, visible company info (org.nr.). No fake numbers or testimonials.
2. **One action per view.** "Kontakt oss" (teal, primary) is the only strong call to action. Phone is the secondary action.
3. **Plain language.** Short sentences, no jargon. Norwegian Bokmål first.
4. **Calm motion.** Content arrives softly once; nothing loops or demands attention.
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
| display | Unbounded | 52 / 1.08 / −0.03em (mobile 34) | 600 |
| heading.lg | Unbounded | 34 / 1.15 / −0.02em (mobile 24) | 500 |
| heading.md | Unbounded | 24 / 1.25 / −0.01em | 500 |
| heading.sm | Unbounded | 18 / 1.35 / −0.005em | 500 |
| lead | Geist | 20 / 1.55 (mobile 17) | 400 |
| body | Geist | 17 / 1.6 | 400 |
| label | Geist | 15 / 1.4 | 500–600 |
| small / caption | Geist | 14 / 13 | 400–500 |
| eyebrow | Geist | 13 / 0.08em, uppercase | 600 |

Tuning: Unbounded is very wide, so headings are one step smaller than the preset and use weight 500 (600 only for the display). Geist body is 17px for comfortable reading. Numbers that align use `.t-tabular`.

Fonts are self-hosted variable woff2 (latin subset, covers æ ø å), `font-display: swap`, with metric-adjusted Arial fallbacks (approximate). **Tamil (planned):** neither font has Tamil glyphs. Add Noto Sans Tamil, raise line height (~1.7) and use 0 tracking for `lang="ta"`.

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
- Cards lift 2px on hover (pointer devices only). Buttons scale to 0.97 on press.
- Header float: width, height, inset and radius ease with `duration.slow` + `easing.emphasized`; glass and shadow fade with `duration.base`.
- `prefers-reduced-motion`: animations and transitions become near-instant, smooth scroll is off.

## 6. Components
All live in `styles/components/` (one file per component, class names map 1:1 to future React components).

| Component | File | Notes |
|---|---|---|
| Button | `button.css` | `--primary`, `--secondary`, `--sm`, `--block` |
| Icon / IconBadge | `icon.css` | Sprite `assets/icons.svg` (Lucide-style, 1.75 stroke). Badges: default (teal), `--warm` (apricot), `--highlight` (orange) |
| Card | `card.css` | `--interactive` adds hover lift; `.card-grid` 1/2/3 columns |
| Badge / Provider | `badge.css` | Verified-fact pill (Finanstilsynet link), "Leveres av …" line |
| Form / Field | `form.css` | Ready for the contact form; **not imported** until the form returns |
| SiteHeader | `header.css` + `js/header.js` | Rest: full-width, transparent, `size.headerInset` from the top. Scrolled (`[data-scrolled]`): floating glass pill, `size.floatingHeader.*`. Constant outer height, so no layout shift. Works without JS (stays at rest). Mobile menu via `<details>`. |
| SiteFooter | `footer.css` | Org.nr., contact, links |

Sections (`styles/sections/`): hero, steps, about, contact, prose.

## 7. Do / don't
- **Do** use semantic tokens (`--ds-color-text-secondary`), **don't** use primitives or hex in components.
- **Do** keep orange to small marks. **Don't** use it for text on white or for large fills.
- **Don't** use red except for errors.
- **Do** attribute every service to the company that delivers it ("Leveres av …").
- **Do** say "godkjent regnskapsselskap" **only about NK Regnskap AS** (Finanstilsynet, verified October 2026). NK Økonomi Bistand AS has no licence: never imply it does accounting, auditing or investment advice.
- **Don't** list auditing (revisjon) or investment advice until the customer has confirmed scope and licences.
- **Do** show both companies with org.nr. in the footer. Only NK Økonomi Bistand AS is VAT-registered (MVA); NK Regnskap AS is not (checked October 2026).
- **Don't** use primitives directly, except the decorative hero glow (`teal.3`, `apricot.3`).
- **Don't** put the logo on dark backgrounds.
