# cfrancis03.github.io

Personal portfolio site for **Colton Francis** — a single-page, statically hosted site
built with semantic HTML, hand-written CSS, and TypeScript compiled to vanilla JS.
No frameworks, no runtime dependencies.

Live at **https://cfrancis03.github.io/**

---

## Stack

| Layer | Choice | Why |
| --- | --- | --- |
| Markup | Semantic HTML5 | Landmarks, real heading order, skip link, ARIA only where needed |
| Styling | One CSS file, custom properties | Theming is a single `[data-theme]` attribute swap |
| Behaviour | TypeScript → ES2019 script | Type safety in source, zero-dependency plain JS in the browser |
| Fonts | Inter (Google Fonts) | Preconnected, `display=swap`, full system fallback stack |
| Hosting | GitHub Pages from the repo root | Nothing to build on the server |

Total payload is roughly **37 KB** of HTML + CSS + JS (uncompressed, fonts excluded).

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
└── .nojekyll                  # Serve files verbatim; skip Jekyll processing
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

## Known gaps

Marked with `PLACEHOLDER:` comments in `index.html`:

- No live-demo URLs — all three projects are CLI tools, so each card shows a greyed-out
  "Demo" label next to the Source link.
- No social preview image; the `og:image` tag is commented out until one exists.
- No LinkedIn or blog URL.

## Accessibility

Skip link, visible `:focus-visible` rings, one `<h1>` with an ordered heading structure,
`aria-expanded`/`aria-controls` on the menu button, `aria-label` + `aria-pressed` on the
theme toggle, decorative icons and SVGs marked `aria-hidden`, and
`rel="noopener noreferrer"` on every external link.
