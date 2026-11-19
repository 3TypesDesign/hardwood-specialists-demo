# Hardwood Specialists — website

Static one-page site for Hardwood Specialists, Inc. (hardwood flooring contractor, St. Petersburg, FL).
Exported from a Claude Design canvas; no build step, no framework. Open `index.html` or serve the folder.

## Business facts (source of truth — keep consistent everywhere: page, schema, Google Business Profile, BBB)
- Name: Hardwood Specialists (legal: Hardwood Specialists, Inc.)
- Address: 2595 30th Avenue North, St. Petersburg, FL 33713
- Phone: (727) 322-9663 · Email: info@hardwoodspecialists.com
- Hours: Mon–Fri 9:00am–5:00pm, closed Sat–Sun
- In business since 1989 · Florida contractor license C9359
- Service area: St. Petersburg, FL ONLY (do not mention Tampa Bay / Clearwater / Pinellas)
- Services: hardwood floor installation, custom staircases, recoating & refinishing, custom work (inlays, borders, medallions)
- Site copy is in English.

## Structure
- `index.html` — all markup; many styles are inline (from the design export). JSON-LD LocalBusiness schema is in `<head>`.
- `assets/css/site.css` — global styles, animations, responsive rules. Brand: gold `#c9a86a`, near-black `#0a0c0e`, cream `#f2efe8`; font Hanken Grotesk.
- `assets/js/site.js` — mobile menu, header solid-on-scroll, hero plank animation trigger, gallery "view all", swipe lightbox, form submit.
- `assets/images/*.webp` — images used by the site. `assets/images/originals/*.jpg` — source JPGs (not referenced; keep for re-exports).
- `404.html` (branded, noindex), `_headers` (Netlify: security headers, long cache for images, noindex on originals/notes).
- `assets/images/logo.png` (512×512, from favicon.svg; used as schema `logo`). JSON-LD is an `@graph`: business `#business` + `WebSite` `#website`.
- `robots.txt`, `sitemap.xml` (includes image entries), `llms.txt`, `_redirects` (Netlify 301s from old site URLs), `favicon.svg`, `apple-touch-icon.png`, `assets/images/og-image.jpg`.

## Hero animation
Before photo = concrete floor; after photo = finished floor. 134 `.hs-plank` divs, each a perspective-correct clip of the after image,
drop left-to-right (CSS `hs-drop`, per-plank `--d` delay). The after image is revealed behind them with a mask wipe (`hs-wipe`).
After the drop (6.4s after `.hs-go`), `.hs-hero-blur` (backdrop-filter blur 7px + light dark tint) fades in over the photo so the
headline reads clearly; with reduced motion it is on from the start. It starts only when both images are loaded (`.hs-ready`) AND the visitor first interacts (`.hs-go`). `site.js` sizes `#hero-stage`
to match `object-fit: cover; object-position: center 70%` of a 1418×1081 image. Respects prefers-reduced-motion.

## Open TODOs before launch
1. Estimate form: replace `YOUR_FORM_ID` in the form `action` (Formspree) or wire another endpoint. Until then, submitting opens the
   visitor's email app with the request pre-filled to info@ (no lead is dropped). Form has a `_gotcha` honeypot and `_subject`.
2. Deploy to hardwoodspecialists.com (Netlify/Vercel/etc.); confirm old site URLs in Search Console and adjust `_redirects`.
3. Google Search Console + Bing Webmaster Tools: verify, submit sitemap. Add the GA4 gtag snippet to `<head>` — `site.js` already
   sends `phone_click`, `email_click`, `get_directions`, `generate_lead` whenever `window.gtag` exists (mark generate_lead as key event).
4. Lighthouse: target 90+ mobile. Consider moving inline styles into site.css, `srcset` sizes for large images.
5. SEO backlog: FAQ section (+ FAQPage schema) — 10 Q&As drafted (Nov 2026), WAITING on client to confirm: free estimates,
   slab install method, typical install time, showroom walk-in vs appointment, insurance. Once confirmed: accordion section
   before Contact, FAQPage JSON-LD in <head>, link in llms.txt. Then: more specific gallery captions (species + neighborhood), service pages,
   real Google reviews (a hidden Reviews section and a Brands section were removed from the export — brands carried:
   Hakwood, Schotten & Hansen, Mirage, Provenza, Grafch, Boischamois, Grato, Vision Wood, Teka Hardwood).
6. Off-site: update BBB listing address (still shows 3111 22nd Ave N) and year (1989).
