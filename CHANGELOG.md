# changelog

## 0.3.2 hotfix

- Added saved-result validation so corrupted local daily results can no longer reload into a blank board with empty guess rows.
- Corrupted saved results for the current day are now discarded automatically and replaced with a fresh playable board.
- Added a defensive submit guard so an empty or invalid board cannot save more broken `0/5` rows.
- Fixed a broken mode hover listener that stopped the app from finishing startup, leaving the board blank and preventing help/share/practice/audio buttons from working.
- Replaced the experimental animated top-right controls with stable static mode/theme controls.
- Reworked the settings icon into a simple ASCII-style control.
- Resized and corrected the mode selector switch and propeller icons.
- Rewrote `package.json` as strict valid JSON so Vercel can build again.
- Bumped only the service worker cache name so the fix is not held back by PWA caching.
- Centered the muted speaker `x` and tightened the speaker mark styling.
- Made the settings control more stable by forcing the simple ASCII `[*]` icon and cleaning its alignment.

## 0.3.2

- Added a slightly colder blue palette for flipple³ in both light and dark themes, keeping the same readable contrast while making cubed mode feel more icy and distinct.
- Swapped in the latest no-intro soundtrack files so all four theme/mode tracks share the same loop-ready length.
- Simplified soundtrack looping to use the new seamless audio loops while keeping timestamp-matched crossfades for theme and mode changes.
- Added a second speaker wave to the unmuted speaker icon.
- Added a small Settings credit link: `music by Aiden Cullen`, pointing to the music Linktree.
- Updated credits and README soundtrack notes to reflect the Aiden Cullen music credit and v0.3.2 release.

## 0.3.1

- Fixed the broken flipple³ gameplay icon in the Help modal and tightened the supporting visual styles.
- Reworked the top-right mode toggle so it previews the mode you will switch into, using a propeller icon or a switch icon instead of `II / III`.
- Added hover motion to the top-right controls: the mode preview now spins or flips, and the theme preview now animates a simple sun/moon rise-set transition.
- Reworked the Settings gear icon so it reads as a cleaner gear instead of a sunburst.
- Changed the muted speaker icon from a slash to an `x`.
- Updated the music slider thumb to a thin vertical handle and restyled the placeholder future switches to match that horizontal switch language.
- Tightened soundtrack switching so theme/mode crossfades begin from the exact matched timestamp more smoothly, and swapped in the new loop-matched soundtrack files.
- Standardized visible project branding to lowercase `flipple` across the app shell and core project docs.
- Bumped the public app, package, and cache versioning to `0.3.1`.

## 0.3.0

- Added the first full flipple soundtrack system with handmade music by crazywaffleguy throughout the game.
- Added separate theme and mode soundtracks for normal dark, normal light, flipple³ dark, and flipple³ light.
- Added a speaker control, music volume slider, local audio preferences, looping playback, and short crossfades when switching themes or modes.
- Added in-game Help and Settings pop-ups with compact visual explanations for icons, turns, modes, scoring, and practice unlocks.
- Added a daily share prompt before practice unlock.
- Added quality-of-life polish around post-game clarity, settings access, and first-player confusion.
- Added a support ticket log for early player confusion reports.

## 0.2.3

- Added PWA support so flipple can be installed to a phone home screen.
- Added a web app manifest, service worker, and generated app icons from the current favicon artwork.
- Cached the app shell while intentionally leaving daily API responses uncached so daily puzzles do not get stuck.
- Updated the visible app version and package metadata to v0.2.3.

## 0.2.2

- Changed the preview png to something that actually looks nice and matches the game font.
- Changed the favacon to be symmetrical between both of the sliders.

## 0.2.1

- Changed share rows to show correctness instead of selected colors, including cubed mode.
- Added red missed-position feedback on the final losing share row.
- Tuned mobile scaling so the play box sits higher and clears the footer labels better.
- Spaced the top lightbulb tracker a little wider.
- Updated the project description and docs around the wordle-like positioning.
- Added the recommended GitHub topic list to the README and package keywords.

## 0.2.0

- Established the cleaned pre-deployment build as the v0.2 line.
- Added a subtle fixed `flipple v0.2.0` label to the lower-left corner, matching the creator link size, color, and typography.
- Centralized the visible app version in `public/config.js` so future ZIPs can update the label cleanly.
- Removed a duplicate share-label reset and cleaned a leftover CSS selector comment from earlier iterations.

