# nkokonomi-web

Landing site for **NK Økonomi**, the umbrella brand for NK Regnskap AS (accounting, org.nr. 937 920 326) and NK Økonomi Bistand AS (advisory, org.nr. 922 859 469), Hønefoss. Static HTML and CSS, no build step for the pages, no form. Small progressive scripts: floating header, active-section nav, scroll reveals and hero tilt.

## Run locally
```sh
npm run dev        # python3 -m http.server 4321 → http://localhost:4321
```
Pages also work straight from disk (`file://`): icons are inlined in each page.

## Structure
```
index.html            One-page site: hero (with "Kommende frister"), #regnskap, #radgivning, process, about, contact
aktuelt.html          All upcoming tax deadlines and a-ordningen news (rendered from data/*.json)
personvern.html       Privacy policy (draft, review before publishing)
data/                 frister.json, a-ordningen.json: Skatteetaten feeds as JSON (updated daily by CI)
robots.txt, sitemap.xml
tokens.json           Design tokens (DTCG): source of truth
DESIGN.md             Design intent: brand, rules, components
styles/
  main.css            Entry: imports everything in order
  tokens.css          GENERATED from tokens.json (npm run tokens)
  fonts.css, base.css
  components/         One file per component (badge, button, card, header, footer, icon;
                      form.css is kept for the coming form but not imported)
  sections/           Page sections (hero, steps, about, contact, prose)
assets/               Logo variants (logo-nk-okonomi-manrope.svg = umbrella lockup in use, Manrope wordmark;
                      logo-nk-okonomi.svg = same lockup with the Unbounded wordmark; both pending approval;
                      logo-horizontal.svg = NK Økonomi Bistand lockup), icon sprite, touch icon
fonts/                Self-hosted Manrope variable font (OFL-1.1)
js/header.js          Floating header on scroll (progressive: the page works without it)
js/reveal.js          Scroll-enter reveals: letter blur on headings, fade-up groups (skipped for reduced motion)
js/nav.js             Active-section pill in the desktop nav
js/hero.js            Pointer tilt for the hero illustration (fine pointers, no reduced motion)
js/feeds.js           Shared feed helpers (load JSON, dates, deadline card); js/frister.js and js/aktuelt.js render them
scripts/
  build-tokens.mjs    tokens.json → styles/tokens.css
  inline-icons.mjs    assets/icons.svg → inline sprite in each page (npm run icons)
  derive-palette.mjs  Derives color scales from the logo colors (run when a brand color changes)
  fetch_feeds.py      Skatteetaten RSS → data/*.json (npm run feeds; Python standard library only)
  build-og-image.mjs  scripts/og-image.html → assets/og-image.png, 1200×630 share image (npm run og, needs Chrome)
```

## Tax deadlines and news (feeds)
Skatteetaten's RSS feeds (skattekalender for bedrift and person, a-ordningen news) can't be fetched from the browser: they only allow Skatteetaten's own origin (CORS). Instead, `.github/workflows/feeds.yml` runs `scripts/fetch_feeds.py` daily, and commits `data/*.json` when something changed. It then requests a Pages rebuild. Run `npm run feeds` to refresh the data locally. A failing feed keeps its previous file and fails the workflow, so you get notified.

## Icons
Icons come from `assets/icons.svg` (source). In pages, write `<svg class="icon" aria-hidden="true"><use href="#id" /></svg>`, then run `npm run icons`: it inlines exactly the symbols each page uses.

## Design tokens
Edit `tokens.json`, then run `npm run tokens`. CSS variables are named `--ds-` + the token path (`color.text.secondary` → `--ds-color-text-secondary`).

## Before going live
- [ ] Approve the "NK Økonomi" logo lockup: Manrope wordmark (`assets/logo-nk-okonomi-manrope.svg`, in use) or the original Unbounded wordmark (`assets/logo-nk-okonomi.svg`). Switching back is a src change in the headers and footer.
- [ ] Review service descriptions and the privacy policy with the customer.
- [ ] Confirm scope and licences for auditing (revisjon) and investment advice before adding them.
- [ ] Contact form: decide on a solution (static sites need a form service or host feature).
- [ ] Update the e-mail in Brønnøysundregistrene (NK Økonomi Bistand AS currently says nkregnskap@outlook.com).
- [ ] Enforce HTTPS in the GitHub Pages settings once the certificate for nkokonomi.no is issued (canonical and OG URLs use https).
- [ ] After deploy: check link previews (Facebook Sharing Debugger, LinkedIn Post Inspector) and run Google's Rich Results Test.

## Moving to React later
The CSS classes map 1:1 to components (`.button` → `<Button>`, `.card` → `<Card>`, `.site-header` → `<SiteHeader>`), and `styles/tokens.css` keeps working unchanged. Text can move to message files when English and Tamil are added.
