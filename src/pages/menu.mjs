// Menu page: category tabs, search, dietary filters and the order pad.
// The full menu is in the HTML, so it all shows without JavaScript. menu.js adds the tabs, search and filters;
// order.js adds the Add buttons' behaviour, the pad, collection slots and the WhatsApp hand-off.
// Every dish and price comes from src/data/menu.mjs.
import { BUSINESS as B } from '../data/business.mjs';
import { MENU, DIETS, TAGS, allItems } from '../data/menu.mjs';
import { PHOTOS } from '../data/photos.mjs';
import { arrow, esc, formatPrice, jsonScript } from '../templates/layout.mjs';
import { picture } from '../templates/picture.mjs';
import { flower, lineIcon, sprig } from '../templates/motifs.mjs';

const photoKey = (item) => (PHOTOS[item.img || item.id] ? item.img || item.id : null);
const itemCount = allItems().length;

// Dishes without a photo yet get a drawn mark in the same frame, so every row keeps the same rhythm.
const FALLBACK = {
  sandwiches: () => sprig('menu-thumb-mark w-20'),
  breakfast: () => sprig('menu-thumb-mark w-20'),
  'hot-coffee': () => lineIcon('cup', 40, 'menu-thumb-mark'),
  'cold-coffee': () => lineIcon('ice', 40, 'menu-thumb-mark'),
  sweets: () => flower('menu-thumb-mark h-12 w-12'),
};

const badges = (item) => {
  const list = [];
  if (item.diet) list.push(`<span class="tag tag-diet" title="${DIETS[item.diet].label}">${DIETS[item.diet].short}<span class="sr-only"> (${DIETS[item.diet].label})</span></span>`);
  (item.tags || []).forEach((t) => list.push(`<span class="tag ${t === 'new' ? 'tag-new' : 'tag-soft'}">${TAGS[t]}</span>`));
  return list.join('');
};

const addonLine = (c) => (c.addons ? `<p class="mt-2 text-sm text-moss">${c.addons.map((a) => `${esc(a.label)} +${formatPrice(a.price)}`).join(' &middot; ')}</p>` : '');

function dish(item, category) {
  const key = photoKey(item);
  const search = [item.name, item.desc, category.name, item.diet ? DIETS[item.diet].label : '', ...(item.tags || []).map((t) => TAGS[t])].join(' ').toLowerCase();
  return `<li id="dish-${item.id}" class="menu-item" data-item="${item.id}" data-diet="${item.diet || ''}" data-search="${esc(search)}">
          <div class="menu-thumb${key ? '' : ' is-drawn'}">${key ? picture(key, { sizes: '112px' }) : FALLBACK[category.id]()}</div>
          <div class="flex min-w-0 flex-1 flex-col">
            <div class="flex items-baseline justify-between gap-3">
              <h3 class="menu-name">${esc(item.name)}</h3>
              <p class="price">${formatPrice(item.price)}</p>
            </div>
            <p class="mt-1 text-sm">${esc(item.desc)}</p>
            <div class="mt-auto flex items-end justify-between gap-3 pt-3">
              <p class="flex min-w-0 flex-wrap gap-1.5">${badges(item)}</p>
              <button type="button" class="menu-add js-only" data-add="${item.id}" aria-label="Add ${esc(item.name)} to your order">${lineIcon('plus', 18)}<span data-add-label>Add</span></button>
            </div>
          </div>
        </li>`;
}

const sections = MENU.map((c) => `<section id="${c.id}" class="menu-cat" data-category="${c.id}" aria-labelledby="${c.id}-title">
      <div class="menu-cat-head">
        <h2 id="${c.id}-title" class="text-3xl md:text-4xl">${esc(c.name)}</h2>
        <p class="mt-2 text-moss">${esc(c.intro)}</p>
        ${addonLine(c)}
      </div>
      <ul class="menu-grid" role="list">
        ${c.items.map((i) => dish(i, c)).join('\n        ')}
      </ul>
    </section>`).join('\n\n    ');

// What order.js needs: names, prices, add-ons, opening hours and the order rules. Read once, never trusted from storage.
const padData = {
  items: Object.fromEntries(MENU.flatMap((c) => c.items.map((i) => [i.id, { name: i.name, price: i.price, cat: c.short, addons: (c.addons || []).map((a) => a.id) }]))),
  addons: Object.fromEntries(MENU.flatMap((c) => (c.addons || []).map((a) => [a.id, { label: a.label, price: a.price }]))),
  hours: B.hours.map(({ days, opens, closes }) => ({ days, opens, closes })),
  order: B.order,
  opening: B.opening.slice(0, 10),
  whatsapp: B.whatsapp,
  name: B.name,
};

const steps = [
  ['plus', 'Add'],
  ['clock', 'Pick a time'],
  ['whatsapp', 'Send on WhatsApp'],
];

