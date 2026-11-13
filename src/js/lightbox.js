// Gallery lightbox on the native <dialog>: while open the page behind is inert and Escape closes it.
// Without JS each photo is a plain link to the larger image.
(function () {
  const dialog = document.getElementById('lightbox');
  if (!dialog || typeof dialog.showModal !== 'function') return;
  const image = document.getElementById('lightbox-img');
  const caption = document.getElementById('lightbox-caption');
  const links = Array.from(document.querySelectorAll('.gallery-link'));
  let current = 0;

  function show(index) {
    current = (index + links.length) % links.length;
    const link = links[current];
    const thumb = link.querySelector('img');
    image.src = link.dataset.full;
    image.alt = thumb ? thumb.alt : link.dataset.label;
    caption.textContent = `${link.dataset.label} (${current + 1} of ${links.length})`;
  }

  links.forEach((link, index) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      show(index);
      dialog.showModal();
      document.documentElement.style.overflow = 'hidden';
      document.getElementById('lightbox-close').focus();
    });
  });

  document.getElementById('lightbox-close').addEventListener('click', () => dialog.close());
  document.getElementById('lightbox-next').addEventListener('click', () => show(current + 1));
  document.getElementById('lightbox-prev').addEventListener('click', () => show(current - 1));

  // A click on the dark backdrop, rather than a control or the photo, closes it.
  dialog.addEventListener('click', (e) => { if (!e.target.closest('button, img')) dialog.close(); });
  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') show(current + 1);
    if (e.key === 'ArrowLeft') show(current - 1);
    // Keep Tab on the three buttons.
    if (e.key === 'Tab') {
      const buttons = Array.from(dialog.querySelectorAll('button'));
      const i = buttons.indexOf(document.activeElement);
      e.preventDefault();
      buttons[(i + (e.shiftKey ? -1 : 1) + buttons.length) % buttons.length].focus();
    }
  });

  // Swipe sideways on the photo to move between photos.
  let startX = null;
  image.addEventListener('touchstart', (e) => { startX = e.changedTouches[0].clientX; }, { passive: true });
  image.addEventListener('touchend', (e) => {
    if (startX === null) return;
    const distance = e.changedTouches[0].clientX - startX;
    if (Math.abs(distance) > 50) show(current + (distance < 0 ? 1 : -1));
    startX = null;
  }, { passive: true });

  dialog.addEventListener('close', () => {
    image.removeAttribute('src');
    document.documentElement.style.overflow = '';
    // Focus returns to the photo last viewed, so a keyboard user keeps their place.
    links[current].focus();
  });
})();
