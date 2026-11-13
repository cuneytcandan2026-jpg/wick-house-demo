// Home page: the opening countdown and open/closed status, the hot/iced coffee toggle,
// the loyalty stamp card and the opening-week sign-up. Without this file the page still reads
// in full: both coffee lists show, the stamp card is already stamped, and the date is printed.
(function () {
  const dataEl = document.getElementById('home-data');
  if (!dataEl) return;
  const data = JSON.parse(dataEl.textContent);
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Countdown, then open/closed in UK time ---------- */
  const WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const opening = Date.parse(data.opening);
  const toMinutes = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
  // 07:00 becomes 7am, 15:30 becomes 3:30pm.
  const formatTime = (t) => { const [h, m] = t.split(':').map(Number); return `${h % 12 || 12}${m ? `:${String(m).padStart(2, '0')}` : ''}${h < 12 ? 'am' : 'pm'}`; };
  const ukNow = () => {
    const parts = {};
    new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London', weekday: 'long', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
      .formatToParts(new Date()).forEach((p) => { parts[p.type] = p.value; });
    return { day: parts.weekday, minutes: Number(parts.hour) * 60 + Number(parts.minute) };
  };
  const hoursFor = (day) => data.hours.find((h) => h.days.includes(day));

  function status() {
    const { day, minutes } = ukNow();
    const today = hoursFor(day);
    if (today && minutes >= toMinutes(today.opens) && minutes < toMinutes(today.closes)) {
      return { open: true, text: `Open now until ${formatTime(today.closes)}` };
    }
    if (today && minutes < toMinutes(today.opens)) return { open: false, text: `Closed. Opens ${formatTime(today.opens)} today` };
    const index = WEEK.indexOf(day);
    for (let k = 1; k <= 7; k += 1) {
      const next = WEEK[(index + k) % 7];
      const hours = hoursFor(next);
      if (hours) return { open: false, text: `Closed. Opens ${formatTime(hours.opens)} ${k === 1 ? 'tomorrow' : next}` };
    }
    return { open: false, text: 'Closed' };
  }

  const card = document.querySelector('[data-opening]');
  const units = card ? Object.fromEntries(['d', 'h', 'm', 's'].map((u) => [u, card.querySelector(`[data-unit="${u}"]`)])) : {};
  const pill = document.querySelector('[data-status-pill]');
  const pad = (n) => String(n).padStart(2, '0');
  let timer = null;

  function setStatus(el, s) {
    el.querySelector('[data-status-text]').textContent = s.text;
    el.querySelector('[data-status-dot]').classList.toggle('is-open', s.open);
  }

  function tick() {
    const left = opening - Date.now();
    if (left > 0) {
      const s = Math.floor(left / 1000);
      if (units.d) {
        units.d.textContent = pad(Math.floor(s / 86400));
        units.h.textContent = pad(Math.floor((s % 86400) / 3600));
        units.m.textContent = pad(Math.floor((s % 3600) / 60));
        units.s.textContent = pad(s % 60);
      }
      return;
    }
    // Opening day has come: the card and the Visit pill switch to live status, checked every 30 seconds.
    const s = status();
    if (card) {
      card.querySelector('[data-countdown-wrap]').hidden = true;
      card.querySelector('[data-status-wrap]').hidden = false;
      card.querySelector('[data-opening-note]').textContent = 'Now open in Hackney Wick';
      setStatus(card, s);
    }
    if (pill) setStatus(pill, s);
    if (timer && timer.every === 1000) start(30000);
  }
  function start(every) {
    clearInterval(timer && timer.id);
    timer = { id: setInterval(tick, every), every };
  }
  tick();
  start(opening > Date.now() ? 1000 : 30000);
  // Pause while the tab is hidden; catch up on return.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { clearInterval(timer.id); return; }
    tick();
    start(opening > Date.now() ? 1000 : 30000);
  });

  /* ---------- Hot / iced toggle (ARIA tabs) ---------- */
  const toggle = document.querySelector('[data-toggle]');
  if (toggle) {
    const tabs = Array.from(toggle.querySelectorAll('[role="tab"]'));
    const panels = Array.from(document.querySelectorAll('.coffee-panel'));
    const select = (key, focus) => {
      toggle.dataset.active = key;
      tabs.forEach((t) => {
        const on = t.dataset.tab === key;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        if (on && focus) t.focus();
      });
      panels.forEach((p) => {
        const on = p.dataset.panel === key;
        if (on && p.hidden && !reduced) {
          p.classList.add('is-entering');
          requestAnimationFrame(() => requestAnimationFrame(() => p.classList.remove('is-entering')));
        }
        p.hidden = !on;
      });
    };
    tabs.forEach((t) => t.addEventListener('click', () => select(t.dataset.tab)));
    toggle.addEventListener('keydown', (e) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
      e.preventDefault();
      const i = tabs.findIndex((t) => t.getAttribute('aria-selected') === 'true');
      const next = e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : (i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      select(tabs[next].dataset.tab, true);
    });
    select('iced');
  }

  /* ---------- Loyalty: stamps press in one by one when the card scrolls into view ---------- */
  const stampCard = document.querySelector('[data-stamp-card]');
  if (stampCard && !reduced && 'IntersectionObserver' in window && stampCard.getBoundingClientRect().top > window.innerHeight) {
    const counter = stampCard.querySelector('[data-stamp-count]');
    const total = stampCard.querySelectorAll('.stamp').length;
    stampCard.classList.add('is-ready');
    counter.textContent = '0';
    const io = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      io.disconnect();
      stampCard.classList.add('is-stamping');
      // Matches the CSS delay of 0.4s + 0.22s per stamp.
      for (let i = 1; i < total; i += 1) setTimeout(() => { counter.textContent = String(i); }, 400 + i * 220);
    }, { threshold: 0.55 });
    io.observe(stampCard);
  }

  /* ---------- Opening-week sign-up (demo: shows the success state, sends nothing) ---------- */
  const form = document.getElementById('offer-form');
  if (form) {
    const success = document.getElementById('offer-success');
    const input = document.getElementById('offer-contact');
    const label = form.querySelector('[data-contact-label]');
    const error = document.getElementById('offer-error');
    const MODES = {
      email: { label: 'Email address', type: 'email', inputmode: 'email', autocomplete: 'email', placeholder: 'you@example.com' },
      whatsapp: { label: 'WhatsApp number', type: 'tel', inputmode: 'tel', autocomplete: 'tel', placeholder: '07700 900123' },
    };
    const mode = () => form.elements.via.value;
    const showError = (text) => {
      error.textContent = text;
      error.hidden = !text;
      input.setAttribute('aria-invalid', String(Boolean(text)));
    };
    const applyMode = () => {
      const m = MODES[mode()];
      label.textContent = m.label;
      ['type', 'inputmode', 'autocomplete', 'placeholder'].forEach((a) => input.setAttribute(a, m[a]));
      input.value = '';
      showError('');
    };
    form.addEventListener('change', (e) => { if (e.target.name === 'via') applyMode(); });
    input.addEventListener('input', () => { if (!error.hidden) showError(''); });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const value = input.value.trim();
      const valid = mode() === 'email' ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) : value.replace(/\D/g, '').length >= 10;
      if (!valid) {
        showError(mode() === 'email' ? 'Please enter an email address, like name@example.com.' : 'Please enter a mobile number, like 07700 900123.');
        input.focus();
        return;
      }
      if (!form.elements.consent.checked) {
        showError('');
        form.elements.consent.focus();
        form.elements.consent.reportValidity();
        return;
      }
      success.querySelector('[data-sent-to]').textContent = value;
      form.hidden = true;
      success.hidden = false;
      success.focus();
    });
    success.querySelector('[data-offer-reset]').addEventListener('click', () => {
      success.hidden = true;
      form.hidden = false;
      form.reset();
      applyMode();
      input.focus();
    });
  }
})();
