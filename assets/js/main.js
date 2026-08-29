"use strict";
const STORAGE_KEY = 'theme-preference';
const root = document.documentElement;
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
function initTheme() {
    var _a;
    const toggle = document.getElementById('themeToggle');
    const icon = document.getElementById('themeIcon');
    const apply = (theme) => {
        if (theme === 'light') {
            root.setAttribute('data-theme', 'light');
        }
        else {
            root.removeAttribute('data-theme');
        }
        if (icon)
            icon.textContent = theme === 'light' ? '☀️' : '🌙';
        if (toggle) {
            toggle.setAttribute('aria-label', `Switch to ${theme === 'light' ? 'dark' : 'light'} theme`);
            toggle.setAttribute('aria-pressed', String(theme === 'light'));
        }
    };
    apply((_a = readStoredTheme()) !== null && _a !== void 0 ? _a : systemTheme());
    toggle === null || toggle === void 0 ? void 0 : toggle.addEventListener('click', () => {
        const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
        apply(next);
        try {
            localStorage.setItem(STORAGE_KEY, next);
        }
        catch {
        }
    });
    window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (event) => {
        if (readStoredTheme() === null)
            apply(event.matches ? 'light' : 'dark');
    });
}
function initMobileNav() {
    const toggle = document.getElementById('navToggle');
    const links = document.getElementById('navLinks');
    if (!toggle || !links)
        return;
    const setOpen = (open) => {
        links.classList.toggle('open', open);
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', `${open ? 'Close' : 'Open'} navigation menu`);
    };
    toggle.addEventListener('click', () => {
        setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });
    links.addEventListener('click', (event) => {
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
            !links.contains(target) &&
            !toggle.contains(target)) {
            setOpen(false);
        }
    });
    window.matchMedia('(min-width: 651px)').addEventListener('change', (event) => {
        if (event.matches)
            setOpen(false);
    });
}
function initReveal() {
    const sections = Array.from(document.querySelectorAll('.section'));
    if (sections.length === 0)
        return;
    const reveal = (section) => section.classList.add('visible');
    if (!('IntersectionObserver' in window) ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        sections.forEach(reveal);
        return;
    }
    const observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
            if (!entry.isIntersecting)
                continue;
            reveal(entry.target);
            observer.unobserve(entry.target);
        }
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    for (const section of sections) {
        if (section.getBoundingClientRect().top < window.innerHeight) {
            reveal(section);
        }
        else {
            observer.observe(section);
        }
    }
}
function initFooterYear() {
    const slot = document.getElementById('footerYear');
    if (slot)
        slot.textContent = String(new Date().getFullYear());
}
function init() {
    initTheme();
    initMobileNav();
    initReveal();
    initFooterYear();
}
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
}
else {
    init();
}
