/*
  Flipple daily puzzle helpers
  ----------------------------
  Creator: crazywaffleguy
  GitHub:  https://github.com/crazywaffleguy
  Linktree: https://linktr.ee/crazywaffleguy

  One source of truth for daily puzzle dates, puzzle numbers, and seeded answers.
  This file is shared by the local Node server and the Vercel /api/daily route.
*/

const CONFIG = Object.freeze({
  appName: "flipple",
  timezone: "America/New_York",

  // Change this to the date you publicly launch the daily puzzle.
  // Puzzle #1 starts on this Eastern date.
  launchDate: "2026-07-08",

  modes: Object.freeze({
    normal: Object.freeze({ label: "flipple", states: 2, length: 5 }),
    cubed: Object.freeze({ label: "flipple³", states: 3, length: 5 })
  }),

  // This does not need to be secret for the first public version.
  // It just keeps your puzzle sequence unique to Flipple.
  seedSalt: "flipple-daily-seed-v1"
});

function easternDateString(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: CONFIG.timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(now);

  const get = (type) => parts.find((part) => part.type === type).value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}

function dateToUtcDay(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  return Date.UTC(year, month - 1, day) / 86400000;
}

function puzzleNumberFor(dateString) {
  const number = dateToUtcDay(dateString) - dateToUtcDay(CONFIG.launchDate) + 1;
  return Math.max(1, number);
}

function hashString(input) {
  // FNV-1a 32-bit hash. Small, deterministic, and good enough for puzzle seeds.
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed) {
  return function random() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededPattern(seedText, length, states) {
  const random = mulberry32(hashString(seedText));
  return Array.from({ length }, () => Math.floor(random() * states));
}

function dailyPuzzle(mode = "normal", now = new Date()) {
  const safeMode = CONFIG.modes[mode] ? mode : "normal";
  const modeConfig = CONFIG.modes[safeMode];
  const date = easternDateString(now);
  const puzzleNumber = puzzleNumberFor(date);
  const seedText = [CONFIG.appName, safeMode, date, puzzleNumber, CONFIG.seedSalt].join(":");

  return {
    appName: CONFIG.appName,
    mode: safeMode,
    label: modeConfig.label,
    date,
    timezone: CONFIG.timezone,
    launchDate: CONFIG.launchDate,
    puzzleNumber,
    length: modeConfig.length,
    states: modeConfig.states,
    seed: hashString(seedText).toString(36),
    pattern: seededPattern(seedText, modeConfig.length, modeConfig.states)
  };
}

module.exports = {
  CONFIG,
  dailyPuzzle,
  easternDateString,
  puzzleNumberFor,
  seededPattern,
  hashString
};
