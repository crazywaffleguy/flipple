# Configuration

This project is intentionally small. Most things you will want to change live in two places.

## Visible version label

The small lower-left label is set in `public/config.js`:

```js
appVersion: "0.2.0"
```

Update that value for each shipped ZIP/release, and keep it matched with `package.json` and `CHANGELOG.md`.

## Final website URL for sharing

The permanent public URL lives in `public/config.js`:

```js
shareSiteUrl: "https://flipple.live"
```

Keep this set while testing locally so native phone share sheets and clipboard fallback results send people to the real website instead of `localhost`. If the domain ever changes, update this one value, commit, and push to GitHub. Vercel will redeploy with the new share link.

## Daily puzzle settings

The live daily API uses `src/daily.js`:

```js
launchDate: "2026-07-08"
seedSalt: "flipple-daily-seed-v1"
```

- `launchDate` controls puzzle `#1`.
- The game rolls over at midnight in `America/New_York`.
- `seedSalt` keeps Flipple's puzzle sequence unique.

The browser fallback uses the matching values in `public/config.js`. If you change `launchDate` or `seedSalt`, update both `src/daily.js` and `public/config.js`.

## Share result colors

Share colors live in `public/app.js`:

```js
normalColors: ["🟩", "🟨"]
cubedColors: ["🟩", "🟨", "🟨"]
```

Cubed mode intentionally uses only green/yellow in share results so the third in-game color is not spoiled in texts or screenshots.

## Share result bulbs

The share result uses:

```js
bulbs: { on: "💡", off: "◼️" }
```

Used guesses are `💡`. Unused guesses are `◼️`.


## Typography

The app uses a thin system sans-serif stack in `public/styles.css`:

```css
--font-main: "Arial Narrow", "Liberation Sans Narrow", "Helvetica Neue", "Avenir Next", "Inter", Arial, sans-serif;
```

The project does not include or redistribute font files. Browsers use the available system sans-serif stack.

## Share behavior

The share flow is handled in `public/app.js`:

- likely mobile/tablet devices use the native iOS/Android share sheet when available;
- desktop/laptop browsers copy the full result text to the clipboard instead of opening inconsistent desktop share panels;
- the score grid and `https://flipple.live` link are kept together in one text block so messages do not drop the result.
