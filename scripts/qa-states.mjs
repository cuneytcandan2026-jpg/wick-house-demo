// Phase 6 QA for states a full-page screenshot never shows: the mobile menu sheet, the offer
// success message, the gallery lightbox and the order pad. Each state gets a viewport screenshot
// in ./temporary screenshots/ and an axe-core run. Needs the dev server: node serve.mjs
//   node scripts/qa-states.mjs [baseUrl] [width]
import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const axeSource = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const base = (process.argv[2] || 'http://localhost:3000').replace(/\/$/, '');
const width = Number(process.argv[3] || 390);
const dir = './temporary screenshots';
fs.mkdirSync(dir, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
let failures = 0;

async function check(page, label) {
  await wait(700);
  await page.screenshot({ path: path.join(dir, `state-${width}-${label}.png`) });
  await page.addScriptTag({ content: axeSource });
  const violations = await page.evaluate(async () => (await window.axe.run(document, { resultTypes: ['violations'] })).violations
    .map((v) => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.slice(0, 4).map((n) => n.target.join(' ')) })));
  const serious = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
  if (serious.length) failures++;
  const focus = await page.evaluate(() => {
    const el = document.activeElement;
    return el ? `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''} "${(el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 40)}"` : 'none';
  });
  console.log(`\n${label}: ${violations.length} violation(s), ${serious.length} serious. Focus on ${focus}`);
  for (const v of violations) console.log(`  [${v.impact}] ${v.id}: ${v.help}\n      ${v.nodes.join('\n      ')}`);
}

async function fresh(url) {
  const page = await browser.newPage();
  await page.setViewport({ width, height: width > 800 ? 900 : 844, deviceScaleFactor: 2, isMobile: width < 800, hasTouch: width < 800 });
  await page.goto(base + url, { waitUntil: 'networkidle0', timeout: 30000 });
  return page;
}

// 1. Mobile menu sheet
if (width < 1024) {
  const page = await fresh('/');
  await page.click('#menu-toggle');
  await check(page, 'nav-sheet');
  await page.keyboard.press('Escape');
  await wait(300);
  const back = await page.evaluate(() => document.activeElement && document.activeElement.id);
  console.log(`  Escape closes the sheet and returns focus to: ${back}`);
  await page.close();
}

// 2. Offer form: an error, then success
{
  const page = await fresh('/');
  await page.evaluate(() => document.getElementById('offer-form').scrollIntoView({ block: 'center' }));
  await wait(1200); // let the scroll reveal finish moving the card
  await page.click('#offer-form button[type="submit"]');
  await check(page, 'offer-error');
  await page.type('#offer-contact', 'sam@example.com');
  await page.click('#offer-form input[name="consent"]');
  await page.click('#offer-form button[type="submit"]');
  await check(page, 'offer-success');
  await page.close();
}

// 3. Gallery lightbox, then the next photo
{
  const page = await fresh('/');
  await page.evaluate(() => document.querySelector('.gallery-link').scrollIntoView({ block: 'center' }));
  await wait(400);
  await page.click('.gallery-link');
  await check(page, 'lightbox');
  await page.click('#lightbox-next');
  await check(page, 'lightbox-next');
  await page.keyboard.press('Escape');
  await page.close();
}

// 4. Order pad from a home card link, then a different day, then the review step
{
  const page = await fresh('/menu/?add=freddo-espresso#order');
  await check(page, 'pad-open');
  await page.evaluate(() => document.getElementById('pad-days').scrollIntoView({ block: 'center' }));
  const days = await page.$$('#pad-days input');
  if (days[1]) await days[1].click();
  await check(page, 'pad-when');
  await page.type('#pad-name', 'Sam');
  const next = await page.$('#pad-foot button:not([hidden])');
  if (next) await next.click();
  await check(page, 'pad-review');
  await page.close();
}

await browser.close();
console.log(failures ? `\n${failures} state(s) with serious violations.` : '\nNo serious violations in any state.');
process.exit(failures ? 1 : 0);
