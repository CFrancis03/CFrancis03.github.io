# cfrancis03.github.io

Personal portfolio site for **Colton Francis** — a single-page, statically hosted site
built with semantic HTML, hand-written CSS, and TypeScript compiled to vanilla JS.
No frameworks, no runtime dependencies.

Live at **https://coltonfrancis.dev/**

---

## Stack

| Layer | Choice | Why |
| --- | --- | --- |
| Markup | Semantic HTML5 | Landmarks, real heading order, skip link, ARIA only where needed |
| Styling | One CSS file, custom properties | Theming is a single `[data-theme]` attribute swap |
| Behaviour | TypeScript → ES2019 script | Type safety in source, zero-dependency plain JS in the browser |
| Fonts | Inter (Google Fonts) | Preconnected, `display=swap`, only the 5 weights in use |
| Hosting | GitHub Pages from the repo root | Nothing to build on the server |

Total payload is roughly **40 KB** of HTML + CSS + JS (uncompressed, fonts and images excluded).

## Project structure

```
.
├── index.html                 # All page content
├── css/styles.css             # All styling + both theme palettes
├── src/main.ts                # TypeScript source (the thing you edit)
├── assets/
│   ├── js/main.js             # Compiled output — committed, do not edit by hand
│   └── resume/                # Résumé PDF, linked from the hero and Contact
├── tsconfig.json              # strict; compiles src/ → assets/js/
├── package.json               # `typescript` is the only devDependency
├── .nojekyll                  # Serve files verbatim; skip Jekyll processing
│
│   # Domain + SEO
├── CNAME                      # Custom domain for GitHub Pages — see warning below
├── favicon.ico                # 16/32/48 bundle; crawlers request this path directly
├── favicon.svg                # Scalable primary icon
├── apple-touch-icon.png       # 180x180 iOS home-screen icon
├── site.webmanifest           # PWA/Android icon + name metadata
├── robots.txt                 # Allows all, points to the sitemap
├── sitemap.xml                # Single URL; update <lastmod> on meaningful edits
├── 404.html                   # Styled, noindex; GitHub Pages serves it automatically
└── assets/
    ├── og-image.png           # 1200x630 social preview card
    └── icons/                 # 192/512 PNGs + maskable variant for the manifest
```

## Build

Requires Node 18+ (only to run `tsc` — the site itself has no runtime deps).

```bash
npm install        # installs TypeScript
npm run build      # compiles src/main.ts -> assets/js/main.js
npm run watch      # same, but recompiles on save
npm run typecheck  # type-check without emitting
```

`assets/js/main.js` **is committed to the repo on purpose**: GitHub Pages serves this
repo as-is with no build step, so the compiled file has to be in version control.
Always run `npm run build` and commit the result alongside any `src/main.ts` change.

## Preview locally

```bash
npm run serve      # python3 -m http.server 8080
# then open http://localhost:8080
```

Or in one shot: `npm run dev` (build + serve). Any static file server works —
`npx serve .`, `php -S localhost:8080`, etc. Opening `index.html` via `file://`
mostly works but is not identical to how Pages serves it.

## Deploy

This is a user site (`<username>.github.io`), so the default branch **is** the site.

1. `npm run build`
2. Commit `index.html`, `css/`, `src/`, and `assets/`
3. Push to the branch configured under **Settings → Pages → Build and deployment**
   (source: *Deploy from a branch*, branch: `master` — or `main`, folder: `/ (root)`)
4. Pages redeploys in ~1 minute

There is no CI workflow — pushing the compiled output is the deploy.

### ⚠ Custom domain: set DNS *before* this reaches the live branch

The repo contains a `CNAME` file holding `coltonfrancis.dev`. As soon as that file
lands on the branch Pages deploys, GitHub starts serving the site on that domain and
**301-redirects `cfrancis03.github.io` to it**. If DNS isn't pointed yet, the site is
unreachable at both addresses until it is.

So either configure DNS first, or delete `CNAME` before merging and add it back later.

At your registrar, for the apex domain, add four `A` records (or one `ALIAS`/`ANAME`
if the registrar supports it) pointing to GitHub Pages:

