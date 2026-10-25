# AXIS Blue

Static HTML/CSS/JavaScript informational website, with Arabic RTL and English LTR pages. No framework, database, installation or runtime build is required.

## Viewing

Open `index.html` in your browser. For a local HTTP preview, run a static HTTP server in this directory. The language switch opens the equivalent translated page and preserves the selected category, search and product. Dark mode is stored locally; local file links also carry the theme because browsers can isolate file storage.

## Main files

- `index.html`, `services.html`, `products.html`, `about.html`, `contact.html`: Arabic pages.
- `en-index.html`, `en-services.html`, `en-products.html`, `en-about.html`, `en-contact.html`: English pages.
- `product.html`, `en-product.html`: product details, selected with the `product` query parameter.
- `styles.css`: Zain font faces, brand colors, responsive layout, dark mode, hover and keyboard focus styles.
- `preferences.js`: theme initialization before first paint.
- `script.js`: mobile navigation, theme/language controls, catalog filtering, search, pagination and product details.
- `assets/logo.png`: original new logo supplied by the owner, unchanged.
- `assets/logo-web.png`: latest supplied logo with surrounding margins and white matte removed for the header/footer.
- `assets/logo-dark-web.png`: transparent, high-contrast logo variant used in dark mode.
- `assets/favicon.png`: supplied logo's wave emblem centered on a square favicon.
- `assets/pool-hero.jpg`, `assets/pool-hero-900.jpg`: locally stored licensed pool photograph and responsive version; attribution and license are in `assets/IMAGE_SOURCES.md`.
- `assets/pool-wide.jpg`, `assets/pool-wide-1100.jpg`: retained wide crop used by the approved About sections.
- `assets/hero-blue-water.jpg`, `assets/hero-blue-water-1100.jpg`: current full-width hero photo with a generous view of the blue pool water; source and license in `assets/IMAGE_SOURCES.md`.
- `assets/og-axis-blue.png`: 1200 × 630 Arabic social-sharing composition; source layout in `qa/og-card.html`.
- `assets/fonts/`: supplied Zain font files and OFL license. Regular, Bold and ExtraBold are used for both languages.
- `assets/products/`: 429 local product images covering 435 products.
- `catalog.json`: product names, codes, categories, technical attributes and original reference/image URLs.
- `catalog-data.js`: browser-ready product data; works without fetching JSON.
- `site-content.cjs`: original bilingual category descriptions.
- `build-pages.cjs`: optional Node maintenance script that regenerates all 12 HTML pages and `catalog-data.js`. Edit this script for shared page content, then run `node build-pages.cjs`. Regeneration replaces generated HTML.
- `verify-site.cjs`: dependency-free checks; run `node verify-site.cjs`.

The previous `logo.jpeg` and old favicon are retained but are not referenced by the updated website. `reference/build-pages-original.cjs` retains the earlier generator for reference.

## Catalog reference and content

Reference: https://splash-egypt.com/ar/product-catalog (reviewed 2026-10-24), including all category pagination and the equivalent English catalog.

Imported 435 unique product records across all 12 categories. Selected technical attributes were retrieved for 431 products, with exact English values checked against the English product pages. Four product pages did not expose selected technical attributes; those details pages show their reference name, category and code without inventing specifications.

Category functional descriptions are original bilingual copy. Vendor marketing paragraphs, prices, stock claims, purchase controls and warranties were not imported. The website does not confirm availability at AXIS Blue. The reference contains some inconsistent or incomplete product information; the shop should verify its actual range and specifications before launch.

Product images were downloaded from the reference at the owner's request for local review; original image URLs are preserved in `catalog.json`. Reuse rights have not been independently verified and should be confirmed before public publication. The pool lifestyle photo remains illustrative rather than an AXIS Blue project image.

Manual source-refresh scripts: `import-catalog.py`, `import-specifications.py`, `import-english-specifications.py`. They use the Python standard library and network access. To deliberately refresh the catalog, run them in that order, then regenerate the pages. Refreshing replaces imported catalog data; back up owner edits first. Normal browsing does not run these scripts or contact Splash.

## Confirmed business details

