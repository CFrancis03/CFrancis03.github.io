/**
 * Colton Francis — portfolio interactions.
 *
 * Dependency-free; compiles to a single ES2019 script (`assets/js/main.js`)
 * that runs directly in the browser. Three concerns:
 *
 *   1. Theme      — dark by default, honours `prefers-color-scheme` on a first
 *                   visit, persists an explicit choice in localStorage.
 *   2. Mobile nav — hamburger menu with outside-click, Escape, and resize handling.
 *   3. Reveal     — IntersectionObserver entrance animations per section.
 *
 * The theme is *applied* by a small inline script in <head> so there's no flash
 * of the wrong colours; this module owns the toggle from then on.
 */

type Theme = 'light' | 'dark';

const STORAGE_KEY = 'theme-preference';
const root = document.documentElement;

/* ------------------------------------------------------------------ theme */

function readStoredTheme(): Theme | null {
    try {
        const value = localStorage.getItem(STORAGE_KEY);
        return value === 'light' || value === 'dark' ? value : null;
    } catch {
        // Private mode / blocked storage: fall back to the system preference.
        return null;
    }
}

function systemTheme(): Theme {
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function initTheme(): void {
    const toggle = document.getElementById('themeToggle');
    const icon = document.getElementById('themeIcon');

    const apply = (theme: Theme): void => {
        if (theme === 'light') {
            root.setAttribute('data-theme', 'light');
        } else {
            root.removeAttribute('data-theme');
        }
        if (icon) icon.textContent = theme === 'light' ? '☀️' : '🌙';
        if (toggle) {
            toggle.setAttribute('aria-label', `Switch to ${theme === 'light' ? 'dark' : 'light'} theme`);
            toggle.setAttribute('aria-pressed', String(theme === 'light'));
        }
    };

    apply(readStoredTheme() ?? systemTheme());

    toggle?.addEventListener('click', () => {
        const next: Theme = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
        apply(next);
        try {
            localStorage.setItem(STORAGE_KEY, next);
        } catch {
            // Non-fatal: the theme still applies for this page view.
        }
    });

    // Keep following the OS until the visitor makes an explicit choice.
    window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (event) => {
        if (readStoredTheme() === null) apply(event.matches ? 'light' : 'dark');
    });
}

/* -------------------------------------------------------------- mobile nav */

function initMobileNav(): void {
    const toggle = document.getElementById('navToggle');
    const links = document.getElementById('navLinks');
    if (!toggle || !links) return;

    const setOpen = (open: boolean): void => {
        links.classList.toggle('open', open);
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', `${open ? 'Close' : 'Open'} navigation menu`);
    };

    toggle.addEventListener('click', () => {
        setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });

    // Any anchor click closes the menu so the target section is visible.
    links.addEventListener('click', (event) => {
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
            !links.contains(target) &&
            !toggle.contains(target)
        ) {
            setOpen(false);
        }
    });

    // Leaving the mobile breakpoint should never strand the menu open.
    window.matchMedia('(min-width: 651px)').addEventListener('change', (event) => {
        if (event.matches) setOpen(false);
    });
}

/* ---------------------------------------------------------- scroll reveal */

function initReveal(): void {
    const sections = Array.from(document.querySelectorAll<HTMLElement>('.section'));
    if (sections.length === 0) return;

    const reveal = (section: HTMLElement): void => section.classList.add('visible');

    // No IntersectionObserver, or motion is unwelcome: show everything at once.
    if (
        !('IntersectionObserver' in window) ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
        sections.forEach(reveal);
        return;
    }

    const observer = new IntersectionObserver(
        (entries) => {
            for (const entry of entries) {
                if (!entry.isIntersecting) continue;
                reveal(entry.target as HTMLElement);
                observer.unobserve(entry.target);
            }
        },
        { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
    );

    for (const section of sections) {
        // A tall section (the hero) can start on screen without ever crossing the
        // 15% threshold, so reveal anything already in view up front.
        if (section.getBoundingClientRect().top < window.innerHeight) {
            reveal(section);
        } else {
            observer.observe(section);
        }
    }
}

/* -------------------------------------------------------------------- misc */

function initFooterYear(): void {
    const slot = document.getElementById('footerYear');
    if (slot) slot.textContent = String(new Date().getFullYear());
}

/* -------------------------------------------------------------------- boot */

function init(): void {
    initTheme();
    initMobileNav();
    initReveal();
    initFooterYear();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
    init();
}
