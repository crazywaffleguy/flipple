/*
  Flipple public configuration
  ----------------------------
  Creator: crazywaffleguy
  GitHub:  https://github.com/crazywaffleguy
  Linktree: https://linktr.ee/crazywaffleguy

  The live domain is set here so shares never point at localhost.
*/

window.FLIPPLE_CONFIG = Object.freeze({
  // Visible version label. Update this once per shipped ZIP/release.
  appVersion: "0.3.2",

  // Permanent public website URL used in native share sheets and clipboard results.
  // During local development, shares still point to the live domain on purpose.
  shareSiteUrl: "https://flipple.live",

  // Browser fallback settings. The live daily API uses src/daily.js.
  // If you change launchDate or seedSalt, update src/daily.js too.
  launchDate: "2026-07-08",
  seedSalt: "flipple-daily-seed-v1"
});
