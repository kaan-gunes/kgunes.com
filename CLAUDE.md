# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All commands run from `frontend/`:

```bash
npm run dev       # Start Vite dev server with HMR
npm run build     # Production build (Terser minification, code splitting)
npm run lint      # ESLint on all JS/JSX files
npm run preview   # Preview production build locally
```

No test suite configured.

## Architecture

Portfolio website for Kaan Güneş. Single-page React 19 app, bilingual (English/Turkish), heavy animation focus.

**Entry points:**
- `frontend/index.html` → `src/main.jsx` → `src/App.jsx`

**App.jsx** (416 lines) orchestrates the full page. Structure:
```
App
├── LoadingScreen       — preloads hero.webp + selfie.webp, gates hero reveal
├── CustomCursor        — desktop-only custom pointer
├── LanguageToggle      — i18next en/tr switcher
├── InteractiveGrid     — background visual
└── (lazy-loaded sections)
    ├── Hero            — HeroParticles + name animation
    ├── AboutCard       — selfie + bio, scroll animations
    ├── CardStack3D     — portfolio cards (3D flip on desktop, 2×2 grid on mobile)
    ├── BeforeAfterSlider — image comparison
    └── ContactSection
```

**Lazy loading:** `CardStack3D`, `BeforeAfterSlider`, `ContactSection` use `React.lazy` + `Suspense`.

**Responsive breakpoint:** 1200px — desktop gets 3D card stack, mobile gets 2×2 grid.

## Animation Stack

Three animation systems in use — understand which to reach for:

- **GSAP + ScrollTrigger** — scroll-driven animations (timeline scrubbing, parallax). Use `useGSAP` from `@gsap/react` to scope contexts and avoid StrictMode double-firing.
- **Framer Motion** — component enter/exit animations, hover states.
- **Lenis** — smooth scroll provider. Synced to GSAP ScrollTrigger via `lenis.on('scroll', ScrollTrigger.update)`.

Always check `prefers-reduced-motion` before adding motion effects.

## i18n

Config in `src/i18n.js`. Translations in `src/locales/en.json` and `src/locales/tr.json`. Default language: `en`. HTML values allowed in translations (`escapeValue: false`).

## Build Notes

**Vite code splitting** produces four vendor chunks: `vendor-react`, `vendor-animation` (GSAP + Framer Motion), `vendor-i18n`, `vendor-icons` (Lucide). Chunk size warning at 500KB.

**Production:** console statements dropped by Terser, source maps disabled, asset inline threshold 4KB.

**Assets:** All images use WebP. Fonts are WOFF2 (preloaded in `index.html`). Public assets live in `frontend/public/`.

## ESLint

Flat config (`eslint.config.js`). Unused vars with uppercase prefixes are allowed (covers unused destructured props).
