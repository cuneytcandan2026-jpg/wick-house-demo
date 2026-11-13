// "Your daily Wick fix": words and landmarks for the bean journey (ported from Hackberries "Bean to Brew").
//
// `at` is the bean's position on the track (0 to 1) at the moment that section arrives, not a page percentage.
// brew.js maps scroll to track position piecewise between these anchors, so the bean reaches each landmark
// as its section comes into view however tall the sections are. The end of the track (1) is the footer logo.
//
// `icon`   landmark drawn on the track (src/templates/brew.mjs), or null for an anchor that only calibrates.
// `mobile` whether the landmark is drawn below 768px. Every anchor still counts for the mapping.
// `name`   read out in the progress bar's value text.
export const BREW_COPY = {
  beanLabel: 'Give the coffee bean a spin',
  progressLabel: 'Page progress',
  again: 'Brew again',
};

export const BREW_MILESTONES = [
  { id: 'offer', at: 0.07, icon: null, mobile: false, name: 'Opening-week offer' },
  { id: 'signatures', at: 0.17, icon: 'focaccia', mobile: true, name: 'The signatures' },
  { id: 'coffee', at: 0.31, icon: 'ice', mobile: false, name: 'The coffee' },
  { id: 'order-ahead', at: 0.42, icon: null, mobile: false, name: 'Order ahead' },
  { id: 'loyalty', at: 0.52, icon: 'stamp', mobile: true, name: 'Wick Loyalty' },
  { id: 'story', at: 0.63, icon: 'olive', mobile: false, name: 'Our story' },
  { id: 'gallery', at: 0.74, icon: 'flower', mobile: true, name: 'Gallery' },
  { id: 'delivery', at: 0.84, icon: null, mobile: false, name: 'Delivery' },
  { id: 'hiring', at: 0.88, icon: null, mobile: false, name: "We're hiring" },
  { id: 'visit', at: 0.93, icon: null, mobile: false, name: 'Visit us' },
];
