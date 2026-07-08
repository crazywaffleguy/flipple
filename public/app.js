/*
  Flipple browser app
  -------------------
  Creator: crazywaffleguy
  GitHub:  https://github.com/crazywaffleguy
  Linktree: https://linktr.ee/crazywaffleguy

  Daily puzzles, practice sessions, local stats, and share text live here.
  The server provides /api/daily; this file includes a small fallback so the app
  can still preview cleanly before deployment is perfect.
*/

const PROJECT_CONFIG = window.FLIPPLE_CONFIG || {};

const APP = Object.freeze({
  version: PROJECT_CONFIG.appVersion || "0.2.0",
  length: 5,
  maxGuesses: 6,
  timezone: "America/New_York",
  launchDate: PROJECT_CONFIG.launchDate || "2026-07-08",
  seedSalt: PROJECT_CONFIG.seedSalt || "flipple-daily-seed-v1",
  modes: Object.freeze({
    normal: Object.freeze({ label: "flipple", states: 2, selector: "II" }),
    cubed: Object.freeze({ label: "flipple³", states: 3, selector: "III" })
  }),
  share: Object.freeze({
    siteUrl: PROJECT_CONFIG.shareSiteUrl || "",
    bulbs: Object.freeze({ on: "💡", off: "◼️" }),
    normalColors: Object.freeze(["🟩", "🟨"]),
    cubedColors: Object.freeze(["🟩", "🟨", "🟨"]),
    missColor: "🟥"
  })
});

const STORAGE = Object.freeze({
  settings: "flipple-settings-v2",
  stats: "flipple-stats-v2"
});

const $ = (id) => document.getElementById(id);

const els = Object.freeze({
  game: $("game"),
  board: $("board"),
  history: $("history"),
  result: $("result"),
  tries: $("tries"),
  secret: $("secret"),
  submit: $("submit"),
  reset: $("reset"),
  theme: $("theme"),
  mode: $("mode"),
  title: $("title"),
  dailyMeta: $("dailyMeta"),
  winMeta: $("winMeta"),
  streak: $("streak"),
  after: $("after"),
  share: $("share"),
  practice: $("practice"),
  versionLabel: $("versionLabel")
});

const state = {
  settings: loadSettings(),
  session: "daily",
  daily: null,
  secret: [],
  current: [],
  rotations: [],
  guesses: [],
  over: false,
  won: false,
  shared: false,
  shareFlashTimer: null,
  slide: ""
};

function loadSettings() {
  const saved = readJson(STORAGE.settings);
  return {
    theme: saved?.theme === "light" ? "light" : "dark",
    mode: saved?.mode === "cubed" ? "cubed" : "normal"
  };
}

function saveSettings() {
  localStorage.setItem(STORAGE.settings, JSON.stringify(state.settings));
}

function emptyStats() {
  return {
    global: {
      streak: 0,
      maxStreak: 0,
      lastCompletedDate: "",
      lastCompletedPuzzle: 0,
      completedDates: {}
    },
    normal: { played: 0, wins: 0, results: {} },
    cubed: { played: 0, wins: 0, results: {} }
  };
}

function loadStats() {
  const base = emptyStats();
  const saved = readJson(STORAGE.stats) || {};

  return {
    global: { ...base.global, ...(saved.global || {}) },
    normal: { ...base.normal, ...(saved.normal || {}) },
    cubed: { ...base.cubed, ...(saved.cubed || {}) }
  };
}

function saveStats(stats) {
  localStorage.setItem(STORAGE.stats, JSON.stringify(stats));
}

function readJson(key) {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch {
    return null;
  }
}

function modeConfig() {
  return APP.modes[state.settings.mode];
}

function isCubed() {
  return state.settings.mode === "cubed";
}

function isPractice() {
  return state.session === "practice";
}

function statesForMode() {
  return modeConfig().states;
}

function moonIcon() {
  return `
    <svg class="theme-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18.8 16.7c-1.2.8-2.6 1.2-4.2 1.2-4.4 0-8-3.6-8-8 0-1.8.6-3.5 1.7-4.8-3.2 1.2-5.5 4.3-5.5 7.9 0 4.6 3.7 8.4 8.4 8.4 3.3 0 6.2-1.9 7.6-4.7z"></path>
    </svg>
  `;
}

