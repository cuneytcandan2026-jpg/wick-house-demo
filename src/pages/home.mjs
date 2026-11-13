// Home page: the 12 sections in plan.md order, plus the kitchen favourites carousel under the hero (the footer, section 12, comes from the layout).
// Every fact and price is read from src/data, so nothing here needs editing when the real menu arrives.
import { BUSINESS as B } from '../data/business.mjs';
import { DIETS, TAGS, homeItems, itemById } from '../data/menu.mjs';
import { arrow, esc, icon, formatPrice, hoursRows, addressLine, jsonScript } from '../templates/layout.mjs';
import { picture, photoUrl } from '../templates/picture.mjs';
import { sprig, flower, lineIcon } from '../templates/motifs.mjs';
import { cupMark, lockup } from '../brand/logo.mjs';
import { favourites } from '../templates/favourites.mjs';

const photoKey = (item) => item.img || item.id;
const addHref = (item) => `/menu/?add=${item.id}#order`;

// Label, gold dash and heading: the opening of every section.
function head({ id, label, title, intro = '', center = false, cls = '' }) {
  return `<div class="${center ? 'mx-auto text-center' : ''} max-w-2xl ${cls}">
    <p class="label">${label}</p>
    <span class="dash mt-3 ${center ? 'mx-auto' : ''}"></span>
    <h2 id="${id}-title" class="mt-5 text-4xl md:text-5xl">${title}</h2>
    ${intro ? `<p class="mt-4 text-lg ${center ? 'mx-auto' : ''} max-w-prose">${intro}</p>` : ''}
  </div>`;
}

const badges = (item, { skip = ['signature'] } = {}) => {
  const list = [];
  if (item.diet) list.push(`<span class="tag tag-diet" title="${DIETS[item.diet].label}">${DIETS[item.diet].short}<span class="sr-only"> (${DIETS[item.diet].label})</span></span>`);
  (item.tags || []).filter((t) => !skip.includes(t)).forEach((t) => list.push(`<span class="tag ${t === 'new' ? 'tag-new' : ''}">${TAGS[t]}</span>`));
  return list.join('');
};

/* ---------- 1. Hero ---------- */
const countdownUnit = (unit, label) => `<div class="countdown-unit"><span class="countdown-num" data-unit="${unit}">00</span><span class="countdown-label">${label}</span></div>`;

const hero = `<section class="hero" aria-labelledby="hero-title">
  <div class="hero-media">
    ${picture('hero-porchetta', { sizes: '(min-width: 1024px) 100vw, 100vw', eager: true, imgClass: 'hero-img', alt: 'A porchetta ciabatta with salsa verde and rocket, cut in half on a linen napkin, with an iced latte behind it' })}
  </div>
  <div class="hero-scrim" aria-hidden="true"></div>
  <div class="container-page hero-inner">
    <div class="hero-copy">
      <p class="label">${esc(B.promise)} &middot; Hackney Wick</p>
      <h1 id="hero-title" class="hero-title">Your daily <span class="whitespace-nowrap">Wick fix.</span></h1>
      <p class="mt-5 max-w-md text-lg">Italian and Greek sandwiches, coffee hot or shaken over ice, and a queue you can skip. Order ahead and it's ready when you are.</p>
      <div class="hero-ctas mt-8">
        <a href="/menu/#order" class="btn btn-primary">Order ahead ${arrow()}</a>
        <a href="/menu/" class="btn btn-outline">See the menu</a>
      </div>
      <div class="opening-card on-dark mt-10" data-opening>
        <div data-countdown-wrap>
          <p class="label">Doors open in</p>
          <div class="countdown js-only" role="timer" aria-hidden="true">
            ${countdownUnit('d', 'days')}${countdownUnit('h', 'hrs')}${countdownUnit('m', 'min')}${countdownUnit('s', 'sec')}
          </div>
        </div>
        <div data-status-wrap hidden>
          <p class="label">Today at Wick House</p>
          <p class="status-line"><span class="status-dot" data-status-dot></span><span data-status-text></span></p>
        </div>
        <p class="opening-date">${sprig('h-4 w-12 shrink-0 text-gold')}<span data-opening-note>${esc(B.openingLabel)} &middot; 7am</span></p>
      </div>
    </div>
  </div>
</section>`;

