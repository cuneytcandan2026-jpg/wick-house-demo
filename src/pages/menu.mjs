// Menu page. Phase 1 lists the whole menu from src/data/menu.mjs.
// Phase 4 adds the category tabs, search, dietary filters and the order pad.
import { MENU, DIETS, TAGS } from '../data/menu.mjs';
import { esc, formatPrice } from '../templates/layout.mjs';

const badge = (text) => `<span class="rounded-full border border-moss/40 px-2 py-0.5 font-display text-xs uppercase tracking-wide2 text-moss">${esc(text)}</span>`;

const categories = MENU.map((c) => `<section id="${c.id}" class="py-10" aria-labelledby="${c.id}-title">
  <h2 id="${c.id}-title" class="text-3xl">${esc(c.name)}</h2>
  <p class="mt-1 text-moss">${esc(c.intro)}</p>
  <ul class="mt-6 grid gap-x-10 gap-y-6 md:grid-cols-2">
    ${c.items.map((i) => `<li>
      <div class="flex items-baseline justify-between gap-4">
        <h3 class="text-lg">${esc(i.name)}</h3>
        <span class="font-display font-medium">${formatPrice(i.price)}</span>
      </div>
      <p class="mt-1 text-sm">${esc(i.desc)}</p>
      ${i.diet || i.tags ? `<p class="mt-2 flex flex-wrap gap-2">${i.diet ? badge(DIETS[i.diet].label) : ''}${(i.tags || []).map((t) => badge(TAGS[t])).join('')}</p>` : ''}
    </li>`).join('\n    ')}
  </ul>
</section>`).join('\n');

export default {
  key: 'menu',
  path: '/menu/',
  title: 'Menu | Wick House, Hackney Wick',
  description: 'Italian and Greek sandwiches, breakfast, hot and cold coffee including freddo espresso, and sweets. Order ahead for collection.',
  body: `<div class="container-page py-14">
  <p class="label">The menu</p>
  <span class="dash mt-3"></span>
  <h1 class="mt-4 text-5xl md:text-6xl">Eat, drink, repeat.</h1>
  <div id="order"></div>
  ${categories}
</div>`,
};
