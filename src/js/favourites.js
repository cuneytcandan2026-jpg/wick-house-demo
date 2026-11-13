// Kitchen favourites: the orbit carousel under the home hero (markup in src/templates/favourites.mjs).
//
// The page scroll drives the dish: the stage is sticky, and each stretch of the section's scroll brings the next
// one. Pager dots, thumbnails, arrows, arrow keys and swipes jump straight to a dish and move the scroll to its
// stretch, so the two stay in step. The swap animates transform and opacity only, with the Web Animations API;
// timings come from the tokens in src/css/favourites.css. Layout is read on resize only, never on scroll.
(function () {
  const root = document.querySelector('[data-fav]');
  if (!root) return;
  const stage = root.querySelector('[data-fav-stage]');
  const canvas = root.querySelector('[data-fav-canvas]');
  const parts = (name) => [...root.querySelectorAll(`[data-part="${name}"]`)];
  const orbits = parts('orbit');
  const bands = parts('band');
  const infos = parts('info');
  const bodies = parts('body');
  const n = infos.length;
  if (n < 2) return;

  const css = getComputedStyle(document.documentElement);
  const token = (name, fallback) => {
    const v = parseFloat(css.getPropertyValue(name));
    return Number.isFinite(v) ? v : fallback;
  };
  const T = {
    swing: token('--fav-swing', 50),
    out: token('--fav-out', 620),
    in: token('--fav-in', 950),
    inDelay: token('--fav-in-delay', 300),
    titleOut: token('--fav-title-out', 420),
    titleIn: token('--fav-title-in', 700),
    titleDelay: token('--fav-title-delay', 550),
    cardDelay: token('--fav-card-delay', 400),
    stagger: token('--fav-stagger', 60),
  };
  const EASE_IN = 'cubic-bezier(0.55, 0.085, 0.68, 0.53)';
  const EASE_OUT = 'cubic-bezier(0.16, 1, 0.3, 1)';
  const EASE_INOUT = 'cubic-bezier(0.65, 0, 0.35, 1)';
  const reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = window.matchMedia('(min-width: 1024px)');

  const dots = [...root.querySelectorAll('.fav-dot')];
  const thumbs = [...root.querySelectorAll('.fav-th-btn')];
  const track = root.querySelector('[data-fav-track]');
  const num = root.querySelector('[data-fav-num]');
  const live = root.querySelector('[data-fav-live]');
  const ITEM = 118; // thumbnail pitch, canvas px
  const VISIBLE = 4;

  let index = 0;
  let running = [];
  let cleanup = null;

  /* ---------- The swap ---------- */
  const anim = (el, keyframes, options) => {
    if (!el) return;
    const a = el.animate(keyframes, { fill: 'both', ...options });
    running.push(a);
  };

  // Ends a swap in progress at its final state: animations dropped, the outgoing dish hidden.
  function settle() {
    running.forEach((a) => a.cancel());
    running = [];
    if (cleanup) { const c = cleanup; cleanup = null; c(); }
  }

  const setOn = (i, onOff) => [orbits, bands, infos, bodies].forEach((list) => list[i] && list[i].classList.toggle('is-on', onOff));

  function swap(from, to, dir) {
    settle();
    // Keep keyboard focus on the same control of the new dish when the old one is about to hide.
    const focused = document.activeElement;
    const focusKey = focused && (infos[from].contains(focused) || bodies[from].contains(focused)) ? focused.dataset.k : null;

    setOn(to, true);
    if (focusKey) {
      const next = infos[to].querySelector(`[data-k="${focusKey}"]`) || bodies[to].querySelector(`[data-k="${focusKey}"]`);
      if (next) next.focus({ preventScroll: true });
    }

    if (reducedQuery.matches) { setOn(from, false); return; }

    cleanup = () => setOn(from, false);
    const s = T.swing * dir;

    // Plate: out over the top on the orbit, while the next swings in from the far side.
    anim(orbits[from], [{ transform: 'rotate(0deg)', opacity: 1 }, { opacity: 1, offset: 0.8 }, { transform: `rotate(${s}deg)`, opacity: 0 }], { duration: T.out, easing: EASE_IN });
    anim(orbits[to], [{ transform: `rotate(${-s}deg)` }, { transform: 'rotate(0deg)' }], { duration: T.in, delay: T.inDelay, easing: EASE_OUT });

    // Band: turns away with the old plate, and the next one turns in, in its own colour.
    anim(bands[from], [{ transform: 'rotate(0deg)', opacity: 1 }, { transform: `rotate(${s * 0.45}deg)`, opacity: 0 }], { duration: T.out + 100, easing: EASE_INOUT });
    anim(bands[to], [{ transform: `rotate(${-s * 0.45}deg)`, opacity: 0 }, { transform: 'rotate(0deg)', opacity: 1 }], { duration: T.in + 150, delay: T.inDelay - 100, easing: EASE_OUT });

    // Title: the thin line slides out to the right, the heavy line to the left, then the next pair slides back in.
    const lines = (info, attr) => info.querySelector(`[data-anim="${attr}"]`);
    anim(lines(infos[from], 'from-right'), [{ transform: 'translateX(0)' }, { transform: 'translateX(104%)' }], { duration: T.titleOut, easing: EASE_IN });
    anim(lines(infos[from], 'from-left'), [{ transform: 'translateX(0)' }, { transform: 'translateX(-104%)' }], { duration: T.titleOut, delay: 60, easing: EASE_IN });
    infos[from].querySelectorAll('[data-anim="fade"]').forEach((el) => anim(el, [{ opacity: 1 }, { opacity: 0 }], { duration: 250, easing: 'ease-in' }));
    anim(lines(infos[to], 'from-right'), [{ transform: 'translateX(104%)' }, { transform: 'translateX(0)' }], { duration: T.titleIn, delay: T.titleDelay, easing: EASE_OUT });
    anim(lines(infos[to], 'from-left'), [{ transform: 'translateX(-104%)' }, { transform: 'translateX(0)' }], { duration: T.titleIn, delay: T.titleDelay + 70, easing: EASE_OUT });
    infos[to].querySelectorAll('[data-anim="fade"]').forEach((el, k) => anim(el, [{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 420, delay: T.titleDelay + k * 160, easing: EASE_OUT }));

    // Card: the old body fades up and away, the new rows rise in turn.
    anim(bodies[from], [{ opacity: 1, transform: 'translateY(0)' }, { opacity: 0, transform: 'translateY(-6px)' }], { duration: 300, delay: 50, easing: 'ease-in' });
    [...bodies[to].children].forEach((row, k) => anim(row, [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 500, delay: T.cardDelay + k * T.stagger, easing: EASE_OUT }));

    const mine = running.slice();
    Promise.all(mine.map((a) => a.finished)).then(() => { if (running[0] === mine[0]) settle(); }, () => {});
  }

  function render(announce) {
    dots.forEach((d, i) => d.toggleAttribute('aria-current', i === index));
    thumbs.forEach((t, i) => t.toggleAttribute('aria-current', i === index));
    if (num) num.textContent = String(index + 1).padStart(2, '0');
    if (track) {
      const start = n <= VISIBLE ? 0 : Math.max(0, Math.min(index - 1, n - VISIBLE));
      track.style.transform = `translateX(${-start * ITEM}px)`;
    }
    if (live && announce) live.textContent = `Dish ${index + 1} of ${n}: ${infos[index].dataset.name}`;
  }

  function select(next, dir) {
    if (next === index) return;
    const from = index;
    index = next;
    swap(from, next, dir);
    render(true);
  }

  /* ---------- Scroll ---------- */
  // Measured on load and resize: where the pinned stretch starts and how long it is.
  let start = 0;
  let range = 0;
  function measure() {
    const top = root.getBoundingClientRect().top + window.scrollY;
    const stickTop = parseFloat(getComputedStyle(stage).top) || 0;
    start = top - stickTop;
    range = root.offsetHeight - stage.offsetHeight;
    // Fit the 960 x 520 desktop canvas to the stage.
    if (desktop.matches) {
      // A little wider than the canvas, so the card never meets the screen edge.
      const s = Math.min(stage.clientWidth / 1010, stage.clientHeight / 530, 1.6);
      canvas.style.setProperty('--fav-s', s.toFixed(4));
    }
    onScroll();
  }

  const fromScroll = () => {
    if (range <= 0) return index;
    const p = (window.scrollY - start) / range;
    return Math.max(0, Math.min(n - 1, Math.floor(p * n)));
  };
  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      const next = fromScroll();
      if (next !== index) select(next, next > index ? 1 : -1);
    });
  }

  // A jump: change dish, and while the stage is pinned move the scroll to that dish's stretch.
  function go(to, dir) {
    const next = ((to % n) + n) % n;
    if (next === index) return;
    const d = dir || (next > index ? 1 : -1);
    const y = window.scrollY;
    select(next, d);
    if (range > 0 && y >= start - 1 && y <= start + range + 1) {
      window.scrollTo({ top: Math.round(start + (range * (next + 0.5)) / n), behavior: 'instant' });
    }
  }

  root.addEventListener('click', (e) => {
    const target = e.target.closest('[data-go], [data-step]');
    if (!target || !root.contains(target)) return;
    if (target.dataset.go !== undefined) go(Number(target.dataset.go));
    else go(index + Number(target.dataset.step), Number(target.dataset.step));
  });

  // Arrow keys while focus is on the carousel's own controls.
  root.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    if (!e.target.closest('[data-fav-nav]')) return;
    e.preventDefault();
    const d = e.key === 'ArrowRight' ? 1 : -1;
    go(index + d, d);
    const control = e.target.dataset.go !== undefined ? root.querySelector(`${e.target.classList.contains('fav-dot') ? '.fav-dot' : '.fav-th-btn'}[data-go="${index}"]`) : null;
    if (control) control.focus({ preventScroll: true });
  });

  // Swipes across the plate.
  const plates = root.querySelector('[data-fav-plates]');
  let swipe = null;
  plates.addEventListener('pointerdown', (e) => { swipe = { x: e.clientX, y: e.clientY }; });
  plates.addEventListener('pointercancel', () => { swipe = null; });
  plates.addEventListener('pointerup', (e) => {
    const s = swipe;
    swipe = null;
    if (!s) return;
    const dx = e.clientX - s.x;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(e.clientY - s.y) * 1.4) go(index + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
  });

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', measure, { passive: true });
  if ('ResizeObserver' in window) new ResizeObserver(measure).observe(document.body);
  render(false);
  measure();
})();