function sunIcon() {
  return `
    <svg class="theme-icon" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="5"></circle>
      <path d="M12 1.8v3.1M12 19.1v3.1M1.8 12h3.1M19.1 12h3.1M4.8 4.8l2.2 2.2M17 17l2.2 2.2M19.2 4.8 17 7M7 17l-2.2 2.2" fill="none"></path>
    </svg>
  `;
}

function crownIcon() {
  return `
    <svg class="crown-icon" viewBox="0 0 28 22" aria-hidden="true">
      <path d="M3 19h22v-9l-6 4-5-9-5 9-6-4v9z"></path>
    </svg>
  `;
}

function checkIcon(className = "") {
  return `
    <svg class="${className}" viewBox="0 0 24 24" aria-hidden="true">
      <polyline points="5 13 10 18 20 6"></polyline>
    </svg>
  `;
}

function xIcon(className = "") {
  return `
    <svg class="${className}" viewBox="0 0 24 24" aria-hidden="true">
      <line x1="6" y1="6" x2="18" y2="18"></line>
      <line x1="18" y1="6" x2="6" y2="18"></line>
    </svg>
  `;
}

function finalScoreText() {
  return `${state.guesses.length}/${APP.maxGuesses}`;
}

function applyShell() {
  document.body.dataset.theme = state.settings.theme;
  document.body.dataset.hard = String(isCubed());
  els.title.setAttribute("aria-label", isCubed() ? "flipple cubed" : "flipple");
  els.theme.innerHTML = state.settings.theme === "dark" ? moonIcon() : sunIcon();
  els.mode.innerHTML = `<span class="mode-text">${modeConfig().selector}</span>`;
  els.mode.className = "icon" + (isCubed() ? " on" : "");
}

async function loadDaily() {
  const mode = state.settings.mode;

  try {
    const response = await fetch(`/api/daily?mode=${mode}`, { cache: "no-store" });
    if (!response.ok) throw new Error("Daily API failed");
    state.daily = await response.json();
  } catch {
    state.daily = fallbackDaily(mode);
  }

  state.secret = [...state.daily.pattern];
}

function startFreshBoard() {
  state.current = Array(APP.length).fill(0);
  state.rotations = Array(APP.length).fill(0);
  state.guesses = [];
  state.over = false;
  state.won = false;
  state.shared = false;
  els.result.textContent = "";
  els.result.className = "result";
  resetShareLabel();
}

async function startDaily(options = {}) {
  state.session = "daily";
  state.slide = options.slide || "";
  applyShell();
  await loadDaily();

  const saved = getSavedDailyResult();
  if (saved) restoreSavedResult(saved);
  else startFreshBoard();

  render();
}

function startPractice(options = {}) {
  state.session = "practice";
  state.slide = options.slide || "";
  state.secret = randomPattern();
  startFreshBoard();
  render();
}

async function returnToDaily() {
  if (!isPractice()) return;
  await startDaily({ slide: "left" });
}

function getSavedDailyResult() {
  const stats = loadStats();
  return stats[state.settings.mode].results[state.daily.date] || null;
}

function restoreSavedResult(saved) {
  state.guesses = saved.guesses || [];
  state.over = true;
  state.won = Boolean(saved.won);
  state.shared = Boolean(saved.shared);
  state.current = state.guesses.at(-1)?.pattern || Array(APP.length).fill(0);
  state.rotations = Array(APP.length).fill(0);
  resetShareLabel();

  els.result.textContent = finalScoreText();
  els.result.className = state.won ? "result show win" : "result show lose";
}

// Re-render the visual shell after any state change.
function render() {
  applyShell();
  renderGameTone();
  renderMeta();
  renderBoard();
  renderHistory();
  renderSecret();
  renderTries();
  renderActions();
  renderAfter();
  renderStreak();
  renderVersionLabel();
}

function renderGameTone() {
  const endTone = state.over ? (state.won ? " end-win" : " end-lose") : "";
  const sessionTone = isPractice() ? " practice" : " daily";
  els.game.className = `game${sessionTone}${endTone}`;
}

function renderMeta() {
  const stats = loadStats();
  const wins = stats[state.settings.mode].wins;
  const practice = isPractice();

  els.winMeta.innerHTML = `${crownIcon()}<span>${wins}</span>`;
  els.dailyMeta.textContent = practice ? "practice" : `#${state.daily?.puzzleNumber || 1}`;
  els.dailyMeta.className = `daily-meta${practice ? " is-return" : ""}`;
  els.dailyMeta.setAttribute(
    "aria-label",
    practice ? "return to daily puzzle" : "daily puzzle number"
  );
}