/* ---------- 2. Opening-week offer ---------- */
const offer = `<section id="offer" class="section on-dark on-dark-surface relative overflow-hidden" aria-labelledby="offer-title">
  ${flower('offer-flower offer-flower-a hidden lg:block')}${flower('offer-flower offer-flower-b')}
  <div class="container-page relative grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
    <div data-reveal>
      <p class="label">Opening week &middot; 18–24 November</p>
      <span class="dash mt-3"></span>
      <h2 id="offer-title" class="mt-5 text-4xl text-cream md:text-5xl">${esc(B.offer.headline)}.</h2>
      <p class="mt-5 max-w-prose text-lg text-cream/80">${esc(B.offer.detail)}</p>
      <p class="hand mt-6">on the house, opening week</p>
    </div>
    <div class="offer-panel" data-reveal style="--reveal-delay: 120ms">
      <form id="offer-form" class="js-only" novalidate>
        <fieldset>
          <legend class="font-display text-lg font-medium text-forest">Where should we send it?</legend>
          <div class="segmented mt-4">
            <label class="segmented-option"><input type="radio" name="via" value="email" checked /><span>${icon('mail', 18)} Email</span></label>
            <label class="segmented-option"><input type="radio" name="via" value="whatsapp" /><span>${lineIcon('whatsapp', 18)} WhatsApp</span></label>
          </div>
        </fieldset>
        <label for="offer-contact" class="field-label mt-5" data-contact-label>Email address</label>
        <input id="offer-contact" name="contact" class="field" type="email" autocomplete="email" inputmode="email" placeholder="you@example.com" required aria-describedby="offer-error" />
        <p id="offer-error" class="field-error" hidden></p>
        <label class="check mt-4"><input type="checkbox" name="consent" required /><span>Send me the opening-week offer and news from Wick House. One message, no spam.</span></label>
        <button type="submit" class="btn btn-primary mt-6 w-full">Claim my free coffee ${arrow()}</button>
        <p class="mt-3 text-center text-xs text-moss">Demo site: nothing is sent or stored.</p>
      </form>
      <div id="offer-success" class="offer-success" hidden tabindex="-1">
        <p class="label">You're on the list</p>
        <p class="mt-3 font-display text-2xl font-medium text-forest">See you on the 18th.</p>
        <div class="voucher mt-6">
          <p class="label">Opening week voucher</p>
          <p class="mt-2 font-display text-xl font-medium text-forest">${esc(B.offer.headline)}</p>
          <p class="mt-1 text-sm">Show this at the till, 18–24 November.</p>
          <p class="mt-3 text-sm text-moss">Sent to <strong data-sent-to class="text-forest"></strong></p>
        </div>
        <button type="button" class="text-link mt-5 text-sm" data-offer-reset>Use a different email or number</button>
      </div>
      <noscript><p class="text-forest">Send us a DM on Instagram at <a class="text-link" href="${B.instagramUrl}">@${B.instagram}</a> and we'll save you a free coffee.</p></noscript>
    </div>
  </div>
</section>`;

/* ---------- 3. Signatures ---------- */
const sigCard = (item, i) => `<li class="sig-item" data-reveal style="--reveal-delay: ${i * 90}ms">
  <article class="sig-card" aria-labelledby="sig-${item.id}">
    <div class="photo aspect-portrait">
      ${picture(photoKey(item), { sizes: '(min-width: 1024px) 23vw, (min-width: 640px) 45vw, 80vw' })}
      <div class="sig-tags">${badges(item)}</div>
    </div>
    <div class="flex flex-1 flex-col p-5">
      <div class="flex items-baseline justify-between gap-3">
        <h3 id="sig-${item.id}" class="text-xl">${esc(item.name)}</h3>
        <p class="price">${formatPrice(item.price)}</p>
      </div>
      <p class="mt-2 flex-1 text-sm">${esc(item.desc)}</p>
      <a href="${addHref(item)}" class="btn btn-add mt-5">${icon('bag', 18)} Add to order<span class="sr-only">: ${esc(item.name)}</span></a>
    </div>
  </article>
</li>`;