## 0.1.14

- Added a reversible practice flow: clicking the top-right `practice` label returns to the daily puzzle/result view without refreshing.
- Kept practice replayable while preserving daily win and streak tracking as local-only progress.
- Added small inline code comments around the main app sections so the project is easier to continue developing.
- Cleaned the final pre-launch project pass before GitHub/Vercel setup.

## 0.1.13

- Changed sharing behavior so desktop browsers copy the full result text instead of opening inconsistent desktop share panels.
- Kept native share sheets on likely mobile and tablet devices, including iPhone, iPad, Android, and other coarse-touch mobile browsers.
- Preserved the full share payload with title, bulbs, score grid, and `https://flipple.live` link in one text block.

## 0.1.12

- Restored full native share text so mobile share sheets include the title, bulbs, score grid, and `flipple.live` link together.
- Simplified share headers to show the puzzle title and number, then the lightbulb line on its own.
- Added a red final-row loss indicator so missed switches on the sixth guess show as red while correct positions stay green.
- Kept flipple³ share rows spoiler-friendly with green/yellow-only rows except for the final failed loss row.

## 0.1.11

- Set the permanent public domain to `https://flipple.live` across app configuration, metadata, documentation, and package metadata.
- Updated native share and clipboard fallback behavior so shared links point to `flipple.live` instead of local development URLs.
- Added the creator Linktree alongside GitHub attribution throughout documentation and source headers.
- Added domain-focused deployment notes for connecting Vercel and Cloudflare.

## 0.1.10

- Regenerated the social preview with no cubed number and slimmer preview-only switch sliders.
- Kept the in-game switch proportions unchanged while matching preview typography more closely.
- Matched share and practice button text sizing to the final score tracker.
- Kept the end-result score text clean without extra check or X marks.
- Reset the share button label cleanly between games so it does not stay on copied/shared.

## 0.1.9

- Adjusted the flipple title lettering for a more connected custom wordmark.
- Matched the game typography and preview artwork more closely.
- Thinned the normal-mode switch stems for consistency with the preview artwork.
- Regenerated the social preview with green/yellow-only artwork and no cubed marker.


## 0.1.8

- Refined the post-share practice entry and local progress layout.
- Enlarged the lightbulb guess tracker to better match the header controls.
- Centered guess color rows while keeping score counters aligned on the right.
- Slightly tightened and lightened the title typography while keeping one consistent sans-serif stack across the app.

## 0.1.7

- Added practice mode as a post-share option after finishing a daily puzzle.
- Hid the reset button during daily play; reset is now only available in practice mode.
- Added local daily streak tracking that counts one completed daily mode per Eastern day.
- Added separate local win counters for flipple and flipple³, shown with a minimal crown icon.
- Kept practice results shareable without counting practice wins toward daily win totals or streaks.
- Kept the app typography consistent across the new controls and local progress indicators.

## 0.1.6

- Split the finished-game tone so wins fade green and losses fade red.
- Changed the disabled submit button to a matching X on losses while keeping the check on wins.
- Added a subtle creator link in the lower-right corner.
- Lightened the main title weight slightly.

## 0.1.5

- Restored the lighter original sans-serif typography across the app.
- Regenerated the social preview image with more consistent switch spacing.
- Updated the favicon and normal-mode switch stems to match the thinner visual identity.
- Clarified local development notes for opening files through the Node server.
- Tightened proprietary license wording while keeping public creator credit under crazywaffleguy.

## 0.1.3

- Added `public/config.js` for the future permanent share URL.
- Moved the post-game share tray near the bottom of the game card.
- Added `docs/DEPLOYMENT.md` and `docs/DEVELOPMENT.md`.
- Kept share result bulbs as `💡` and `◼️`.
- Kept flipple³ share rows green/yellow only, with no blue emoji spoilers.

## 0.1.1

- Updated share results to use `💡` for used guesses and `◼️` for unused guesses.
- Kept flipple³ share rows green/yellow only, with no blue emoji spoilers.
- Centralized the future permanent website URL in app configuration.
- Added configuration and launch checklist documentation.

## 0.1.0

- First cohesive daily web version.
- Added local Node server.
- Added Vercel `/api/daily` route.
- Added deterministic daily normal and cubed puzzles.
- Added puzzle numbers, local stats, responsive layout, and share flow.
