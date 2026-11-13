// Home page. Phase 1 shell: the hero and an anchor for every section the nav links to.
// Phase 3 replaces each placeholder section with the real one (see plan.md for the order).
import { BUSINESS as B } from '../data/business.mjs';
import { stackedLogo } from '../brand/logo.mjs';
import { arrow, esc } from '../templates/layout.mjs';

const SECTIONS = [
  ['offer', 'Opening-week offer'],
  ['signatures', 'Signatures'],
  ['coffee', 'Coffee'],
  ['order-ahead', 'How order-ahead works'],
  ['loyalty', 'Wick Loyalty'],
  ['story', 'Our story'],
  ['gallery', 'Gallery'],
  ['delivery', 'Delivery'],
  ['hiring', "We're hiring"],
  ['visit', 'Visit us'],
];

const hero = `<section class="container-page flex min-h-[78vh] flex-col items-center justify-center py-16 text-center">
  ${stackedLogo({ cls: 'h-auto w-64 md:w-80', title: 'Wick House: coffee, sandwiches, lunch' })}
  <p class="hand mt-10">${esc(B.tagline)}.</p>
  <h1 class="mt-3 max-w-2xl text-4xl md:text-6xl">${esc(B.promise)} in Hackney Wick.</h1>
  <p class="mt-4 text-lg">Opening ${B.openingLabel}.</p>
  <div class="mt-8 flex flex-wrap justify-center gap-3">
    <a href="/menu/#order" class="btn btn-primary">Order ahead ${arrow()}</a>
    <a href="/menu/" class="btn btn-outline">See the menu</a>
  </div>
</section>`;

const stubs = SECTIONS.map(([id, name], i) => `<section id="${id}" class="section ${i % 2 ? 'bg-paper' : ''}" aria-labelledby="${id}-title" data-reveal>
  <div class="container-page">
    <p class="label">${String(i + 2).padStart(2, '0')}</p>
    <span class="dash mt-3"></span>
    <h2 id="${id}-title" class="mt-4 text-3xl md:text-4xl">${name}</h2>
    <p class="mt-2 max-w-prose text-moss">This section is built in Phase 3.</p>
  </div>
</section>`).join('\n');

export default {
  key: 'home',
  path: '/',
  title: 'Wick House | Specialty coffee & sandwiches in Hackney Wick',
  description: 'Specialty coffee, freddo espresso and premium Italian and Greek sandwiches in Hackney Wick, London. Order ahead and skip the queue. Opening 18 November.',
  body: `${hero}\n${stubs}`,
};
