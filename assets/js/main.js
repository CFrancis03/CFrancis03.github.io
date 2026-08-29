"use strict";
const STORAGE_KEY = 'cf-theme';
const root = document.documentElement;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
function readStoredTheme() {
    try {
        const value = localStorage.getItem(STORAGE_KEY);
        return value === 'light' || value === 'dark' ? value : null;
    }
    catch {
        return null;
    }
}
function systemTheme() {
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}
function currentTheme() {
    return root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
}
function applyTheme(theme, toggle) {
    root.setAttribute('data-theme', theme);
    if (toggle) {
        const next = theme === 'dark' ? 'light' : 'dark';
        toggle.setAttribute('aria-label', `Switch to ${next} theme`);
        toggle.setAttribute('aria-pressed', String(theme === 'light'));
    }
}
function initTheme() {
    var _a;
    const toggle = document.querySelector('[data-theme-toggle]');
    applyTheme((_a = readStoredTheme()) !== null && _a !== void 0 ? _a : systemTheme(), toggle);
    toggle === null || toggle === void 0 ? void 0 : toggle.addEventListener('click', () => {
        const next = currentTheme() === 'dark' ? 'light' : 'dark';
        applyTheme(next, toggle);
        try {
            localStorage.setItem(STORAGE_KEY, next);
        }
        catch {
        }
    });
    const media = window.matchMedia('(prefers-color-scheme: light)');
    media.addEventListener('change', (event) => {
        if (readStoredTheme() === null) {
            applyTheme(event.matches ? 'light' : 'dark', toggle);
        }
    });
}
function initMobileNav() {
    const toggle = document.querySelector('[data-nav-toggle]');
    const menu = document.querySelector('[data-nav-menu]');
    if (!toggle || !menu)
        return;
    const setOpen = (open) => {
        menu.classList.toggle('is-open', open);
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', `${open ? 'Close' : 'Open'} navigation menu`);
    };
    toggle.addEventListener('click', () => {
        setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });
    menu.addEventListener('click', (event) => {
        if (event.target.closest('a'))
            setOpen(false);
    });
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
            setOpen(false);
            toggle.focus();
        }
    });
    document.addEventListener('click', (event) => {
        const target = event.target;
        if (toggle.getAttribute('aria-expanded') === 'true' &&
            !menu.contains(target) &&
            !toggle.contains(target)) {
            setOpen(false);
        }
    });
    const desktop = window.matchMedia('(min-width: 46.0625rem)');
    desktop.addEventListener('change', (event) => {
        if (event.matches)
            setOpen(false);
    });
}
function initScrollChrome() {
    const nav = document.querySelector('[data-nav]');
    const bar = document.querySelector('[data-progress-bar]');
    let ticking = false;
    const update = () => {
        ticking = false;
        const y = window.scrollY;
        nav === null || nav === void 0 ? void 0 : nav.classList.toggle('is-stuck', y > 8);
        if (bar) {
            const scrollable = document.documentElement.scrollHeight - window.innerHeight;
            const progress = scrollable > 0 ? Math.min(y / scrollable, 1) : 0;
            bar.style.transform = `scaleX(${progress})`;
        }
    };
    window.addEventListener('scroll', () => {
        if (!ticking) {
            ticking = true;
            requestAnimationFrame(update);
        }
    }, { passive: true });
    update();
}
function initActiveSection() {
    const links = Array.from(document.querySelectorAll('[data-nav-menu] a[href^="#"]'));
    if (links.length === 0)
        return;
    const byId = new Map();
    const sections = [];
    for (const link of links) {
        const id = link.getAttribute('href').slice(1);
        const section = document.getElementById(id);
        if (section) {
            byId.set(id, link);
            sections.push(section);
        }
    }
    const setActive = (id) => {
        for (const link of links) {
            link.classList.toggle('is-active', link === byId.get(id));
        }
    };
    const observer = new IntersectionObserver((entries) => {
        const visible = entries
            .filter((entry) => entry.isIntersecting)
            .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible)
            setActive(visible.target.id);
    }, { rootMargin: '-25% 0px -60% 0px', threshold: 0 });
    sections.forEach((section) => observer.observe(section));
}
function initReveal() {
    const items = Array.from(document.querySelectorAll('.reveal'));
    if (items.length === 0)
        return;
    if (reducedMotion.matches || !('IntersectionObserver' in window)) {
        items.forEach((item) => item.classList.add('is-visible'));
        return;
    }
    for (const item of items) {
        const delay = item.dataset.revealDelay;
        if (delay)
            item.style.setProperty('--reveal-delay', delay);
    }
    const observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
            if (!entry.isIntersecting)
                continue;
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
        }
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    items.forEach((item) => observer.observe(item));
}
function initCardSpotlight() {
    if (reducedMotion.matches || !window.matchMedia('(hover: hover)').matches)
        return;
    for (const card of Array.from(document.querySelectorAll('[data-tilt]'))) {
        card.addEventListener('pointermove', (event) => {
            const rect = card.getBoundingClientRect();
            card.style.setProperty('--mx', `${event.clientX - rect.left}px`);
            card.style.setProperty('--my', `${event.clientY - rect.top}px`);
        });
    }
}
function initFooterYear() {
    const slot = document.querySelector('[data-year]');
    if (slot)
        slot.textContent = String(new Date().getFullYear());
}
function init() {
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
}
else {
    init();
}
