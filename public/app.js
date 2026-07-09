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
  version: PROJECT_CONFIG.appVersion || "0.3.2",
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
    correctColor: "🟩",
    pendingColor: "🟨",
    missColor: "🟥"
  }),
  audio: Object.freeze({
    defaultVolume: 0.46,
    fadeMs: 500,
    tracks: Object.freeze({
      "normal-dark": "/assets/audio/flipple-dark.mp3",
      "normal-light": "/assets/audio/flipple-light.mp3",
      "cubed-dark": "/assets/audio/flipple-cubed-dark.mp3",
      "cubed-light": "/assets/audio/flipple-cubed-light.mp3"
    })
  })
});

const STORAGE = Object.freeze({
  settings: "flipple-settings-v2",
  stats: "flipple-stats-v2"
});

const MAINTENANCE_EASTER_EGG = Object.freeze({
  tapGoal: 10,
  resetDelay: 1800,
  riseDelay: 720,
  holdDelay: 1500,
  asset: "/assets/casual-unsuspecting-maintenance.png"
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
  shareHint: $("shareHint"),
  practice: $("practice"),
  sound: $("sound"),
  helpButton: $("helpButton"),
  settingsButton: $("settingsButton"),
  modalBackdrop: $("modalBackdrop"),
  modalClose: $("modalClose"),
  modalTitle: $("modalTitle"),
  modalBody: $("modalBody"),
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
  slide: "",
  themeTapCount: 0,
  themeTapTimer: null,
  maintenanceTimer: null,
  maintenanceActive: false,
  activeModal: "",
  lastFocus: null
};

const music = {
  unlocked: false,
  current: null,
  currentKey: "",
  fadeTimer: null,
  pendingTrackChange: false,
  preloadedKeys: new Set()
};

function loadSettings() {
  const saved = readJson(STORAGE.settings);
  const savedVolume = Number(saved?.musicVolume);
  const savedPreviousVolume = Number(saved?.previousMusicVolume);
  const musicVolume = Number.isFinite(savedVolume) ? clamp(savedVolume, 0, 1) : APP.audio.defaultVolume;
  const previousMusicVolume = Number.isFinite(savedPreviousVolume)
    ? clamp(savedPreviousVolume, 0.05, 1)
    : APP.audio.defaultVolume;

  return {
    theme: saved?.theme === "light" ? "light" : "dark",
    mode: saved?.mode === "cubed" ? "cubed" : "normal",
    musicVolume,
    previousMusicVolume,
    musicMuted: Boolean(saved?.musicMuted) || musicVolume === 0
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

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
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

function moonIcon(className = "theme-icon") {
  return `
    <svg class="${className}" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18.8 16.7c-1.2.8-2.6 1.2-4.2 1.2-4.4 0-8-3.6-8-8 0-1.8.6-3.5 1.7-4.8-3.2 1.2-5.5 4.3-5.5 7.9 0 4.6 3.7 8.4 8.4 8.4 3.3 0 6.2-1.9 7.6-4.7z"></path>
    </svg>
  `;
}

function sunIcon(className = "theme-icon") {
  return `
    <svg class="${className}" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="4.8"></circle>
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

function gearIcon(className = "") {
  return `
    <svg class="${className}" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M10 2.9h4l.5 2.1c.6.2 1.2.4 1.8.8l1.9-1.1 2.8 2.8-1.1 1.9c.3.6.6 1.2.8 1.8l2.1.5v4l-2.1.5c-.2.6-.4 1.2-.8 1.8l1.1 1.9-2.8 2.8-1.9-1.1c-.6.3-1.2.6-1.8.8L14 21.1h-4l-.5-2.1c-.6-.2-1.2-.4-1.8-.8l-1.9 1.1-2.8-2.8 1.1-1.9c-.3-.6-.6-1.2-.8-1.8l-2.1-.5v-4l2.1-.5c.2-.6.4-1.2.8-1.8L3 4.7l2.8-2.8 1.9 1.1c.6-.3 1.2-.6 1.8-.8L10 2.9zM12 8.7A3.3 3.3 0 1 0 12 15.3A3.3 3.3 0 1 0 12 8.7z"></path>
    </svg>
  `;
}

function speakerIcon(isMuted, className = "") {
  const mark = isMuted
    ? `
      <line class="speaker-mark" x1="16.5" y1="8" x2="21.3" y2="12.8"></line>
      <line class="speaker-mark" x1="21.3" y1="8" x2="16.5" y2="12.8"></line>
    `
    : `
      <path class="speaker-wave speaker-wave-inner" d="M16.7 9.2c.75.75 1.15 1.7 1.15 2.8s-.4 2.05-1.15 2.8"></path>
      <path class="speaker-wave speaker-wave-outer" d="M19 7.5c1.2 1.2 1.85 2.75 1.85 4.5S20.2 15.3 19 16.5"></path>
    `;

  return `
    <svg class="speaker-icon ${className}" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 9.2h4.2L14 4.8v14.4l-5.8-4.4H4z"></path>
      ${mark}
    </svg>
  `;
}

function switchGlyphMarkup(className = "", state = 0) {
  return `
    <span class="switch-glyph ${className}" data-state="${state}" aria-hidden="true">
      <span class="switch-glyph-stem"></span>
      <span class="switch-glyph-bar"></span>
    </span>
  `;
}

function dialGlyphMarkup(className = "", spin = 0) {
  return `
    <span class="dial-glyph ${className}" style="--preview-spin: ${spin}deg;" aria-hidden="true">
      ${wheelMarkup()}
    </span>
  `;
}

function themeToggleMarkup() {
  const targetTheme = state.settings.theme === "dark" ? "light" : "dark";
  const primaryIcon = targetTheme === "light"
    ? sunIcon("theme-icon primary")
    : moonIcon("theme-icon primary");
  const secondaryIcon = targetTheme === "light"
    ? moonIcon("theme-icon secondary")
    : sunIcon("theme-icon secondary");

  return `
    <span class="theme-toggle-stack" data-target-theme="${targetTheme}" aria-hidden="true">
      ${primaryIcon}
      ${secondaryIcon}
    </span>
  `;
}

function modeToggleMarkup() {
  const targetMode = isCubed() ? "normal" : "cubed";
  return `
    <span class="mode-toggle-shell mode-target-${targetMode}" aria-hidden="true">
      ${targetMode === "cubed" ? dialGlyphMarkup("mode-toggle-dial") : switchGlyphMarkup("mode-toggle-switch", 0)}
    </span>
  `;
}

function themeHelpVisualMarkup() {
  return `
    <span class="help-theme-pair" aria-hidden="true">
      ${sunIcon("theme-icon help-theme-icon")}
      ${moonIcon("theme-icon help-theme-icon")}
    </span>
  `;
}

function modeHelpVisualMarkup() {
  return `
    <span class="help-mode-pair" aria-hidden="true">
      ${switchGlyphMarkup("help-mode-switch", 0)}
      ${dialGlyphMarkup("help-mode-dial")}
    </span>
  `;
}

function helpSwitchVisualMarkup() {
  return `
    <span class="help-card" aria-hidden="true">
      ${switchGlyphMarkup("help-switch-glyph", 0)}
    </span>
  `;
}

function helpDialVisualMarkup() {
  return `
    <span class="help-card help-dial-card" aria-hidden="true">
      ${dialGlyphMarkup("help-dial-glyph")}
    </span>
  `;
}

function finalScoreText() {
  return `${state.guesses.length}/${APP.maxGuesses}`;
}

function applyShell() {
  document.body.dataset.theme = state.settings.theme;
  document.body.dataset.hard = String(isCubed());
  els.title.setAttribute("aria-label", isCubed() ? "flipple cubed" : "flipple");

  if (els.theme) {
    const targetTheme = state.settings.theme === "dark" ? "light" : "dark";
    els.theme.innerHTML = state.settings.theme === "dark" ? moonIcon() : sunIcon();
    els.theme.className = "icon theme-toggle";
    els.theme.setAttribute("aria-label", `switch to ${targetTheme} mode`);
  }

  if (els.mode) {
    const targetMode = isCubed() ? "normal" : "cubed";
    els.mode.innerHTML = modeToggleMarkup();
    els.mode.className = "icon mode-toggle" + (isCubed() ? " on" : "");
    els.mode.setAttribute("aria-label", `switch to ${targetMode === "cubed" ? "flipple cubed" : "normal flipple"}`);
  }

  if (els.settingsButton) {
    els.settingsButton.textContent = "[*]";
    els.settingsButton.classList.add("ascii-settings");
  }
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
  renderSoundControl();
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
  const showShareHint = state.over && !isPractice() && !state.shared;

  els.after.className = "after" + (state.over ? " show" : "") + (showPractice ? " with-practice" : "");
  els.practice.hidden = !showPractice;
  els.practice.setAttribute("aria-hidden", String(!showPractice));

  if (els.shareHint) {
    els.shareHint.hidden = !showShareHint;
    els.shareHint.setAttribute("aria-hidden", String(!showShareHint));
  }
}

function renderStreak() {
  const stats = loadStats();
  els.streak.textContent = `streak - ${stats.global.streak}`;
}

function isSoundMuted() {
  return state.settings.musicMuted || state.settings.musicVolume <= 0;
}

function renderSoundControl() {
  if (!els.sound) return;

  const muted = isSoundMuted();
  els.sound.innerHTML = speakerIcon(muted);
  els.sound.className = "sound-toggle" + (muted ? " is-muted" : "");
  els.sound.setAttribute("aria-label", muted ? "unmute soundtrack" : "mute soundtrack");
  els.sound.setAttribute("aria-pressed", String(!muted));
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
  const finalLoss = isFinalLossRow(index);
  const colors = entry.pattern
    .map((value, position) => shareColorForPosition(value, position, finalLoss))
    .join("");

  return `${colors} ${entry.score}/5`;
}

function isFinalLossRow(index) {
  return state.over && !state.won && index === state.guesses.length - 1;
}

function shareColorForPosition(value, position, finalLoss) {
  const correct = value === state.secret[position];
  if (correct) return APP.share.correctColor;
  return finalLoss ? APP.share.missColor : APP.share.pendingColor;
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

  updateMusicForContext();
}

function toggleTheme() {
  trackMaintenanceTap();
  state.settings.theme = state.settings.theme === "dark" ? "light" : "dark";
  saveSettings();
  render();
  updateMusicForContext();
}

function trackMaintenanceTap() {
  if (state.maintenanceActive) return;

  state.themeTapCount += 1;

  if (state.themeTapTimer) clearTimeout(state.themeTapTimer);
  state.themeTapTimer = setTimeout(resetMaintenanceTapChain, MAINTENANCE_EASTER_EGG.resetDelay);

  if (state.themeTapCount >= MAINTENANCE_EASTER_EGG.tapGoal) {
    resetMaintenanceTapChain();
    showMaintenanceEasterEgg();
  }
}

function resetMaintenanceTapChain() {
  state.themeTapCount = 0;

  if (state.themeTapTimer) {
    clearTimeout(state.themeTapTimer);
    state.themeTapTimer = null;
  }
}

function showMaintenanceEasterEgg() {
  const existing = document.querySelector(".maintenance-egg");
  if (existing) existing.remove();

  if (state.maintenanceTimer) {
    clearTimeout(state.maintenanceTimer);
    state.maintenanceTimer = null;
  }

  state.maintenanceActive = true;

  const holder = document.createElement("div");
  holder.className = "maintenance-egg";
  holder.setAttribute("aria-hidden", "true");

  const image = document.createElement("img");
  image.src = MAINTENANCE_EASTER_EGG.asset;
  image.alt = "";
  image.decoding = "async";

  holder.appendChild(image);
  document.body.appendChild(holder);

  requestAnimationFrame(() => {
    holder.classList.add("is-rising");
  });

  state.maintenanceTimer = setTimeout(() => {
    holder.classList.add("is-dissipating");

    holder.addEventListener("animationend", () => {
      holder.remove();
      state.maintenanceActive = false;
      state.maintenanceTimer = null;
    }, { once: true });
  }, MAINTENANCE_EASTER_EGG.riseDelay + MAINTENANCE_EASTER_EGG.holdDelay);
}

function soundtrackKey() {
  return `${state.settings.mode}-${state.settings.theme}`;
}

function desiredMusicVolume() {
  return isSoundMuted() ? 0 : clamp(state.settings.musicVolume, 0, 1);
}

function primeTrackCache() {
  Object.keys(APP.audio.tracks).forEach((key) => {
    if (music.preloadedKeys.has(key)) return;
    music.preloadedKeys.add(key);

    const audio = new Audio(APP.audio.tracks[key]);
    audio.preload = "auto";
    audio.load();
  });
}

function prepareAudioAtOffset(audio, seconds) {
  return new Promise((resolve) => {
    const applyTime = () => {
      try {
        const duration = audio.duration;
        if (Number.isFinite(duration) && duration > 0) {
          audio.currentTime = seconds % duration;
        } else if (seconds > 0) {
          audio.currentTime = seconds;
        }
      } catch {
        // Some browsers briefly reject currentTime until metadata is ready.
      }

      resolve();
    };

    if (audio.readyState >= 1) {
      applyTime();
      return;
    }

    audio.addEventListener("loadedmetadata", applyTime, { once: true });
    audio.load();
  });
}

function unlockAudioFromGesture() {
  if (music.unlocked) return;
  music.unlocked = true;
  primeTrackCache();
  updateMusicForContext({ fade: false });
}

function toggleSoundMute() {
  if (isSoundMuted()) {
    state.settings.musicMuted = false;
    if (state.settings.musicVolume <= 0) {
      state.settings.musicVolume = state.settings.previousMusicVolume || APP.audio.defaultVolume;
    }
    saveSettings();
    renderSoundControl();
    updateMusicForContext({ fade: false });
    updateSettingsVolumeUI();
    return;
  }

  if (state.settings.musicVolume > 0) {
    state.settings.previousMusicVolume = state.settings.musicVolume;
  }

  state.settings.musicMuted = true;
  saveSettings();
  renderSoundControl();
  pauseMusicImmediately();
  updateSettingsVolumeUI();
}

function setMusicVolume(value) {
  const volume = clamp(Number(value) / 100, 0, 1);
  state.settings.musicVolume = volume;

  if (volume <= 0) {
    state.settings.musicMuted = true;
  } else {
    state.settings.musicMuted = false;
    state.settings.previousMusicVolume = volume;
  }

  saveSettings();
  renderSoundControl();
  applyCurrentMusicVolume();
  updateSettingsVolumeUI();

  if (volume > 0) updateMusicForContext({ fade: false });
  else pauseMusicImmediately();
}

function applyCurrentMusicVolume() {
  if (music.current) music.current.volume = desiredMusicVolume();
}

function pauseMusicImmediately() {
  clearMusicFade();

  if (!music.current) return;
  music.current.volume = 0;
  music.current.pause();
}

function updateMusicForContext(options = {}) {
  const fade = options.fade !== false;
  renderSoundControl();

  const targetVolume = desiredMusicVolume();
  if (!music.unlocked || targetVolume <= 0) {
    applyCurrentMusicVolume();
    return;
  }

  const key = soundtrackKey();
  if (music.current && music.currentKey === key) {
    music.current.volume = targetVolume;
    music.current.play().catch(() => {});
    return;
  }

  const previous = music.current;
  const offset = previous ? previous.currentTime || 0 : 0;
  const next = makeMusicAudio(key);

  music.current = next;
  music.currentKey = key;
  startCrossfade(previous, next, offset, targetVolume, fade);
}

function makeMusicAudio(key) {
  const audio = new Audio(APP.audio.tracks[key]);
  audio.preload = "auto";
  audio.loop = true;
  audio.playsInline = true;
  audio.volume = 0;
  return audio;
}

function setMusicStartTime(audio, seconds) {
  prepareAudioAtOffset(audio, seconds);
}

function startCrossfade(previous, next, offset, targetVolume, fade) {
  clearMusicFade();

  prepareAudioAtOffset(next, offset).then(() => {
    next.volume = fade && previous ? 0 : targetVolume;

    next.play().catch(() => {
      music.pendingTrackChange = true;
    });

    if (!previous || !fade) {
      if (previous) stopAudio(previous);
      return;
    }

    const start = performance.now();
    const fromStartVolume = previous.volume;
    const duration = APP.audio.fadeMs;

    music.fadeTimer = setInterval(() => {
      const progress = clamp((performance.now() - start) / duration, 0, 1);
      const eased = progress * progress * (3 - 2 * progress);

      previous.volume = fromStartVolume * (1 - eased);
      next.volume = targetVolume * eased;

      if (progress >= 1) {
        clearMusicFade();
        stopAudio(previous);
        next.volume = targetVolume;
      }
    }, 30);
  });
}

function stopAudio(audio) {
  audio.pause();
  audio.removeAttribute("src");
  audio.load();
}

function clearMusicFade() {
  if (!music.fadeTimer) return;
  clearInterval(music.fadeTimer);
  music.fadeTimer = null;
}

function openHelp() {
  openModal("help");
}

function openSettings() {
  openModal("settings");
}

function openModal(type) {
  state.activeModal = type;
  state.lastFocus = document.activeElement;

  els.modalTitle.textContent = type === "settings" ? "settings" : "help";
  els.modalBody.innerHTML = type === "settings" ? settingsMarkup() : helpMarkup();
  els.modalBackdrop.hidden = false;
  document.body.classList.add("modal-open");

  if (type === "settings") wireSettingsControls();
  els.modalClose.focus({ preventScroll: true });
}

function closeModal() {
  if (els.modalBackdrop.hidden) return;

  els.modalBackdrop.hidden = true;
  els.modalBody.innerHTML = "";
  state.activeModal = "";
  document.body.classList.remove("modal-open");

  if (state.lastFocus?.focus) state.lastFocus.focus({ preventScroll: true });
  state.lastFocus = null;
}

function settingsMarkup() {
  const volume = Math.round(state.settings.musicVolume * 100);
  return `
    <section class="modal-section">
      <h3>soundtrack</h3>
      <p>The music changes with theme and mode. The four tracks are original, handmade, and now loop without an intro.</p>
      <p>Theme and mode changes crossfade at the same timestamp so the soundtrack stays smooth instead of jumping.</p>
      <label class="volume-setting" for="musicVolumeSlider">
        <span>music volume</span>
        <input class="music-slider" id="musicVolumeSlider" type="range" min="0" max="100" value="${volume}" />
        <span class="volume-readout" id="musicVolumeReadout">${volume}%</span>
      </label>
      <p class="music-credit">music by <a href="https://linktr.ee/aidencullenorl" target="_blank" rel="noopener noreferrer">Aiden Cullen</a></p>
    </section>

    <section class="modal-section coming-soon">
      <h3>later switches</h3>
      <div class="future-setting">
        <span class="future-switch-visual off" aria-hidden="true"></span>
        <span>haptic feedback</span>
        <em>coming later</em>
      </div>
      <div class="future-setting">
        <span class="future-switch-visual off" aria-hidden="true"></span>
        <span>sound effects</span>
        <em>coming later</em>
      </div>
    </section>
  `;
}

function wireSettingsControls() {
  const slider = document.getElementById("musicVolumeSlider");
  if (!slider) return;

  slider.addEventListener("input", (event) => setMusicVolume(event.target.value));
}

function updateSettingsVolumeUI() {
  const slider = document.getElementById("musicVolumeSlider");
  const readout = document.getElementById("musicVolumeReadout");
  const value = Math.round(state.settings.musicVolume * 100);

  if (slider) slider.value = String(value);
  if (readout) readout.textContent = `${value}%`;
}

function helpMarkup() {
  return `
    <section class="modal-section intro-section">
      <p>flipple is a daily code-breaking puzzle. Flip the pattern, press the check, then use the score to narrow down the hidden answer.</p>
    </section>

    <section class="modal-section">
      <h3>icons around the board</h3>
      <div class="help-row"><span class="help-visual">${crownIcon()}</span><p><b>crown</b> is your local wins for the current mode.</p></div>
      <div class="help-row"><span class="help-visual">${modeHelpVisualMarkup()}</span><p><b>mode</b> is the top-right mode toggle. It shows the mode you will switch into next.</p></div>
      <div class="help-row"><span class="help-visual">${themeHelpVisualMarkup()}</span><p><b>theme</b> is the light/dark toggle. It shows the theme you will switch into next.</p></div>
      <div class="help-row"><span class="help-visual bulb-pair">${bulbMarkup(false)}${bulbMarkup(true)}</span><p><b>lightbulbs</b> show your 6 turns. Each guess dims one bulb.</p></div>
    </section>

    <section class="modal-section">
      <h3>gameplay</h3>
      <div class="help-score-sample">
        <div class="mini"><div class="bit" data-color="0"></div><div class="bit" data-color="0"></div><div class="bit" data-color="0"></div><div class="bit" data-color="0"></div><div class="bit" data-color="0"></div></div>
        <span>0/5</span>
      </div>
      <p>The number on the right is how many positions are exactly right. The colored bars are your guess history, not green/yellow correctness hints.</p>
    </section>

    <section class="modal-section">
      <h3>gameplay modes</h3>
      <div class="help-row"><span class="help-visual">${helpSwitchVisualMarkup()}</span><p><b>normal</b> uses two-position switches.</p></div>
      <div class="help-row"><span class="help-visual">${helpDialVisualMarkup()}</span><p><b>flipple³</b> uses rotating three-position propellers. Same goal, one extra state.</p></div>
    </section>

    <section class="modal-section">
      <h3>soundtrack</h3>
      <p>flipple has a full in-game soundtrack throughout the experience. Each theme and mode has its own track, and the music was made by Aiden Cullen.</p>
    </section>

    <section class="modal-section">
      <h3>how to unlock</h3>
      <p>Finish the daily puzzle, tap <b>share</b>, and practice mode unlocks for that day.</p>
    </section>

    <footer class="modal-footnote">
      flipple by crazywaffleguy. Source, notes, and project info live on <a href="https://github.com/crazywaffleguy/flipple" target="_blank" rel="noopener noreferrer">GitHub</a>.
    </footer>
  `;
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
els.sound.addEventListener("click", toggleSoundMute);
els.helpButton.addEventListener("click", openHelp);
els.settingsButton.addEventListener("click", openSettings);
els.modalClose.addEventListener("click", closeModal);
els.modalBackdrop.addEventListener("click", (event) => {
  if (event.target === els.modalBackdrop) closeModal();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeModal();
});

document.addEventListener("pointerdown", unlockAudioFromGesture, { once: true });
document.addEventListener("keydown", unlockAudioFromGesture, { once: true });

startDaily();
