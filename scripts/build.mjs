// Static site build into dist/. GitHub Actions runs this and publishes dist/ to the hostinger branch.
// Set OUT_DIR to build somewhere else.
import { execFileSync } from 'child_process';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import esbuild from 'esbuild';
import sharp from 'sharp';
import { page } from '../src/templates/layout.mjs';
import { stackedLogo } from '../src/brand/logo.mjs';
import { widthsFor } from '../src/templates/picture.mjs';
import { COLORS } from '../src/data/brand.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.resolve(process.env.OUT_DIR || path.join(ROOT, 'dist'));
const IMG_SOURCE = path.join(ROOT, 'assets/img');
const IMG_OUT = path.join(OUT, 'assets/img');

// Every page, with the file it is written to. Folders give clean URLs (/menu/).
const PAGES = { home: 'index.html', menu: 'menu/index.html' };

const hash = (data) => crypto.createHash('sha256').update(data).digest('hex').slice(0, 10);

function writeHashed(dir, name, ext, data) {
  const folder = path.join(OUT, dir);
  fs.mkdirSync(folder, { recursive: true });
  for (const f of fs.readdirSync(folder)) {
    if (new RegExp(`^${name}\\.[0-9a-f]{10}\\.${ext}$`).test(f)) fs.unlinkSync(path.join(folder, f));
  }
  const filename = `${name}.${hash(data)}.${ext}`;
  fs.writeFileSync(path.join(folder, filename), data);
  return filename;
}

function buildCss() {
  const tmp = path.join(ROOT, 'node_modules/.cache-site.css');
  execFileSync(process.execPath, [
    path.join(ROOT, 'node_modules/tailwindcss/lib/cli.js'),
    '-c', path.join(ROOT, 'tailwind.config.cjs'),
    '-i', path.join(ROOT, 'src/css/site.css'),
    '-o', tmp,
    '--minify',
  ], { stdio: ['ignore', 'ignore', 'inherit'], cwd: ROOT });
  const css = fs.readFileSync(tmp, 'utf8');
  fs.unlinkSync(tmp);
  // The stylesheet is inlined into each page: on a phone that saves the render-blocking round trip
  // before the hero can paint (about 16 KB gzipped, and the site has only two pages).
  fs.rmSync(path.join(OUT, 'assets/css'), { recursive: true, force: true });
  if (/<\/style/i.test(css)) throw new Error('site.css contains "</style", which would end the inline <style> early.');
  return css;
}

// Every file in src/js becomes its own minified, hashed script. Pages list the ones they need.
async function buildJs() {
  const js = {};
  for (const file of fs.readdirSync(path.join(ROOT, 'src/js')).filter((f) => f.endsWith('.js'))) {
    const name = file.replace(/\.js$/, '');
    const source = fs.readFileSync(path.join(ROOT, 'src/js', file), 'utf8');
    const { code } = await esbuild.transform(source, { minify: true, target: 'es2019' });
    js[name] = writeHashed('assets/js', name, 'js', code);
  }
  return js;
}

function copyFonts() {
  const dir = path.join(OUT, 'assets/fonts');
  fs.mkdirSync(dir, { recursive: true });
  const fonts = {
    'manrope-400.woff2': '@fontsource/manrope/files/manrope-latin-400-normal.woff2',
    'manrope-600.woff2': '@fontsource/manrope/files/manrope-latin-600-normal.woff2',
    'manrope-700.woff2': '@fontsource/manrope/files/manrope-latin-700-normal.woff2',
    'jost-400.woff2': '@fontsource/jost/files/jost-latin-400-normal.woff2',
    'jost-500.woff2': '@fontsource/jost/files/jost-latin-500-normal.woff2',
    'caveat-600.woff2': '@fontsource/caveat/files/caveat-latin-600-normal.woff2',
  };
  for (const [name, source] of Object.entries(fonts)) fs.copyFileSync(path.join(ROOT, 'node_modules', source), path.join(dir, name));
}

const isFresh = (output, input) => fs.existsSync(output) && fs.statSync(output).mtimeMs >= fs.statSync(input).mtimeMs;

// Graded photos in assets/img (made by `npm run photos`) become AVIF and WebP at the widths picture() lists.
// Skipped when the output is newer than its source.
async function buildPhotos() {
  if (!fs.existsSync(IMG_SOURCE)) return 0;
  const out = path.join(IMG_OUT, 'r');
  fs.mkdirSync(out, { recursive: true });
  const sources = fs.readdirSync(IMG_SOURCE).filter((f) => /\.(jpe?g|png|webp)$/i.test(f));
  for (const file of sources) {
    const input = path.join(IMG_SOURCE, file);
    const base = file.replace(/\.[^.]+$/, '');
    const { width: sourceWidth } = await sharp(input).metadata();
    for (const width of widthsFor(sourceWidth)) {
      const webp = path.join(out, `${base}-${width}.webp`);
      const avif = path.join(out, `${base}-${width}.avif`);
      if (!isFresh(webp, input)) await sharp(input).resize({ width, withoutEnlargement: true }).webp({ quality: 74, effort: 6 }).toFile(webp);
      if (!isFresh(avif, input)) await sharp(input).resize({ width, withoutEnlargement: true }).avif({ quality: 52, effort: 6 }).toFile(avif);
    }
  }
  return sources.length;
}

