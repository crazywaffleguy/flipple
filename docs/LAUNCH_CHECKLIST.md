# Launch checklist

## Before pushing to GitHub

- [ ] Run `npm run dev`.
- [ ] Open `http://localhost:3000`.
- [ ] Play normal mode to win.
- [ ] Play cubed mode to win.
- [ ] Test the share button on desktop.
- [ ] Test the layout on a phone-sized browser window.
- [ ] Check `http://localhost:3000/api/daily?mode=normal`.
- [ ] Check `http://localhost:3000/api/daily?mode=cubed`.

## Before sending to friends/family

- [ ] Confirm the Vercel URL loads.
- [ ] Confirm both API routes work on Vercel.
- [ ] Play one full normal puzzle on your phone.
- [ ] Play one full cubed puzzle on your phone.
- [ ] Tap share on iPhone/Android and make sure the native share sheet opens.
- [ ] Make sure the copied/shared result includes the current website link.

## After buying a domain

- [ ] Add the domain in Vercel project settings.
- [ ] Add the DNS records in Cloudflare.
- [ ] Confirm the domain loads over HTTPS.
- [ ] Update `siteUrl` in `public/app.js`.
- [ ] Commit and push the change.
- [ ] Test the share button again.


## Domain checks

- [ ] Add `flipple.live` to the Vercel project.
- [ ] Add the DNS records Vercel gives you inside Cloudflare.
- [ ] Open `https://flipple.live`.
- [ ] Check `https://flipple.live/api/daily?mode=normal`.
- [ ] Check `https://flipple.live/api/daily?mode=cubed`.
- [ ] Finish a game on your phone and confirm the share sheet sends `https://flipple.live`.
