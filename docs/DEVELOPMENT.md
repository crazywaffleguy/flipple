# Development notes

Flipple is kept deliberately small and readable. There is no framework and no build step yet.

## File responsibilities

- `src/daily.js` is the source of truth for daily answers on Node/Vercel.
- `api/daily.js` exposes that generator to Vercel as `/api/daily`.
- `server.js` serves the same API locally for `npm run dev`.
- `public/config.js` contains easy public settings, especially the future share domain.
- `public/app.js` owns browser state, rendering, stats, and sharing.
- `public/styles.css` owns all layout, mobile scaling, and visual animation.

## Editing rule

When adding a new feature, try to keep it inside one of these existing sections in `public/app.js`:

1. config/state
2. shell rendering
3. daily loading
4. board rendering
5. result rendering and saved daily completion
6. share helpers
7. fallback daily generator
8. event listeners

That keeps the project from turning into spaghetti code.

## Mobile behavior

The page uses:

- `viewport-fit=cover` in `index.html` for iPhones with notches.
- `100svh` for safer mobile viewport height.
- `env(safe-area-inset-*)` padding for modern phones.
- `clamp()` sizing for controls and game pieces.
- `touch-action: manipulation` and tap highlight removal for better button feel.

## Share behavior

The share button tries `navigator.share()` first. On iPhone and Android, this opens the native share sheet. The score text and `flipple.live` link are sent together as one text payload so apps do not drop the score grid and share only the URL. If native sharing is unavailable, the same full result is copied with the Clipboard API, with an older textarea fallback.

## Attribution

Creator attribution is intentionally repeated in docs, source headers, and package metadata:

- crazywaffleguy
- https://github.com/crazywaffleguy
- https://linktr.ee/crazywaffleguy


## Opening files directly

`server.js` is meant to be run by Node. If you double-click it, your computer may show raw code, ask what app should open it, or show a safety prompt. That is normal. Use `npm run dev` from the project folder instead.

`public/index.html` is the webpage shell. If it is opened from inside a ZIP/compressed-folder preview, the browser may not be able to load `styles.css`, `config.js`, or `app.js`, which makes the page look plain and broken. Fully unzip the folder first. Even then, the clean local URL is always `http://localhost:3000` because that also runs `/api/daily`.
