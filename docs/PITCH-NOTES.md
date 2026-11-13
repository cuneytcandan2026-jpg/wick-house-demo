# Wick House: pitch notes

Demo: https://wickhouse.laaradigital.co.uk (hidden from search engines while it is a demo)

Wick House opens on Wednesday 18 November 2026. Right now its only online presence is Instagram. This demo shows what a website could do for the business from day one. Every feature below is there to bring in money or save staff time, not just to look nice.

## How to run the demo (about 5 minutes, on your phone)

Open the link on a phone, not a laptop. Most customers will see the site this way, on the walk from the Overground.

1. **Home page, first screen.** It says "Your daily Wick fix." and shows a live countdown to 7am on the 18th. The countdown changes by itself into an Open / Closed badge based on the opening hours, so nobody has to update it.
2. **Bottom bar.** *Order ahead · Directions · Call* stays at the bottom of the screen the whole time. Those are the three things a passer-by actually wants.
3. **Opening-week offer.** Enter an email address, tick the box and show the "You're on the list" voucher.
4. **Signatures → Add to order.** Tap *Add to order* on a sandwich. It opens the menu with the sandwich already in the order.
5. **Order pad.** Add a freddo espresso with oat milk, pick a collection time, enter a name and tap *Send order via WhatsApp*. Show the ready-written message.
6. **Back to the home page, scroll slowly to the bottom.** The coffee bean rolls along the gold line under the header and passes an icon for each section. In the footer it drops into the cup, and the Wick House logo draws itself. End on "That's your daily Wick fix." with the *Order ahead* button.

## What each feature is worth to them

| Feature | What it does for the business |
|---|---|
| **Order ahead with collection times** | For a cafe by a station, the 7am commuter rush is usually the busiest hour, and it is when people give up on a long queue. Customers order on the way from the station and pick a 10-minute slot, so the team can make drinks in advance and serve more people in that hour. Each slot shows how much work is coming. |
| **Orders through WhatsApp (in the demo)** | It works from the first day with no app, no fees and no new equipment. The order arrives as a ready-written message with the items, oat milk and extra shots, the total, the name and the collection time. |
| **Opening-week sign-up** | Builds a customer list the business owns. Instagram decides who sees each post, but an email or WhatsApp list can be messaged directly about new specials, rainy-day deals or a quiet afternoon. The free-coffee offer gives people a reason to join in the first week. |
| **Wick Loyalty stamp card** | "Every 8th coffee on us" brings people back and makes Wick House their daily habit rather than an occasional stop. A digital card can't be lost, and it shows how often each customer comes in. |
| **Menu page with search and dietary filters** | Customers can find something vegetarian or vegan in seconds. Prices are shown up front, so people order with confidence instead of asking at the counter. |
| **Delivery links (Deliveroo, Uber Eats, Just Eat)** | Office lunches in Hackney Wick and Stratford they can't reach on foot. The buttons are ready and show "coming soon" until they sign up. |
| **We're hiring** | Uses their real hiring post (7am–1pm shift, apply by DM), so the site helps with recruiting before opening day too. |
| **Directions, map, call and hours** | Answers "where is it and is it open?" without a search. The opening hours mark today's row in UK time. |
| **Bean journey** | It makes the site memorable and ends every visit on the logo and an *Order ahead* button. It was built for Wick House and uses its own logo, gold dash and lilac flowers. |

## Quality checks (13 November 2026)

- **Accessibility:** no axe-core violations on either page at 1440px, 390px or 360px, and none with the menu sheet, offer form, photo viewer or order pad open. Lighthouse accessibility score: 100 on both pages.
- **Speed (Lighthouse, mobile, simulated slow 4G):** home page LCP 2.35–2.4s, menu page LCP 1.6–1.7s, no layout shift. On a normal connection the first screen appears in well under a second.
- **Phones:** no sideways scrolling at 360px. Every button is at least 44px for thumbs.
- **Search engines:** the demo is set to `noindex` on purpose, which is why Lighthouse's SEO score is 66. That comes off at launch.

## Real vs placeholder

**Taken from their own posts:** the name and logo, "Your daily Wick fix", "Good food. Great vibes.", "Specialty coffee and premium sandwiches", the opening date, the mural, the hiring post and the Instagram handle.

**Invented for the demo (placeholder):** the whole menu and its prices, the address (only "Hackney Wick, E9" is confirmed), the opening hours, the phone and WhatsApp number (a reserved number that can't ring anyone), the email address, and the food and interior photos (AI-generated and stock, labelled "illustrative" on the site). The footer of every page says the content is a placeholder.

Don't present any placeholder as fact. Talk about these as "your menu would go here".

## What we need from them

1. **Menu and prices**, including vegetarian/vegan items, add-ons (oat milk, extra shot) and when breakfast ends.
2. **Photos:** their own food, drinks and the shop. A one-hour shoot in the first week would be enough to replace every stock image.
3. **Full address** and a Google Business Profile, if they have one.
4. **Opening hours**, including any late or early days.
5. **Phone number and WhatsApp number** for orders.
6. **Email address** for the website and the sign-up list.
7. **Payment / till provider** (Square, SumUp, Stripe or another). This decides how online payment is connected.
8. **Delivery accounts** (Deliveroo, Uber Eats, Just Eat), once they are set up.
9. **Loyalty:** whether they want a digital stamp card at launch or after the first month.
10. **Domain name**, such as wickhouse.co.uk or wickhouselondon.co.uk.

## Moving from demo to the live site

- **Menu, hours and contact details:** a one-file change each. They can go live within a day of receiving them.
- **Order ahead:** start with WhatsApp (free, works on day one). Later, add online payment through their till provider so orders arrive paid and go straight to the till.
- **Sign-up list:** connect the form to an email or WhatsApp list tool so sign-ups are stored and they can send messages.
- **Loyalty:** connect it to the till's loyalty feature if it has one (Square Loyalty, for example), or use a stand-alone digital stamp card.
- **Search:** remove `noindex`, add their Google Business Profile and local business details so they show up for "coffee Hackney Wick".