```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

Plus a `CNAME` record for `www` → `cfrancis03.github.io`. Then in **Settings → Pages**
set the custom domain and, once the check passes, tick **Enforce HTTPS** (certificate
issuance takes a few minutes).

Everything else is already pointed at the new domain: canonical tag, `og:url`,
`og:image`, `sitemap.xml`, `robots.txt`, and the JSON-LD `@id`s. If you end up using a
different domain, grep for `coltonfrancis.dev` and replace it — those are the only
places it appears.

## How the pieces work

**Theming.** Every colour is a custom property on `:root`, with the light palette
redefined under `[data-theme="light"]`. An inline script in `<head>` sets the attribute
before first paint (so there's no flash of the wrong colours): it reads
`localStorage['theme-preference']`, and falls back to `prefers-color-scheme` — which
means **dark unless the visitor's OS asks for light**. The nav toggle writes an explicit
choice to `localStorage`; until someone clicks it, the page keeps following the OS
setting live.

**Scroll reveal.** Each `<section class="section">` fades and rises into view via an
`IntersectionObserver`. Sections already on screen at load (the hero) are revealed
immediately rather than waiting for a threshold they may never cross. Content is only
hidden when the `js` class is present, so the page is fully readable with JS disabled,
and everything shows at once under `prefers-reduced-motion: reduce`.

**Nav.** Sticky with a blurred backdrop. Below 650 px it collapses into a hamburger menu
that closes on link click, outside click, `Escape`, or resize back to desktop. The theme
toggle sits outside the collapsible list so it stays reachable on mobile.

**Motion.** Every transition, hover lift, and the bouncing scroll arrow are disabled
under `prefers-reduced-motion: reduce`; there's also a `@media print` block.

## Editing content

All copy lives in `index.html` — there's no data file or templating to learn.

- **Projects** — duplicate an `<article class="project-card">` block. Each needs a
  `project-tag`, a description, and a GitHub link.
- **Skills** — add an `<li>` to any `.skill-pills` list. Add `class="skill-pending"`
  for a dashed, de-emphasised "still learning" pill.
- **Education** — add another `<div class="edu-item">`.
- **Accent colour** — change `--accent` (and `--accent-contrast`, the text colour used
  on top of it) in *both* palette blocks at the top of `css/styles.css`.

## Contact details

The phone number is **deliberately not printed anywhere on the page**. It lives in
`assets/resume/Colton-Francis-Resume.pdf`, reachable through the *Résumé* button in the
hero and the *View Résumé* button in the Contact section. That keeps it out of reach of
plain-text scrapers while still being one click away for a real reader — but note the
PDF is publicly downloadable, so this is obfuscation, not privacy. Delete both buttons
and `assets/resume/` if you'd rather not publish it at all.

Email, GitHub, and city remain on the page as visible links.

## SEO

What's in place:

- **Title** (51 chars) and **meta description** (148 chars) — both inside Google's
  truncation limits, name first for branded searches.
- **Canonical URL** on every page, absolute `og:`/`twitter:` URLs (scrapers don't
  resolve relative paths), and a real 1200x630 `og:image`.
- **JSON-LD structured data** — a `@graph` of `WebSite`, `ProfilePage`, `Person`, and
  one `SoftwareSourceCode` node per project. The `Person` node is what Google reads for
  name queries: job title, `alumniOf` NIU, locality, `sameAs` GitHub, and `knowsAbout`
  skills. **There is deliberately no `telephone` property** — the number is kept off the
  site (see below), and putting it in structured data would undo that.
- **`robots.txt` + `sitemap.xml`**, and a `noindex` 404 page so error pages can't rank.
- **Full icon set**: `favicon.ico` (16/32/48), SVG, Apple touch icon, and manifest PNGs.
- **Faster fonts** — the request now asks for the 5 weights actually used instead of the
  full variable font on two axes plus a separate italic file.

After the domain is live, submit `https://coltonfrancis.dev/sitemap.xml` in
[Google Search Console](https://search.google.com/search-console) — indexing a brand-new
domain otherwise takes considerably longer. Validate the structured data with the
[Rich Results Test](https://search.google.com/test/rich-results).

Worth doing next, in rough order of payoff:

1. **Self-host the Inter woff2 subset.** Removes two third-party origins from the
   critical path and improves Largest Contentful Paint, which is a ranking signal.
2. **Real project content.** Per-project pages with genuine write-ups give Google
   something to index beyond one page of card blurbs — the single biggest lever on a
   one-pager.
3. **Backlinks.** Put the domain in your GitHub profile, repo `About` fields, and
   LinkedIn. For a new personal domain this outweighs most on-page tweaking.

## Known gaps

Marked with `PLACEHOLDER:` comments in `index.html`:

- No live-demo URLs — all three projects are CLI tools, so each card shows a greyed-out
  "Demo" label next to the Source link.
- No LinkedIn or blog URL, so `sameAs` in the structured data lists only GitHub.

## Accessibility

Skip link, visible `:focus-visible` rings, one `<h1>` with an ordered heading structure,
`aria-expanded`/`aria-controls` on the menu button, `aria-label` + `aria-pressed` on the
theme toggle, decorative icons and SVGs marked `aria-hidden`, and
`rel="noopener noreferrer"` on every external link.
