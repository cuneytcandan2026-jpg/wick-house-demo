// Small decorative drawings in the Wick House line style: one stroke weight, round caps, currentColor.
// All decorative, so they are hidden from screen readers.
const svg = (viewBox, body, cls, extra = '') =>
  `<svg aria-hidden="true" focusable="false" class="${cls}" viewBox="${viewBox}" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"${extra}>${body}</svg>`;

const leaf = (x, y, angle, size = 1) =>
  `<path transform="translate(${x} ${y}) rotate(${angle}) scale(${size})" fill="currentColor" stroke="none" d="M0 0C6-4.2 15-4.6 24 0C15 4.6 6 4.2 0 0Z"/>`;

// An olive sprig, from the leaves on the Opening Soon poster.
export const sprig = (cls = '') => svg('0 0 140 48',
  `<path d="M4 40C34 34 72 22 136 6"/>${[
    [18, 37, -58], [32, 34, 18], [48, 30, -62], [62, 26, 14], [78, 22, -64], [92, 18, 10], [106, 14, -66], [118, 10, 6], [130, 7, -24],
  ].map(([x, y, a]) => leaf(x, y, a, 0.9)).join('')}`, cls);

// A six-petal flower, from the mural's white star flowers. The lilac version uses it too.
export const flower = (cls = '') => svg('-20 -20 40 40',
  `${[0, 60, 120, 180, 240, 300].map((a) => `<path transform="rotate(${a})" d="M0-3C-3.5-7-3.5-13 0-17C3.5-13 3.5-7 0-3Z"/>`).join('')}<circle r="2.2"/>`, cls);

// Line icons used by the home sections. 24px grid like the layout icons.
const ICON = {
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  bag: '<path d="M6 7h12l1 13H5L6 7z"/><path d="M9 10V6a3 3 0 0 1 6 0v4"/>',
  leaf: '<path d="M5 19C5 10 10 5 20 4c-1 10-6 15-15 15z"/><path d="M5 19l8-8"/>',
  list: '<path d="M8 6h12M8 12h12M8 18h8"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>',
  walk: '<circle cx="13" cy="4" r="2"/><path d="M10 21l2-6-3-3 1-5 4 3 3 1M9 12l-3 2-1 4M14 15l3 6"/>',
  cup: '<path d="M4 9h13v4a6 6 0 0 1-6 6h-1a6 6 0 0 1-6-6V9z"/><path d="M17 11h1.5a2.5 2.5 0 0 1 0 5H16"/><path d="M8 3c0 1.5 1 1.5 1 3M12 3c0 1.5 1 1.5 1 3"/>',
  ice: '<path d="M5 8l7-4 7 4v8l-7 4-7-4z"/><path d="M5 8l7 4 7-4M12 12v8"/>',
  bike: '<circle cx="6" cy="17" r="3.5"/><circle cx="18" cy="17" r="3.5"/><path d="M6 17l4-8h5l3 8M10 9 8.5 6H6M15 9l-2 8"/>',
  heart: '<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  star: '<path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.4 6.7 19.4l1.2-6L3.4 9.3l6-.7z"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  prev: '<path d="M15 5l-7 7 7 7"/>',
  next: '<path d="M9 5l7 7-7 7"/>',
  whatsapp: '<path d="M4 20l1.3-4A8 8 0 1 1 8 18.8z"/><path d="M9 9.5c.3 2 2.2 4.2 4.6 4.8l1.2-1.3 1.7.9c-.4 1.1-1.4 1.8-2.5 1.6-3-.6-5.6-3.2-6.2-6.2-.2-1.1.5-2.1 1.6-2.5l.9 1.7z"/>',
};
export const lineIcon = (name, size = 24, cls = '') =>
  `<svg aria-hidden="true" focusable="false" class="${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${ICON[name]}</svg>`;
