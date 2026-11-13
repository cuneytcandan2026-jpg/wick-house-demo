// Responsive <picture> markup for any photo in src/data/photos.mjs.
// The build (scripts/build.mjs) writes AVIF and WebP for exactly the widths widthsFor() returns,
// so srcset never lists a size that does not exist. Width and height come from photo-sizes.json,
// which `npm run photos` writes, so every image reserves its space and nothing shifts on load.
import fs from 'fs';
import { PHOTOS } from '../data/photos.mjs';

export const WIDTHS = [480, 800, 1400, 2000];

const SIZES = JSON.parse(fs.readFileSync(new URL('../data/photo-sizes.json', import.meta.url), 'utf8'));

// Standard widths below the photo's own width, plus the photo's full width when it falls between tiers.
export function widthsFor(width) {
  const list = WIDTHS.filter((w) => w <= width);
  if (!list.length || (list[list.length - 1] < width && width < WIDTHS[WIDTHS.length - 1])) list.push(width);
  return list;
}

const escape = (text) => String(text).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const url = (key, width, ext) => `/assets/img/r/${key}-${width}.${ext}`;

/**
 * @param {string} key      a key of PHOTOS
 * @param {object} options
 *   sizes      the `sizes` attribute; default '100vw'
 *   alt        overrides the alt text from photos.mjs ('' marks the image decorative)
 *   eager      true for the LCP image: loads eagerly with fetchpriority="high"
 *   className  classes on <picture>
 *   imgClass   classes on <img> (object-fit, aspect, grade overlay hooks)
 */
export function picture(key, { sizes = '100vw', alt, eager = false, className = '', imgClass = '' } = {}) {
  const photo = PHOTOS[key];
  const size = SIZES[key];
  if (!photo || !size) throw new Error(`picture(): unknown photo "${key}". Add it to src/data/photos.mjs and run npm run photos.`);
  const widths = widthsFor(size.width);
  const srcset = (ext) => widths.map((w) => `${url(key, w, ext)} ${w}w`).join(', ');
  const fallback = widths.find((w) => w >= 800) || widths[widths.length - 1];
  const loading = eager ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"';
  return `<picture${className ? ` class="${className}"` : ''}>`
    + `<source type="image/avif" srcset="${srcset('avif')}" sizes="${sizes}">`
    + `<source type="image/webp" srcset="${srcset('webp')}" sizes="${sizes}">`
    + `<img src="${url(key, fallback, 'webp')}" width="${size.width}" height="${size.height}" alt="${escape(alt ?? photo.alt)}" ${loading} decoding="async"${imgClass ? ` class="${imgClass}"` : ''}>`
    + '</picture>';
}

// Plain URL for CSS backgrounds or the lightbox's full-size view.
export const photoUrl = (key, width = 1400, ext = 'webp') => {
  const widths = widthsFor(SIZES[key].width);
  return url(key, widths.filter((w) => w <= width).pop() || widths[0], ext);
};