function renderBoard() {
  els.board.innerHTML = "";
  els.board.className = "board";

  state.current.forEach((value, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.setAttribute("aria-label", String(index + 1));
    button.dataset.state = String(value);

    if (isCubed()) {
      button.className = "dial";
      button.style.setProperty("--spin", `${state.rotations[index]}deg`);
      button.innerHTML = wheelMarkup();
    } else {
      button.className = "switch";
      button.innerHTML = "<span class='slot'></span>";
    }

    button.addEventListener("click", () => flipControl(button, index));
    els.board.appendChild(button);
  });

  if (state.slide) {
    requestAnimationFrame(() => {
      els.board.classList.add(state.slide === "right" ? "from-right" : "from-left");
      state.slide = "";
    });
  }
}

function flipControl(button, index) {
  if (state.over) return;

  state.current[index] = (state.current[index] + 1) % statesForMode();
  button.dataset.state = String(state.current[index]);

  if (isCubed()) {
    state.rotations[index] += 120;
    button.style.setProperty("--spin", `${state.rotations[index]}deg`);
  }
}

function renderHistory() {
  els.history.innerHTML = "";

  state.guesses.forEach((entry) => {
    const row = document.createElement("div");
    row.className = "row";

    const spacer = document.createElement("div");
    spacer.className = "row-spacer";

    const score = document.createElement("div");
    score.className = "score";
    score.textContent = `${entry.score}/5`;

    row.append(spacer, drawPattern(entry.pattern), score);
    els.history.appendChild(row);
  });
}

function renderSecret() {
  els.secret.innerHTML = "";
  els.secret.appendChild(drawPattern(state.secret));
  els.secret.className = "secret" + (state.over ? " show" : "");
}

function renderTries() {
  els.tries.innerHTML = "";
  for (let i = 0; i < APP.maxGuesses; i += 1) {
    els.tries.insertAdjacentHTML("beforeend", bulbMarkup(i < state.guesses.length));
  }
}

function renderActions() {
  els.submit.disabled = state.over;

  if (state.over && !state.won) {
    els.submit.innerHTML = xIcon();
    els.submit.setAttribute("aria-label", "game over");
  } else {
    els.submit.innerHTML = checkIcon();
    els.submit.setAttribute("aria-label", state.over ? "puzzle solved" : "submit guess");
  }

  els.reset.hidden = !isPractice();
  els.reset.setAttribute("aria-hidden", String(!isPractice()));
  els.game.dataset.actions = isPractice() ? "practice" : "daily";
}

function renderAfter() {
  const showPractice = !isPractice() && state.shared;

  els.after.className = "after" + (state.over ? " show" : "") + (showPractice ? " with-practice" : "");
  els.practice.hidden = !showPractice;
  els.practice.setAttribute("aria-hidden", String(!showPractice));
}

function renderStreak() {
  const stats = loadStats();
  els.streak.textContent = `streak - ${stats.global.streak}`;
}

function renderVersionLabel() {
  if (!els.versionLabel) return;
  els.versionLabel.textContent = `flipple v${APP.version}`;
}

function drawPattern(pattern) {
  const mini = document.createElement("div");
  mini.className = "mini";

  pattern.forEach((value) => {
    const bit = document.createElement("div");
    bit.className = "bit";
    bit.dataset.color = String(visualColor(value));
    mini.appendChild(bit);
  });

  return mini;
}

function visualColor(value) {
  if (!isCubed()) return value === 0 ? 0 : 2;
  return value;
}

function bulbMarkup(isOff) {
  return `
    <svg class="bulb${isOff ? " off" : ""}" viewBox="0 0 20 30" aria-hidden="true">
      <path class="glass" d="M10 2C6.1 2 3.3 5 3.3 8.8c0 2.3 1 4 2.4 5.5 1 1.1 1.8 2.2 2 3.7h4.6c.2-1.5 1-2.6 2-3.7 1.4-1.5 2.4-3.2 2.4-5.5C16.7 5 13.9 2 10 2z"></path>
      <rect class="neck" x="7" y="18" width="6" height="3"></rect>
      <rect class="base" x="6" y="22" width="8" height="3"></rect>
      <rect class="base" x="7" y="26" width="6" height="2"></rect>
    </svg>
  `;
}

