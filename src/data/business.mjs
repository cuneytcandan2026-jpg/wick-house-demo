// Business facts used by every page. Change them here only.
//
// THIS IS A DEMO. Anything marked PLACEHOLDER is invented for the pitch and must be replaced with the owner's
// real details before launch (see docs/PITCH-NOTES.md for the list to request). Only the Instagram handle,
// the opening date, the hiring shift and the brand lines come from Wick House's own posts.
export const BUSINESS = {
  name: 'Wick House',
  // PLACEHOLDER until the Hostinger subdomain is chosen. Used for og:url and share images.
  baseUrl: process.env.BASE_URL || 'https://wickhouse.laaradigital.co.uk',
  demo: true,

  // From the Instagram bio and posts.
  instagram: 'wickhouselondon',
  instagramUrl: 'https://www.instagram.com/wickhouselondon/',
  tagline: 'Your daily Wick fix',
  descriptor: 'Coffee · Sandwiches · Lunch',
  promise: 'Specialty coffee and premium sandwiches',
  vibe: 'Good food. Great vibes.',
  servesCuisine: ['Italian', 'Greek', 'Coffee'],

  // Opening day, 18 November 2026, from the owners. The homepage counts down to this in UK time.
  opening: '2026-11-18T07:00:00+00:00',
  openingLabel: 'Wednesday 18 November',

  // PLACEHOLDER. 020 7946 0xxx is Ofcom's reserved range for fiction, so it can never ring a real person.
  phoneDisplay: '020 7946 0123',
  phoneHref: 'tel:+442079460123',
  // PLACEHOLDER. The order pad hands orders to WhatsApp on this number (digits only, country code first).
  whatsapp: '442079460123',
  // PLACEHOLDER. example.com is reserved, so nothing is ever delivered to a stranger.
  email: 'hello@wickhouse.example.com',

  // PLACEHOLDER. Only "Hackney Wick" is confirmed (Instagram location tag).
  address: {
    street: 'Hackney Wick',
    town: 'London',
    postcode: 'E9',
    country: 'GB',
  },
  landmark: 'a short walk from Hackney Wick Overground',
  directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=Hackney%20Wick%20Station%2C%20London%20E9',
  mapEmbedUrl: 'https://maps.google.com/maps?q=Hackney%20Wick%2C%20London%20E9&z=15&output=embed',

  // PLACEHOLDER hours. days use the names Intl gives for Europe/London, so the open/closed badge can match them.
  hours: [
    { label: 'Mon–Fri', labelLong: 'Monday to Friday', time: '7am–3pm', days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '07:00', closes: '15:00' },
    { label: 'Sat–Sun', labelLong: 'Saturday and Sunday', time: '8am–4pm', days: ['Saturday', 'Sunday'], opens: '08:00', closes: '16:00' },
  ],

  // Order ahead: how far ahead a collection slot can be booked, and how long the kitchen needs.
  order: {
    slotMinutes: 10,
    leadMinutes: 15,
    lastOrderBeforeCloseMinutes: 20,
  },

  // Opening-week offer (the demo shows a success state and sends nothing).
  offer: {
    headline: 'Free coffee with your first sandwich',
    detail: 'Opening week only, 18–24 November. Sign up and show the message at the till.',
  },

  // Loyalty card.
  loyalty: { stamps: 8, reward: 'Every 8th coffee is on us' },

  // From the hiring post on Instagram.
  hiring: {
    shift: '7:00am – 1:00pm',
    lookingFor: [
      'A positive and welcoming attitude',
      'Hard-working and reliable',
      'Enjoys working with people',
      'A passion for coffee (experience is a bonus)',
    ],
    apply: 'Send us a DM on Instagram',
  },

  // Delivery partners, shown as coming soon until the owners sign up.
  delivery: [
    { name: 'Deliveroo', url: '' },
    { name: 'Uber Eats', url: '' },
    { name: 'Just Eat', url: '' },
  ],
};
