// Kitchen favourites: the orbit carousel under the home hero.
//
// Rebuilt from the "Dish Orbit Carousel" brief (MostLovedDish.md) without React or GSAP. The plated dish sits on
// the left; changing dish swings it out over the top on a wide orbit while the next plate swings in from the other
// side. The two-weight title wipes out and back in, the card cross-fades, and a band of brand colour behind the
// plate turns with it. The page scroll drives it: the stage pins and each stretch of scroll brings the next dish.
// Arrows, thumbnails, the pager, arrow keys and swipes jump too. Behaviour: src/js/favourites.js.
// Styles: src/css/favourites.css. Dishes: FAVOURITES in src/data/menu.mjs.
//
// Desktop (1024px and up) lays everything out on a 960 x 520 canvas that favourites.js scales to the stage, so
// the positions below are canvas px. Narrower screens stack the same markup in one column.
//
// Without JavaScript the first dish shows, with its links, and the stage does not pin.
import { MENU, DIETS, FAVOURITES } from '../data/menu.mjs';
import { esc, formatPrice } from './layout.mjs';
import { picture } from './picture.mjs';
import { lineIcon } from './motifs.mjs';

// The plates' orbit: its pivot sits above the canvas (.fav-orbit's transform-origin is the same point).
export const ORBIT = { x: 299, y: -450, r: 650 };
// Where the band rests for each dish, as [start, end] angles along the orbit (degrees, 0 = right, 90 = down).
const ARC_REST = [[50, 98], [46, 124], [60, 126], [40, 100]];

/** The band: a thick stroke along the orbit circle, tapering at both ends. */
export function arcPath(a0, a1, { x: cx, y: cy, r } = ORBIT, w = 118, steps = 48) {
  const outer = [];
  const inner = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const a = ((a0 + (a1 - a0) * t) * Math.PI) / 180;
    const h = (w / 2) * Math.pow(Math.sin(Math.PI * t), 0.45);
    const c = Math.cos(a);
    const s = Math.sin(a);
    outer.push(`${(cx + c * (r + h)).toFixed(1)} ${(cy + s * (r + h)).toFixed(1)}`);
    inner.push(`${(cx + c * (r - h)).toFixed(1)} ${(cy + s * (r - h)).toFixed(1)}`);
  }
  return `M${outer.join('L')}L${inner.reverse().join('L')}Z`;
}

/** Title size in canvas px so a line of `chars` capitals fits `width` at `em` average glyph width. */
const fitSize = (chars, max, width, em) => Math.round(Math.min(max, width / (Math.max(1, chars) * em)));

const pad2 = (n) => String(n).padStart(2, '0');

// Each favourite joined to its menu item and category.
const dishes = FAVOURITES.map((f) => {
  const category = MENU.find((c) => c.items.some((i) => i.id === f.id));
  if (!category) throw new Error(`FAVOURITES: no menu item "${f.id}" in src/data/menu.mjs.`);
  const item = category.items.find((i) => i.id === f.id);
  const tags = item.tags || [];
  const note = tags.includes('greek-classic') ? 'Greek classic' : tags.includes('signature') ? 'Signature' : item.diet ? DIETS[item.diet].label : '';
  return { ...f, item, category, eyebrow: [category.short, note].filter(Boolean).join(' · '), photo: item.img || item.id };
});

const n = dishes.length;
const on = (i) => (i === 0 ? ' is-on' : '');

const plate = (d, i) => `<div class="fav-orbit${on(i)}" data-part="orbit" style="--focus: ${d.focus}; --zoom: ${d.zoom}">
  <div class="fav-plate">${picture(d.photo, { sizes: '(min-width: 1024px) 400px, 44vw', imgClass: 'fav-plate-img' })}</div>
</div>`;

const band = (d, i) => `<g class="fav-band${on(i)}" data-part="band"><path d="${arcPath(...ARC_REST[i % ARC_REST.length])}" fill="var(--fav-${d.accent})" /></g>`;