- Brand colors: blue `#187BD1`, navy `#2F5278`. Slightly darker/lighter blue text variants support contrast in each theme.
- Phone: `01034031505`; all call links use `tel:+201034031505`.
- WhatsApp: `https://wa.me/201034031505`, with relevant messages and no automatic sending.
- Facebook: https://web.facebook.com/profile.php?id=61584932767330
- Address: First Settlement, Cairo First Mall, First Settlement Services Area, behind the Oncology Institute, Cairo, Egypt.

## Verification, 2026-10-24

- JavaScript syntax checks passed for the generator, runtime scripts and catalog data.
- Static checks passed for 12 pages, 358 local asset/link references, Arabic/English language and direction, metadata, branding, Facebook and phone/WhatsApp URLs.
- All 435 product IDs are unique; all 12 categories contain products. All 429 product images passed image decoding checks.
- Browser checks via localhost covered the 12 pages in both languages, desktop and mobile, light and dark modes. No horizontal overflow or browser warnings/errors were observed in those checks.
- Verified category selection, search by product code, empty search results, pagination, clicking a card to open details, language switching while preserving product/category selection, theme persistence across pages, mobile menu navigation and Escape-key closure.
- Contact icons have transparent neutral circular outlines and neutral symbols adapted to each theme. Hover changes the phone/Facebook symbols and contact labels to the site's hover blue; WhatsApp's symbol becomes green. Rings remain neutral, without new hover backgrounds, shadows or movement. Keyboard focus retains its separate visible outline.
- Calls and WhatsApp messages were not sent.
- Automated direct `file://` browsing was blocked by the browser's URL policy, so direct-file behavior remains unverified in-browser. Local targets were checked statically; interactive checks used localhost.

## Before launch

Confirm the actual product range, technical details and product-image reuse rights. Supply a verified map pin if required. Canonical and social URLs use `https://axisblue.vercel.app/`. Product-specific metadata is updated by browser JavaScript; social crawlers that do not execute JavaScript see the generic product-details metadata and the shared branded OG image.

Publish only the HTML pages, CSS, browser JavaScript and used assets; maintenance scripts, reference HTML and review screenshots are not required on the public host.

## UI review and browser checks

The header uses balanced side tracks with centered desktop navigation. Up to 600px, the logo/menu and the four utility controls occupy two intentional rows; all controls remain visible with 44px tap targets. Moving from navigation toward the outer edge, controls read phone, WhatsApp, language, theme in both language directions. Header/footer contact marks use four local Tabler Outline SVGs, embedded by the generator with consistent rounded 2-unit strokes. Header phone/WhatsApp use optical sizes of 36/38px; footer slots remain 28px. Sources and MIT license are retained in `assets/icons/tabler/`. Neither has an outer ring or container. Page-body contact marks retain their approved outlined-circle style. The footer distributes content-sized columns with equal free space between them, has a fluid 340px description maximum, and stacks its groups up to 800px. The Contact page has unified interactive contact rows and a single Facebook label. Service details are centered within 960px with a 760px reading area; the product notice is limited to 820px.

The shared layout uses fluid Zain typography, compact 44px controls and the owner-supplied transparent logo assets. The selected theme is initialized in the document head. Navigation uses only a current-page underline and temporary hover underline. The homepage order is hero, services, products, About, contact. The shared contact card is the sole in-content WhatsApp CTA; the floating bubble was removed. On the Contact page, the WhatsApp contact method takes the place of that card. Product details route their shared card to a product-specific inquiry.

See `qa/REVIEW.md` for this UI pass, screenshot comparisons, tested viewports, and remaining limitations. `qa/results/` contains local review artifacts and is ignored by Git.

Browser checks use an existing Node Playwright installation and installed Google Chrome, with no packages or browsers installed by this task. With the existing Playwright and Sharp packages available through Node's module search path:

```powershell
node qa/verify-ui.cjs
node qa/compose-review.cjs
node verify-site.cjs
```

`qa/capture-before.cjs` records a baseline before making visual changes; do not rerun it over the retained before images. `qa/prepare-brand.cjs` prepares the supplied logo assets from an explicit source PNG path. These are development tools and are not needed to serve the site.

This UI pass made no commits, pushes, branch changes or deployments.
