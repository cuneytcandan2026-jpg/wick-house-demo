// Drawings and markup for the bean journey. Pure string builders, rendered at build time.
// brew.js reads everything back from the DOM (the flying bean is a clone of the strip's bean),
// so nothing here is duplicated in browser code. Colours come from classes in src/css/brew.css.
import fs from 'fs';
import { BREW_COPY, BREW_MILESTONES } from '../data/brew.mjs';

const L = JSON.parse(fs.readFileSync(new URL('../brand/logo-data.json', import.meta.url), 'utf8'));
const { cup } = L;

/* ---------- The bean: roast brown, lit with gold ---------- */
// Gradient stops use inline style because stop-color as an attribute cannot read a CSS variable.
const stop = (offset, token) => `<stop offset="${offset}" style="stop-color:var(${token})"/>`;
export const beanDefs = (p) => `<radialGradient id="${p}-bean" cx="0.36" cy="0.3" r="0.82">${stop(0, '--bean-hi')}${stop(0.5, '--bean')}${stop(1, '--bean-deep')}</radialGradient>`;

// On a 32 x 32 grid, leaning like a bean at rest.
export const beanShapes = (p) => `<g transform="rotate(-32 16 16)">
  <ellipse class="bean-shade" cx="16.6" cy="17" rx="10.4" ry="13.4"/>
  <ellipse class="bean-body" cx="16" cy="16" rx="10.4" ry="13.4" fill="url(#${p}-bean)"/>
  <path class="bean-crease" d="M16.7 3.3c-3.7 3.4-4 8-.9 12.6 3 4.7 2.7 9.2-.7 13"/>
  <path class="bean-crease-hi" d="M18.3 5c-2.7 3.1-2.8 7-.3 10.9 2.5 3.9 2.3 7.6-.1 10.8"/>
  <ellipse class="bean-shine" cx="11.2" cy="10.2" rx="2.2" ry="4.3" transform="rotate(14 11.2 10.2)"/>
</g>`;

export const beanSVG = (p) => `<svg class="bean-svg" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><defs>${beanDefs(p)}</defs>${beanShapes(p)}</svg>`;

/* ---------- Olive leaves: the latte art and the sprigs share one leaf shape ---------- */
// A slender almond, `len` long, pointing along `angle` from (x, y).
const leafPath = (x, y, angle, len, cls, k) => {
  const w = len * 0.2;
  return `<path class="${cls}" style="--k:${k}" pathLength="1" transform="translate(${x} ${y}) rotate(${angle})" d="M0 0C${len * 0.3} ${-w} ${len * 0.72} ${-w} ${len} 0C${len * 0.72} ${w} ${len * 0.3} ${w} 0 0Z"/>`;
};

// The latte art in the footer cup: an olive sprig poured across the crema. Cup coordinates (the logo's 0-124 grid).
export function oliveArt() {
  const leaves = [
    [40, 102.5, -75, 12.5], [40, 102.5, 15, 12.5],
    [51, 96.5, -78, 11], [51, 96.5, 12, 11],
    [61, 90.5, -80, 9.5], [61, 90.5, 10, 9.5],
    [69.5, 85, -30, 11.5],
  ];
  // Each leaf sits in its own group: the leaf carries a transform attribute, which a CSS transform would replace.
  return `<path class="brew-art-stem" pathLength="1" d="M31 107Q49 99 70 85"/>${leaves.map(([x, y, a, l], i) => `<g class="brew-art-leaf" style="--k:${i}">${leafPath(x, y, a, l, 'brew-art-leaf-shape', i)}</g>`).join('')}`;
}

