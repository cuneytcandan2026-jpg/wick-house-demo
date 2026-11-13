# Wick House — Demo Website Plan

> Source of truth across sessions. Tick items off (`[x]`) as each one is done. Each phase ends with a working build and a local commit.

## Context
Wick House is a new cafe in Hackney Wick, London, opening **18/11/2026**. It sells specialty coffee and premium Mediterranean sandwiches. They have no menu or website yet, only an Instagram account (@wickhouselondon: logo, an "Opening Soon" poster, a hiring post, and a reel of the painted mural sign). The demo is a sales pitch: it has to look premium on a phone and show **features that make money**, so the owner can picture the return on the investment.

**Decisions made**
- **Italian and Greek** placeholder menu. No Turkish dish names: we don't know whether the owners are Turkish, and the customers might not know the words.
- Cold coffees are included and get their own tab.
- Revenue features: order ahead / click & collect, opening-week offer sign-up, loyalty card, and delivery-app links.
- Images: about 10 Higgsfield credits for AI-generated on-brand photos, then stock photos regraded to fit the brand.
- Look follows the logo, with warm accents.
- Hosted on GitHub + Hostinger, the same way as the other client repos. Pushing to GitHub is approved.
- Address and hours are placeholders.
- Signature feature: an improved version of the Hackberries bean-to-cup scroll effect.

## Source assets (project root)
- `Brand Assets/WickHouseLogo.jpg`: logo on cream; forest-green geometric sans; steaming cup icon; underline dash; "COFFEE • SANDWICHES • LUNCH".
- `Instagram Post.png`: "Opening Soon" poster. Gold accents, leaves, "Specialty Coffee | Premium Sandwiches", "Good Food. Great Vibes."
- `WickHouseHiringPost.png`: hiring post. 7:00 AM – 1:00 PM shift, apply by DM. Sage palette.
- `InstagramProfile.png`: bio reads "Your daily Wick fix / Your local spot in Hackney Wick / Coffee • Sandwiches • Lunch / Coming soon…"
- `Instagrap Post Video.mp4`: the painted mural sign (dark green wall with purple/white flowers and "Wick House" in script).

## Brand system
- **Colours:**
  - cream `#F5F0E3` (base)
  - forest `#1E2B22` (logo ink, main text and dark sections)
  - deep green `#2F4A35`
  - sage `#8F9F7E`
  - gold `#C9962B` (accent, from the Opening Soon poster)
  - lilac `#9C82B8`, used sparingly, from the mural's flowers
  - Run a contrast check so every pairing passes WCAG AA.
- **Type:**
  - Headings: **Jost** (geometric, close to the logo), in wide-tracked capitals for labels.
  - Body: **Manrope**.
  - One handwritten accent font, used only for short lines such as "your daily Wick fix".
  - All fonts are self-hosted with fontsource.
- **Logo:** rebuild it as an SVG (steaming cup + Jost wordmark). The JPG stays as the reference.
- **Motifs:** leaf sprigs from the posters and the mural's purple flowers as a subtle texture. Light grain over the cream background.

## Site structure
One long home page with a sticky nav that jumps to each section, plus a separate **Menu** page with the order pad. On a phone, a **sticky bottom bar** shows three buttons: *Order ahead · Directions · Call*.

Home sections, in order:
1. **Hero:** full-bleed signature sandwich photo, the headline "Your daily Wick fix.", and *Order ahead* / *See the menu* buttons. A **live countdown to opening on 18 Nov** switches automatically to an Open/Closed badge from the opening hours.
2. **Opening-week offer:** "Free coffee with your first sandwich, opening week". Email + WhatsApp sign-up form with a success state. In the demo it only shows the success message and sends nothing.
3. **Signatures:** 4 hero sandwiches as large cards with price, tags (V / new) and *Add to order*.
4. **Coffee:** a hot/iced toggle switches between 4 hot and 4 cold drinks; freddo espresso is the featured drink. The story copy is generic and makes no claims about specific beans.
5. **How order-ahead works:** 3 steps (pick → choose a collection time → skip the queue). Aimed at the 7am commuter rush.
6. **Wick Loyalty:** an animated digital stamp card ("every 8th coffee on us"), with a "coming soon" note.
7. **About / Our story:** Italian and Greek flavours on a Hackney Wick corner. Uses stills from the mural reel.
8. **Gallery:** masonry grid of food and interior shots plus the real Instagram posts. Opens in a lightbox. Ends with a *Follow @wickhouselondon* button.
9. **Delivery:** Deliveroo / Uber Eats / Just Eat buttons, marked "coming soon".
10. **We're hiring:** from the real hiring post (7:00–13:00 shift, apply by DM).
11. **Visit / Contact:** placeholder address "Hackney Wick, London E9", near Hackney Wick Overground. Placeholder hours: Mon–Fri 07:00–15:00, Sat–Sun 08:00–16:00. Map embed, *Get directions*, call, email and Instagram.
12. **Footer:** bean-journey payoff, logo, hours, socials, and a line saying it is a demo with placeholder content.

