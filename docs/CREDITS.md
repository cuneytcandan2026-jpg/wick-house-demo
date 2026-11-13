# Image credits

Every photo on the demo site, where it came from, and what was done to it. The machine-readable list is `src/data/photos.mjs`; this file is the human record.

All photos pass through `npm run photos` (`scripts/grade-photos.mjs`), which crops them to one of two ratios (4:5 portrait or 3:2 landscape) and applies the shared grade. The build then makes AVIF and WebP copies at 480, 800, 1400 and 2000px.

## AI-generated (Higgsfield)

These are illustrative placeholders made for the pitch. They are not photos of Wick House's food, and should be replaced with a real shoot before launch.

- Tool: Higgsfield, model Nano Banana 2. Generated 13 November 2026.
- Cost: 9.5 of the 10 credits budgeted. The hero was 2k (2 credits) and the others 1k (1.5 credits each).
- GPT Image 2.6 was tried first, but the Higgsfield free plan doesn't allow it.
- Grade: `light` (matte finish and grain only), because the shots were already lit to the brief.

All prompts share this art direction: *natural soft window light from the left, cream linen napkin on a pale marble counter, dark bottle-green glazed tiles and a brass rail softly out of focus behind, shallow depth of field, 50mm lens look, warm cream highlights, deep green shadows, gentle film grain, no text, logos or people.*

| Key | Subject | Ratio, size |
|---|---|---|
| `hero-porchetta` | Porchetta ciabatta cut in half, with salsa verde and rocket, and an iced coffee behind | 3:2, 2400×1600 |
| `mortadella-focaccia` | Rosemary focaccia with mortadella, burrata and pistachio pesto | 4:5, 921×1151 |
| `freddo-espresso` | Freddo espresso in a tall glass over ice, thick foam, paper straw | 4:5, 921×1151 |
| `souvlaki-pita` | Chicken souvlaki pita with tzatziki and red onion, half-wrapped in paper, lemon wedge | 4:5, 921×1151 |
| `caprese-ciabatta` | Caprese on ciabatta: tomato, buffalo mozzarella, basil | 4:5, 921×1151 |
| `flat-white` | Flat white with leaf latte art, cream cup and saucer | 4:5, 921×1151 |

## Stock (Pexels)

These are free to use under the [Pexels licence](https://www.pexels.com/license/). Attribution isn't required, but it is recorded here. Each was downloaded at 1800px and given the `full` grade: slight desaturation, forest-green shadows, cream highlights, a matte finish and grain.

| Key | Photo | Photographer |
|---|---|---|
| `interior-green-bar` | [Bar Counter of a Restaurant with Green Tiles](https://www.pexels.com/photo/bar-counter-of-a-restaurant-with-green-tiles-9511004/) | [Mimi Di Cianni](https://www.pexels.com/@mimi-di-cianni-105651170/) |
| `interior-coffee-counter` | [Modern Coffee Shop Interior with Green Accents](https://www.pexels.com/photo/modern-coffee-shop-interior-with-green-accents-34673909/) | [betül nur akyürek](https://www.pexels.com/@cileklipalet/) |
| `interior-window-seats` | [Counter and Seats by Windows in Restaurant](https://www.pexels.com/photo/counter-and-seats-by-windows-in-restaurant-18338620/) | [Gül Işık](https://www.pexels.com/@ekrulila/) |
| `latte-pour` | [Close-up of Barista Pouring Latte Art Coffee](https://www.pexels.com/photo/close-up-of-barista-pouring-latte-art-coffee-30446269/) | [cole yap](https://www.pexels.com/@cole-yap-2149136300/) |
| `espresso-shot` | [Close-up of a Shot of Espresso](https://www.pexels.com/photo/close-up-of-a-shot-of-espresso-9050518/) | [Mike Jones](https://www.pexels.com/@mike-jones/) |
| `cannoli` | [Yummy cannoli dessert on plate](https://www.pexels.com/photo/yummy-cannoli-dessert-on-plate-7474117/) | [Valeria Boltneva](https://www.pexels.com/@valeriya/) |
| `tiramisu` | [Tiramisu and Coffee](https://www.pexels.com/photo/tiramisu-and-coffee-754954/) | [Alex Tim](https://www.pexels.com/@alex-tim-249063/) |
| `baklava` | [Close-up of Baklava Pieces on a Plate](https://www.pexels.com/photo/close-up-of-baklava-pieces-on-a-plate-20183046/) | [Valeria Boltneva](https://www.pexels.com/@valeriya/) |

Unsplash was the first choice for stock, but it serves a browser check to scripted downloads, so the stock came from Pexels instead.

## Wick House's own material

- **Mural stills** (`mural-sign`, `mural-flowers`, `mural-wide`): frames taken with ffmpeg from `Instagrap Post Video.mp4`, the mural reel on @wickhouselondon, at 2.3s, 0.3s and 3.3s. The reel is a 944×534 screen recording. The crops remove its black top edge, the mouse cursor and the mute icon. The stills are not graded.
- **Instagram posts** (`post-opening-soon`, `post-hiring`): `Instagram Post.png` and `WickHouseHiringPost.png`, used as they are. The opening poster file is a screenshot, so it is trimmed to the poster itself and Instagram's comment panel is removed. The artwork is unchanged.

Before launch, confirm the owners are happy for their posts and mural to appear on the site, and get the mural artist's name for a credit.