/* ---------- Landmarks: small line drawings, one per section ---------- */
const LANDMARKS = {
  // Signatures: a slice of focaccia with a sprig of rosemary on top.
  focaccia: `<g class="lm-rig"><rect class="lm-fill" x="2.6" y="7" width="14.8" height="8.6" rx="2.6"/>
    <circle class="lm-dot" cx="6.4" cy="12.6" r="0.9"/><circle class="lm-dot" cx="10" cy="13.4" r="0.9"/><circle class="lm-dot" cx="13.6" cy="12.6" r="0.9"/>
    <path class="lm-line lm-draw" pathLength="1" d="M5.6 9.6 14.4 8.4M8 9.3l-.9-1.6M10.6 8.9l-.7-1.6M12.9 8.6l-.5-1.5"/></g>`,
  // Coffee: an ice cube, with a glint.
  ice: `<g class="lm-rig"><path class="lm-fill" d="M10 3l6.4 3.6v7.2L10 17.4l-6.4-3.6V6.6z"/>
    <path class="lm-line" d="M3.6 6.6 10 10.2l6.4-3.6M10 10.2v7.2"/>
    <path class="lm-line lm-draw" pathLength="1" d="M17.6 1.6v2.6M16.3 2.9h2.6"/></g>`,
  // Loyalty: a stamp with the logo's cup in it.
  stamp: `<g class="lm-rig"><circle class="lm-fill" cx="10" cy="10" r="7.6"/>
    <circle class="lm-ring" cx="10" cy="10" r="5.6"/>
    <path class="lm-line lm-draw" pathLength="1" d="M6.9 8.8h5.6v.9a2.8 2.8 0 0 1-5.6 0zM12.5 9.1h.9a1 1 0 0 1 0 2h-1"/></g>`,
  // Story: an olive sprig that unfurls.
  olive: `<path class="lm-line lm-stem" d="M3.4 16.8C7.4 13.6 11.6 9 16.4 3.4"/>
    ${[[6, 14.6, -105, 5.4], [7.6, 13.2, 10, 5.4], [10.4, 10.4, -110, 5], [12, 8.6, 5, 5], [14.4, 6, -80, 4.4]].map(([x, y, a, l], i) => `<g class="lm-leaf-rig" style="--k:${i};transform-origin:${x}px ${y}px">${leafPath(x, y, a, l, 'lm-leaf', i)}</g>`).join('')}`,
  // Gallery: one of the mural's lilac flowers, which blooms.
  flower: `<g class="lm-rig">${[0, 72, 144, 216, 288].map((a, i) => `<path class="lm-petal" style="--k:${i}" transform="translate(10 10) rotate(${a})" d="M0-1.6C-2.6-3.6-2.6-7.2 0-8.4C2.6-7.2 2.6-3.6 0-1.6Z"/>`).join('')}
    <circle class="lm-centre" cx="10" cy="10" r="1.6"/></g>`,
};

const landmark = (icon) => `<svg class="lm-svg lm-${icon}" viewBox="0 0 20 20" aria-hidden="true" focusable="false">${LANDMARKS[icon]}</svg>`;

// A tiny olive sprig at the start of the track, which opens on load.
const startSprig = `<svg class="sprig-svg" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
  <path class="sprig-stem" d="M10 19.5V10"/>
  <g class="sprig-leaf sprig-left">${leafPath(10, 13.2, -150, 7.6, 'sprig-leaf-shape', 0)}</g>
  <g class="sprig-leaf sprig-right">${leafPath(10, 10.8, -35, 7.6, 'sprig-leaf-shape', 1)}</g>
</svg>`;

// The destination: the logo's own cup, waiting empty at the end of the track.
const stripCup = `<svg class="strip-cup-svg" viewBox="4 4 116 126" aria-hidden="true" focusable="false">
  <defs><clipPath id="strip-inside"><path d="${cup.inside}"/></clipPath></defs>
  <g class="strip-steam" fill="none" stroke-width="${cup.steamStroke + 1}" stroke-linecap="round">${cup.steam.map((d, i) => `<path class="strip-steam-${i + 1}" pathLength="1" d="${d}"/>`).join('')}</g>
  <g clip-path="url(#strip-inside)"><rect class="strip-liquid" x="0" y="73" width="100" height="52"/></g>
  <g class="strip-cup-line" fill="none" stroke-width="${cup.stroke + 1}" stroke-linejoin="round" stroke-linecap="round"><path d="${cup.bowl}"/><path d="${cup.handle}"/></g>
</svg>`;

// The strip under the header. Landmarks carry data-brew-anchor (the section id) and data-at; anchors without
// an icon are hidden spans that only calibrate the mapping.
export function brewStrip() {
  const marks = BREW_MILESTONES.map((m) => (m.icon
    ? `<span class="brew-mark" data-brew-anchor="${m.id}" data-at="${m.at}" data-name="${m.name}"${m.mobile ? ' data-mobile' : ''} style="--at:${m.at}">${landmark(m.icon)}</span>`
    : `<span class="brew-anchor" data-brew-anchor="${m.id}" data-at="${m.at}" data-name="${m.name}"></span>`)).join('');
  return `<div class="brew-strip js-only" id="brew-strip" data-stage="1">
  <div class="brew-inner container-page">
    <div class="brew-track" id="brew-track">
      <span class="brew-sprig">${startSprig}</span>
      <span class="brew-rail" id="brew-progress" role="progressbar" aria-label="${BREW_COPY.progressLabel}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" aria-valuetext="0%, top of the page"></span><span class="brew-fill"></span>
      ${marks}
      <span class="brew-bean-slot" id="brew-bean-slot">
        <button type="button" class="brew-bean" id="brew-bean" aria-label="${BREW_COPY.beanLabel}">
          <span class="brew-bean-hop"><span class="brew-bean-lean"><span class="brew-bean-roll">${beanSVG('strip')}</span></span></span>
        </button>
      </span>
    </div>
    <span class="strip-cup" id="brew-mini-cup">${stripCup}</span>
  </div>
</div>`;
}

export const againIcon = '<svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>';
