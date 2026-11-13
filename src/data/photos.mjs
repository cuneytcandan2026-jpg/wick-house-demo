// Every photo on the site, in one place. `npm run photos` reads this file, crops and grades each
// source in assets/raw/ into assets/img/<key>.jpg, and the build turns those into AVIF/WebP sizes.
// Pages never point at a file directly: they call picture('<key>') from src/templates/picture.mjs.
//
// Fields:
//   src     source file under assets/raw/
//   ratio   output crop, [w, h]. Two ratios across the whole shoot: 4:5 portrait and 3:2 landscape.
//   width   output width in px (never larger than the source allows)
//   focus   crop anchor for sharp: 'centre', 'north', 'south', 'east', 'west', 'attention', or {left, top} in 0..1
//   extract optional pre-crop rectangle on the source {left, top, width, height}, applied before `ratio`
//   grade   'full' (stock: shared colour grade + grain), 'light' (AI shots: grain and matte only), 'none' (real posts)
//   source  'ai' | 'stock' | 'mural' | 'instagram'. Stock entries carry a credit for docs/CREDITS.md.
//
// AI shots are illustrative PLACEHOLDERS for the pitch, not photos of Wick House's food.

export const PHOTOS = {
  // Higgsfield (Nano Banana 2), November 2026. Prompts are recorded in docs/CREDITS.md.
  'hero-porchetta': {
    src: 'ai/hero-porchetta.jpg', ratio: [3, 2], width: 2400, focus: 'centre', grade: 'light', source: 'ai',
    alt: 'A porchetta ciabatta cut in half, with salsa verde and rocket, on a linen napkin on a marble counter in front of dark green tiles',
  },
  'mortadella-focaccia': {
    src: 'ai/mortadella-focaccia.jpg', ratio: [4, 5], width: 928, focus: 'centre', grade: 'light', source: 'ai',
    alt: 'A rosemary focaccia sandwich filled with mortadella, burrata and pistachio pesto, topped with crushed pistachios',
  },
  'freddo-espresso': {
    src: 'ai/freddo-espresso.jpg', ratio: [4, 5], width: 928, focus: 'centre', grade: 'light', source: 'ai',
    alt: 'A tall glass of freddo espresso over ice with a thick layer of foam and a striped paper straw',
  },
  'souvlaki-pita': {
    src: 'ai/souvlaki-pita.jpg', ratio: [4, 5], width: 928, focus: 'centre', grade: 'light', source: 'ai',
    alt: 'A toasted pita wrapped in paper, filled with chicken souvlaki, tzatziki, red onion and tomato, with a lemon wedge',
  },
  'caprese-ciabatta': {
    src: 'ai/caprese-ciabatta.jpg', ratio: [4, 5], width: 928, focus: 'centre', grade: 'light', source: 'ai',
    alt: 'A ciabatta filled with tomato, buffalo mozzarella and fresh basil on a linen napkin',
  },
  'flat-white': {
    src: 'ai/flat-white.jpg', ratio: [4, 5], width: 928, focus: 'centre', grade: 'light', source: 'ai',
    alt: 'A flat white with leaf latte art in a cream cup and saucer on a marble counter',
  },

  // Pexels stock, graded to match the shoot. Free under the Pexels licence; credited anyway.
  'interior-green-bar': {
    src: 'stock/pexels-9511004.jpg', ratio: [4, 5], width: 1400, focus: 'south', grade: 'full', source: 'stock',
    alt: 'A cafe bar with a counter faced in dark green tiles, pendant lights and open shelving',
    credit: { by: 'Mimi Di Cianni', url: 'https://www.pexels.com/photo/bar-counter-of-a-restaurant-with-green-tiles-9511004/' },
  },
  'interior-coffee-counter': {
    src: 'stock/pexels-34673909.jpg', ratio: [4, 5], width: 1400, focus: 'centre', grade: 'full', source: 'stock',
    alt: 'An espresso machine on a pale counter with a sage green fluted front and globe pendant lights',
    credit: { by: 'betül nur akyürek', url: 'https://www.pexels.com/photo/modern-coffee-shop-interior-with-green-accents-34673909/' },
  },
  'interior-window-seats': {
    src: 'stock/pexels-18338620.jpg', ratio: [4, 5], width: 1400, focus: 'centre', grade: 'full', source: 'stock',
    alt: 'A cafe interior with green tiled walls, a counter and seats by the windows',
    credit: { by: 'Gül Işık', url: 'https://www.pexels.com/photo/counter-and-seats-by-windows-in-restaurant-18338620/' },
  },
  'latte-pour': {
    src: 'stock/pexels-30446269.jpg', ratio: [4, 5], width: 1400, focus: 'centre', grade: 'full', source: 'stock',
    alt: 'A barista pouring steamed milk into a cup to make latte art',
    credit: { by: 'cole yap', url: 'https://www.pexels.com/photo/close-up-of-barista-pouring-latte-art-coffee-30446269/' },
  },
  'espresso-shot': {
    src: 'stock/pexels-9050518.jpg', ratio: [4, 5], width: 1400, focus: 'centre', grade: 'full', source: 'stock',
    alt: 'A shot of espresso in a small glass on a scale beneath the machine',
    credit: { by: 'Mike Jones', url: 'https://www.pexels.com/photo/close-up-of-a-shot-of-espresso-9050518/' },
  },
  cannoli: {
    src: 'stock/pexels-7474117.jpg', ratio: [3, 2], width: 1400, focus: 'centre', grade: 'full', source: 'stock',
    alt: 'Cannoli filled with ricotta cream and dusted with icing sugar',
    credit: { by: 'Valeria Boltneva', url: 'https://www.pexels.com/photo/yummy-cannoli-dessert-on-plate-7474117/' },
  },
  tiramisu: {
    src: 'stock/pexels-754954.jpg', ratio: [3, 2], width: 1400, focus: 'centre', grade: 'full', source: 'stock',
    alt: 'A tiramisu in a glass, dusted with cocoa, beside a coffee',
    credit: { by: 'Alex Tim', url: 'https://www.pexels.com/photo/tiramisu-and-coffee-754954/' },
  },
  baklava: {
    src: 'stock/pexels-20183046.jpg', ratio: [3, 2], width: 1400, focus: 'centre', grade: 'full', source: 'stock',
    alt: 'Close-up of baklava with layers of filo and a pistachio filling',
    credit: { by: 'Valeria Boltneva', url: 'https://www.pexels.com/photo/close-up-of-baklava-pieces-on-a-plate-20183046/' },
  },

  // Stills from the mural reel on @wickhouselondon. Cropped above the screen-recording cursor and mute icon.
  'mural-sign': {
    src: 'mural/frame-2.3.png', extract: { left: 0, top: 10, width: 944, height: 415 }, ratio: [944, 415], width: 944,
    focus: 'centre', grade: 'none', source: 'mural',
    alt: 'The Wick House mural: "Wick House, coffee and food" painted in cream script on a dark green brick wall with purple and white flowers',
  },
  'mural-flowers': {
    src: 'mural/frame-0.3.png', extract: { left: 60, top: 10, width: 400, height: 415 }, ratio: [400, 415], width: 400,
    focus: 'centre', grade: 'none', source: 'mural',
    alt: 'Detail of the mural: purple lilies and white star flowers painted on dark green brick',
  },
  'mural-wide': {
    src: 'mural/frame-3.3.png', extract: { left: 0, top: 10, width: 944, height: 415 }, ratio: [944, 415], width: 944,
    focus: 'centre', grade: 'none', source: 'mural',
    alt: 'The Wick House mural on the side of the building, with autumn trees above the roofline',
  },

  // The real Instagram posts, used as they are. The opening poster file is a screenshot, so it is
  // trimmed to the poster itself (Instagram's comment panel removed); the artwork is untouched.
  'post-opening-soon': {
    src: '../../Instagram Post.png', extract: { left: 6, top: 4, width: 560, height: 748 }, ratio: null, width: 560,
    grade: 'none', source: 'instagram',
    alt: 'Wick House "Opening Soon" poster: specialty coffee, premium sandwiches. Good food. Great vibes. Coming your way!',
  },
  'post-hiring': {
    src: '../../WickHouseHiringPost.png', extract: { left: 0, top: 0, width: 748, height: 736 }, ratio: null, width: 748,
    grade: 'none', source: 'instagram',
    alt: 'Wick House hiring post: join our coffee shop team, working hours 7:00 AM to 1:00 PM, apply by sending a DM',
  },
};
