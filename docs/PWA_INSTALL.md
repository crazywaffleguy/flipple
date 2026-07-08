# PWA install notes

Flipple now has Progressive Web App support in v0.2.3.

## Files added

```text
public/manifest.webmanifest
public/service-worker.js
public/assets/icon-180.png
public/assets/icon-192.png
public/assets/icon-512.png
```

## iPhone install test

1. Deploy the site.
2. Open `https://flipple.live` in Safari on iPhone.
3. Tap the iOS share button.
4. Tap **Add to Home Screen**.
5. Confirm the app icon uses the Flipple favicon artwork.
6. Launch Flipple from the home screen.

## Android / Chrome install test

1. Open `https://flipple.live` in Chrome.
2. Look for **Install app** or **Add to Home screen**.
3. Install and launch from the home screen or app launcher.

## Cache note

The service worker cache name is currently:

```js
flipple-v0.2.3
```

When changing cached files like `index.html`, `styles.css`, `app.js`, `config.js`, icons, or the manifest, bump this cache name in `public/service-worker.js`. Otherwise an already installed PWA can keep using old cached files.

Daily API responses are intentionally not cached, so `/api/daily?mode=normal` and `/api/daily?mode=cubed` continue to come from the live site.