const signatures = `<section id="signatures" class="section relative" aria-labelledby="signatures-title">
  <div class="container-page">
    <div class="flex flex-col gap-6 md:flex-row md:items-end md:justify-between" data-reveal>
      ${head({ id: 'signatures', label: 'The signatures', title: 'Four sandwiches worth crossing the canal for.', intro: 'Focaccia, ciabatta and warm pita, filled to order with Italian and Greek favourites.' })}
      <a href="/menu/#sandwiches" class="text-link shrink-0">All sandwiches</a>
    </div>
  </div>
  <ul class="sig-row container-page" role="list">
    ${homeItems('signature').map(sigCard).join('\n    ')}
  </ul>
</section>`;

/* ---------- 4. Coffee: hot / iced ---------- */
const drinkRow = (item) => `<li class="drink-row${item.featured ? ' is-featured' : ''}">
  <div class="min-w-0">
    <p class="flex flex-wrap items-center gap-2"><span class="font-display text-lg font-medium">${esc(item.name)}</span>${badges(item)}</p>
    <p class="mt-1 text-sm">${esc(item.desc)}</p>
  </div>
  <p class="price">${formatPrice(item.price)}</p>
</li>`;

const coffeePanel = (key, title, photo, items, note) => `<div id="coffee-${key}" class="coffee-panel" role="tabpanel" aria-labelledby="coffee-tab-${key}" data-panel="${key}">
  <h3 class="sr-only">${title}</h3>
  <div class="grid items-center gap-8 lg:grid-cols-12 lg:gap-14">
    <div class="photo aspect-portrait lg:col-span-5">
      ${picture(photo, { sizes: '(min-width: 1024px) 38vw, 92vw' })}
      <p class="photo-note">${note}</p>
    </div>
    <ul class="lg:col-span-7" role="list">${items.map(drinkRow).join('')}</ul>
  </div>
</div>`;

const coffee = `<section id="coffee" class="section section-paper relative overflow-hidden" aria-labelledby="coffee-title">
  ${sprig('coffee-sprig')}
  <div class="container-page relative">
    <div class="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between" data-reveal>
      ${head({ id: 'coffee', label: 'The coffee', title: 'Hot, or shaken over ice the Greek way.', intro: 'A seasonal espresso blend, pulled to order. When it\'s cold, the flat white. When it isn\'t (or even when it is), the freddo espresso: a double shot shaken hard with ice until it froths.' })}
      <div class="toggle js-only" role="tablist" aria-label="Hot or iced coffee" data-toggle>
        <span class="toggle-thumb" aria-hidden="true"></span>
        <button type="button" role="tab" id="coffee-tab-hot" aria-controls="coffee-hot" aria-selected="false" tabindex="-1" data-tab="hot">${lineIcon('cup', 18)} Hot</button>
        <button type="button" role="tab" id="coffee-tab-iced" aria-controls="coffee-iced" aria-selected="true" data-tab="iced">${lineIcon('ice', 18)} Iced</button>
      </div>
    </div>
    <div class="mt-10 lg:mt-12" data-reveal>
      ${coffeePanel('iced', 'Iced coffee', 'freddo-espresso', homeItems('cold'), '<span class="hand">the Greek classic</span>')}
      ${coffeePanel('hot', 'Hot coffee', 'flat-white', homeItems('hot'), '<span class="hand">silky, every time</span>')}
    </div>
    <p class="mt-8" data-reveal><a href="/menu/#cold-coffee" class="text-link">The full coffee menu</a> <span class="text-moss">&middot; oat milk and extra shots on everything</span></p>
  </div>
</section>`;