**Menu page:** category tabs (Signature Sandwiches · Breakfast · Hot Coffee · Cold Coffee · Sweets), with search and dietary filters. *Add to order* opens an **order pad drawer** with a collection time-slot picker and a *Send order via WhatsApp* button. In the demo nothing is charged. In production it would connect to Square, Stripe or Sumup.

**Placeholder menu (~30 items, £ prices typical for London):**
- **Sandwiches:**
  - Mortadella, burrata & pistachio pesto focaccia
  - Porchetta, salsa verde & rocket ciabatta
  - Prosciutto, mozzarella & fig on focaccia
  - Caprese: tomato, buffalo mozzarella & basil (V)
  - Chicken souvlaki, tzatziki & red onion in toasted pita
  - Greek lamb, feta, olives & oregano
  - Halloumi, roasted pepper & honey (V)
  - Roast veg, hummus & olive tapenade (Vegan)
- **Breakfast:** egg & pancetta focaccia; Greek yoghurt, honey & walnuts; spinach & feta pie (spanakopita).
- **Hot coffee:** espresso, macchiato, cortado, flat white, cappuccino, latte, mocha.
- **Cold coffee:**
  - Iced latte, iced americano, cold brew
  - **Freddo espresso** and **freddo cappuccino** (the Greek classics, a selling point)
  - Espresso tonic, affogato, iced mocha
- **Sweets:** cannoli, tiramisu cup, baklava, olive-oil cake.

## Signature feature: "Your Daily Wick Fix" bean journey (improves on Hackberries)
Port the Hackberries "Bean to Brew" module:
- Source: `../../4. TEMPLATE SITE/Hackberries/site/scripts/brew.js`, `brew-art.js`, `motion.js`, `site/styles/brew.css`, `site/data/brew.mjs`.
- The original brief is `Hackberries/Component/ProgresBar.md`.
- Keep its engine: critically damped spring, rolling without slipping, landmarks tied to real sections, footer reveal via IntersectionObserver, reduced-motion support, passive listeners, cleanup on teardown.

**What makes it better here:**
1. **The scroll completes the logo.** The destination cup is the logo's cup icon. When the bean drops in:
   - the cup fills
   - the logo's three steam squiggles draw themselves
   - the "WICK HOUSE" wordmark and its underline fade in below

   The page ends on the full brand mark.
2. **Landmarks per section, in the Wick House style.** Each is a small line icon with one short response:

   | Section | Icon | Response |
   |---|---|---|
   | Signatures | focaccia slice | tilt |
   | Coffee | ice cube | clink |
   | Loyalty | loyalty stamp | thunk |
   | Story | olive sprig | unfurls |
   | Gallery | mural lilac flower | blooms |

   Mobile shows 3 of them.
3. **Olive-leaf latte art** instead of a generic leaf.
4. **The track is a thin gold line** echoing the dash under the logo. The bean's shading uses roast brown and gold.
5. **The payoff converts.** The footer headline is "That's your daily Wick fix.", with *Order ahead* and *Get directions* buttons. Both stay usable throughout the animation.
6. A short haptic tick when the bean lands (`navigator.vibrate`, Android only). It respects reduced motion, and iOS ignores it silently.

Kept from Hackberries: it plays once per visit, then a "Brew again" button replays it. It never captures scrolling, and it pauses while the tab is hidden.

