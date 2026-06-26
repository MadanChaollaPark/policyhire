# Release Checklist

## Build

- Run `npm install`.
- Run `npm run build`.
- Preview with `npm run preview`.
- Confirm `dist/` contains `index.html`, hashed assets, `robots.txt`, `sitemap.xml`, manifest, favicon, and `og-image.png`.

## Browser QA

- Check desktop at 1440x900, 1280x800, and 1024x768.
- Check tablet at 768x1024.
- Check mobile at 390x844 and 360x800.
- Test search, filters, sort, save job, mobile filter drawer, section tabs, pricing cards, and alert CTA.
- Confirm no horizontal scroll, clipped text, overlapping sticky bars, or hidden action buttons.

## Accessibility

- Keyboard through header, tabs, search, filters, results, save buttons, detail actions, and mobile drawer.
- Confirm visible focus state for buttons, selects, inputs, cards, and drawer controls.
- Confirm salary/deadline signals are text-based and not color-only.
- Confirm image assets are decorative or have useful labels.

## Deployment

- Use any static host that can serve Vite output from `dist/`.
- For GitHub Pages, set the build command to `npm run build` and publish directory to `dist`.
- If hosted under a subpath, set Vite `base` before building.
