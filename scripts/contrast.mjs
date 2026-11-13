// WCAG contrast check for the brand palette. Run with: npm run contrast
// Every pairing the site uses for text is listed with what it is allowed to carry.
// AA needs 4.5:1 for body text and 3:1 for large text (24px, or 18.66px bold) and for UI parts like icons and borders.
import { COLORS } from '../src/data/brand.mjs';

const lum = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
export const ratio = (a, b) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

// [foreground, background, use]. "text" needs 4.5, "large" and "ui" need 3.
const PAIRS = [
  ['forest', 'cream', 'text'],
  ['forest', 'paper', 'text'],
  ['deepgreen', 'cream', 'text'],
  ['moss', 'cream', 'text'],
  ['golddark', 'cream', 'text'],
  ['golddark', 'paper', 'text'],
  ['lilacdark', 'cream', 'text'],
  ['golddark', 'cream', 'ui'],
  ['moss', 'cream', 'ui'],
  ['cream', 'forest', 'text'],
  ['cream', 'deepgreen', 'text'],
  ['gold', 'forest', 'text'],
  ['goldlight', 'forest', 'text'],
  ['sage', 'forest', 'text'],
  ['lilac', 'forest', 'large'],
  ['forest', 'gold', 'text'],
  ['forest', 'sage', 'text'],
];
const NEED = { text: 4.5, large: 3, ui: 3 };

let failed = 0;
for (const [fg, bg, use] of PAIRS) {
  const r = ratio(COLORS[fg], COLORS[bg]);
  const ok = r >= NEED[use];
  if (!ok) failed++;
  console.log(`${ok ? 'pass' : 'FAIL'}  ${r.toFixed(2).padStart(5)}:1  ${fg} on ${bg} (${use})`);
}
console.log('\nNot for text on cream: gold, sage, lilac (decoration only).');
for (const c of ['gold', 'sage', 'lilac']) console.log(`  ${c} on cream ${ratio(COLORS[c], COLORS.cream).toFixed(2)}:1`);
if (failed) { console.error(`\n${failed} pairing(s) fail.`); process.exit(1); }
