import { BUSINESS as B } from '../data/business.mjs';
import { COLORS } from '../data/brand.mjs';
import { lockup, stackedLogo } from '../brand/logo.mjs';
import { brewStrip, againIcon } from './brew.mjs';
import { BREW_COPY } from '../data/brew.mjs';

export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Home sections are linked as /#id so the same nav works from the menu page. "note" is the handwritten line in the mobile sheet.
const NAV = [
  { href: '/menu/', label: 'Menu', key: 'menu', note: 'come hungry' },
  { href: '/#coffee', label: 'Coffee', note: 'hot or iced' },
  { href: '/#order-ahead', label: 'Order ahead', note: 'skip the queue' },
  { href: '/#story', label: 'Our story', note: 'who we are' },
  { href: '/#visit', label: 'Visit', note: 'find us' },
];

const LAARA_URL = 'https://laaradigital.co.uk/';

export const ICONS = {
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  bag: '<path d="M6 7h12l1 13H5L6 7z"/><path d="M9 10V6a3 3 0 0 1 6 0v4"/>',
  phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
  pin: '<path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>',
  mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
  instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.8" fill="currentColor"/>',
};
export const icon = (name, size = 20, cls = '') =>
  `<svg aria-hidden="true" focusable="false" class="${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONS[name]}</svg>`;
export const arrow = () => icon('arrow', 18, 'arrow');

export const addressLine = () => `${B.address.street}, ${B.address.town} ${B.address.postcode}`;

// Hours as a list. site.js marks today's row in UK time.
export const hoursRows = (labelKey = 'labelLong') => B.hours.map((h) => `<li class="hours-row" data-days="${h.days.join(',')}"><span>${h[labelKey]} <span class="today-tag" hidden>Today</span></span><span class="whitespace-nowrap font-semibold">${h.time}</span></li>`).join('');

function header(current, brew) {
  const isCurrent = (n) => (n.key && n.key === current ? ' aria-current="page"' : '');
  const desktop = NAV.map((n) => `<a href="${n.href}" class="nav-link"${isCurrent(n)}>${n.label}</a>`).join('');
  const mobile = NAV.map((n) => `<a href="${n.href}" class="sheet-link" data-note="${n.note}"${isCurrent(n)}>${n.label}</a>`).join('\n      ');
  return `<header class="site-header" data-header>
  <div class="site-header-inner container-page flex items-center justify-between gap-6">
    <a href="/" class="logo-link shrink-0" aria-label="Wick House, home">${lockup()}</a>
    <nav class="hidden items-center gap-1 lg:flex" aria-label="Primary">${desktop}</nav>
    <div class="flex items-center gap-3">
      <a href="/menu/#order" class="btn btn-primary hidden md:inline-flex">Order ahead ${arrow()}</a>
      <button id="menu-toggle" type="button" class="menu-toggle js-only -mr-2 lg:hidden" aria-label="Open menu" aria-expanded="false" aria-controls="mobile-nav">
        <svg aria-hidden="true" focusable="false" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path data-icon-open d="M3 8h18M3 16h12"/><path data-icon-close d="M6 6l12 12M18 6L6 18" hidden/></svg>
      </button>
    </div>
  </div>
  ${brew ? brewStrip() : ''}
</header>
<nav id="mobile-nav" class="mobile-nav on-dark hidden lg:!hidden" aria-label="Mobile">
      ${mobile}
      <p class="hand mt-8">${esc(B.tagline)}.</p>
      <div class="mt-5 grid gap-3 sm:grid-cols-2">
        <a href="/menu/#order" class="btn btn-gold w-full">Order ahead ${arrow()}</a>
        <a href="${B.instagramUrl}" rel="noopener" class="btn btn-outline w-full">${icon('instagram', 18)} @${B.instagram}</a>
      </div>
</nav>`;
}

// Mobile only: the three things a phone visitor most wants.
function actionBar() {
  return `<nav class="action-bar on-dark md:hidden" aria-label="Quick actions">
  <a href="/menu/#order" class="is-primary">${icon('bag', 22)}Order ahead</a>
  <a href="${B.directionsUrl}" rel="noopener">${icon('pin', 22)}Directions</a>
  <a href="${B.phoneHref}">${icon('phone', 22)}Call</a>
</nav>`;
}