function wheelMarkup() {
  return `
    <svg class="wheel" viewBox="0 0 100 100" aria-hidden="true">
      <line class="spoke green" x1="50" y1="50" x2="50" y2="84"></line>
      <line class="spoke mustard" x1="50" y1="50" x2="20.6" y2="33"></line>
      <line class="spoke blue" x1="50" y1="50" x2="79.4" y2="33"></line>
      <circle class="hub" cx="50" cy="50" r="8"></circle>
    </svg>
  `;
}

// Submit the current pattern and end the session when solved or out of guesses.
function submitGuess() {
  if (state.over) return;

  const pattern = [...state.current];
  const score = sameCount(pattern, state.secret);
  state.guesses.push({ pattern, score });

  els.result.textContent = `${score}/5`;
  els.result.className = "result show";

  if (score === APP.length) {
    state.over = true;
    state.won = true;
    els.result.textContent = finalScoreText();
    els.result.className = "result show win";
    if (!isPractice()) recordDailyResult();
  } else if (state.guesses.length === APP.maxGuesses) {
    state.over = true;
    state.won = false;
    els.result.textContent = finalScoreText();
    els.result.className = "result show lose";
    if (!isPractice()) recordDailyResult();
  }

  render();
}

function sameCount(a, b) {
  return a.reduce((total, value, index) => total + (value === b[index] ? 1 : 0), 0);
}

// Daily results are the only results that count toward local wins/streaks.
function recordDailyResult() {
  const stats = loadStats();
  const modeStats = stats[state.settings.mode];
  const alreadyCompletedThisMode = Boolean(modeStats.results[state.daily.date]);

  if (!alreadyCompletedThisMode) {
    modeStats.played += 1;
    if (state.won) modeStats.wins += 1;
  }

  recordGlobalCompletion(stats);

  modeStats.results[state.daily.date] = {
    date: state.daily.date,
    puzzleNumber: state.daily.puzzleNumber,
    mode: state.settings.mode,
    won: state.won,
    shared: state.shared,
    guesses: state.guesses,
    completedAt: new Date().toISOString()
  };

  saveStats(stats);
}

function recordGlobalCompletion(stats) {
  if (stats.global.completedDates[state.daily.date]) return;

  const previousPuzzle = stats.global.lastCompletedPuzzle;
  stats.global.streak = previousPuzzle === state.daily.puzzleNumber - 1 ? stats.global.streak + 1 : 1;
  stats.global.maxStreak = Math.max(stats.global.maxStreak, stats.global.streak);
  stats.global.lastCompletedPuzzle = state.daily.puzzleNumber;
  stats.global.lastCompletedDate = state.daily.date;
  stats.global.completedDates[state.daily.date] = true;
}

function markDailyShared() {
  if (isPractice() || !state.over || state.shared) return;

  state.shared = true;
  const stats = loadStats();
  const saved = stats[state.settings.mode].results[state.daily.date];

  if (saved) {
    saved.shared = true;
    saveStats(stats);
  }
}

// Desktop copies to clipboard; mobile uses the native share sheet when available.
async function shareResult() {
  if (!state.over) return;

  markDailyShared();
  renderAfter();

  const fullText = makeShareTextWithUrl(makeShareText());

  if (shouldUseNativeShare(fullText)) {
    try {
      // Mobile browsers use this for the iOS/Android share sheet.
      // The URL stays inside the text so apps keep the score grid with the link.
      await navigator.share({ title: shareTitle(), text: fullText });
      flashShareLabel("shared");
      return;
    } catch (error) {
      if (error?.name === "AbortError") return;
      // If a mobile share target fails, fall through to clipboard copy.
    }
  }

  await copyShareText(fullText);
  flashShareLabel("copied");
}

function shouldUseNativeShare(fullText) {
  if (!navigator.share || !isLikelyMobileDevice()) return false;

  const payload = { text: fullText };
  return !navigator.canShare || navigator.canShare(payload);
}

function isLikelyMobileDevice() {
  const ua = navigator.userAgent || navigator.vendor || "";
  const uaSaysMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(ua);
  const coarseTouch = window.matchMedia?.("(pointer: coarse)")?.matches && navigator.maxTouchPoints > 0;
  const phoneSized = window.matchMedia?.("(max-width: 900px)")?.matches;
  const ipadOS = /Macintosh/i.test(ua) && coarseTouch && navigator.maxTouchPoints > 1;

  return uaSaysMobile || ipadOS || (coarseTouch && phoneSized);
}

