/**
 * Colton Francis — portfolio interactions.
 *
 * Everything here is dependency-free and compiles to a single ES2019 script
 * (`assets/js/main.js`) that runs directly in the browser. Four concerns:
 *
 *   1. Theme        — dark by default, honours `prefers-color-scheme` on a
 *                     first visit, persists an explicit choice in localStorage.
 *   2. Mobile nav   — hamburger menu with focus/escape handling.
 *   3. Scroll       — sticky-nav state, active section highlight, progress bar.
 *   4. Reveal       — IntersectionObserver entrance animations + card spotlight.
 *
 * The theme is *applied* by a tiny inline script in <head> so there's no flash
 * of the wrong colours; this module only owns the toggle from then on.
 */

type Theme = 'light' | 'dark';

const STORAGE_KEY = 'cf-theme';
const root = document.documentElement;

/** `prefers-reduced-motion` is respected everywhere motion is introduced. */
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

/* ------------------------------------------------------------------ theme */

function readStoredTheme(): Theme | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === 'light' || value === 'dark' ? value : null;
  } catch {
    // Private-mode / blocked storage: fall back to the system preference.
    return null;
  }
}

function systemTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function currentTheme(): Theme {
  return root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
}

function applyTheme(theme: Theme, toggle: HTMLButtonElement | null): void {
  root.setAttribute('data-theme', theme);
  if (toggle) {
    const next = theme === 'dark' ? 'light' : 'dark';
    toggle.setAttribute('aria-label', `Switch to ${next} theme`);
    toggle.setAttribute('aria-pressed', String(theme === 'light'));
  }
}

function initTheme(): void {
  const toggle = document.querySelector<HTMLButtonElement>('[data-theme-toggle]');

  applyTheme(readStoredTheme() ?? systemTheme(), toggle);

  toggle?.addEventListener('click', () => {
    const next: Theme = currentTheme() === 'dark' ? 'light' : 'dark';
    applyTheme(next, toggle);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Non-fatal: the theme still applies for this page view.
    }
  });

  // Follow the OS until the visitor makes an explicit choice.
  const media = window.matchMedia('(prefers-color-scheme: light)');
  media.addEventListener('change', (event) => {
    if (readStoredTheme() === null) {
      applyTheme(event.matches ? 'light' : 'dark', toggle);
    }
  });
}

/* -------------------------------------------------------------- mobile nav */

function initMobileNav(): void {
  const toggle = document.querySelector<HTMLButtonElement>('[data-nav-toggle]');
  const menu = document.querySelector<HTMLElement>('[data-nav-menu]');
  if (!toggle || !menu) return;

  const setOpen = (open: boolean): void => {
    menu.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', `${open ? 'Close' : 'Open'} navigation menu`);
  };

  toggle.addEventListener('click', () => {
    setOpen(toggle.getAttribute('aria-expanded') !== 'true');
  });

  // Any anchor click closes the menu so the target section is visible.
  menu.addEventListener('click', (event) => {
    if ((event.target as HTMLElement).closest('a')) setOpen(false);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      setOpen(false);
      toggle.focus();
    }
  });

  document.addEventListener('click', (event) => {
    const target = event.target as Node;
    if (
      toggle.getAttribute('aria-expanded') === 'true' &&
      !menu.contains(target) &&
      !toggle.contains(target)
    ) {
      setOpen(false);
    }
  });

  // Leaving the mobile breakpoint should never strand the menu open.
  const desktop = window.matchMedia('(min-width: 46.0625rem)');
  desktop.addEventListener('change', (event) => {
    if (event.matches) setOpen(false);
  });
}

/* ------------------------------------------------------- scroll behaviours */

/** Sticky-nav shadow + top progress bar, batched into one rAF per scroll. */
function initScrollChrome(): void {
  const nav = document.querySelector<HTMLElement>('[data-nav]');
  const bar = document.querySelector<HTMLElement>('[data-progress-bar]');
  let ticking = false;

  const update = (): void => {
    ticking = false;
    const y = window.scrollY;

    nav?.classList.toggle('is-stuck', y > 8);

    if (bar) {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollable > 0 ? Math.min(y / scrollable, 1) : 0;
      bar.style.transform = `scaleX(${progress})`;
    }
  };

  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    },
    { passive: true },
  );

  update();
}

/** Highlights the nav link for whichever section is nearest the viewport top. */
function initActiveSection(): void {
  const links = Array.from(
    document.querySelectorAll<HTMLAnchorElement>('[data-nav-menu] a[href^="#"]'),
  );
  if (links.length === 0) return;

  const byId = new Map<string, HTMLAnchorElement>();
  const sections: HTMLElement[] = [];

  for (const link of links) {
    const id = link.getAttribute('href')!.slice(1);
    const section = document.getElementById(id);
    if (section) {
      byId.set(id, link);
      sections.push(section);
    }
  }

  const setActive = (id: string): void => {
    for (const link of links) {
      link.classList.toggle('is-active', link === byId.get(id));
    }
  };

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (visible) setActive(visible.target.id);
    },
    // Band across the upper-middle of the viewport: a section is "current"
    // once its content sits under the nav.
    { rootMargin: '-25% 0px -60% 0px', threshold: 0 },
  );

  sections.forEach((section) => observer.observe(section));
}

/* -------------------------------------------------------- reveal + polish */

function initReveal(): void {
  const items = Array.from(document.querySelectorAll<HTMLElement>('.reveal'));
  if (items.length === 0) return;

  // No IntersectionObserver, or motion is unwelcome: show everything at once.
  if (reducedMotion.matches || !('IntersectionObserver' in window)) {
    items.forEach((item) => item.classList.add('is-visible'));
    return;
  }

  for (const item of items) {
    const delay = item.dataset.revealDelay;
    if (delay) item.style.setProperty('--reveal-delay', delay);
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    },
    { threshold: 0.15, rootMargin: '0px 0px -8% 0px' },
  );

  items.forEach((item) => observer.observe(item));
}

/** Feeds pointer position into `--mx`/`--my` for the project-card spotlight. */
function initCardSpotlight(): void {
  if (reducedMotion.matches || !window.matchMedia('(hover: hover)').matches) return;

  for (const card of Array.from(document.querySelectorAll<HTMLElement>('[data-tilt]'))) {
    card.addEventListener('pointermove', (event) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${event.clientX - rect.left}px`);
      card.style.setProperty('--my', `${event.clientY - rect.top}px`);
    });
  }
}

function initFooterYear(): void {
  const slot = document.querySelector<HTMLElement>('[data-year]');
  if (slot) slot.textContent = String(new Date().getFullYear());
}

/* -------------------------------------------------------------------- boot */

function init(): void {
  initTheme();
  initMobileNav();
  initScrollChrome();
  initActiveSection();
  initReveal();
  initCardSpotlight();
  initFooterYear();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  init();
}
