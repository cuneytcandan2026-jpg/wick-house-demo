// Renders the Wick House logo from src/brand/logo-data.json (made by scripts/make-logo.mjs).
// In pages the ink is currentColor, so the same mark works on cream and on forest.
// Class names are hooks for the bean journey: .logo-cup-fill, .logo-steam path, .logo-wordmark, .logo-dash.
import fs from 'fs';

const L = JSON.parse(fs.readFileSync(new URL('./logo-data.json', import.meta.url), 'utf8'));
const { cup } = L;

const cupParts = ({ ink, steam = true, fill = false }) => `${steam ? `<g class="logo-steam" fill="none" stroke="${ink}" stroke-width="${cup.steamStroke}" stroke-linecap="round">${cup.steam.map((d, i) => `<path class="logo-steam-${i + 1}" d="${d}" pathLength="1"/>`).join('')}</g>` : ''}
<path class="logo-cup-fill" d="${cup.inside}" fill="${fill ? ink : 'none'}"/>
<g class="logo-cup" fill="none" stroke="${ink}" stroke-width="${cup.stroke}" stroke-linejoin="round" stroke-linecap="round"><path d="${cup.bowl}"/><path d="${cup.handle}"/></g>`;

const a11y = (title) => (title ? `role="img" aria-label="${title}"` : 'aria-hidden="true" focusable="false"');

// The full stacked logo: steam, cup, WICK / HOUSE, dash and tagline.
export function stackedLogo({ cls = '', title = 'Wick House', standalone = false, background = '', tagline = true } = {}) {
  const s = L.stacked;
  const ink = standalone ? L.colors.ink : 'currentColor';
  const [vx, vy, vw, vh] = s.viewBox.split(' ').map(Number);
  const box = tagline ? s.viewBox : `${vx} ${vy} ${vw} ${s.dash.y + s.dash.h + 24 - vy}`;
  return `<svg ${standalone ? 'xmlns="http://www.w3.org/2000/svg" ' : ''}class="logo logo-stacked ${cls}" viewBox="${box}" ${a11y(title)}>${background ? `<rect x="${vx}" y="${vy}" width="${vw}" height="${vh}" fill="${background}"/>` : ''}
<g class="logo-mark" transform="translate(${s.cup.x} ${s.cup.y}) scale(${s.cup.s})">${cupParts({ ink })}</g>
<g class="logo-wordmark" fill="${ink}"><path d="${s.wick}"/><path d="${s.house}"/></g>
<rect class="logo-dash" x="${s.dash.x}" y="${s.dash.y}" width="${s.dash.w}" height="${s.dash.h}" fill="${ink}"/>
${tagline ? `<g class="logo-tagline" fill="${ink}">${s.tagline.map((d) => `<path d="${d}"/>`).join('')}${s.bullets.map((b) => `<circle cx="${b.cx}" cy="${b.cy}" r="${b.r}"/>`).join('')}</g>` : ''}
</svg>`;
}

// One line, for the header: the cup then WICK HOUSE.
export function lockup({ cls = '', title = '' } = {}) {
  const { viewBox, cup: c, text } = L.lockup;
  return `<svg class="logo logo-lockup ${cls}" viewBox="${viewBox}" ${a11y(title)}><g transform="translate(${c.x} ${c.y}) scale(${c.s})">${cupParts({ ink: 'currentColor' })}</g><path fill="currentColor" d="${text}"/></svg>`;
}

// The cup on its own. As a favicon it sits cream-on-forest in a rounded square, which holds up at 16px.
export function cupMark({ cls = '', favicon = false, steam = true } = {}) {
  if (favicon) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><rect width="128" height="128" rx="28" fill="${L.colors.ink}"/><g transform="translate(11 -1) scale(0.86)">${cupParts({ ink: '#F5F0E3' }).replace(`stroke-width="${cup.stroke}"`, 'stroke-width="9"').replace(`stroke-width="${cup.steamStroke}"`, 'stroke-width="7"')}</g></svg>`;
  }
  return `<svg class="logo logo-cup-mark ${cls}" viewBox="4 ${steam ? 4 : 64} 116 ${steam ? 126 : 66}" aria-hidden="true" focusable="false">${cupParts({ ink: 'currentColor', steam })}</svg>`;
}
