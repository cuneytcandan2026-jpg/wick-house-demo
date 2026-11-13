// "Your daily Wick fix": the bean journey. Ported from the Hackberries "Bean to Brew" module.
//
// 1. THE STRIP. Scroll offset maps to a track position piecewise between the real sections
//    (data-brew-anchor, from src/data/brew.mjs), so the bean reaches each landmark as its section
//    arrives. The bean follows that value on a critically damped spring: a natural settle when
//    scrolling stops, a smooth reversal on the way back up, and a velocity for lean and squash.
//    The rAF loop only runs while the bean is catching up or hopping; at rest nothing runs.
//
// 2. THE REVEAL. When the footer logo is at least 40% on screen (an IntersectionObserver on the
//    logo itself, not a page percentage), the bean leaves the strip, flies into the logo's cup and
//    the CSS sequence in src/css/brew.css completes the logo: the cup fills, olive-leaf latte art,
//    steam, wordmark and dash. Once per visit; afterwards "Brew again" replays only the drawing.
//
// Scrolling is never touched: passive listeners, no preventDefault, nothing gated on the animation.
// The footer buttons stay live throughout. Reduced motion is followed live, including a change mid-visit.
(function () {
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

  // Numeric value of a timing token ("190" -> 190, "560ms" -> 560).
  const token = (name, fallback) => {
    const value = parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name));
    return Number.isFinite(value) ? value : fallback;
  };

  // One rAF per frame however many times it is called.
  const rafBatch = (fn) => {
    let queued = false;
    const runner = () => { queued = false; fn(); };
    const wrapped = () => { if (!queued) { queued = true; requestAnimationFrame(runner); } };
    wrapped.cancel = () => { queued = false; };
    return wrapped;
  };

  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  function initBrew() {
    const strip = document.getElementById('brew-strip');
    const track = document.getElementById('brew-track');
    const slot = document.getElementById('brew-bean-slot');
    const beanButton = document.getElementById('brew-bean');
    const miniCup = document.getElementById('brew-mini-cup');
    const progressbar = document.getElementById('brew-progress');
    const art = document.getElementById('brew-art');
    const again = document.getElementById('brew-again');
    if (!strip || !track || !slot || !beanButton) return () => {};

    const hopEl = slot.querySelector('.brew-bean-hop');
    const leanEl = slot.querySelector('.brew-bean-lean');
    const rollEl = slot.querySelector('.brew-bean-roll');
    const target = art && art.querySelector('.brew-target');

    const T = {
      spring: token('--brew-spring', 190),
      hop: token('--brew-hop', 420),
      hopHeight: token('--brew-hop-height', 7),
      intro: token('--brew-intro', 900),
      flight: token('--brew-flight', 950),
    };

    const marks = Array.from(strip.querySelectorAll('[data-brew-anchor]')).map((el) => ({
      el,
      at: parseFloat(el.dataset.at),
      name: el.dataset.name || '',
      section: document.getElementById(el.dataset.brewAnchor),
      drawn: el.classList.contains('brew-mark'),
      passed: false,
    }));

    let reduced = motionQuery.matches;
    const timers = new Set();
    const later = (fn, ms) => {
      const id = setTimeout(() => { timers.delete(id); fn(); }, ms);
      timers.add(id);
      return id;
    };
    // Restart a one-shot CSS animation class.
    const replay = (el, cls, ms) => {
      el.classList.remove(cls);
      void el.offsetWidth;
      el.classList.add(cls);
      later(() => el.classList.remove(cls), ms);
    };

    /* ---------- Measuring: scroll offset -> track position ---------- */
    let anchors = [{ y: 0, at: 0 }, { y: 1, at: 1 }];
    let trackW = 0;
    let radius = 10;
    const docTop = (el) => el.getBoundingClientRect().top + window.scrollY;

    function measure() {
      const vh = window.innerHeight;
      const max = Math.max(1, document.documentElement.scrollHeight - vh);
      // A section "arrives" when its top reaches 45% of the viewport.
      const points = [{ y: 0, at: 0 }];
      for (const m of marks) if (m.section) points.push({ y: docTop(m.section) - vh * 0.45, at: m.at });
      // The destination is the footer logo, a little below the middle of the screen,
      // or the bottom of the page if it cannot scroll that far.
      let endY = max;
      if (art) {
        const r = art.getBoundingClientRect();
        endY = Math.min(max, r.top + window.scrollY + r.height * 0.5 - vh * 0.55);
      }
      points.push({ y: endY, at: 1 });
      // Strictly increasing, and the end must stay reachable.
      for (let i = 1; i < points.length; i += 1) points[i].y = Math.max(points[i].y, points[i - 1].y + 1);
      const last = points.length - 1;
      points[last].y = Math.min(points[last].y, max);
      for (let i = last - 1; i >= 0; i -= 1) points[i].y = Math.min(points[i].y, points[i + 1].y - 1);
      points[0].y = Math.min(points[0].y, 0);
      anchors = points;
      trackW = track.clientWidth;
      radius = Math.max(4, rollEl.offsetWidth / 2);
    }

    function mapScroll(y) {
      if (y <= anchors[0].y) return 0;
      for (let i = 1; i < anchors.length; i += 1) {
        const a = anchors[i - 1];
        const b = anchors[i];
        if (y <= b.y) return a.at + ((y - a.y) / (b.y - a.y)) * (b.at - a.at);
      }
      return 1;
    }

    /* ---------- The bean ---------- */
    let goal = 0;
    let pos = 0;
    let vel = 0;
    let raf = 0;
    let lastFrame = 0;
    let hopStart = -1;
    let stage = '1';
    let state = 'idle'; // idle | flying | brewing | brewed

    const readGoal = () => clamp(mapScroll(window.scrollY), 0, 1);

    function paint(now) {
      const x = pos * trackW;
      slot.style.transform = `translate3d(${x.toFixed(2)}px, 0, 0)`;
      strip.style.setProperty('--p', pos.toFixed(4));

      if (reduced) {
        rollEl.style.transform = '';
        leanEl.style.transform = '';
        hopEl.style.transform = '';
      } else {
        // Rolling without slipping: distance travelled over the bean's radius.
        rollEl.style.transform = `rotate(${((x / radius) * 57.2958).toFixed(1)}deg)`;
        const vpx = vel * trackW;
        const squash = Math.min(0.14, Math.abs(vpx) / 2400);
        const lean = clamp(vpx / 130, -12, 12);
        leanEl.style.transform = `rotate(${lean.toFixed(2)}deg) scale(${(1 + squash).toFixed(3)}, ${(1 - squash * 0.75).toFixed(3)})`;
        const u = hopStart >= 0 ? (now - hopStart) / T.hop : 1;
        hopEl.style.transform = u < 1 ? `translateY(${(-Math.sin(Math.PI * u) * T.hopHeight).toFixed(2)}px)` : '';
        if (u >= 1) hopStart = -1;
      }

      // Stage three draws the logo's three steam lines above the waiting cup as the bean nears it.
      strip.style.setProperty('--steam-off', (1 - clamp((pos - 0.55) / 0.25, 0, 1)).toFixed(3));
      strip.style.setProperty('--steam-off-2', (1 - clamp((pos - 0.65) / 0.22, 0, 1)).toFixed(3));
      strip.style.setProperty('--steam-off-3', (1 - clamp((pos - 0.75) / 0.2, 0, 1)).toFixed(3));

      const next = pos < 0.2 ? '1' : pos < 0.55 ? '2' : pos < 0.85 ? '3' : '4';
      if (next !== stage) {
        stage = next;
        strip.dataset.stage = stage;
      }
      // Once the bean has left for the footer it stays in the cup while the bean is at the end of the line.
      strip.classList.toggle('is-cupped', state !== 'idle' && pos > 0.97);
    }

    function crossings(prev, now, respond) {
      const forward = pos > prev;
      for (const m of marks) {
        if (!m.drawn) continue;
        const passed = pos >= m.at - 0.004;
        if (passed === m.passed) continue;
        m.passed = passed;
        m.el.classList.toggle('is-passed', passed);
        // Landmarks hidden at this width (phones show three) get no response.
        if (!passed || !forward || !respond || m.el.offsetParent === null) continue;
        replay(m.el, 'is-hit', 800);
        if (hopStart < 0) hopStart = now;
      }
      if (respond && forward && prev < 0.995 && pos >= 0.995 && miniCup) replay(miniCup, 'is-catch', 600);
    }

    function frame(now) {
      raf = 0;
      const dt = Math.min(1 / 30, lastFrame ? (now - lastFrame) / 1000 : 1 / 60);
      lastFrame = now;
      const prev = pos;
      if (reduced) {
        pos = goal;
        vel = 0;
      } else {
        const k = T.spring;
        const c = 2 * Math.sqrt(k); // critically damped: never overshoots the truth
        vel += (k * (goal - pos) - c * vel) * dt;
        pos += vel * dt;
        if (Math.abs(goal - pos) < 0.0004 && Math.abs(vel) < 0.003) {
          pos = goal;
          vel = 0;
        }
      }
      crossings(prev, now, !reduced);
      paint(now);
      if (pos !== goal || vel !== 0 || hopStart >= 0) raf = requestAnimationFrame(frame);
      else lastFrame = 0;
    }

    const run = () => { if (!raf && !document.hidden) raf = requestAnimationFrame(frame); };

    // Jump straight to the truth: no travel, no landmark responses.
    function snap() {
      goal = readGoal();
      const prev = pos;
      pos = goal;
      vel = 0;
      hopStart = -1;
      crossings(prev, performance.now(), false);
      paint(performance.now());
    }

    /* ---------- Assistive tech: coarse, silent progress ---------- */
    let lastText = '';
    function describe() {
      if (!progressbar) return;
      const pct = Math.round((goal * 100) / 5) * 5;
      let where = 'top of the page';
      for (const m of marks) if (goal >= m.at - 0.01) where = m.name;
      if (goal >= 0.999) where = 'the footer';
      const text = `${pct}%, ${where}`;
      if (text === lastText) return;
      lastText = text;
      progressbar.setAttribute('aria-valuenow', String(pct));
      progressbar.setAttribute('aria-valuetext', text);
    }

    /* ---------- Listeners ---------- */
    const onScroll = () => {
      goal = readGoal();
      describe();
      run();
    };
    const remeasure = rafBatch(() => {
      measure();
      goal = readGoal();
      describe();
      paint(performance.now()); // width changed: same fraction, repainted at once
      run();
    });
    const onVisibility = () => {
      if (document.hidden) {
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
        lastFrame = 0;
      } else {
        snap();
      }
    };
    // Play only. The progress value is deliberately untouched.
    const onBean = () => { if (!reduced) replay(beanButton, 'is-spinning', 760); };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', remeasure, { passive: true });
    window.addEventListener('load', remeasure);
    document.addEventListener('visibilitychange', onVisibility);
    beanButton.addEventListener('click', onBean);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(remeasure).catch(() => {});

    // Late images and the scroll reveals can change the page height.
    let bodyObserver = null;
    if ('ResizeObserver' in window) {
      bodyObserver = new ResizeObserver(() => remeasure());
      bodyObserver.observe(document.body);
    }

    measure();
    snap(); // a reload halfway down starts where the reader is, not at zero
    describe();
    if (!reduced && window.scrollY < 40) {
      strip.classList.add('is-intro');
      later(() => strip.classList.remove('is-intro'), T.intro + 900);
    }

    /* ---------- The footer reveal ---------- */
    let flyer = null;
    let flightRaf = 0;
    let artObserver = null;
    let artVisible = false;

    const setAgainBusy = (busy) => { if (again) again.setAttribute('aria-disabled', String(busy)); };

    // A short tick as the bean lands. Android only; iOS ignores it, and reduced motion skips it.
    const haptic = () => {
      if (reduced || typeof navigator.vibrate !== 'function') return;
      try { navigator.vibrate(12); } catch (e) { /* not allowed yet: no tick */ }
    };

    function finish() {
      state = 'brewed';
      if (art) {
        art.dataset.state = 'brewed';
        art.classList.remove('is-paused');
      }
      strip.classList.remove('is-flying');
      strip.classList.add('is-brewed');
      paint(performance.now());
      if (!again) return;
      setAgainBusy(false);
      if (reduced) {
        again.hidden = true;
        return;
      }
      if (again.hidden) {
        again.hidden = false;
        replay(again, 'is-arriving', 600);
      }
      art.classList.add('is-fresh');
      later(() => art.classList.remove('is-fresh'), 11000);
    }

    // The sequence is paced by the CSS animations themselves, so it can pause while the logo is off
    // screen (see the observer below): the bean lands when its drop ends, and the logo is complete
    // when the tagline has faded in.
    function brew() {
      state = 'brewing';
      setAgainBusy(true);
      art.classList.remove('is-fresh');
      art.dataset.state = 'empty';
      void art.offsetWidth; // commit the empty cup so the sequence restarts
      art.dataset.state = 'brewing';
      art.classList.toggle('is-paused', !artVisible);
    }

    const onArtAnimationEnd = (event) => {
      if (state !== 'brewing') return;
      if (event.animationName === 'brew-drop') haptic();
      if (event.animationName === 'brew-fade' && event.target.classList.contains('logo-tagline')) finish();
    };

    function endFlight() {
      if (flightRaf) cancelAnimationFrame(flightRaf);
      flightRaf = 0;
      if (flyer) flyer.remove();
      flyer = null;
    }

    function fly() {
      state = 'flying';
      snap();
      const from = beanButton.getBoundingClientRect();
      const startSize = rollEl.getBoundingClientRect().width || 20;
      flyer = document.createElement('span');
      flyer.className = 'brew-flyer';
      flyer.setAttribute('aria-hidden', 'true');
      // The same drawing as the strip's bean, with its gradient id made unique.
      flyer.innerHTML = rollEl.innerHTML.replace(/strip-bean/g, 'flyer-bean');
      document.body.append(flyer);
      strip.classList.add('is-flying');

      const t0 = performance.now();
      const sx = from.left + from.width / 2;
      const sy = from.top + from.height / 2;
      const step = (now) => {
        flightRaf = 0;
        const u = clamp((now - t0) / T.flight, 0, 1);
        const e = easeInOutCubic(u);
        // The target is re-read every frame, so scrolling mid-flight is fine.
        const r = target.getBoundingClientRect();
        const ex = r.left + r.width / 2;
        const ey = r.top + r.height / 2;
        // One arc: a small lift out of the strip, then down into the cup.
        const cx = sx + (ex - sx) * 0.35;
        const cy = Math.max(8, sy - 70);
        const x = (1 - e) ** 2 * sx + 2 * (1 - e) * e * cx + e * e * ex;
        const y = (1 - e) ** 2 * sy + 2 * (1 - e) * e * cy + e * e * ey;
        const size = startSize + (r.width - startSize) * e;
        flyer.style.transform = `translate3d(${(x - 16).toFixed(1)}px, ${(y - 16).toFixed(1)}px, 0) rotate(${(e * 720).toFixed(1)}deg) scale(${(size / 32).toFixed(3)})`;
        if (u < 1) {
          flightRaf = requestAnimationFrame(step);
        } else {
          endFlight();
          strip.classList.remove('is-flying');
          strip.classList.add('is-brewed');
          brew();
        }
      };
      flightRaf = requestAnimationFrame(step);
    }

    const onAgain = () => {
      if (state !== 'brewed' || reduced) return;
      brew();
    };

    if (art && target) {
      // The markup ships the finished logo. Under reduced motion that is what stays; otherwise empty the cup.
      art.dataset.state = reduced ? 'brewed' : 'empty';
      // The sticky header covers the top of the screen and, on phones, the action bar the bottom.
      // The logo has to be visible between them, not just inside the viewport.
      const header = document.querySelector('[data-header]');
      const top = header ? header.offsetHeight : 0;
      const bar = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--bar-h')) || 0;
      artObserver = new IntersectionObserver(([entry]) => {
        const ratio = entry.isIntersecting ? entry.intersectionRatio : 0;
        // A quick flick past the footer must not play the logo unseen: the sequence holds while
        // most of the logo is off screen and carries on when the visitor comes back to it.
        artVisible = ratio >= 0.25;
        art.classList.toggle('is-paused', state === 'brewing' && !artVisible);
        if (ratio < 0.4 || state !== 'idle') return;
        if (reduced) finish();
        else if (document.hidden) brew();
        else fly();
      }, { threshold: [0, 0.25, 0.4, 0.7, 1], rootMargin: `-${top}px 0px -${bar}px 0px` });
      artObserver.observe(art.querySelector('svg'));
      art.addEventListener('animationend', onArtAnimationEnd);
      if (again) again.addEventListener('click', onAgain);
    }

    /* ---------- A preference change mid-visit ---------- */
    const onMotion = () => {
      reduced = motionQuery.matches;
      if (reduced) {
        endFlight();
        strip.classList.remove('is-intro', 'is-flying');
        if (state === 'flying' || state === 'brewing') finish();
        if (state === 'brewed' && again) again.hidden = true;
        if (state === 'idle' && art) art.dataset.state = 'brewed';
      } else if (state === 'brewed' && again) {
        again.hidden = false;
      } else if (state === 'idle' && art) {
        art.dataset.state = 'empty';
      }
      snap();
    };
    if (motionQuery.addEventListener) motionQuery.addEventListener('change', onMotion);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', remeasure);
      window.removeEventListener('load', remeasure);
      document.removeEventListener('visibilitychange', onVisibility);
      beanButton.removeEventListener('click', onBean);
      if (again) again.removeEventListener('click', onAgain);
      if (art) art.removeEventListener('animationend', onArtAnimationEnd);
      if (motionQuery.removeEventListener) motionQuery.removeEventListener('change', onMotion);
      if (bodyObserver) bodyObserver.disconnect();
      if (artObserver) artObserver.disconnect();
      remeasure.cancel();
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      endFlight();
      for (const id of timers) clearTimeout(id);
      timers.clear();
    };
  }

  // The teardown is kept so the journey can be switched off cleanly (for example from the console).
  window.wickBrew = { destroy: initBrew() };
})();
