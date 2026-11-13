// Phase 6 QA: axe-core on every page at desktop and phone widths, plus a
// horizontal-overflow check at 360px. Needs the dev server: node serve.mjs
//   node scripts/qa.mjs [baseUrl]
import puppeteer from 'puppeteer-core';
import fs from 'fs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const axeSource = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

const base = (process.argv[2] || 'http://localhost:3000').replace(/\/$/, '');
const pages = ['/', '/menu/'];
const widths = [1440, 390, 360];

const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

let failures = 0;

for (const p of pages) {
  for (const width of widths) {
    const page = await browser.newPage();
    await page.setViewport({ width, height: width > 800 ? 900 : 800 });
    await page.goto(base + p, { waitUntil: 'networkidle0', timeout: 30000 });

    // Scroll through so reveals and lazy images settle, as a visitor would.
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) {
        window.scrollTo(0, y);
        await new Promise(r => setTimeout(r, 60));
      }
      window.scrollTo(0, 0);
      await new Promise(r => setTimeout(r, 800));
    });

    // Horizontal overflow: the page, and which elements stick out past the viewport.
    const overflow = await page.evaluate(() => {
      const vw = document.documentElement.clientWidth;
      const offenders = [];
      for (const el of document.querySelectorAll('body *')) {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;
        if (r.right > vw + 1 || r.left < -1) {
          // Skip elements inside an ancestor that clips them.
          let clipped = false;
          for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
            const s = getComputedStyle(a);
            if (/(hidden|clip|auto|scroll)/.test(s.overflowX)) { clipped = true; break; }
          }
          if (!clipped) offenders.push(`${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}.${[...el.classList].slice(0, 3).join('.')} [${Math.round(r.left)}, ${Math.round(r.right)}]`);
        }
      }
      return { scrollWidth: document.documentElement.scrollWidth, vw, offenders: offenders.slice(0, 10) };
    });

    await page.addScriptTag({ content: axeSource });
    const result = await page.evaluate(async () => {
      const r = await window.axe.run(document, { resultTypes: ['violations'] });
      return r.violations.map(v => ({
        id: v.id,
        impact: v.impact,
        help: v.help,
        nodes: v.nodes.slice(0, 5).map(n => n.target.join(' ') + (n.failureSummary ? ' :: ' + n.failureSummary.split('\n').slice(1, 2).join(' ').trim() : '')),
        count: v.nodes.length,
      }));
    });

    const serious = result.filter(v => v.impact === 'serious' || v.impact === 'critical');
    const scrolls = overflow.scrollWidth > overflow.vw;
    if (serious.length || scrolls) failures++;

    console.log(`\n${p} @ ${width}px: ${result.length} axe violation(s), ${serious.length} serious/critical; scrollWidth ${overflow.scrollWidth} vs ${overflow.vw}${scrolls ? '  << HORIZONTAL SCROLL' : ''}`);
    for (const v of result) {
      console.log(`  [${v.impact}] ${v.id} (${v.count}): ${v.help}`);
      for (const n of v.nodes) console.log(`      ${n}`);
    }
    if (overflow.offenders.length) {
      console.log('  Elements past the viewport edge:');
      for (const o of overflow.offenders) console.log(`      ${o}`);
    }
    await page.close();
  }
}

await browser.close();
console.log(failures ? `\n${failures} check(s) failed.` : '\nAll checks passed.');
process.exit(failures ? 1 : 0);
