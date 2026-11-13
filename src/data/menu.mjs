// The whole menu. Every page that shows a dish or a price reads from here, so the real menu is a one-file swap.
//
// PLACEHOLDER MENU for the pitch: Italian and Greek dishes at typical London prices. Wick House has not published
// a menu yet. Replace names, descriptions and prices with the owner's own before launch.
//
// Item fields
//   id         stable slug, used by the order pad and for photos (assets/img/<img or id>)
//   price      pounds, as a string with pence
//   diet       'v' vegetarian, 'vg' vegan. Omit when the dish has meat or fish.
//   tags       short badges: 'new', 'signature', 'greek-classic'
//   home       where the homepage features it: 'signature', 'hot', 'cold'
//   featured   the one drink the coffee section leads with
//   img        photo name in assets/img when it differs from id (filled in Phase 2)
// Category fields
//   addons     priced extras the order pad offers on every item in the category

export const DIETS = {
  v: { label: 'Vegetarian', short: 'V' },
  vg: { label: 'Vegan', short: 'VG' },
};

export const TAGS = {
  new: 'New',
  signature: 'Signature',
  'greek-classic': 'Greek classic',
};

export const MENU = [
  {
    id: 'sandwiches',
    name: 'Signature Sandwiches',
    short: 'Sandwiches',
    intro: 'Focaccia and ciabatta baked fresh each morning, filled to order.',
    items: [
      { id: 'mortadella-focaccia', name: 'Mortadella & burrata focaccia', price: '11.50', desc: 'Mortadella, a whole burrata and pistachio pesto on rosemary focaccia.', tags: ['signature', 'new'], home: 'signature' },
      { id: 'porchetta-ciabatta', name: 'Porchetta ciabatta', price: '11.00', desc: 'Slow-roast porchetta, salsa verde and rocket in a toasted ciabatta.', tags: ['signature'], home: 'signature' },
      { id: 'prosciutto-fig', name: 'Prosciutto, mozzarella & fig', price: '10.50', desc: 'Prosciutto crudo, fior di latte and fig jam on focaccia.' },
      { id: 'caprese', name: 'Caprese', price: '9.00', desc: 'Heritage tomato, buffalo mozzarella, basil and good olive oil on focaccia.', diet: 'v', tags: ['signature'], home: 'signature' },
      { id: 'chicken-souvlaki', name: 'Chicken souvlaki pita', price: '10.50', desc: 'Charred lemon-oregano chicken, tzatziki, red onion and tomato in a warm pita.', tags: ['signature', 'greek-classic'], home: 'signature' },
      { id: 'greek-lamb', name: 'Greek lamb, feta & olive', price: '11.50', desc: 'Slow-cooked lamb, crumbled feta, kalamata olives and oregano on ciabatta.' },
      { id: 'halloumi-pepper', name: 'Halloumi, roast pepper & honey', price: '9.50', desc: 'Grilled halloumi, sweet roast peppers, rocket and a drizzle of thyme honey.', diet: 'v' },
      { id: 'roast-veg-hummus', name: 'Roast veg, hummus & tapenade', price: '9.00', desc: 'Roast courgette, aubergine and pepper with hummus and black olive tapenade.', diet: 'vg' },
    ],
  },
  {
    id: 'breakfast',
    name: 'Breakfast',
    short: 'Breakfast',
    intro: 'Served until 11:30am.',
    items: [
      { id: 'egg-pancetta', name: 'Egg & pancetta focaccia', price: '7.50', desc: 'Soft fried egg, crispy pancetta and a little chilli butter in warm focaccia.' },
      { id: 'greek-yoghurt', name: 'Greek yoghurt, honey & walnuts', price: '5.50', desc: 'Thick strained yoghurt with thyme honey and toasted walnuts.', diet: 'v' },
      { id: 'spanakopita', name: 'Spanakopita', price: '5.95', desc: 'Spinach and feta in crisp, buttery filo. Served warm.', diet: 'v', tags: ['greek-classic'] },
    ],
  },
  {
    id: 'hot-coffee',
    name: 'Hot Coffee',
    short: 'Hot coffee',
    intro: 'A seasonal espresso blend, pulled to order.',
    addons: [
      { id: 'oat', label: 'Oat milk', price: '0.50' },
      { id: 'shot', label: 'Extra shot', price: '0.70' },
    ],
    items: [
      { id: 'espresso', name: 'Espresso', price: '2.80', desc: 'A double shot, short and sweet.', diet: 'vg' },
      { id: 'macchiato', name: 'Macchiato', price: '3.00', desc: 'Espresso marked with a spoon of milk foam.', diet: 'v' },
      { id: 'cortado', name: 'Cortado', price: '3.40', desc: 'Equal parts espresso and warm milk.', diet: 'v', home: 'hot' },
      { id: 'flat-white', name: 'Flat white', price: '3.80', desc: 'Double ristretto with silky steamed milk.', diet: 'v', home: 'hot' },
      { id: 'cappuccino', name: 'Cappuccino', price: '3.70', desc: 'Espresso, steamed milk and a deep cap of foam.', diet: 'v', home: 'hot' },
      { id: 'latte', name: 'Latte', price: '3.80', desc: 'Espresso with plenty of steamed milk.', diet: 'v', home: 'hot' },
      { id: 'mocha', name: 'Mocha', price: '4.20', desc: 'Espresso, dark chocolate and steamed milk.', diet: 'v' },
    ],
  },
  {
    id: 'cold-coffee',
    name: 'Cold Coffee',
    short: 'Cold coffee',
    intro: 'Shaken, poured over ice, or brewed cold overnight.',
    addons: [
      { id: 'oat', label: 'Oat milk', price: '0.50' },
      { id: 'shot', label: 'Extra shot', price: '0.70' },
    ],
    items: [
      { id: 'freddo-espresso', name: 'Freddo espresso', price: '3.90', desc: 'The Greek summer classic: a double espresso shaken hard with ice until it froths, poured over fresh ice.', diet: 'vg', tags: ['greek-classic'], home: 'cold', featured: true },
      { id: 'freddo-cappuccino', name: 'Freddo cappuccino', price: '4.30', desc: 'A freddo espresso crowned with cold whipped milk foam.', diet: 'v', tags: ['greek-classic'], home: 'cold' },
      { id: 'iced-latte', name: 'Iced latte', price: '4.20', desc: 'Espresso and cold milk over ice.', diet: 'v', home: 'cold' },
      { id: 'iced-americano', name: 'Iced americano', price: '3.60', desc: 'Espresso lengthened with cold water over ice.', diet: 'vg' },
      { id: 'cold-brew', name: 'Cold brew', price: '4.00', desc: 'Steeped slowly overnight. Smooth, mellow and served over ice.', diet: 'vg', home: 'cold' },
      { id: 'espresso-tonic', name: 'Espresso tonic', price: '4.50', desc: 'A double shot floated over tonic, ice and a twist of orange.', diet: 'vg', tags: ['new'] },
      { id: 'affogato', name: 'Affogato', price: '5.00', desc: 'A scoop of fior di latte gelato drowned in hot espresso.', diet: 'v' },
      { id: 'iced-mocha', name: 'Iced mocha', price: '4.60', desc: 'Espresso, dark chocolate and cold milk over ice.', diet: 'v' },
    ],
  },
  {
    id: 'sweets',
    name: 'Sweets',
    short: 'Sweets',
    intro: 'Something small with your coffee.',
    items: [
      { id: 'cannoli', name: 'Cannoli', price: '3.80', desc: 'Crisp shell filled to order with sweet ricotta and pistachio.', diet: 'v' },
      { id: 'tiramisu', name: 'Tiramisu cup', price: '5.50', desc: 'Espresso-soaked savoiardi, mascarpone and cocoa.', diet: 'v' },
      { id: 'baklava', name: 'Baklava', price: '3.50', desc: 'Layers of filo, walnuts and honey syrup. Two pieces.', diet: 'v', tags: ['greek-classic'] },
      { id: 'olive-oil-cake', name: 'Olive-oil cake', price: '4.20', desc: 'Lemon and olive-oil sponge, light and not too sweet.', diet: 'vg' },
    ],
  },
];

export const allItems = () => MENU.flatMap((c) => c.items.map((i) => ({ ...i, category: c.id })));
export const itemById = (id) => allItems().find((i) => i.id === id);
export const homeItems = (slot) => allItems().filter((i) => i.home === slot);
