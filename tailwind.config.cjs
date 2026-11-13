/** @type {import('tailwindcss').Config} */
// Brand tokens only. The default Tailwind palette is switched off, so every colour on the site is a brand colour.
// Colours live in src/data/brand.mjs and are checked for contrast by `npm run contrast`.
const { COLORS } = require('./src/data/brand.mjs');

module.exports = {
  content: ['./src/pages/**/*.mjs', './src/templates/**/*.mjs', './src/brand/**/*.mjs', './src/js/**/*.js'],
  theme: {
    screens: { sm: '640px', md: '768px', lg: '1024px', xl: '1280px' },
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      white: '#FFFFFF',
      ...COLORS,
    },
    fontFamily: {
      display: ['Jost', 'Futura', 'Century Gothic', 'system-ui', 'sans-serif'],
      body: ['Manrope', 'system-ui', '-apple-system', 'Segoe UI', 'Arial', 'sans-serif'],
      hand: ['Caveat', 'Bradley Hand', 'cursive'],
    },
    extend: {
      letterSpacing: { label: '0.22em', wide2: '0.12em' },
      maxWidth: { page: '76rem', prose: '38rem' },
      borderRadius: { card: '1.25rem' },
      // The shoot's two crop ratios.
      aspectRatio: { portrait: '4 / 5', land: '3 / 2' },
      boxShadow: {
        // Tinted with forest, layered, low opacity. base sits on the page, lifted floats over it.
        base: '0 1px 2px rgba(30,43,34,0.06), 0 8px 24px -10px rgba(30,43,34,0.18)',
        lifted: '0 2px 4px rgba(30,43,34,0.06), 0 24px 48px -16px rgba(30,43,34,0.30)',
        gold: '0 10px 28px -10px rgba(201,150,43,0.55)',
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        out: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};
