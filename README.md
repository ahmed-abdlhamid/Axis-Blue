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
- `assets/logo-web.png`: same logo with surrounding white margins trimmed for the header/footer.
- `assets/logo-dark-web.png`: transparent, high-contrast logo variant used in dark mode.
- `assets/favicon.png`: supplied logo's wave emblem centered on a square favicon.
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
- Static checks passed for 12 pages, 322 local asset/link references, Arabic/English language and direction, metadata, branding, Facebook and phone/WhatsApp URLs.
- All 435 product IDs are unique; all 12 categories contain products. All 429 product images passed image decoding checks.
- Browser checks via localhost covered the 12 pages in both languages, desktop and mobile, light and dark modes. No horizontal overflow or browser warnings/errors were observed in those checks.
- Verified category selection, search by product code, empty search results, pagination, clicking a card to open details, language switching while preserving product/category selection, theme persistence across pages, mobile menu navigation and Escape-key closure.
- WhatsApp interaction styling was verified through keyboard focus: computed background `rgb(37, 211, 102)` (`#25D366`).
- Calls and WhatsApp messages were not sent.
- Automated direct `file://` browsing was blocked by the browser's URL policy, so direct-file behavior remains unverified in-browser. Local targets were checked statically; interactive checks used localhost.

## Before launch

Confirm the actual product range, technical details and image reuse rights. Approve business/service descriptions and the illustrative pool photo. Supply a verified map pin if required. Once a public domain is chosen, use absolute social image URLs and add canonical URLs. Product metadata is updated by browser JavaScript; social crawlers that do not execute JavaScript see the generic product-details metadata.

Publish only the HTML pages, CSS, browser JavaScript and used assets; maintenance scripts, reference HTML and review screenshots are not required on the public host.

No packages were installed. No commits, pushes or deployment were performed.