/* ---------- 5. How order-ahead works ---------- */
const ticketItems = ['flat-white', 'mortadella-focaccia'].map(itemById);
const ticketTotal = ticketItems.reduce((sum, i) => sum + Number(i.price), 0).toFixed(2);
const steps = [
  ['list', 'Pick your order', 'The full menu on your phone, with oat milk and extra shots in a tap.'],
  ['clock', 'Choose a collection time', `Slots every ${B.order.slotMinutes} minutes from opening. We start making it before you arrive.`],
  ['walk', 'Skip the queue', 'Walk in, pick it up from the counter and be on your way to the Overground.'],
];

const orderAhead = `<section id="order-ahead" class="section relative overflow-hidden" aria-labelledby="order-ahead-title">
  <div class="container-page grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
    <div class="lg:col-span-7">
      <div data-reveal>${head({ id: 'order-ahead', label: 'Order ahead', title: 'Beat the 7am rush.', intro: 'Order on the walk from the station and your coffee is waiting. No app to download, nothing to sign up for.' })}</div>
      <ol class="steps mt-10" role="list">
        ${steps.map(([ic, title, text], i) => `<li class="step" data-reveal style="--reveal-delay: ${i * 110}ms">
          <span class="step-icon">${lineIcon(ic, 26)}<span class="step-num">${i + 1}</span></span>
          <div><h3 class="text-xl">${title}</h3><p class="mt-1">${text}</p></div>
        </li>`).join('\n        ')}
      </ol>
      <div class="mt-10 flex flex-wrap items-center gap-4" data-reveal>
        <a href="/menu/#order" class="btn btn-primary">Start an order ${arrow()}</a>
        <p class="hand">skip the queue</p>
      </div>
    </div>
    <div class="ticket-wrap lg:col-span-5" data-reveal style="--reveal-delay: 150ms">
      <div class="ticket" aria-label="Example order: a flat white and a mortadella focaccia for collection at 7:20am" role="img">
        <div class="flex items-center justify-between">
          ${lockup({ cls: 'h-5 w-auto text-forest' })}
          <span class="tag tag-new">Ready 7:20</span>
        </div>
        <p class="label mt-6">Your order</p>
        <ul class="mt-3 divide-y divide-forest/10">
          ${ticketItems.map((i) => `<li class="flex justify-between gap-4 py-3"><span>1 &times; ${esc(i.name)}</span><span class="font-semibold">${formatPrice(i.price)}</span></li>`).join('')}
        </ul>
        <div class="ticket-rule"></div>
        <div class="flex justify-between font-display text-lg font-medium"><span>Total</span><span>${formatPrice(ticketTotal)}</span></div>
        <p class="label mt-6">Collect at</p>
        <div class="mt-3 grid grid-cols-4 gap-2 text-center text-sm">
          ${['7:10', '7:20', '7:30', '7:40'].map((t) => `<span class="slot${t === '7:20' ? ' is-picked' : ''}">${t}</span>`).join('')}
        </div>
        <span class="ticket-cta">${lineIcon('whatsapp', 18)} Send order via WhatsApp</span>
      </div>
    </div>
  </div>
</section>`;

