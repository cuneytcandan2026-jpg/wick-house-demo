// Shared by every page: header shadow on scroll, the mobile sheet, the action bar while typing,
// today's opening hours and scroll reveals.
(function () {
  const header = document.querySelector('[data-header]');
  const toggle = document.getElementById('menu-toggle');
  const nav = document.getElementById('mobile-nav');

  // A soft shadow under the header once the page has moved.
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
      ticking = false;
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  function setNav(open, returnFocus) {
    nav.classList.toggle('hidden', !open);
    nav.classList.toggle('flex', open);
    document.documentElement.style.overflow = open ? 'hidden' : '';
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    toggle.querySelector('[data-icon-open]').toggleAttribute('hidden', open);
    toggle.querySelector('[data-icon-close]').toggleAttribute('hidden', !open);
    if (!open && returnFocus) toggle.focus();
  }
  const isOpen = () => toggle.getAttribute('aria-expanded') === 'true';
  toggle.addEventListener('click', () => setNav(!isOpen()));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && isOpen()) setNav(false, true); });
  // Following a link in the sheet, including a same-page #anchor, closes it.
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) setNav(false); });
  window.matchMedia('(min-width: 1024px)').addEventListener('change', (e) => { if (e.matches && isOpen()) setNav(false); });

  // The action bar steps aside while a field has focus.
  const isField = (el) => el && el.matches && el.matches('input:not([type=checkbox]):not([type=radio]), textarea, select');
  document.addEventListener('focusin', (e) => document.body.classList.toggle('typing', isField(e.target)));
  document.addEventListener('focusout', () => document.body.classList.remove('typing'));

  // Today's row in any hours list, in UK time wherever the visitor is.
  const today = new Intl.DateTimeFormat('en-GB', { weekday: 'long', timeZone: 'Europe/London' }).format(new Date());
  document.querySelectorAll('[data-days]').forEach((row) => {
    if (!row.dataset.days.split(',').includes(today)) return;
    row.classList.add('is-today');
    const tag = row.querySelector('.today-tag');
    if (tag) tag.hidden = false;
  });

  // Reveals: only elements below the fold are hidden, and only here, so nothing stays hidden if this never runs.
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduced && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('reveal-in');
        entry.target.classList.remove('reveal-pending');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    // Read every position first, then write: interleaving them forced a layout per element.
    const fold = window.innerHeight;
    const below = [...document.querySelectorAll('[data-reveal]')].filter((el) => el.getBoundingClientRect().top >= fold);
    below.forEach((el) => {
      el.classList.add('reveal-pending');
      observer.observe(el);
    });
  }
})();