// The footer opens with the payoff the bean journey lands on: the logo forms, then the two actions that make money.
// The logo's markup is the finished cup, so pages without the journey (and visitors without JavaScript) see it complete.
function footer(brew) {
  return `<footer class="site-footer on-dark" id="footer">
  <div class="footer-payoff container-page flex flex-col items-center pb-12 pt-14 text-center lg:flex-row lg:justify-center lg:gap-20 lg:pb-14 lg:pt-16 lg:text-left" data-payoff>
    <div class="brew-logo" id="brew-art" data-state="brewed">${stackedLogo({ title: 'Wick House: coffee, sandwiches, lunch', brew: true })}</div>
    <span class="footer-payoff-rule" aria-hidden="true"></span>
    <div class="mt-10 flex flex-col items-center lg:mt-0 lg:items-start">
      <h2 class="max-w-xl text-4xl text-cream md:text-5xl lg:max-w-md">That's your daily Wick fix.</h2>
      <div class="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
        <a href="/menu/#order" class="btn btn-gold">Order ahead ${arrow()}</a>
        <a href="${B.directionsUrl}" rel="noopener" class="btn btn-outline">${icon('pin', 18)} Get directions</a>
      </div>
      ${brew ? `<button type="button" class="brew-again mt-6" id="brew-again" hidden>${againIcon} ${BREW_COPY.again}</button>` : ''}
    </div>
  </div>
  <div class="container-page grid gap-8 border-t border-white/10 py-10 md:grid-cols-3 md:py-12">
    <div>
      <h2 class="label mb-4">Opening hours</h2>
      <ul class="text-sm">${hoursRows()}</ul>
      <p class="mt-3 text-sm text-cream/80">Opening ${B.openingLabel}.</p>
    </div>
    <div>
      <h2 class="label mb-4">Find us</h2>
      <p class="text-sm">${esc(addressLine())}<br />${esc(B.landmark)}</p>
      <ul class="mt-3 text-sm">
        <li><a href="${B.phoneHref}" class="footer-link gap-2">${icon('phone', 16)} ${B.phoneDisplay}</a></li>
        <li><a href="mailto:${B.email}" class="footer-link gap-2">${icon('mail', 16)} ${B.email}</a></li>
      </ul>
    </div>
    <div>
      <h2 class="label mb-4">Follow along</h2>
      <a href="${B.instagramUrl}" rel="noopener" class="footer-link gap-2 text-base">${icon('instagram', 20)} @${B.instagram}</a>
      <p class="mt-2 text-sm text-cream/80">${esc(B.vibe)} Coming your way.</p>
    </div>
  </div>
  <div class="container-page pb-8">
    ${B.demo ? '<p class="demo-note">This is a demo website prepared for Wick House. The menu, prices, address, phone, email and opening hours are placeholders until the owners confirm them.</p>' : ''}
    <div class="mt-6 flex flex-col gap-1 text-xs text-cream/70 sm:flex-row sm:justify-between">
      <p>&copy; 2026 ${B.name}, Hackney Wick.</p>
      <p>Website by <a href="${LAARA_URL}" rel="noopener" class="underline decoration-gold underline-offset-4 hover:text-goldlight">Laara Digital</a></p>
    </div>
  </div>
</footer>`;
}

// brew: true adds the bean journey: the strip under the header, brew.js and the footer reveal.
export function page({ key, path, title, description, ogImage = 'home', body, scripts = [], preloads = '', brew = false }, assets) {
  const url = `${B.baseUrl}${path}`;
  const image = `${B.baseUrl}/assets/img/og/${ogImage}.jpg`;
  const scriptTags = ['site', ...scripts, ...(brew ? ['brew'] : [])].map((s) => `<script src="/assets/js/${assets.js[s]}" defer></script>`).join('\n');
  return `<!DOCTYPE html>
<!-- Generated by scripts/build.mjs. Edit the files in src/ and run npm run build. -->
<html lang="en-GB"${brew ? ' class="has-brew"' : ''}>
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}" />
${B.demo ? '<meta name="robots" content="noindex, nofollow" />' : `<link rel="canonical" href="${url}" />`}
<meta property="og:site_name" content="${B.name}" />
<meta property="og:locale" content="en_GB" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(description)}" />
<meta property="og:type" content="website" />
<meta property="og:url" content="${url}" />
<meta property="og:image" content="${image}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="The Wick House logo: a steaming cup above the words Wick House" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="theme-color" content="${COLORS.cream}" />
<link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml" />
<link rel="icon" href="/assets/img/favicon-32.png" type="image/png" sizes="32x32" />
<link rel="apple-touch-icon" href="/assets/img/apple-touch-icon.png" />
<script>document.documentElement.classList.add('js');</script>
<link rel="preload" href="/assets/fonts/manrope-400.woff2" as="font" type="font/woff2" crossorigin />
<link rel="preload" href="/assets/fonts/jost-500.woff2" as="font" type="font/woff2" crossorigin />
${preloads}
<style>${assets.css}</style>
${scriptTags}
</head>
<body>
<a href="#main-content" class="sr-only rounded-full bg-forest px-4 py-2 font-semibold text-cream focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50">Skip to content</a>
${header(key, brew)}
<main id="main-content" tabindex="-1">
${body}
</main>
${footer(brew)}
${actionBar()}
</body>
</html>
`;
}

// Data for a page script. "<" is escaped so a value can never close the script tag.
export const jsonScript = (id, data) => `<script type="application/json" id="${id}">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;
export const formatPrice = (p) => `£${p}`;
