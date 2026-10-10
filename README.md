# nkokonomi-web

Landing site for **NK Økonomi**, the umbrella brand for NK Regnskap AS (accounting, org.nr. 937 920 326) and NK Økonomi Bistand AS (advisory, org.nr. 922 859 469), Hønefoss. Static HTML and CSS, no build step for the pages, no form. Two small progressive scripts: floating header and scroll reveals.

## Run locally
```sh
npm run dev        # python3 -m http.server 4321 → http://localhost:4321
```
Pages also work straight from disk (`file://`): icons are inlined in each page.

## Structure
```
index.html            One-page site: hero, #regnskap, #radgivning, process, about, contact
personvern.html       Privacy policy (draft, review before publishing)
tokens.json           Design tokens (DTCG): source of truth
DESIGN.md             Design intent: brand, rules, components
styles/
  main.css            Entry: imports everything in order
  tokens.css          GENERATED from tokens.json (npm run tokens)
  fonts.css, base.css
  components/         One file per component (badge, button, card, header, footer, icon;
                      form.css is kept for the coming form but not imported)
  sections/           Page sections (hero, steps, about, contact, prose)
assets/               Logo variants (logo-nk-okonomi.svg = umbrella lockup, pending approval;
                      logo-horizontal.svg = NK Økonomi Bistand lockup), icon sprite, touch icon
fonts/                Self-hosted Unbounded + Geist (OFL-1.1)
js/header.js          Floating header on scroll (progressive: the page works without it)
js/reveal.js          Scroll-enter reveals: letter blur on headings, fade-up groups (skipped for reduced motion)
scripts/
  build-tokens.mjs    tokens.json → styles/tokens.css
  inline-icons.mjs    assets/icons.svg → inline sprite in each page (npm run icons)
  derive-palette.mjs  Derives color scales from the logo colors (run when a brand color changes)
```

## Icons
Icons come from `assets/icons.svg` (source). In pages, write `<svg class="icon" aria-hidden="true"><use href="#id" /></svg>`, then run `npm run icons`: it inlines exactly the symbols each page uses.

## Design tokens
Edit `tokens.json`, then run `npm run tokens`. CSS variables are named `--ds-` + the token path (`color.text.secondary` → `--ds-color-text-secondary`).

## Before going live
- [ ] Approve the "NK Økonomi" logo lockup (`assets/logo-nk-okonomi.svg`).
- [ ] Review service descriptions and the privacy policy with the customer.
- [ ] Confirm scope and licences for auditing (revisjon) and investment advice before adding them.
- [ ] Contact form: decide on a solution (static sites need a form service or host feature).
- [ ] Update the e-mail in Brønnøysundregistrene (NK Økonomi Bistand AS currently says nkregnskap@outlook.com).
- [ ] Choose hosting and the domain, and add `og:url`, `og:image` and a canonical link.

## Moving to React later
The CSS classes map 1:1 to components (`.button` → `<Button>`, `.card` → `<Card>`, `.site-header` → `<SiteHeader>`), and `styles/tokens.css` keeps working unchanged. Text can move to message files when English and Tamil are added.