## Build approach (reuse the Olympic Cafe stack)
Repo `wick-house-demo` in this folder. The pipeline comes from `../../2. CLIENT/Olympic Cafe`:
- `scripts/build.mjs`: static build covering Tailwind compile, esbuild, sharp images and hashed asset names. Copy it and trim it to the home and menu pages, building to `dist/`.
- `src/templates/layout.mjs`: head/nav/footer page template. Adapt it.
- `src/data/business.mjs` and `src/data/menu.mjs`: facts and menu as data, so swapping in the real menu is a one-file edit.
- `src/js/order.js`: the order pad. Reuse it and add the collection time-slot picker and the WhatsApp hand-off.
- `serve.mjs` and `screenshot.mjs`: local server on :3000 and puppeteer screenshots.
- `tailwind.config.cjs`: brand tokens only, no default palette.
- `CLAUDE.md`: copy the design guardrails from Olympic Cafe.
- **Deploy:** use `../../2. CLIENT/Anatolian Accountancy/.github/workflows/deploy-hostinger.yml` as the pattern. GitHub Actions builds `dist/` and pushes it to the `hostinger` branch, and Hostinger's Git deploy pulls that branch. Drop the IndexNow and Web3Forms steps.
- Add `<meta name="robots" content="noindex">` while it is a demo.

## Images
- One consistent art direction: natural window light, cream linen and dark green tiles, brass details, shallow depth of field.
- **Higgsfield first (~10 credits).** Check the balance and the per-image cost before generating anything. Use this priority order and stop when the credits run out:
  1. Hero sandwich
  2. Mortadella focaccia
  3. Freddo espresso
  4. Chicken souvlaki pita
  5. Caprese
- **Stock for the rest** (free Unsplash/Pexels). Give them all the same sharp treatment so they read as one shoot:
  - A shared colour grade: warm cream highlights and deep-green shadows
  - Matched crop ratios
  - A light grain
- Record each stock photo's source in `docs/CREDITS.md`.
- Pull mural stills from `Instagrap Post Video.mp4` with ffmpeg if it's installed. If not, crop the mural from `InstagramProfile.png`.
- Use the real posts as they are.

## Phases

### Phase 0: Save the plan
- [x] Copy the plan to `plan.md` in the project root

### Phase 1: Foundation
- [x] `git init` + `.gitignore`
- [x] Copy and trim the Olympic Cafe pipeline (build, serve, screenshot, Tailwind config, `package.json`) and run `npm install`
- [x] Brand tokens and fonts (Jost, Manrope, script accent)
- [x] SVG logo
- [x] `CLAUDE.md` with guardrails, deploy rules and screenshot workflow
- [x] `business.mjs` and `menu.mjs` with the placeholder data
- [x] Layout: nav, mobile sticky bar, footer
- [x] Hostinger workflow; create the GitHub repo `cuneytcandan2026-jpg/wick-house-demo` and push
- [ ] **You:** connect Hostinger's Git deploy to the `hostinger` branch on a subdomain you choose

### Phase 2: Images
- [ ] Higgsfield generations, in priority order, within the 10 credits
- [ ] Stock photos sourced and graded to match
- [ ] Mural stills extracted
- [ ] sharp responsive pipeline (WebP/AVIF)
- [ ] `docs/CREDITS.md`

### Phase 3: Home page
- [ ] All 12 sections
- [ ] Countdown and open/closed badge
- [ ] Hot/iced toggle
- [ ] Loyalty stamp card animation
- [ ] Gallery lightbox
- [ ] Scroll reveals

### Phase 4: Menu and order-ahead
- [ ] Menu page: tabs, search, dietary filters
- [ ] Order pad with collection time slots and WhatsApp hand-off
- [ ] Opening-offer form success state

### Phase 5: Bean journey
- [ ] Port the Hackberries module
- [ ] Logo-completing reveal (cup → steam → wordmark)
- [ ] Wick House landmarks (5 on desktop, 3 on mobile)
- [ ] Olive-leaf latte art, gold track, footer buttons, haptic tick

### Phase 6: QA and pitch
- [ ] Screenshots at 1440px and 390px, at least 2 rounds of fixes
- [ ] axe-core: no serious violations
- [ ] Lighthouse: mobile LCP under 2.5s, no layout shift, no horizontal scroll at 360px
- [ ] Test on a real phone through the live URL
- [ ] `docs/PITCH-NOTES.md`: map each feature to its revenue benefit (queue-skipping at the 7am rush, an owned customer list instead of only Instagram, repeat visits from loyalty, delivery reach), and list what they need to send (menu, prices, photos, address, hours, payment/POS provider)
- [ ] Final push

## Verification
- `npm run build` then `node serve.mjs`. Screenshot desktop and mobile with `screenshot.mjs`, then read the PNGs.
- On a real phone through the Hostinger URL, check: sticky bar, order pad → WhatsApp hand-off, sign-up success state, lightbox, countdown.
- Bean journey: test slow, fast and reverse scrolling, jumping straight to the footer, resizing, and reduced-motion mode. Confirm the logo forms when the footer comes into view.