// Favicons and the share image, all drawn from the vector logo.
async function buildBrand() {
  fs.mkdirSync(path.join(IMG_OUT, 'og'), { recursive: true });
  const favicon = path.join(ROOT, 'src/brand/favicon.svg');
  fs.copyFileSync(favicon, path.join(IMG_OUT, 'favicon.svg'));
  await sharp(favicon, { density: 300 }).resize(32, 32).png().toFile(path.join(IMG_OUT, 'favicon-32.png'));
  await sharp(favicon, { density: 300 }).resize(180, 180).png().toFile(path.join(IMG_OUT, 'apple-touch-icon.png'));
  fs.copyFileSync(path.join(ROOT, 'src/brand/logo.svg'), path.join(IMG_OUT, 'logo.svg'));

  // Share card: the stacked logo on a cream panel beside the hero photo (logo only if the photo is missing).
  const og = path.join(IMG_OUT, 'og/home.jpg');
  const hero = path.join(IMG_SOURCE, 'hero-porchetta.jpg');
  if (fs.existsSync(hero)) {
    const logo = stackedLogo({ standalone: true }).replace('<svg ', '<svg width="400" height="304" ');
    const panel = `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="630"><rect width="500" height="630" fill="${COLORS.cream}"/><rect x="24" y="24" width="452" height="582" fill="none" stroke="${COLORS.gold}" stroke-width="2"/><g transform="translate(50 163)">${logo}</g></svg>`;
    const photo = await sharp(hero).resize(700, 630, { fit: 'cover', position: 'east' }).toBuffer();
    await sharp({ create: { width: 1200, height: 630, channels: 3, background: COLORS.cream } })
      .composite([{ input: Buffer.from(panel), left: 0, top: 0 }, { input: photo, left: 500, top: 0 }])
      .jpeg({ quality: 82, mozjpeg: true }).toFile(og);
  } else {
    const logo = stackedLogo({ standalone: true }).replace('<svg ', '<svg width="560" height="425" ');
    const card = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="${COLORS.cream}"/><rect x="24" y="24" width="1152" height="582" fill="none" stroke="${COLORS.gold}" stroke-width="2"/><g transform="translate(320 102)">${logo}</g></svg>`;
    await sharp(Buffer.from(card)).jpeg({ quality: 82, mozjpeg: true }).toFile(og);
  }
}

// A demo: crawlers may fetch pages (so they can see noindex) but nothing should be indexed.
const ROBOTS = `# Wick House demo site. Pages carry noindex until launch.
User-agent: *
Allow: /
`;

// Hostinger serves through LiteSpeed/Apache, which reads this file.
const HTACCESS = `# Generated by scripts/build.mjs
Options -Indexes
DirectorySlash On

<IfModule mod_headers.c>
  # Demo: keep every page out of search results until launch.
  Header set X-Robots-Tag "noindex, nofollow"
  Header set X-Content-Type-Options "nosniff"
  Header set Referrer-Policy "strict-origin-when-cross-origin"
  # Hashed assets never change, so they can be cached for a year. HTML is always rechecked.
  <FilesMatch "\\.[0-9a-f]{10}\\.(css|js)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </FilesMatch>
  <FilesMatch "\\.(woff2|webp|avif|svg|png|jpg)$">
    Header set Cache-Control "public, max-age=2592000"
  </FilesMatch>
  <FilesMatch "\\.html$">
    Header set Cache-Control "no-cache"
  </FilesMatch>
</IfModule>
`;

fs.mkdirSync(OUT, { recursive: true });
copyFonts();
await buildBrand();
const photos = await buildPhotos();
const assets = { css: buildCss(), js: await buildJs() };

for (const [name, file] of Object.entries(PAGES)) {
  const { default: definition } = await import(pathToFileURL(path.join(ROOT, `src/pages/${name}.mjs`)).href);
  const html = page(definition, assets);
  fs.mkdirSync(path.dirname(path.join(OUT, file)), { recursive: true });
  fs.writeFileSync(path.join(OUT, file), html);
}
fs.writeFileSync(path.join(OUT, 'robots.txt'), ROBOTS);
fs.writeFileSync(path.join(OUT, '.htaccess'), HTACCESS);
console.log(`Built ${Object.keys(PAGES).length} pages and ${photos} photos to ${path.relative(ROOT, OUT) || '.'}. CSS ${(assets.css.length / 1024).toFixed(0)} KB inlined.`);
