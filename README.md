# Fashion House

A complete local, four-view fashion art website, refined against the supplied Figma Make Version 6 preview. The interface uses the reference’s black background, pink page headers, Abril Fatface headings, Space Mono controls, and yellow/green/blue accents.

## Preview

For a double-clickable copy, open `Fashion-House.html` in Chrome or Edge. It contains the site's code, images and fonts, so you can move the single file or open it without a server. Rebuild it with `npm run build:offline` after source changes. Saved works and uploads are browser-local; the offline file does not import the hosted site's saved data, and storage availability can vary by browser or file location.

For the hosted development preview, run `npm start` with Node.js 20+, or `./Start-FashionHouse.ps1` in PowerShell. The launcher also finds the bundled Codex Node runtime. Open **http://127.0.0.1:4186**. Serve `dist/` over HTTP instead of opening `dist/index.html` directly.

| View | Route |
| --- | --- |
| Homepage | `/#/` |
| Gallery | `/#/collection` |
| Category gallery | `/#/collection?category=illustration` |
| Upload form | `/#/upload` |
| Artwork | `/#/artwork/velvet-horizon` |

## Preserved references and interactions

The supplied colorful model and actual pencil sketch remain in the unchanged `hero-model-reference.png` source. Two aligned CSS windows crossfade over 620ms; mouse leave restores color, touch taps toggle, and keyboard activation works. Both states decode before swapping. The left title is independent. Small vector pencil strokes add a restrained hand-drawn accent.

The supplied nine-category image remains unchanged in `categories-reference.png`. Proportional windows make its nine panels independently navigable, while small CSS patches remove the number-side icons. Original artwork, colors and compact proportions are retained. Desktop has three category columns; smaller screens use two or one.

Magnetic buttons move their visual surface within a stable hit area. The custom cursor, pointer-following light, and thin moving edge are limited to artwork. Seamless marquees have pause controls and keyboard-accessible links. Reduced motion disables decorative animation. All four layouts adapt to mobile.

## Working flows

- Nine category destinations, artwork search, empty states, and five-column desktop / two-column phone galleries.
- Recent sorts by creation time; Popular uses real view counts in this browser; Save persists local favorites; Share uses the browser clipboard with a manual-copy fallback.
- Image picker / drag and drop, JPG/PNG/WEBP validation up to 20 MB, image preview, title, artist, media, statement and category fields, plus an optional artist portrait up to 2 MB.
- Uploads persist image blobs and metadata in IndexedDB and open immediately in the artwork viewer. Previous/next, arrow keys, details, native fullscreen, related works, and return-to-gallery state work across views.

Uploads, favorites and popularity are stored in the current browser. There is no public publishing service, account system or shared backend. Clearing browser data removes local uploads. Local artwork links work only where their artwork is stored.

## Figma and assets

The accessible embedded Make preview was inspected for homepage, all nine gallery paths, upload form, artwork detail, navigation, and controls. Its original editable source and layer metadata require Figma access and were not available; the Figma file itself was not modified. The user’s supplied model and category imagery take precedence over the preview’s corresponding images. Other page visuals follow the observed preview, with readable form labels and the user’s restrained lighting requirement.

Reference gallery photography is saved locally from the image URLs rendered in Figma; see `dist/assets/figma-image-sources.json`. Abril Fatface, Outfit and Space Mono are bundled under `dist/assets/fonts/` with `figma-fonts.css`. Two supplemental discipline studies use existing AI-created art. Artist names, statements and media descriptions are illustrative sample content, not verified photography credits or artist identities.

## Verification

`npm run check` checks module syntax. `npm test` runs nine behavior tests for mouse/touch/keyboard switching, image loading races, reduced-motion handling, cleanup, and persistent collection preferences. Browser verification covers desktop/mobile layout, the supplied model swap, all nine categories, search/sort/save/share controls and the four routes. Current page screenshots are in `output/`; `output/verification.json` distinguishes automated tests and browser checks. Phone-width browser previews were checked; no physical phone was used.

The main code is dependency-free JavaScript. `presentation.js` owns shared/home markup; `figma-pages.js/css` owns gallery/upload presentation; `app.js` owns routes and state; `motion.js` and `hero-interaction.js` own interactions. The local static server needs no build step.