const intro = `<section class="menu-hero relative overflow-hidden" aria-labelledby="menu-title">
  ${sprig('menu-hero-sprig')}
  <div class="container-page relative grid items-center gap-10 pb-10 pt-10 lg:grid-cols-12 lg:pb-14 lg:pt-16">
    <div class="lg:col-span-7">
      <p class="label">The menu &middot; order ahead</p>
      <span class="dash mt-3"></span>
      <h1 id="menu-title" class="mt-5 text-5xl md:text-6xl">Eat, drink, repeat.</h1>
      <p class="mt-5 max-w-prose text-lg">Italian and Greek sandwiches, breakfast, coffee hot or iced, and something sweet. Order ahead, pick a collection time and skip the queue.</p>
      <ol class="menu-steps js-only mt-7" role="list">
        ${steps.map(([ic, text], i) => `<li><span class="menu-step-num">${i + 1}</span>${lineIcon(ic, 18)}${text}</li>`).join('')}
      </ol>
      <noscript><p class="mt-6">To order ahead, call us on <a class="text-link" href="${B.phoneHref}">${B.phoneDisplay}</a>.</p></noscript>
      <p class="mt-6 text-sm text-moss">Allergies or dietary needs? Tell us in your order note or at the counter.${B.demo ? ' Sample menu and prices for this demo.' : ''}</p>
    </div>
    <div class="menu-hero-media hidden lg:col-span-5 lg:block">
      <div class="photo aspect-portrait menu-hero-a">${picture('mortadella-focaccia', { sizes: '22vw' })}</div>
      <div class="photo aspect-portrait menu-hero-b">${picture('freddo-espresso', { sizes: '18vw' })}</div>
      <p class="menu-hero-note hand" aria-hidden="true">fresh every morning</p>
    </div>
  </div>
</section>`;

const controls = `<span id="order" class="block"></span>
<div id="menu-controls" class="menu-controls js-only">
  <div class="container-page">
    <form id="menu-form" class="menu-controls-inner" role="search" aria-label="Search and filter the menu">
      <div class="menu-search">
        <label for="menu-search" class="sr-only">Search the menu</label>
        ${lineIcon('search', 18, 'menu-search-icon')}
        <input id="menu-search" type="search" class="field menu-search-field" placeholder="Search" autocomplete="off" enterkeyhint="search" />
      </div>
      <fieldset class="menu-diets">
        <legend class="sr-only">Dietary filters</legend>
        <label class="chip-check"><input type="checkbox" id="menu-v" /><span>${lineIcon('leaf', 16, 'hidden sm:block')}<span class="sm:hidden">Veggie</span><span class="hidden sm:inline">Vegetarian</span></span></label>
        <label class="chip-check"><input type="checkbox" id="menu-vg" /><span>${lineIcon('leaf', 16, 'hidden sm:block')}Vegan</span></label>
      </fieldset>
      <div class="menu-tabs-wrap">
        <div id="menu-tabs" class="menu-tabs" role="group" aria-label="Menu categories">
          <button type="button" class="menu-tab" data-tab="" aria-pressed="true">All</button>
          ${MENU.map((c) => `<button type="button" class="menu-tab" data-tab="${c.id}" aria-pressed="false">${esc(c.short)}</button>`).join('\n          ')}
        </div>
      </div>
    </form>
  </div>
</div>
<noscript>
  <nav class="container-page flex flex-wrap gap-2 pb-4" aria-label="Menu categories">
    ${MENU.map((c) => `<a class="menu-tab" href="#${c.id}">${esc(c.short)}</a>`).join('\n    ')}
  </nav>
</noscript>`;

const results = `<div id="menu-results" class="container-page pb-14 pt-6 md:pt-8 lg:pb-20">
  <div class="js-only flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
    <p id="menu-status" class="text-sm font-semibold text-moss" role="status" aria-live="polite">Showing all ${itemCount} items.</p>
    <button id="menu-reset" type="button" class="text-link text-sm" hidden>Clear search and filters</button>
  </div>
  <div id="menu-empty" class="menu-empty" hidden>
    ${flower('mx-auto h-12 w-12 text-lilac')}
    <h2 class="mt-4 text-3xl">Nothing matches that.</h2>
    <p id="menu-empty-text" class="mt-2">Try a different word, or show the full menu again.</p>
    <button id="menu-empty-reset" type="button" class="btn btn-primary mt-6">Show the full menu</button>
  </div>
  <div class="space-y-12 md:space-y-16">
    ${sections}
  </div>
</div>`;

const closeIcon = lineIcon('close', 22);

