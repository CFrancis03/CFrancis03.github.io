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
| Fonts | Space Grotesk + Inter (Google Fonts) | Preconnected, `display=swap`, full system fallback stacks |
| Hosting | GitHub Pages from the repo root | Nothing to build on the server |

Total payload is roughly **50 KB** of HTML + CSS + JS (uncompressed, fonts excluded).

## Project structure

```
.
├── index.html                 # All page content
├── css/styles.css             # All styling + both theme palettes
├── src/main.ts                # TypeScript source (the thing you edit)
├── assets/
│   ├── js/main.js             # Compiled output — committed, do not edit by hand
│   └── resume/                # Résumé PDF linked from the hero
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
redefined under `:root[data-theme="light"]`. An inline script in `<head>` sets
`data-theme` before first paint (so there's no flash of the wrong colours): it reads
`localStorage['cf-theme']`, and falls back to `prefers-color-scheme` — which means
**dark unless the visitor's OS asks for light**. The toggle in the nav writes an
explicit choice to `localStorage`; until someone clicks it, the page keeps following
the OS setting live.

**Scroll reveal.** Elements with `.reveal` fade and rise into place via an
`IntersectionObserver`, staggered with `data-reveal-delay="1|2|3…"` (each step = 85 ms).
Add the class and the attribute to any new element and it just works. Content is only
hidden when the `js` class is present, so the page is fully readable with JS disabled,
and everything is shown immediately under `prefers-reduced-motion: reduce`.

**Nav.** Sticky, gains a blurred background past 8 px of scroll, and highlights the
current section with a second `IntersectionObserver`. Below 46 rem it collapses into a
hamburger menu that closes on link click, outside click, `Escape`, or resize to desktop.

**Motion.** Every hover lift, transition, and animation is disabled under
`prefers-reduced-motion: reduce`; there's also a `@media print` block.

## Editing content

All copy lives in `index.html` — there's no data file or templating to learn.

- **Projects** — duplicate an `<article class="card">` block. Each needs a
  `card__lang` badge, a GitHub `card__link`, and a `<ul class="tags">`.
- **Skills** — add an `<li class="pill">` to any `.skills__group`.
- **Education** — add an `<li class="timeline__item">`; the connector line and dot are
  drawn by CSS.
- **Accent colour** — change `--accent` / `--accent-2` in *both* palette blocks at the
  top of `css/styles.css`. Everything else (gradients, glows, focus rings) derives
  from them.

## Content provenance — please review

Everything on the page was taken from `assets/resume/Colton-Francis-Resume.pdf`,
**except** the items below. Each is also flagged with an HTML comment at its location
in `index.html`:

- **Sauk Valley Community College (Associate in Arts)** in the Education timeline —
  carried over from the previous `index.html` in this repo, not present in the résumé
  PDF. Verify or delete.
- **"Open to relocation and remote"** under Contact — not stated on the résumé.
- **Prose in About / Projects / hero** — rewritten from résumé bullet points for the
  web. No new facts were introduced, but the wording is not verbatim.

Known gaps, all marked with `PLACEHOLDER:` comments in `index.html`:

- No live-demo URLs (all three projects are CLI tools) — only GitHub links are shown.
- No LinkedIn, X, or blog URL appears on the résumé, so none is linked.
- No social preview image; the `og:image` tags are commented out until one exists.
- No GPA, honours, or NIU coursework listed.
- The résumé lists a **phone number**, deliberately left out of the public page. The
  PDF itself is linked from the hero and *does* contain it — delete the "Résumé"
  button and `assets/resume/` if you'd rather not publish that.

## Accessibility

Skip link, visible `:focus-visible` rings, one `<h1>` with an ordered heading
structure, `aria-expanded`/`aria-controls` on the menu button, `aria-label` +
`aria-pressed` on the theme toggle, decorative SVGs marked `aria-hidden`, and
`rel="noopener noreferrer"` on every external link. Both palettes were chosen to keep
body text above 4.5:1 contrast.
