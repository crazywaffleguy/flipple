# PWA install notes

Flipple can be installed to a phone home screen as a Progressive Web App.

## iPhone and iPad

1. Open Safari.
2. Go to `https://flipple.live`.
3. Tap the Share button.
4. Tap **Add to Home Screen**.
5. Tap **Add**.

## Android

1. Open Chrome.
2. Go to `https://flipple.live`.
3. Tap the browser menu.
4. Tap **Install app** or **Add to Home screen**.

## Development note

The service worker caches the app shell but skips `/api/` responses so daily puzzles do not get stuck on an old day.

When changing cached files, bump the cache name in `public/service-worker.js`.