const pad = `<div id="pad-toast" class="pad-toast js-only" role="status" aria-live="polite"></div>
<button id="pad-bar" type="button" class="pad-bar js-only" aria-haspopup="dialog" hidden>
  <span class="pad-bar-count" id="pad-bar-count">0</span>
  <span class="pad-bar-text">View order</span>
  <span class="pad-bar-total" id="pad-bar-total"></span>
</button>

<dialog id="pad" class="pad js-only" aria-labelledby="pad-title">
  <div class="pad-panel">
    <p id="pad-live" class="sr-only" role="status" aria-live="polite"></p>
    <div class="pad-head">
      <div>
        <p class="label">Order ahead &middot; collect</p>
        <h2 id="pad-title" class="mt-1 text-3xl">Your order</h2>
      </div>
      <button id="pad-close" type="button" class="pad-icon-btn" aria-label="Close your order">${closeIcon}</button>
    </div>

    <div class="pad-scroll" id="pad-scroll">
      <div id="pad-empty" class="pad-empty" hidden>
        ${lineIcon('bag', 36, 'mx-auto text-golddark')}
        <p class="mt-4 font-display text-xl font-medium">Nothing here yet.</p>
        <p class="mt-1 text-sm">Tap <strong>Add</strong> on anything on the menu, then pick a time to collect it.</p>
        <button id="pad-browse" type="button" class="btn btn-primary mt-6">Browse the menu</button>
        <button id="pad-undo" type="button" class="text-link mt-4 block w-full text-sm" hidden>Undo clear</button>
      </div>

      <div id="pad-edit">
        <ul id="pad-lines" class="pad-lines" role="list"></ul>
        <button id="pad-clear" type="button" class="text-link mt-3 text-sm">Clear order</button>

        <div class="pad-block" role="group" aria-labelledby="pad-when-title">
          <h3 id="pad-when-title" class="pad-legend">${lineIcon('clock', 18)} Collection time</h3>
          <p id="pad-when-note" class="mt-1 text-sm text-moss"></p>
          <fieldset class="mt-4">
            <legend class="sr-only">Collection day</legend>
            <div id="pad-days" class="pad-days"></div>
          </fieldset>
          <fieldset class="mt-3">
            <legend class="sr-only">Collection hour</legend>
            <div id="pad-hours" class="pad-hours"></div>
          </fieldset>
          <fieldset class="mt-3">
            <legend class="sr-only">Collection time</legend>
            <div id="pad-slots" class="pad-slots"></div>
          </fieldset>
          <p class="pad-picked" aria-live="polite">${lineIcon('check', 18, 'shrink-0 text-golddark')}<span id="pad-picked"></span></p>
        </div>

        <div class="pad-block">
          <label for="pad-name" class="field-label">Name for the order</label>
          <input id="pad-name" class="field" type="text" autocomplete="given-name" maxlength="40" aria-describedby="pad-name-error" required />
          <p id="pad-name-error" class="field-error" hidden>Add a name so we know whose order it is.</p>
          <label for="pad-notes" class="field-label mt-5">Note <span class="font-normal text-moss">(optional)</span></label>
          <textarea id="pad-notes" class="field pad-notes" rows="2" maxlength="200" placeholder="Allergies, no onion, extra hot…"></textarea>
        </div>
      </div>

      <div id="pad-review" class="pad-review" hidden tabindex="-1">
        <p class="label">Ready to send</p>
        <h3 class="mt-2 text-2xl">Here's the message WhatsApp will open with.</h3>
        <div class="wa-chat mt-5">
          <div class="wa-head">${lineIcon('whatsapp', 20)} <span>${esc(B.name)}</span></div>
          <p id="pad-message" class="wa-bubble"></p>
        </div>
        <p class="mt-4 text-sm">Press send in WhatsApp and we'll reply to confirm. Pay at the counter when you collect.</p>
        ${B.demo ? '<p class="pad-demo mt-4">Demo: the WhatsApp number is a placeholder, so this message won\'t reach anyone.</p>' : ''}
      </div>

      <div id="pad-done" class="pad-done" hidden tabindex="-1">
        <span class="pad-done-mark">${lineIcon('check', 30)}</span>
        <h3 class="mt-5 text-3xl">Over to WhatsApp.</h3>
        <p id="pad-done-text" class="mt-2"></p>
        <p class="hand mt-5">${esc(B.tagline.toLowerCase())}, sorted</p>
      </div>
    </div>

    <div class="pad-foot" id="pad-foot">
      <div class="pad-total-row"><span>Total</span><span class="pad-leader" aria-hidden="true"></span><span id="pad-total">£0.00</span></div>
      <div id="pad-actions-edit">
        <button id="pad-send" type="button" class="btn btn-gold mt-4 w-full">${lineIcon('whatsapp', 20)} Send order via WhatsApp</button>
      </div>
      <div id="pad-actions-review" class="mt-4 grid gap-3" hidden>
        <a id="pad-wa" href="#" target="_blank" rel="noopener" class="btn btn-gold w-full">${lineIcon('whatsapp', 20)} Open WhatsApp ${arrow()}</a>
        <button id="pad-back" type="button" class="btn btn-outline w-full">Edit order</button>
      </div>
      <div id="pad-actions-done" class="mt-4 grid gap-3" hidden>
        <button id="pad-new" type="button" class="btn btn-primary w-full">Start a new order</button>
        <button id="pad-keep" type="button" class="text-link text-sm">Keep this order</button>
      </div>
      <p class="mt-3 text-center text-xs text-moss">Nothing is charged online. Pay when you collect.</p>
    </div>
  </div>
</dialog>
${jsonScript('pad-data', padData)}`;

export default {
  key: 'menu',
  path: '/menu/',
  title: 'Menu | Wick House, Hackney Wick',
  description: 'Italian and Greek sandwiches, breakfast, hot and cold coffee including freddo espresso, and sweets. Order ahead for collection.',
  scripts: ['menu', 'order'],
  body: `${intro}
${controls}
${results}
${pad}`,
};
