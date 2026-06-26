# QA Report

Date: 2026-06-27

## Automated Checks

- `npm run lint`: passed.
- `npm test`: passed, 5 tests.
- `npm run build`: passed.
- `npm run check`: passed.

## Browser Checks

- Desktop 1440x900: title rendered, hero/search visible, 11 job cards rendered, active Jobs tab visible, no horizontal overflow.
- Mobile 390x844: hero/search stacks cleanly, horizontal tab rail works, no horizontal overflow.
- Mobile filter drawer: Filters button opens drawer; Escape closes drawer.
- Browser console: no warning or error logs observed.

## Notes

- Dev server used for QA: `http://127.0.0.1:5174/`.
- The mobile screenshot was also checked at top-of-page after keyboard Home navigation.