function makeShareText() {
  const rows = state.guesses.map((entry, index) => shareRow(entry, index));

  return [
    shareTitle(),
    shareBulbs(state.guesses.length),
    "",
    ...rows
  ].join("\n");
}

function makeShareTextWithUrl(text) {
  return `${text}\n\n${shareUrl()}`;
}

function shareTitle() {
  if (isPractice()) return `${modeConfig().label} practice`;
  return `${state.daily.label} #${state.daily.puzzleNumber}`;
}

function shareRow(entry, index) {
  const colors = isFinalLossRow(index)
    ? entry.pattern.map((value, position) => shareColorForFinalLoss(value, position)).join("")
    : entry.pattern.map(shareColorForValue).join("");

  return `${colors} ${entry.score}/5`;
}

function isFinalLossRow(index) {
  return state.over && !state.won && index === state.guesses.length - 1;
}

function shareColorForFinalLoss(value, position) {
  return value === state.secret[position] ? APP.share.normalColors[0] : APP.share.missColor;
}

function shareBulbs(used) {
  const onCount = Math.max(0, Math.min(APP.maxGuesses, used));
  const offCount = APP.maxGuesses - onCount;
  return APP.share.bulbs.on.repeat(onCount) + APP.share.bulbs.off.repeat(offCount);
}

function shareUrl() {
  return APP.share.siteUrl || window.location.origin;
}

async function copyShareText(fullText) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(fullText);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = fullText;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

function shareColorForValue(value) {
  if (isCubed()) return APP.share.cubedColors[value] || APP.share.cubedColors[0];
  return value === 0 ? APP.share.normalColors[0] : APP.share.normalColors[1];
}

function resetShareLabel() {
  if (state.shareFlashTimer) {
    clearTimeout(state.shareFlashTimer);
    state.shareFlashTimer = null;
  }

  els.share.textContent = "share";
}

function flashShareLabel(text) {
  if (state.shareFlashTimer) clearTimeout(state.shareFlashTimer);

  els.share.textContent = text;
  state.shareFlashTimer = setTimeout(() => {
    els.share.textContent = "share";
    state.shareFlashTimer = null;
  }, 1300);
}

function restartPractice() {
  if (!isPractice()) return;
  startPractice();
}

async function toggleMode() {
  const goingCubed = !isCubed();
  state.settings.mode = goingCubed ? "cubed" : "normal";
  saveSettings();

  if (isPractice()) startPractice({ slide: goingCubed ? "right" : "left" });
  else await startDaily({ slide: goingCubed ? "right" : "left" });
}

function toggleTheme() {
  state.settings.theme = state.settings.theme === "dark" ? "light" : "dark";
  saveSettings();
  render();
}

function randomPattern() {
  return Array.from({ length: APP.length }, () => Math.floor(Math.random() * statesForMode()));
}

// Browser fallback daily generator mirrors src/daily.js for local static previews.
function fallbackDaily(mode = "normal") {
  const safeMode = APP.modes[mode] ? mode : "normal";
  const config = APP.modes[safeMode];
  const date = easternDateString();
  const puzzleNumber = puzzleNumberFor(date);
  const seedText = ["flipple", safeMode, date, puzzleNumber, APP.seedSalt].join(":");

  return {
    appName: "flipple",
    mode: safeMode,
    label: config.label,
    date,
    timezone: APP.timezone,
    launchDate: APP.launchDate,
    puzzleNumber,
    length: APP.length,
    states: config.states,
    seed: hashString(seedText).toString(36),
    pattern: seededPattern(seedText, APP.length, config.states)
  };
}

function easternDateString(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: APP.timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(now);

  const get = (type) => parts.find((part) => part.type === type).value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}

function puzzleNumberFor(dateString) {
  const number = dateToUtcDay(dateString) - dateToUtcDay(APP.launchDate) + 1;
  return Math.max(1, number);
}

function dateToUtcDay(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  return Date.UTC(year, month - 1, day) / 86400000;
}

function hashString(input) {
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

els.submit.addEventListener("click", submitGuess);
els.reset.addEventListener("click", restartPractice);
els.theme.addEventListener("click", toggleTheme);
els.mode.addEventListener("click", toggleMode);
els.share.addEventListener("click", shareResult);
els.practice.addEventListener("click", () => startPractice({ slide: "right" }));
els.dailyMeta.addEventListener("click", returnToDaily);

startDaily();