const info = (d, i) => `<div class="fav-info${on(i)}" data-part="info" data-name="${esc(d.item.name)}, ${formatPrice(d.item.price)}">
  <p class="fav-eyebrow" data-anim="fade">${esc(d.eyebrow)}</p>
  <h3 class="fav-title">
    <span class="fav-line"><span class="fav-t1" data-anim="from-right" style="--fs: ${fitSize(d.line1.length, 54, 300, 0.6)}px">${esc(d.line1)}</span></span>
    <span class="fav-line"><span class="fav-t2" data-anim="from-left" style="--fs: ${fitSize(d.line2.length, 62, 296, 0.66)}px">${esc(d.line2)}</span></span>
    <span class="sr-only">: ${esc(d.item.name)}</span>
  </h3>
  <div class="fav-acts" data-anim="fade">
    <a href="/menu/?add=${d.item.id}#order" class="fav-act fav-act-primary" data-k="add">${lineIcon('bag', 16)} Add to order<span class="sr-only">: ${esc(d.item.name)}</span></a>
    <a href="/menu/#${d.category.id}" class="fav-act" data-k="menu">${lineIcon('list', 16)} ${esc(d.category.short)} menu</a>
  </div>
</div>`;

const card = (d, i) => `<div class="fav-body${on(i)}" data-part="body">
  <div class="fav-price-row">
    <p class="fav-price" style="--accent: var(--fav-${d.accent})"><span class="fav-badge" aria-hidden="true">${lineIcon('leaf', 12)}</span><span class="fav-price-num">${formatPrice(d.item.price)}</span></p>
    <a href="/menu/?add=${d.item.id}#order" class="fav-card-add" data-k="add-card">${lineIcon('bag', 16)} Add<span class="sr-only"> to order: ${esc(d.item.name)}</span></a>
  </div>
  <p class="fav-name">${esc(d.item.name)}</p>
  <p class="fav-meta">${esc(d.category.name)}${d.item.diet ? ` &middot; ${DIETS[d.item.diet].label}` : ''}</p>
  <p class="fav-desc">${esc(d.item.desc)}</p>
  <ul class="fav-ing" role="list" aria-label="Ingredients">${d.ingredients.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
</div>`;

const dot = (d, i) => `<button type="button" class="fav-dot" data-go="${i}" aria-label="${esc(d.item.name)}"${i === 0 ? ' aria-current="true"' : ''}><i></i></button>`;

const thumb = (d, i) => `<li class="fav-th"><button type="button" class="fav-th-btn" data-go="${i}"${i === 0 ? ' aria-current="true"' : ''}>
  <span class="fav-th-img" style="--focus: ${d.focus}; --zoom: ${d.zoom}">${picture(d.photo, { sizes: '64px', alt: '' })}</span>
  <span class="fav-th-label">${esc(d.line1)}<br />${esc(d.line2)}</span>
</button></li>`;

const arrowBtn = (dir, cls) => `<button type="button" class="${cls}" data-step="${dir === 'prev' ? -1 : 1}" aria-label="${dir === 'prev' ? 'Previous' : 'Next'} dish">${lineIcon(dir, 20)}</button>`;

export const favourites = `<section id="favourites" class="fav" data-fav style="--fav-steps: ${n - 1}" aria-labelledby="favourites-title">
  <div class="fav-stage" data-fav-stage>
    <div class="fav-canvas" data-fav-canvas>
      <div class="fav-top">
        <div>
          <h2 id="favourites-title" class="label">Kitchen favourites</h2>
          <span class="dash mt-2"></span>
        </div>
        <div class="fav-mnav js-only" data-fav-nav>
          ${arrowBtn('prev', 'fav-round')}
          <p class="fav-count" aria-hidden="true"><span data-fav-num>01</span> / ${pad2(n)}</p>
          ${arrowBtn('next', 'fav-round')}
        </div>
      </div>

      <div class="fav-pager js-only" data-fav-nav role="group" aria-label="Choose a dish">${dishes.map(dot).join('')}</div>

      <div class="fav-plates" data-fav-plates>
        <svg class="fav-arc" viewBox="0 0 960 520" aria-hidden="true" focusable="false">${dishes.map(band).join('')}</svg>
        ${dishes.map(plate).join('\n        ')}
      </div>

      <div class="fav-infos">${dishes.map(info).join('')}</div>

      <div class="fav-card">${dishes.map(card).join('')}</div>

      <div class="fav-strip js-only" data-fav-nav>
        ${arrowBtn('prev', 'fav-arrow')}
        <div class="fav-win">
          <ul class="fav-track" role="list" data-fav-track>${dishes.map(thumb).join('')}</ul>
        </div>
        ${arrowBtn('next', 'fav-arrow')}
      </div>
    </div>
    <p class="sr-only" aria-live="polite" data-fav-live></p>
  </div>
</section>`;

