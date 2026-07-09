# flipple

a unique take on the wordle-like genre that combines the addicting daily challenge feel of games like wordle with the color-code breaking brain itch of mastermind. its a flipping great game if you ask me!

flipple is a daily code-breaking web puzzle by **crazywaffleguy**. flip the switches, guess a code, then use your score checker along with your past guess tracker to narrow down the final code.

Website: <https://flipple.live>

Current version: `flipple v0.3.2`

GitHub: <https://github.com/crazywaffleguy>

Creator links: <https://linktr.ee/crazywaffleguy>

Music links: <https://linktr.ee/aidencullenorl>

## gameplay

flipple has two daily modes:

- **flipple** - 5 two-position switches.
- **flipple³** - 5 rotating three-position switches. good luck!

the daily puzzle changes at midnight in `America/New_York`. each mode has its own deterministic answer, puzzle number, local win counter, and wordle-like share result. a shared local streak counts one completed daily puzzle per day.

the colored bars represent your guess history and correlate to the color of the toggle switch, not the standard correctness hints. the number on the right of your guess shows you how many positions you currently have selected correctly.

finish the daily puzzle, tap **share**, and practice mode unlocks for that day.

## soundtrack

flipple provides a completely interactive soundtrack that changes with the theme and mode.

the four tracks are original and handmade by **Aiden Cullen**, and blend seamlessly into each other in a way that gets addicting to toy with.

the soundtrack currently has separate tracks for normal flipple, flipple³, light mode, and dark mode. switching modes or themes attempts to crossfade into the matching timestamp so the music feels like it is transforming with the board instead of restarting.

all soundtrack rights are retained by **Aiden Cullen**. the music files are included only for use inside flipple.

## share behavior

share rows are based on correctness, not the selected in-game color. correct positions are green, unsolved positions are yellow, and missed positions on a losing final row turn red. this keeps flipple³ share results spoiler-light because the shared grid never reveals the blue dial state.

## version label

the small lower-left label is controlled by:

```js
appVersion: "0.3.2"
```

in `public/config.js`. future zips/releases should update that value, `package.json`, and `CHANGELOG.md` together.

## final website url for shares

`public/config.js` sets:

```js
shareSiteUrl: "https://flipple.live"
```

this keeps local testing from accidentally sharing `localhost`.

## project structure

```text
flipple/
├── api/
│   └── daily.js              # Vercel API route: /api/daily?mode=normal|cubed
├── docs/
│   ├── CONFIGURATION.md      # Launch date, share URL, and share color settings
│   ├── DEPLOYMENT.md         # GitHub to Vercel to Cloudflare walkthrough
│   ├── DEVELOPMENT.md        # How the code is organized
│   ├── LAUNCH_CHECKLIST.md   # Local, Vercel, phone, and domain checks
│   ├── PWA_INSTALL.md        # How to install flipple as a home-screen app
│   └── SUPPORT_TICKETS.md    # Mostly unserious log for bugs/confusing player reports
├── public/
│   ├── index.html            # Main page shell and fixed creator/version labels
│   ├── config.js             # Easy public settings, especially future domain URL
│   ├── styles.css            # Visual style and responsive layout
│   ├── app.js                # Browser game, local stats, and share flow
│   ├── manifest.webmanifest  # PWA install metadata
│   ├── service-worker.js     # PWA shell caching, excluding daily API responses
│   └── assets/
│       ├── favicon.svg
│       ├── icon-180.png      # Apple home-screen icon
│       ├── icon-192.png      # PWA icon
│       ├── icon-512.png      # Large PWA icon
│       ├── preview.png       # Green/yellow-only social thumbnail
│       └── audio/            # Handmade theme/mode soundtracks
├── src/
│   └── daily.js              # Shared Node daily puzzle generator
├── CREDITS.md
├── CHANGELOG.md
├── LICENSE.md
├── server.js                 # Local Node server for development
├── package.json
└── README.md
```

## Run locally

Install Node.js 18 or newer, then run:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

Check the daily API directly:

```text
http://localhost:3000/api/daily?mode=normal
http://localhost:3000/api/daily?mode=cubed
```

## Daily puzzle behavior

The API generates one normal answer and one cubed answer per Eastern date. The seed uses:

```text
flipple + mode + Eastern date + puzzle number + seed salt
```

The current public launch date is:

```js
launchDate: "2026-07-08"
```

That date is puzzle `#1`. Every Eastern date after that increases the puzzle number by one.

## Share button

After the game ends, a minimal share button appears near the bottom of the game card. After sharing a daily result, practice mode appears below it. The **share** button uses the phone's native share sheet when available, like other wordle-like games do on iPhone and Android. If native sharing is not available, it copies the result to the clipboard.

Share results use lightbulb emoji for used/unused guesses:

```text
flipple #1
💡💡💡◼️◼️◼️

🟩🟨🟩🟨🟨 2/5
🟨🟩🟩🟨🟨 3/5
🟩🟩🟩🟩🟩 5/5
```

Share rows are based on correctness, not the selected in-game color. Correct positions are green, unsolved positions are yellow, and missed positions on a losing final row turn red. This keeps flipple³ share results spoiler-light because the shared grid never reveals the blue dial state.

## Version label

The small lower-left label is controlled by:

```js
appVersion: "0.3.2"
```

in `public/config.js`. Future ZIPs/releases should update that value, `package.json`, and `CHANGELOG.md` together.

## Final website URL for shares

The permanent share URL is already configured as:

```js
shareSiteUrl: "https://flipple.live"
```

That means local testing, Vercel previews, native phone share sheets, and clipboard fallback results all point people to the public domain instead of `localhost` or a temporary preview URL. If the domain ever changes, update `public/config.js`, then commit and push.

## Suggested GitHub topics

Use these in the GitHub repo About panel when you edit the repository details:

```text
javascript, game, puzzle, wordle, wordle-game, wordle-like, daily, daily-game, web-game, browser-game, flipple, flipple-game, flipple-live, flipple-wordle
```

## Documentation included

- `docs/CONFIGURATION.md` - the small settings you are most likely to edit.
- `docs/DEPLOYMENT.md` - step-by-step GitHub, Vercel, and Cloudflare setup.
- `docs/DEVELOPMENT.md` - how the files work together so future edits stay clean.
- `docs/LAUNCH_CHECKLIST.md` - quick checks before sending the link around.
- `docs/PWA_INSTALL.md` - installing flipple as a home-screen app.
- `docs/SUPPORT_TICKETS.md` - early player confusion reports and joke support tickets.
- `CREDITS.md` - creator attribution and soundtrack ownership note.
- `LICENSE.md` - all-rights-reserved project license.

## notes

- The answer is returned by the API because this version prioritizes fun and shareability over anti-cheat seriousness.
- Local wins, completed daily results, and the shared streak are saved in the browser with `localStorage`. Practice mode does not add wins or streak days.
- The social preview image and cubed share result are intentionally green/yellow only.
- All soundtrack music is original, handmade by crazywaffleguy, and all music rights are retained by crazywaffleguy.
- Attribution and creator links are included in source headers, `package.json`, `README.md`, `CREDITS.md`, and `LICENSE.md`.
- Do not judge the app by double-clicking files inside the ZIP preview. Fully unzip the folder, then run `npm run dev` and open `http://localhost:3000`.