/* ---------- 6. Wick Loyalty ---------- */
const stampCount = B.loyalty.stamps;
const loyalty = `<section id="loyalty" class="section on-dark on-dark-surface relative overflow-hidden" aria-labelledby="loyalty-title">
  ${sprig('loyalty-sprig')}
  <div class="container-page relative grid items-center gap-10 lg:grid-cols-2 lg:gap-20">
    <div data-reveal>
      <p class="label">Wick Loyalty</p>
      <span class="dash mt-3"></span>
      <h2 id="loyalty-title" class="mt-5 text-4xl text-cream md:text-5xl">${esc(B.loyalty.reward)}.</h2>
      <p class="mt-5 max-w-prose text-lg text-cream/80">A digital stamp card that lives on your phone. Buy a coffee, collect a stamp, and the ${stampCount}th is on the house. No paper card to lose in a coat pocket.</p>
      <p class="mt-6 inline-flex items-center gap-2 rounded-full border border-sage/40 px-4 py-2 text-sm text-cream/90">${lineIcon('star', 16, 'text-goldlight')} Coming soon after opening</p>
    </div>
    <div class="flex justify-center lg:justify-end" data-reveal style="--reveal-delay: 120ms">
      <div class="stamp-card" data-stamp-card>
        <p class="sr-only">Example loyalty card: ${stampCount - 1} stamps collected, so the next coffee is free.</p>
        <div class="flex items-center justify-between" aria-hidden="true">
          ${lockup({ cls: 'h-5 w-auto text-forest' })}
          <span class="label">Loyalty card</span>
        </div>
        <ol class="stamp-grid" aria-hidden="true">
          ${Array.from({ length: stampCount }, (_, i) => {
            const free = i === stampCount - 1;
            return `<li class="stamp-slot"><span class="stamp${free ? ' stamp-free' : ''}" style="--i: ${i}; --tilt: ${[-8, 6, -4, 9, -10, 3, -6, 0][i % 8]}deg">${free ? '<span>On us</span>' : cupMark({ cls: 'h-7 w-7', steam: true })}</span></li>`;
          }).join('')}
        </ol>
        <div class="mt-5 flex items-center justify-between" aria-hidden="true">
          <p class="hand">your daily Wick fix</p>
          <p class="text-sm font-semibold text-moss"><span data-stamp-count>${stampCount - 1}</span> / ${stampCount}</p>
        </div>
      </div>
    </div>
  </div>
</section>`;

/* ---------- 7. Our story ---------- */
const story = `<section id="story" class="section relative overflow-hidden" aria-labelledby="story-title">
  <div class="container-page">
    <div class="grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-16">
      <div class="lg:col-span-6" data-reveal>
        ${head({ id: 'story', label: 'Our story', title: 'Italian and Greek flavours on a Hackney Wick corner.' })}
        <div class="mt-6 space-y-4 text-lg">
          <p>Wick House is a neighbourhood cafe for the walk to the Overground, the lunch break and the slow Saturday morning.</p>
          <p>Behind the counter: focaccia and ciabatta filled to order, Greek favourites like souvlaki and spanakopita, and coffee pulled hot or shaken over ice.</p>
          <p>Out front, you can't miss us. Look for the lilies on the green brick wall.</p>
        </div>
        <p class="hand mt-6">${esc(B.vibe.toLowerCase())}</p>
      </div>
      <div class="story-media lg:col-span-6" data-reveal style="--reveal-delay: 120ms">
        <figure class="photo story-main">
          ${picture('mural-sign', { sizes: '(min-width: 1024px) 46vw, 92vw' })}
          <figcaption class="photo-note"><span class="hand">the mural, out front</span></figcaption>
        </figure>
        ${flower('story-flower')}
      </div>
    </div>
  </div>
</section>`;

/* ---------- 8. Gallery ---------- */
const GALLERY = [
  ['mortadella-focaccia', 'Mortadella & burrata focaccia'],
  ['post-opening-soon', 'Our Opening Soon post', true],
  ['interior-green-bar', 'Green tiles at the bar'],
  ['latte-pour', 'Latte art, poured to order'],
  ['souvlaki-pita', 'Chicken souvlaki pita'],
  ['mural-wide', 'The mural, Hackney Wick'],
  ['cannoli', 'Cannoli'],
  ['freddo-espresso', 'Freddo espresso'],
  ['interior-window-seats', 'A seat by the window'],
  ['tiramisu', 'Tiramisu cup'],
  ['caprese-ciabatta', 'Caprese ciabatta'],
  ['espresso-shot', 'A double shot'],
  ['baklava', 'Baklava'],
  ['interior-coffee-counter', 'At the coffee counter'],
];

