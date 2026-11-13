// The Wick House palette. tailwind.config.cjs and scripts/contrast.mjs both read it, so a colour changes in one place.
// Run `npm run contrast` after any change: every text pairing has to pass WCAG AA.
export const COLORS = {
  cream: '#F5F0E3', // page base, from the logo background
  paper: '#FBF8F0', // raised cards on cream
  forest: '#1E2B22', // logo ink, main text, dark sections
  deepgreen: '#2F4A35',
  moss: '#4A5E40', // sage darkened so it can carry small text on cream
  sage: '#8F9F7E', // decoration on cream; text only on forest
  gold: '#C9962B', // accent from the Opening Soon poster; decoration on cream, text on forest
  goldlight: '#E2B85A', // gold for small text on forest
  golddark: '#8A6418', // gold that can carry small text on cream
  lilac: '#9C82B8', // the mural's flowers, used sparingly
  lilacdark: '#6B5285', // lilac for small text on cream
  roast: '#5A3A22', // the bean's shading
};
