# CLAUDE.md: Wick House demo site

A pitch demo for Wick House, a specialty coffee and sandwich cafe in Hackney Wick opening 18 November 2026.
`plan.md` is the source of truth: read it first and tick items off as they are done. Each phase ends with a working build and a commit.

## Always do first
- Check `Brand Assets/` and the Instagram files in the project root before writing frontend code. Use what is there.
- Content rules: Italian and Greek dishes only, no Turkish dish names. Cold coffees stay in (freddo espresso is the featured drink).
- Anything invented for the pitch is marked PLACEHOLDER in `src/data/business.mjs` and `src/data/menu.mjs`. Never present a placeholder as fact in copy (no specific bean origins, awards or reviews).

## GitHub and deployment
- Repo: `cuneytcandan2026-jpg/wick-house-demo`, branch `master`. Pushing to it is approved; push at the end of each phase.
- A push to `master` runs `.github/workflows/deploy-hostinger.yml`: it builds `dist/` and publishes it to the `hostinger` branch, which Hostinger's Git deploy pulls into the subdomain.
- Never commit `dist/`. Never push to `hostinger` by hand.

## Source layout
- **Edit `src/`, then `npm run build`.** Output goes to `dist/` (`index.html`, `menu/index.html`, scripts with hashed names). The stylesheet is inlined into each page's `<style>` to save a render-blocking request on phones (it keeps mobile LCP under 2.5s), so it never contains `</style`.
- `src/data/business.mjs`: every business fact. `src/data/menu.mjs`: every dish and price. Swapping the real menu is a one-file edit.
- `src/data/brand.mjs`: the palette. `tailwind.config.cjs` reads it; `npm run contrast` checks every text pairing for WCAG AA.
- `src/brand/`: the vector logo. Regenerate with `npm run logo` (`scripts/make-logo.mjs` traces Jost glyphs; never hand-edit `logo-data.json`). Parts carry classes for the bean journey: `.logo-steam path`, `.logo-cup-fill`, `.logo-wordmark`, `.logo-dash`.
- **Bean journey** (home only, `brew: true` in the page definition): `src/data/brew.mjs` (landmark positions), `src/templates/brew.mjs` (strip, bean, landmarks, latte art), `src/js/brew.js`, `src/css/brew.css` (colours and every timing as tokens). The footer logo is `stackedLogo({ brew: true })`; its resting markup is the finished logo.
- **Kitchen favourites** (home, under the hero): `FAVOURITES` in `src/data/menu.mjs` picks the dishes; `src/templates/favourites.mjs` (markup, orbit geometry), `src/js/favourites.js` (scroll pin and swaps), `src/css/favourites.css` (timings as tokens). Desktop is a 960 x 520 canvas scaled to the stage; below 1024px it stacks.
- `src/templates/layout.mjs`: head, header, mobile sheet, mobile action bar, footer. `src/pages/*.mjs`: page bodies. `src/js/*.js`: each file becomes its own hashed script; a page lists the ones it needs in `scripts`.
- **Photos:** `src/data/photos.mjs` lists every photo (source, crop ratio, grade, alt text). Originals live in `assets/raw/` (`ai/`, `stock/`, `mural/`). `npm run photos` crops and grades them into `assets/img/<key>.jpg` and writes `src/data/photo-sizes.json`; commit all three. The build makes AVIF and WebP at 480/800/1400/2000px (never wider than the source) into `dist/assets/img/r/`.
- In pages, use `picture('<key>', { sizes, eager })` from `src/templates/picture.mjs`, and never a hand-written `<img>`. Only the hero gets `eager: true`. Menu items find their photo by `img` or `id`.
- Two crop ratios across the shoot: 4:5 portrait and 3:2 landscape. A new stock photo gets `grade: 'full'` and an entry in `docs/CREDITS.md`.

## Dev server and screenshots
- `npm run build`, then `node serve.mjs` (background) serves `dist/` at `http://localhost:3000`. Never screenshot `file:///`. Do not start a second instance if one is running.
- `node screenshot.mjs http://localhost:3000 label` (desktop 1440px) and `node screenshot.mjs http://localhost:3000 label mobile` (390px). Saved to `./temporary screenshots/`.
- After each screenshot, read the PNG and compare. **Always take desktop and mobile per pass.** Minimum 2 rounds before calling a phase done. Check 360px for horizontal scroll.

## Brand
- Colours: cream base, forest ink and dark sections, deep green, sage, gold accent, lilac sparingly. **Gold, sage and lilac are decoration only on cream** (they fail AA there). For small text on cream use `golddark`, `moss` or `lilacdark`; on forest use `goldlight`, `sage` or `cream`.
- Type: Jost for headings and wide-tracked capital labels (`.label`), Manrope for body, Caveat (`.hand`) only for short lines like "your daily Wick fix". All self-hosted from @fontsource; never add Google Fonts or the Tailwind CDN.
- Motifs: the gold dash under the logo (`.dash`), leaf sprigs, the mural's lilac flowers, light grain on cream.

## Design guardrails
- **Colours:** only brand tokens. The default Tailwind palette is switched off on purpose.
- **Typography:** tight tracking on large headings, `line-height: 1.7` on body.
- **Shadows:** layered, forest-tinted, low opacity (`shadow-base`, `shadow-lifted`). Never flat `shadow-md`.
- **Gradients:** multiple radial layers plus SVG grain for depth.
- **Animation:** `transform` and `opacity` only. No `transition-all`. Spring easing (`--ease-spring`, `--ease-out`). Respect `prefers-reduced-motion`.
- **Interactive states:** every clickable element has hover, focus-visible and active.
- **Images:** gradient overlay plus a colour layer; one consistent grade across the shoot.
- **Depth:** base → elevated → floating; surfaces don't all sit on one plane.
- **Scroll reveals:** `data-reveal`, handled by `site.js` with IntersectionObserver on opacity and translateY. Never on page load or above the fold.
- No arbitrary Tailwind values when a token works.

## Required head tags (layout.mjs adds them)
charset, viewport, title, description, og:title/description/type/url/image, and `<meta name="robots" content="noindex, nofollow">` while `BUSINESS.demo` is true. The CI build fails if a page loses noindex.

## Accessibility
- WCAG AA contrast (`npm run contrast`). Semantic HTML: `<nav>`, `<main>`, `<button>`, never a `<div>` for clicks. Descriptive `alt` on all images. Visible focus rings. 44×44px minimum touch targets.
- With the dev server running: `npm run qa` (axe-core on both pages at 1440/390/360px, plus horizontal overflow) and `npm run qa:states -- http://localhost:3000 390` (axe and screenshots with the menu sheet, offer form, lightbox and order pad open). Both must pass before a push.
- In scripts, read layout before writing classes; a read after each write forces a layout per element.
