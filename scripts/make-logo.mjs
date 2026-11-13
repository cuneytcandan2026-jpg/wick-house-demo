// Rebuilds the Wick House logo as vector paths, traced from Brand Assets/WickHouseLogo.jpg.
// Run with: npm run logo. It writes:
//   src/brand/logo.mjs  the parts as data (cup, steam, wordmark, dash, tagline, header lockup), for the templates
//   src/brand/logo.svg  the full stacked logo as a standalone file
//   src/brand/favicon.svg
// Letters are real Jost glyph outlines, so the logo never depends on a font loading. The parts stay separate
// so the bean journey can fill the cup, draw the steam and fade the wordmark in one at a time.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import opentype from 'opentype.js';
import { COLORS } from '../src/data/brand.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const font = (weight) => opentype.parse(fs.readFileSync(path.join(ROOT, `node_modules/@fontsource/jost/files/jost-latin-${weight}-normal.woff`)).buffer);
const WORD_FONT = font(500);
const TAG_FONT = font(400);

const r = (n) => Math.round(n * 10) / 10;

// Lays out a line of capitals with even tracking and returns its path and ink bounds.
function line(f, text, { capHeight, tracking }) {
  const size = (capHeight * f.unitsPerEm) / f.tables.os2.sCapHeight;
  const scale = size / f.unitsPerEm;
  let x = 0;
  const glyphs = [];
  for (const ch of text) {
    const g = f.charToGlyph(ch);
    glyphs.push({ g, x });
    x += g.advanceWidth * scale + tracking;
  }
  const p = new opentype.Path();
  for (const { g, x: gx } of glyphs) p.extend(g.getPath(gx, 0, size));
  const box = p.getBoundingBox();
  return { p, box, size };
}

// Places a laid-out line so its ink is centred on cx with its baseline on y.
function place({ p, box }, cx, baseline) {
  const dx = cx - (box.x1 + box.x2) / 2;
  // Serialised here: opentype.js 2's own toPathData emits NaN for some Jost 500 points.
  const X = (v) => r(v + dx);
  const Y = (v) => r(v + baseline);
  const d = p.commands.map((c) => {
    if (c.type === 'M' || c.type === 'L') return `${c.type}${X(c.x)} ${Y(c.y)}`;
    if (c.type === 'Q') return `Q${X(c.x1)} ${Y(c.y1)} ${X(c.x)} ${Y(c.y)}`;
    if (c.type === 'C') return `C${X(c.x1)} ${Y(c.y1)} ${X(c.x2)} ${Y(c.y2)} ${X(c.x)} ${Y(c.y)}`;
    return 'Z';
  }).join('');
  if (d.includes('NaN')) throw new Error('Logo path has NaN');
  return { d, x1: box.x1 + dx, x2: box.x2 + dx };
}

// Finds the tracking that makes a line's ink exactly the width measured on the original logo.
function fit(f, text, capHeight, width) {
  let lo = -20, hi = 200;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    const { box } = line(f, text, { capHeight, tracking: mid });
    if (box.x2 - box.x1 > width) hi = mid; else lo = mid;
  }
  return lo;
}

// ---- The cup, drawn on a 100-unit grid and placed over the original. Strokes, not fills, so they can draw on.
const CUP = {
  bowl: 'M10 70H90V80C90 105 72 124 50 124C28 124 10 105 10 80Z',
  handle: 'M90 74H104A10 10 0 0 1 104 94H89',
  // The space inside the bowl, for the fill when the bean lands.
  inside: 'M13 73H87V80C87 103 70.5 121 50 121C29.5 121 13 103 13 80Z',
  steam: [
    'M33.5 54c-5-6.7-5-13.3 0-20s5-13.3 0-20',
    'M51 54c-5-7.3-5-14.7 0-22s5-14.7 0-22',
    'M68.5 54c-5-6.7-5-13.3 0-20s5-13.3 0-20',
  ],
  stroke: 7,
  steamStroke: 5,
};

// ---- Stacked logo, in the original image's pixel space (1206 square). Measured from the JPG.
const CX = 602.5;
const houseTracking = fit(WORD_FONT, 'HOUSE', 108, 646);
const house = place(line(WORD_FONT, 'HOUSE', { capHeight: 108, tracking: houseTracking }), 605, 726);
const wickFit = place(line(WORD_FONT, 'WICK', { capHeight: 104, tracking: fit(WORD_FONT, 'WICK', 104, 515) }), 605.5, 577);
const tagCap = 22;
const parts = ['COFFEE', 'SANDWICHES', 'LUNCH'];
const tagTracking = 9.2;
const tagLines = parts.map((t) => line(TAG_FONT, t, { capHeight: tagCap, tracking: tagTracking }));
const gap = 52; // between a word and its bullet, each side
const widths = tagLines.map((l) => l.box.x2 - l.box.x1);
const total = widths.reduce((a, b) => a + b, 0) + gap * 4;
let tx = CX - total / 2;
const tagPaths = [];
const bullets = [];
tagLines.forEach((l, i) => {
  tagPaths.push(place(l, tx + widths[i] / 2, 872).d);
  tx += widths[i];
  if (i < tagLines.length - 1) {
    bullets.push(r(tx + gap));
    tx += gap * 2;
  }
});
const CUP_T = { x: 540.4, y: 282.6, s: 1.13 };
const DASH = { x: 549, y: 774.5, w: 107, h: 7.5 };
const VIEWBOX = '190 270 830 630';

// ---- Header lockup: cup then WICK HOUSE on one line, on a grid where the capitals are 100 units tall.
const lockWords = line(WORD_FONT, 'WICK HOUSE', { capHeight: 100, tracking: 22 });
const lockCupScale = 1.35;
const lockCupW = 116 * lockCupScale; // bowl plus handle reach
const lockGap = 44;
const lockText = place(lockWords, lockCupW + lockGap + (lockWords.box.x2 - lockWords.box.x1) / 2 - 2, 100);
const lockCup = { x: -10 * lockCupScale + 2, y: 100 - 126 * lockCupScale, s: lockCupScale };
const LOCKUP = {
  viewBox: `0 ${r(lockCup.y + 8 * lockCupScale - 4)} ${r(lockText.x2 + 4)} ${r(100 - (lockCup.y + 8 * lockCupScale - 4) + 4)}`,
  cup: lockCup,
  text: lockText.d,
};

const data = {
  colors: { ink: COLORS.forest },
  cup: CUP,
  stacked: {
    viewBox: VIEWBOX,
    cup: CUP_T,
    wick: wickFit.d,
    house: house.d,
    dash: DASH,
    tagline: tagPaths,
    bullets: bullets.map((x) => ({ cx: x, cy: 872 - tagCap / 2, r: 3.4 })),
  },
  lockup: LOCKUP,
};

fs.mkdirSync(path.join(ROOT, 'src/brand'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'src/brand/logo-data.json'), `${JSON.stringify(data, null, 1)}\n`);

// The standalone SVG files are rendered by the same functions the pages use.
const { stackedLogo, cupMark } = await import('../src/brand/logo.mjs');
fs.writeFileSync(path.join(ROOT, 'src/brand/logo.svg'), `<?xml version="1.0" encoding="UTF-8"?>\n${stackedLogo({ standalone: true, background: COLORS.cream })}\n`);
fs.writeFileSync(path.join(ROOT, 'src/brand/favicon.svg'), `${cupMark({ favicon: true })}\n`);
console.log(`Logo written. HOUSE tracking ${r(houseTracking)}, tagline width ${r(total)}.`);