const gallery = `<section id="gallery" class="section section-paper" aria-labelledby="gallery-title">
  <div class="container-page">
    <div class="flex flex-col gap-6 md:flex-row md:items-end md:justify-between" data-reveal>
      ${head({ id: 'gallery', label: 'Gallery', title: `${esc(B.vibe)}`, intro: 'A first look at the food, the mood and our posts so far.' })}
      <a href="${B.instagramUrl}" rel="noopener" class="btn btn-outline shrink-0 self-start md:self-auto">${icon('instagram', 18)} Follow @${B.instagram}</a>
    </div>
    <ul class="gallery mt-10 lg:mt-12" role="list">
      ${GALLERY.map(([key, label, post], i) => `<li class="gallery-item" data-reveal style="--reveal-delay: ${(i % 3) * 80}ms">
        <a href="${photoUrl(key, 1400)}" class="gallery-link" data-full="${photoUrl(key, 2000)}" data-label="${esc(label)}">
          ${picture(key, { sizes: '(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 46vw' })}
          <span class="gallery-caption">${post ? `${icon('instagram', 14)} ` : ''}${esc(label)}</span>
          <span class="sr-only">(opens a larger view)</span>
        </a>
      </li>`).join('\n      ')}
    </ul>
    <p class="mt-4 text-sm text-moss" data-reveal>Food and interior photos are illustrative until opening day.</p>
  </div>
  <dialog id="lightbox" class="lightbox on-dark" aria-label="Photo viewer">
    <div class="lightbox-inner">
      <figure class="lightbox-figure">
        <img id="lightbox-img" alt="" />
        <figcaption id="lightbox-caption" class="lightbox-caption" aria-live="polite"></figcaption>
      </figure>
      <button type="button" id="lightbox-close" class="lightbox-btn lightbox-close" aria-label="Close photo viewer">${lineIcon('close', 22)}</button>
      <button type="button" id="lightbox-prev" class="lightbox-btn lightbox-prev" aria-label="Previous photo">${lineIcon('prev', 22)}</button>
      <button type="button" id="lightbox-next" class="lightbox-btn lightbox-next" aria-label="Next photo">${lineIcon('next', 22)}</button>
    </div>
  </dialog>
</section>`;

/* ---------- 9. Delivery ---------- */
const delivery = `<section id="delivery" class="section-tight" aria-labelledby="delivery-title">
  <div class="container-page">
    <div class="delivery-band" data-reveal>
      <div class="max-w-md">
        <p class="label">Delivery</p>
        <h2 id="delivery-title" class="mt-3 text-3xl md:text-4xl">Lunch at your desk, soon.</h2>
        <p class="mt-3">Delivery is on its way. Until then, order ahead and collect on your way past.</p>
      </div>
      <ul class="grid w-full gap-3 sm:grid-cols-3 lg:w-auto" role="list">
        ${B.delivery.map((d) => (d.url
    ? `<li><a href="${d.url}" rel="noopener" class="delivery-chip is-live">${lineIcon('bike', 22)}<span>${d.name}</span></a></li>`
    : `<li class="delivery-chip">${lineIcon('bike', 22)}<span>${d.name}</span><span class="delivery-soon">Coming soon</span></li>`)).join('')}
      </ul>
    </div>
  </div>
</section>`;

