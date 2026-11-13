// The order pad: build an order, pick a collection slot, then hand it to WhatsApp as a ready-written message.
// Nothing is charged or sent from the site. Prices always come from the menu data in the page, never from
// storage or a link, so they can't go stale or be edited.
(function () {
  const $ = (id) => document.getElementById(id);
  const dialog = $('pad');
  const data = JSON.parse($('pad-data').textContent);
  const ITEMS = data.items;
  const ADDONS = data.addons;
  const RULES = data.order;

  const STORE_KEY = 'wickhouse-order';
  const MAX_AGE = 3 * 24 * 60 * 60 * 1000;
  const MAX_QTY = 20;
  const MAX_LINES = 40;

  const pence = (price) => Math.round(Number(price) * 100);
  const money = (p) => `£${(p / 100).toFixed(2)}`;
  const itemsText = (n) => `${n} ${n === 1 ? 'item' : 'items'}`;

  let lines = [];
  let undoLines = null;
  let view = 'edit';
  let picked = null; // { date: 'YYYY-MM-DD', minutes }
  let toastTimer = null;

  // ---------- Lines ----------
  const keyOf = (line) => `${line.id}|${line.addons.join('.')}`;
  const unitPrice = (line) => line.addons.reduce((sum, a) => sum + pence(ADDONS[a].price), pence(ITEMS[line.id].price));
  const lineTotal = (line) => unitPrice(line) * line.qty;
  const totalOf = (list) => list.reduce((sum, line) => sum + lineTotal(line), 0);
  const countOf = (list) => list.reduce((sum, line) => sum + line.qty, 0);

  // The one gate for anything read back from storage.
  function clean(line) {
    const item = line && ITEMS[line.id];
    const qty = Math.min(Math.floor(Number(line && line.qty)), MAX_QTY);
    if (!item || !(qty >= 1)) return null;
    const addons = [...new Set(Array.isArray(line.addons) ? line.addons : [])].filter((a) => item.addons.includes(a)).sort();
    return { id: line.id, addons, qty };
  }
  function merged(list) {
    const out = new Map();
    list.forEach((line) => {
      const existing = out.get(keyOf(line));
      if (existing) existing.qty = Math.min(existing.qty + line.qty, MAX_QTY);
      else if (out.size < MAX_LINES) out.set(keyOf(line), { ...line });
    });
    return [...out.values()];
  }

  // ---------- Storage: may be blocked, so the pad still works for this visit without it ----------
  function save() {
    try {
      const name = $('pad-name').value.trim();
      if (lines.length || name) window.localStorage.setItem(STORE_KEY, JSON.stringify({ at: Date.now(), lines, name }));
      else window.localStorage.removeItem(STORE_KEY);
    } catch (e) { /* blocked */ }
  }
  function load() {
    try {
      const saved = JSON.parse(window.localStorage.getItem(STORE_KEY));
      if (!saved || Date.now() - saved.at > MAX_AGE) return;
      if (Array.isArray(saved.lines)) lines = merged(saved.lines.map(clean).filter(Boolean));
      if (typeof saved.name === 'string') $('pad-name').value = saved.name.slice(0, 40);
    } catch (e) { /* blocked or unreadable */ }
  }

  // ---------- Collection slots, always in UK time wherever the visitor is ----------
  const toMinutes = (hhmm) => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; };
  const clock = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = String(minutes % 60).padStart(2, '0');
    return `${h % 12 || 12}:${m}${h < 12 ? 'am' : 'pm'}`;
  };
  const shortClock = (minutes) => `${Math.floor(minutes / 60) % 12 || 12}:${String(minutes % 60).padStart(2, '0')}`;
  const hourLabel = (h) => `${h % 12 || 12}${h < 12 ? 'am' : 'pm'}`;
  const atNoon = (iso) => new Date(`${iso}T12:00:00Z`);
  const addDays = (iso, n) => { const d = atNoon(iso); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
  const weekday = (iso) => new Intl.DateTimeFormat('en-GB', { weekday: 'long', timeZone: 'UTC' }).format(atNoon(iso));
  const shortDate = (iso) => new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' }).format(atNoon(iso));

  function londonNow() {
    const parts = {};
    new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
      .formatToParts(new Date()).forEach((p) => { parts[p.type] = p.value; });
    return { date: `${parts.year}-${parts.month}-${parts.day}`, minutes: Number(parts.hour) * 60 + Number(parts.minute) };
  }

  function slotsFor(iso, now) {
    const hours = data.hours.find((h) => h.days.includes(weekday(iso)));
    if (!hours) return [];
    const step = RULES.slotMinutes;
    const last = toMinutes(hours.closes) - RULES.lastOrderBeforeCloseMinutes;
    let start = toMinutes(hours.opens);
    if (iso === now.date) start = Math.max(start, Math.ceil((now.minutes + RULES.leadMinutes) / step) * step);
    const out = [];
    for (let m = start; m <= last; m += step) out.push(m);
    return out;
  }

  // The next three days with a free slot, never before opening day.
  function availableDays() {
    const now = londonNow();
    const first = now.date > data.opening ? now.date : data.opening;
    const days = [];
    for (let i = 0; i < 14 && days.length < 3; i += 1) {
      const iso = addDays(first, i);
      const slots = slotsFor(iso, now);
      if (slots.length) days.push({ iso, slots });
    }
    return { now, days };
  }

  function dayName(iso, now) {
    if (iso === now.date) return 'Today';
    if (iso === addDays(now.date, 1)) return 'Tomorrow';
    return shortDate(iso);
  }

  let schedule = availableDays();
  const dayOf = (iso) => schedule.days.find((d) => d.iso === iso);

  function ensurePicked() {
    const day = picked && dayOf(picked.date);
    if (day && day.slots.includes(picked.minutes)) return;
    const first = schedule.days[0];
    picked = first ? { date: first.iso, minutes: first.slots[0] } : null;
  }

  function radio(name, value, checked, content, extra = '') {
    const label = document.createElement('label');
    label.className = `pad-chip ${extra}`;
    const input = document.createElement('input');
    input.type = 'radio';
    input.name = name;
    input.value = String(value);
    input.checked = checked;
    const span = document.createElement('span');
    span.innerHTML = content;
    label.append(input, span);
    return label;
  }

  function drawDays() {
    $('pad-days').replaceChildren(...schedule.days.map((d) => {
      const tag = d.iso === data.opening ? '<small>Opening day</small>' : '';
      return radio('pad-day', d.iso, picked && picked.date === d.iso, `${dayName(d.iso, schedule.now)}${tag}`, 'pad-chip-day');
    }));
  }
  function drawHours() {
    const day = picked && dayOf(picked.date);
    const hours = day ? [...new Set(day.slots.map((m) => Math.floor(m / 60)))] : [];
    $('pad-hours').replaceChildren(...hours.map((h) => radio('pad-hour', h, Math.floor(picked.minutes / 60) === h, hourLabel(h))));
  }
  function drawSlots() {
    const day = picked && dayOf(picked.date);
    const hour = picked ? Math.floor(picked.minutes / 60) : -1;
    const slots = day ? day.slots.filter((m) => Math.floor(m / 60) === hour) : [];
    $('pad-slots').replaceChildren(...slots.map((m) => {
      const el = radio('pad-slot', m, picked.minutes === m, shortClock(m), 'pad-chip-slot');
      el.querySelector('input').setAttribute('aria-label', clock(m));
      return el;
    }));
    drawPicked();
  }
  // "today at 7:20am", "tomorrow at 7:20am" or "Wed 18 Nov at 7:20am".
  const pickedText = () => {
    if (!picked) return '';
    const day = dayName(picked.date, schedule.now);
    return `${day === 'Today' || day === 'Tomorrow' ? day.toLowerCase() : `on ${day}`} at ${clock(picked.minutes)}`;
  };
  function drawPicked() {
    $('pad-picked').textContent = picked ? `Collect ${pickedText()}` : 'No collection slots in the next few days. Call us to order.';
    const opening = schedule.now.date < data.opening;
    $('pad-when-note').textContent = opening
      ? `We open on ${weekday(data.opening)} ${Number(data.opening.slice(8))} November. Book a slot for opening day or after.`
      : `Slots every ${RULES.slotMinutes} minutes. Give us at least ${RULES.leadMinutes} minutes to make it.`;
  }
  function drawSchedule() {
    schedule = availableDays();
    ensurePicked();
    drawDays();
    drawHours();
    drawSlots();
  }

  $('pad-days').addEventListener('change', (e) => {
    const day = dayOf(e.target.value);
    if (!day) return;
    // Keep the same time on the new day if it's free, otherwise the first slot.
    picked = { date: day.iso, minutes: day.slots.includes(picked && picked.minutes) ? picked.minutes : day.slots[0] };
    drawHours();
    drawSlots();
  });
  $('pad-hours').addEventListener('change', (e) => {
    const day = dayOf(picked.date);
    const hour = Number(e.target.value);
    picked.minutes = day.slots.find((m) => Math.floor(m / 60) === hour);
    drawSlots();
  });
  $('pad-slots').addEventListener('change', (e) => {
    picked.minutes = Number(e.target.value);
    drawPicked();
  });

  // ---------- Drawing ----------
  function el(tag, cls, text) {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function stepButton(act, key, symbol, label, disabled) {
    const button = el('button', 'pad-step');
    button.type = 'button';
    button.innerHTML = symbol === '+' ? '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>' : '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12h14"/></svg>';
    button.dataset.act = act;
    button.dataset.key = key;
    button.setAttribute('aria-label', label);
    button.disabled = Boolean(disabled);
    return button;
  }

  function drawLine(line) {
    const item = ITEMS[line.id];
    const key = keyOf(line);
    const li = el('li', 'pad-line');
    const top = el('div', 'flex items-baseline gap-3');
    top.append(el('p', 'pad-line-name', item.name), el('span', 'pad-line-price', money(lineTotal(line))));
    li.append(top);

    const row = el('div', 'mt-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-2');
    row.append(el('p', 'text-sm text-moss', item.cat));
    const stepper = el('div', 'pad-stepper');
    stepper.setAttribute('role', 'group');
    stepper.setAttribute('aria-label', `Quantity of ${item.name}`);
    stepper.append(
      stepButton('dec', key, '−', line.qty === 1 ? `Remove ${item.name}` : `One fewer ${item.name}`),
      el('span', 'pad-qty', String(line.qty)),
      stepButton('inc', key, '+', `One more ${item.name}`, line.qty >= MAX_QTY),
    );
    row.append(stepper);
    li.append(row);

    if (item.addons.length) {
      const extras = el('div', 'mt-3 flex flex-wrap gap-2');
      item.addons.forEach((id) => {
        const label = el('label', 'pad-addon');
        const box = el('input');
        box.type = 'checkbox';
        box.checked = line.addons.includes(id);
        box.dataset.act = 'addon';
        box.dataset.key = key;
        box.dataset.addon = id;
        const words = el('span', '', `${ADDONS[id].label} +${money(pence(ADDONS[id].price))}`);
        words.append(el('span', 'sr-only', ` for ${item.name}`));
        label.append(box, words);
        extras.append(label);
      });
      li.append(extras);
    }
    return li;
  }

  function drawAddButtons() {
    const counts = {};
    lines.forEach((line) => { counts[line.id] = (counts[line.id] || 0) + line.qty; });
    document.querySelectorAll('[data-add]').forEach((button) => {
      const count = counts[button.dataset.add] || 0;
      const name = ITEMS[button.dataset.add].name;
      button.classList.toggle('is-on', count > 0);
      button.querySelector('[data-add-label]').textContent = count ? `${count} added` : 'Add';
      button.setAttribute('aria-label', count ? `Add another ${name}. ${count} in your order.` : `Add ${name} to your order`);
    });
  }

  function setView(next) {
    view = next;
    $('pad-edit').hidden = next !== 'edit' || !lines.length;
    $('pad-empty').hidden = next !== 'edit' || lines.length > 0;
    $('pad-review').hidden = next !== 'review';
    $('pad-done').hidden = next !== 'done';
    $('pad-actions-edit').hidden = next !== 'edit';
    $('pad-actions-review').hidden = next !== 'review';
    $('pad-actions-done').hidden = next !== 'done';
    $('pad-foot').hidden = next === 'edit' && !lines.length;
    dialog.dataset.view = next;
  }

  function draw(focusSelector) {
    const count = countOf(lines);
    const total = totalOf(lines);

    const bar = $('pad-bar');
    bar.hidden = count === 0;
    document.body.classList.toggle('has-pad', count > 0);
    $('pad-bar-count').textContent = String(count);
    $('pad-bar-total').textContent = money(total);
    bar.setAttribute('aria-label', `View your order: ${itemsText(count)}, ${money(total)}`);

    $('pad-lines').replaceChildren(...lines.map(drawLine));
    $('pad-total').textContent = money(total);
    $('pad-undo').hidden = !undoLines;
    setView(view);
    drawAddButtons();
    save();

    if (focusSelector) {
      const target = dialog.querySelector(focusSelector);
      (target && !target.disabled && !target.closest('[hidden]') ? target : $('pad-close')).focus();
    }
  }

  // Outside the open dialog is inert, so messages go to whichever live region can be heard.
  function announce(text) {
    const box = $('pad-toast');
    box.textContent = text;
    box.classList.toggle('is-on', !dialog.open);
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => box.classList.remove('is-on'), 3500);
    if (dialog.open) $('pad-live').textContent = text;
  }

  // ---------- Adding from the menu ----------
  function add(id) {
    const line = { id, addons: [], qty: 1 };
    const existing = lines.find((l) => keyOf(l) === keyOf(line));
    if (existing && existing.qty >= MAX_QTY) return announce(`You can have up to ${MAX_QTY} of one item.`);
    if (existing) existing.qty += 1;
    else if (lines.length >= MAX_LINES) return announce('Your order is full.');
    else lines.push(line);
    undoLines = null;
    if (view === 'done') view = 'edit';
    draw();
    const bar = $('pad-bar');
    bar.classList.remove('is-bumped');
    void bar.offsetWidth;
    bar.classList.add('is-bumped');
    return announce(`Added ${ITEMS[id].name}. ${itemsText(countOf(lines))}, ${money(totalOf(lines))}.`);
  }
  $('menu-results').addEventListener('click', (e) => {
    const button = e.target.closest('[data-add]');
    if (button && ITEMS[button.dataset.add]) add(button.dataset.add);
  });

  // ---------- Opening and closing ----------
  function openPad() {
    if (dialog.open) return;
    if (view === 'review') view = 'edit';
    drawSchedule();
    draw();
    dialog.showModal();
    document.documentElement.classList.add('pad-open');
    $('pad-scroll').scrollTop = 0;
    $('pad-close').focus();
  }
  $('pad-bar').addEventListener('click', openPad);
  $('pad-close').addEventListener('click', () => dialog.close());
  $('pad-browse').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => {
    document.documentElement.classList.remove('pad-open');
    undoLines = null;
    draw();
    const bar = $('pad-bar');
    (bar.hidden ? $('menu-search') : bar).focus({ preventScroll: true });
  });

  // Every "Order ahead" link on this page opens the pad instead of jumping.
  function orderLink(e) {
    const a = e.target.closest('a[href]');
    if (!a) return;
    const url = new URL(a.href, location.href);
    if (url.pathname !== location.pathname || url.hash !== '#order' || url.search) return;
    e.preventDefault();
    startOrder();
  }
  document.addEventListener('click', orderLink);

  function startOrder() {
    if (lines.length) openPad();
    else {
      $('order').scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      announce('Tap Add on anything to start your order.');
    }
  }

  // ---------- Editing lines ----------
  $('pad-lines').addEventListener('click', (e) => {
    const button = e.target.closest('button[data-act]');
    if (!button) return;
    const index = lines.findIndex((l) => keyOf(l) === button.dataset.key);
    const line = lines[index];
    if (!line) return;
    const name = ITEMS[line.id].name;
    if (button.dataset.act === 'inc') {
      line.qty = Math.min(line.qty + 1, MAX_QTY);
      draw(`[data-act="inc"][data-key="${CSS.escape(keyOf(line))}"]`);
      announce(`${line.qty} of ${name}. Total ${money(totalOf(lines))}.`);
    } else if (line.qty > 1) {
      line.qty -= 1;
      draw(`[data-act="dec"][data-key="${CSS.escape(keyOf(line))}"]`);
      announce(`${line.qty} of ${name}. Total ${money(totalOf(lines))}.`);
    } else {
      lines.splice(index, 1);
      const neighbour = lines[index] || lines[index - 1];
      draw(neighbour ? `[data-act="dec"][data-key="${CSS.escape(keyOf(neighbour))}"]` : '#pad-browse');
      announce(`Removed ${name}. ${lines.length ? `Total ${money(totalOf(lines))}.` : 'Your order is empty.'}`);
    }
  });

  $('pad-lines').addEventListener('change', (e) => {
    const box = e.target;
    if (box.dataset.act !== 'addon') return;
    const line = lines.find((l) => keyOf(l) === box.dataset.key);
    if (!line) return;
    line.addons = (box.checked ? [...line.addons, box.dataset.addon] : line.addons.filter((a) => a !== box.dataset.addon)).sort();
    // A changed option can make this line the same as another, so they join up.
    lines = merged(lines);
    draw(`[data-act="addon"][data-addon="${CSS.escape(box.dataset.addon)}"][data-key="${CSS.escape(keyOf(line))}"]`);
    announce(`Total ${money(totalOf(lines))}.`);
  });

  $('pad-clear').addEventListener('click', () => {
    undoLines = lines;
    lines = [];
    draw('#pad-undo');
    announce('Your order is cleared.');
  });
  $('pad-undo').addEventListener('click', () => {
    lines = undoLines || [];
    undoLines = null;
    draw('#pad-clear');
    announce('Your order is back.');
  });

  $('pad-name').addEventListener('input', () => {
    $('pad-name').removeAttribute('aria-invalid');
    $('pad-name-error').hidden = true;
    save();
  });

  // ---------- WhatsApp hand-off ----------
  function message() {
    const name = $('pad-name').value.trim();
    const notes = $('pad-notes').value.trim();
    const rows = lines.map((line) => {
      const extras = line.addons.map((a) => ADDONS[a].label.toLowerCase()).join(', ');
      return `${line.qty} × ${ITEMS[line.id].name}${extras ? ` (${extras})` : ''}: ${money(lineTotal(line))}`;
    });
    return [
      `Hi ${data.name}, I'd like to order ahead for collection.`,
      '',
      `Collect: ${shortDate(picked.date)}, ${clock(picked.minutes)}`,
      `Name: ${name}`,
      '',
      ...rows,
      '',
      `Total: ${money(totalOf(lines))}`,
      ...(notes ? [`Note: ${notes}`] : []),
      '',
      "I'll pay when I collect. Thanks!",
    ].join('\n');
  }

  $('pad-send').addEventListener('click', () => {
    drawSchedule();
    const name = $('pad-name');
    if (!picked) {
      announce('There are no collection slots in the next few days. Please call us.');
      return;
    }
    if (!name.value.trim()) {
      name.setAttribute('aria-invalid', 'true');
      $('pad-name-error').hidden = false;
      name.focus();
      return;
    }
    const text = message();
    $('pad-message').textContent = text;
    $('pad-wa').href = `https://wa.me/${data.whatsapp}?text=${encodeURIComponent(text)}`;
    setView('review');
    $('pad-scroll').scrollTop = 0;
    $('pad-review').focus();
  });
  $('pad-back').addEventListener('click', () => {
    setView('edit');
    $('pad-send').focus();
  });
  $('pad-wa').addEventListener('click', () => {
    // WhatsApp opens in a new tab or the app. Here we confirm what happens next.
    $('pad-done-text').textContent = `Once you press send, we'll reply on WhatsApp to confirm. See you ${pickedText()}.`;
    setTimeout(() => {
      setView('done');
      $('pad-done').focus();
    }, 300);
  });
  $('pad-new').addEventListener('click', () => {
    lines = [];
    $('pad-notes').value = '';
    view = 'edit';
    draw();
    dialog.close();
    announce('Ready for a new order.');
  });
  $('pad-keep').addEventListener('click', () => {
    setView('edit');
    $('pad-send').focus();
  });

  // ---------- Arriving from a link ----------
  // /menu/?add=<id>#order from the home page adds that dish, then opens the pad.
  function fromLink() {
    const params = new URLSearchParams(location.search);
    const id = params.get('add');
    let opened = false;
    if (id !== null) {
      params.delete('add');
      const rest = params.toString();
      history.replaceState(null, '', `${location.pathname}${rest ? `?${rest}` : ''}${location.hash}`);
      if (ITEMS[id]) {
        add(id);
        openPad();
        opened = true;
      }
    }
    if (!opened && location.hash === '#order') startOrder();
  }
  window.addEventListener('hashchange', () => { if (location.hash === '#order') startOrder(); });

  load();
  drawSchedule();
  draw();
  fromLink();
})();
