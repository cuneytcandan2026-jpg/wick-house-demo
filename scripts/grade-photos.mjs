// Crops and colour-grades every photo listed in src/data/photos.mjs, from assets/raw/ into assets/img/<key>.jpg.
// Run with `npm run photos` after adding or changing a source. The build then makes AVIF/WebP sizes from assets/img.
//
// The grade is what makes stock and AI shots read as one shoot:
//   - slight desaturation, so no single photo shouts
//   - split tone: shadows pulled toward the brand's forest green, highlights warmed toward cream
//   - a matte finish: blacks lifted a touch, whites rolled off so nothing is pure #fff
//   - fine luminance grain, strongest in the mid-tones
// 'full' applies all of it; 'light' (AI shots, already lit to the brief) applies the matte and grain at lower strength.
// The noise is seeded per photo, so re-running produces identical files and git sees no change.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import { PHOTOS } from '../src/data/photos.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const RAW = path.join(ROOT, 'assets/raw');
const OUT = path.join(ROOT, 'assets/img');

const GRADES = {
  full: { saturation: 0.86, split: 1, matte: 1, grain: 0.022 },
  light: { saturation: 0.97, split: 0.35, matte: 0.6, grain: 0.016 },
};

// Offsets in 0..1 RGB, scaled by how dark or light each pixel is.
const SHADOW_TINT = [-0.022, 0.012, -0.006]; // toward forest #1E2B22
const HIGHLIGHT_TINT = [0.02, 0.008, -0.026]; // toward cream #F5F0E3
const BLACK_LIFT = 0.035;
const WHITE_CEILING = 0.972;

// Small deterministic PRNG (mulberry32) and a Box-Muller normal, so grain is repeatable.
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const seedFrom = (text) => [...text].reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 16777619), 2166136261);

function grade(data, channels, settings, seed) {
  const random = rng(seed);
  const { saturation, split, matte, grain } = settings;
  const lift = BLACK_LIFT * matte;
  const range = 1 - lift - (1 - WHITE_CEILING) * matte;
  let spare = null;
  const normal = () => {
    if (spare !== null) { const v = spare; spare = null; return v; }
    const u = Math.max(random(), 1e-9), v = random();
    const r = Math.sqrt(-2 * Math.log(u));
    spare = r * Math.sin(2 * Math.PI * v);
    return r * Math.cos(2 * Math.PI * v);
  };

  for (let i = 0; i < data.length; i += channels) {
    let r = data[i] / 255, g = data[i + 1] / 255, b = data[i + 2] / 255;
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;

    r = lum + (r - lum) * saturation;
    g = lum + (g - lum) * saturation;
    b = lum + (b - lum) * saturation;

    const shadow = (1 - lum) ** 2 * split;
    const highlight = lum ** 2 * split;
    r += SHADOW_TINT[0] * shadow + HIGHLIGHT_TINT[0] * highlight;
    g += SHADOW_TINT[1] * shadow + HIGHLIGHT_TINT[1] * highlight;
    b += SHADOW_TINT[2] * shadow + HIGHLIGHT_TINT[2] * highlight;

    r = lift + r * range;
    g = lift + g * range;
    b = lift + b * range;

    // Grain peaks in the mid-tones (4·l·(1−l)) and fades in deep shadow and bright highlight.
    const n = normal() * grain * (0.35 + 2.6 * lum * (1 - lum));
    data[i] = Math.round(Math.min(1, Math.max(0, r + n)) * 255);
    data[i + 1] = Math.round(Math.min(1, Math.max(0, g + n)) * 255);
    data[i + 2] = Math.round(Math.min(1, Math.max(0, b + n)) * 255);
  }
}

const POSITIONS = { centre: 'centre', north: 'north', south: 'south', east: 'east', west: 'west' };

async function crop(image, meta, photo) {
  let width = meta.width, height = meta.height;
  if (photo.extract) {
    image = image.extract(photo.extract);
    ({ width, height } = photo.extract);
  }
  if (!photo.ratio) return { image: image.resize({ width: Math.min(photo.width, width) }), width, height };

  const [rw, rh] = photo.ratio;
  const outWidth = Math.min(photo.width, width, Math.floor((height * rw) / rh));
  const outHeight = Math.round((outWidth * rh) / rw);
  const focus = photo.focus || 'centre';
  if (typeof focus === 'object') {
    // Manual anchor: pick the largest box of the right ratio, centred on the given point, then scale.
    const boxW = Math.min(width, Math.floor((height * rw) / rh));
    const boxH = Math.round((boxW * rh) / rw);
    const left = Math.round(Math.min(width - boxW, Math.max(0, focus.left * width - boxW / 2)));
    const top = Math.round(Math.min(height - boxH, Math.max(0, focus.top * height - boxH / 2)));
    image = sharp(await image.toBuffer()).extract({ left, top, width: boxW, height: boxH }).resize(outWidth, outHeight);
  } else {
    const position = focus === 'attention' ? sharp.strategy.attention : POSITIONS[focus];
    image = image.resize(outWidth, outHeight, { fit: 'cover', position });
  }
  return { image, width: outWidth, height: outHeight };
}

const only = process.argv.slice(2);
fs.mkdirSync(OUT, { recursive: true });
const SIZES_FILE = path.join(ROOT, 'src/data/photo-sizes.json');
const sizes = fs.existsSync(SIZES_FILE) ? JSON.parse(fs.readFileSync(SIZES_FILE, 'utf8')) : {};
let count = 0;
for (const [key, photo] of Object.entries(PHOTOS)) {
  if (only.length && !only.includes(key)) continue;
  const input = path.join(RAW, photo.src);
  if (!fs.existsSync(input)) {
    console.error(`missing source for ${key}: ${path.relative(ROOT, input)}`);
    process.exitCode = 1;
    continue;
  }
  const source = sharp(input).rotate();
  const meta = await source.metadata();
  const { image } = await crop(source.removeAlpha().toColourspace('srgb'), meta, photo);
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  if (GRADES[photo.grade]) grade(data, info.channels, GRADES[photo.grade], seedFrom(key));

  const quality = photo.grade === 'none' ? 92 : 88;
  await sharp(data, { raw: info }).jpeg({ quality, mozjpeg: true, chromaSubsampling: '4:4:4' }).toFile(path.join(OUT, `${key}.jpg`));
  sizes[key] = { width: info.width, height: info.height };
  console.log(`${key.padEnd(24)} ${info.width}x${info.height}  ${photo.grade}`);
  count++;
}
// Drop entries for photos removed from the manifest, keep the order stable, and write the sizes picture() reads.
const ordered = Object.fromEntries(Object.keys(PHOTOS).filter((k) => sizes[k]).map((k) => [k, sizes[k]]));
fs.writeFileSync(SIZES_FILE, `${JSON.stringify(ordered, null, 2)}\n`);
console.log(`Graded ${count} photo${count === 1 ? '' : 's'} into assets/img. Sizes in src/data/photo-sizes.json.`);