/* ---------- 10. We're hiring ---------- */
const hiring = `<section id="hiring" class="section section-paper relative overflow-hidden" aria-labelledby="hiring-title">
  <div class="container-page grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
    <div class="order-2 lg:order-1 lg:col-span-5" data-reveal>
      <figure class="photo hiring-post">
        ${picture('post-hiring', { sizes: '(min-width: 1024px) 34vw, 92vw' })}
      </figure>
    </div>
    <div class="order-1 lg:order-2 lg:col-span-7" data-reveal style="--reveal-delay: 120ms">
      ${head({ id: 'hiring', label: "We're hiring", title: 'Join the coffee shop team.', intro: `Morning shifts, ${esc(B.hiring.shift)}. Early starts, good coffee and a brand-new cafe to open.` })}
      <h3 class="mt-8 font-display text-sm font-medium uppercase tracking-wide2 text-moss">We're looking for</h3>
      <ul class="mt-4 grid gap-3 sm:grid-cols-2" role="list">
        ${B.hiring.lookingFor.map((t) => `<li class="flex gap-3">${lineIcon('check', 22, 'mt-0.5 shrink-0 text-golddark')}<span>${esc(t)}</span></li>`).join('')}
      </ul>
      <div class="mt-8 flex flex-wrap items-center gap-4">
        <a href="https://ig.me/m/${B.instagram}" rel="noopener" class="btn btn-primary">${icon('instagram', 18)} Apply by DM</a>
        <p class="hand">come and say hi</p>
      </div>
    </div>
  </div>
</section>`;

/* ---------- 11. Visit ---------- */
const visit = `<section id="visit" class="section visit" aria-labelledby="visit-title">
  <div class="container-page grid gap-12 lg:grid-cols-12 lg:gap-16">
    <div class="lg:col-span-5" data-reveal>
      ${head({ id: 'visit', label: 'Visit us', title: 'Find us in Hackney Wick.' })}
      <p class="status-pill mt-6" data-status-pill><span class="status-dot" data-status-dot></span><span data-status-text>Opening ${esc(B.openingLabel)}</span></p>
      <dl class="mt-8 space-y-6">
        <div class="relative pl-10"><dt class="label">${icon('pin', 22, 'absolute left-0 top-1 text-golddark')}Address</dt><dd class="mt-1 text-lg">${esc(addressLine())}<br /><span class="text-moss">${esc(B.landmark.replace(/^a/, 'A'))}</span></dd></div>
        <div class="relative pl-10"><dt class="label">${icon('clock', 22, 'absolute left-0 top-1 text-golddark')}Opening hours</dt><dd class="mt-1"><ul>${hoursRows()}</ul></dd></div>
      </dl>
      <div class="mt-8 flex flex-wrap gap-3">
        <a href="${B.directionsUrl}" rel="noopener" class="btn btn-primary">${icon('pin', 18)} Get directions</a>
        <a href="${B.phoneHref}" class="btn btn-outline">${icon('phone', 18)} Call</a>
      </div>
      <ul class="mt-6 space-y-1">
        <li><a href="mailto:${B.email}" class="contact-link">${icon('mail', 18)} ${B.email}</a></li>
        <li><a href="${B.instagramUrl}" rel="noopener" class="contact-link">${icon('instagram', 18)} @${B.instagram}</a></li>
      </ul>
    </div>
    <div class="lg:col-span-7" data-reveal style="--reveal-delay: 120ms">
      <div class="map-frame">
        <iframe src="${B.mapEmbedUrl}" title="Map of Hackney Wick, London E9" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
      </div>
    </div>
  </div>
</section>`;

// What home.js needs: the opening moment and the hours, both in UK time.
const data = jsonScript('home-data', {
  opening: B.opening,
  openingLabel: B.openingLabel,
  hours: B.hours.map(({ days, opens, closes }) => ({ days, opens, closes })),
});

export default {
  key: 'home',
  path: '/',
  title: 'Wick House | Specialty coffee & sandwiches in Hackney Wick',
  description: 'Specialty coffee, freddo espresso and premium Italian and Greek sandwiches in Hackney Wick, London. Order ahead and skip the queue. Opening 18 November.',
  scripts: ['home', 'favourites', 'lightbox'],
  brew: true,
  body: [hero, favourites, offer, signatures, coffee, orderAhead, loyalty, story, gallery, delivery, hiring, visit, data].join('\n'),
};
