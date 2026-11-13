// Category tabs, search and dietary filters. They only hide what is already in the HTML,
// so without this file the whole menu still shows.
(function () {
  const root = document.documentElement;
  const controls = document.getElementById('menu-controls');
  const results = document.getElementById('menu-results');
  const search = document.getElementById('menu-search');
  const veg = document.getElementById('menu-v');
  const vegan = document.getElementById('menu-vg');
  const status = document.getElementById('menu-status');
  const reset = document.getElementById('menu-reset');
  const empty = document.getElementById('menu-empty');
  const emptyText = document.getElementById('menu-empty-text');
  const tabRow = document.getElementById('menu-tabs');
  const tabs = Array.from(tabRow.querySelectorAll('[data-tab]'));
  const sections = Array.from(document.querySelectorAll('[data-category]'));
  const total = document.querySelectorAll('[data-item]').length;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  let category = '';

  const nameOf = (id) => tabs.find((t) => t.dataset.tab === id).textContent.trim().toLowerCase();
  const plural = (n) => `${n} ${n === 1 ? 'item' : 'items'}`;
  const dietWord = () => (vegan.checked ? 'vegan ' : veg.checked ? 'vegetarian ' : '');

  // The sticky bar's height, so jumps to a category land below it.
  function measure() {
    root.style.setProperty('--controls-h', `${controls.offsetHeight}px`);
  }

  // Lines the results up under the sticky bars, but only when the visitor is already past them.
  function alignResults() {
    const stuckBottom = (parseFloat(getComputedStyle(controls).top) || 0) + controls.offsetHeight;
    const top = Math.round(results.getBoundingClientRect().top + window.scrollY - stuckBottom);
    if (window.scrollY > top) window.scrollTo({ top, behavior: reduced.matches ? 'auto' : 'smooth' });
  }

  // Scrolls only the tab row, never the page.
  function revealTab(tab) {
    const rail = tabRow.getBoundingClientRect();
    const box = tab.getBoundingClientRect();
    if (box.left >= rail.left && box.right <= rail.right) return;
    tabRow.scrollBy({ left: box.left + box.width / 2 - (rail.left + rail.width / 2), behavior: reduced.matches ? 'auto' : 'smooth' });
  }

  function apply() {
    const words = search.value.toLowerCase().split(/\s+/).filter(Boolean);
    const diet = vegan.checked ? ['vg'] : veg.checked ? ['v', 'vg'] : null;
    let count = 0;

    sections.forEach((section) => {
      const inScope = !category || section.id === category;
      let shown = 0;
      section.querySelectorAll('[data-item]').forEach((item) => {
        const show = inScope
          && (!diet || diet.includes(item.dataset.diet))
          && words.every((w) => item.dataset.search.includes(w));
        item.hidden = !show;
        if (show) shown += 1;
      });
      section.hidden = shown === 0;
      count += shown;
    });

    const where = category ? ` in ${nameOf(category)}` : '';
    if (words.length) status.textContent = `${count ? plural(count).replace(' ', ` ${dietWord()}`) : `No ${dietWord()}items`} matching "${search.value.trim()}"${where}.`;
    else if (diet) status.textContent = `${count ? plural(count).replace(' ', ` ${dietWord()}`) : `No ${dietWord()}items`}${where || ' on the menu'}.`;
    else status.textContent = category ? `Showing ${plural(count)} in ${nameOf(category)}.` : `Showing all ${plural(total)}.`;

    reset.hidden = !(words.length || diet || category);
    empty.hidden = count > 0;
    if (!count) {
      emptyText.textContent = diet && category
        ? `Nothing ${dietWord().trim()} in ${nameOf(category)} yet. Try all categories, or show the full menu.`
        : 'Try a different word, or show the full menu again.';
    }

    tabs.forEach((tab) => {
      const on = tab.dataset.tab === category;
      tab.setAttribute('aria-pressed', String(on));
      if (on) revealTab(tab);
    });
  }

  function updateUrl(push) {
    const url = category ? `#${category}` : `${location.pathname}${location.search}`;
    history[push ? 'pushState' : 'replaceState'](history.state, '', url);
  }

  function choose(id, push = true) {
    category = id;
    // Picking a category means browsing it, so an earlier search shouldn't quietly narrow it.
    search.value = '';
    apply();
    updateUrl(push);
    alignResults();
  }

  function resetAll() {
    category = '';
    search.value = '';
    veg.checked = false;
    vegan.checked = false;
    apply();
    updateUrl(false);
    alignResults();
    search.focus();
  }

  tabs.forEach((tab) => tab.addEventListener('click', () => choose(tab.dataset.tab)));

  // Search always covers the whole menu, so the tabs go back to All.
  search.addEventListener('input', () => {
    if (category) {
      category = '';
      updateUrl(false);
    }
    apply();
    alignResults();
  });
  // Vegan is the stricter filter: turning it on also ticks vegetarian, turning vegetarian off clears vegan.
  vegan.addEventListener('change', () => {
    if (vegan.checked) veg.checked = true;
    apply();
    alignResults();
  });
  veg.addEventListener('change', () => {
    if (!veg.checked) vegan.checked = false;
    apply();
    alignResults();
  });
  document.getElementById('menu-form').addEventListener('submit', (e) => {
    e.preventDefault();
    search.blur();
  });
  reset.addEventListener('click', resetAll);
  document.getElementById('menu-empty-reset').addEventListener('click', resetAll);

  // #sandwiches opens that tab. #dish-<id> clears anything that would hide that dish. #order belongs to order.js.
  function fromHash() {
    const id = decodeURIComponent(location.hash.slice(1));
    if (sections.some((s) => s.id === id)) {
      category = id;
      search.value = '';
      apply();
      requestAnimationFrame(() => document.getElementById(id).scrollIntoView({ block: 'start' }));
    } else if (id.startsWith('dish-') && document.getElementById(id)) {
      category = '';
      search.value = '';
      veg.checked = false;
      vegan.checked = false;
      apply();
      document.getElementById(id).scrollIntoView({ block: 'center' });
    } else {
      category = '';
      apply();
    }
  }
  window.addEventListener('hashchange', fromHash);
  window.addEventListener('popstate', fromHash);

  if ('ResizeObserver' in window) new ResizeObserver(measure).observe(controls);
  measure();
  // A browser may restore a typed search or ticked filter on reload, so read them before the first render.
  fromHash();
})();
