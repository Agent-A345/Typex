/**
 * TYPEX — Typing Speed Tester
 * Vanilla JS · No external dependencies
 * Features: WPM, accuracy, timer, difficulty, categories,
 *           localStorage, badges, weakness detection, WPM chart,
 *           sound feedback, dark/light mode, streak tracking.
 */

/* ══════════════════════════════════════════════════════════
   TEXT POOL
══════════════════════════════════════════════════════════ */
const TEXT_POOL = {
  easy: {
    general: [
      "The sun sets in the west every day. Birds fly south in the winter months.",
      "A cat sat on the mat. The dog ran fast across the yard.",
      "Today is a good day to start something new and fun.",
      "Apples and oranges are tasty fruits. I like to eat them every morning.",
      "The big red bus stops here. We can ride it to the park.",
    ],
    programming: [
      "A loop runs code many times. A variable holds a value.",
      "Functions take input and return output. Code runs line by line.",
      "A bug is an error in code. We debug code to fix it.",
      "HTML builds pages. CSS styles them. JS adds behavior.",
      "An array stores many items. A string holds text data.",
    ],
    quotes: [
      "Be yourself. Everyone else is already taken.",
      "Do one thing every day that scares you.",
      "In the middle of every difficulty lies opportunity.",
      "Life is what happens when you are busy making other plans.",
      "The only way to do great work is to love what you do.",
    ],
  },
  medium: {
    general: [
      "The quick brown fox jumps over the lazy dog near the riverbank on a warm summer afternoon.",
      "She packed her bags carefully, checked the weather forecast one last time, and stepped out into the crisp morning air.",
      "Scientists have discovered a new species of deep-sea fish that produces its own bioluminescent light.",
      "Learning a new skill requires patience, consistent practice, and the willingness to make and learn from mistakes.",
      "The old library at the corner of Fifth and Main held thousands of dusty books no one had opened in decades.",
    ],
    programming: [
      "Recursion is a technique where a function calls itself with a modified argument until it reaches a base case.",
      "Asynchronous programming in JavaScript uses promises and async/await syntax to handle non-blocking operations.",
      "Object-oriented programming organizes code around objects that combine state and behavior into a single unit.",
      "A REST API communicates over HTTP using standard methods like GET, POST, PUT, and DELETE to manage resources.",
      "Version control systems like Git track changes to source code and allow teams to collaborate without conflicts.",
    ],
    quotes: [
      "The greatest glory in living lies not in never falling, but in rising every time we fall.",
      "Your time is limited, so don't waste it living someone else's life.",
      "If you look at what you have in life, you'll always have more. If you look at what you don't have, you'll never have enough.",
      "You will face many defeats in life, but never let yourself be defeated.",
      "The most common way people give up their power is by thinking they don't have any.",
    ],
  },
  hard: {
    general: [
      "Photosynthesis is the biochemical process by which green plants, algae, and some bacteria convert light energy into chemical energy stored as glucose, using carbon dioxide and water as reactants.",
      "The philosophical concept of determinism posits that every event, including human cognition and behavior, is causally determined by an unbroken chain of prior events, leaving no room for genuine free will.",
      "Quantum entanglement describes a phenomenon where pairs of particles interact in ways such that the quantum state of each particle cannot be described independently of the others, even across vast distances.",
      "The Renaissance was a fervent period of European cultural, artistic, political, and economic rebirth following the Middle Ages, characterized by renewed interest in classical philosophy, literature, and art.",
      "Cryptographic hash functions produce a fixed-size output from arbitrary input such that minor changes in input yield drastically different outputs, making them invaluable for data integrity verification.",
    ],
    programming: [
      "Dynamic programming solves complex optimization problems by breaking them into overlapping subproblems, solving each once, and storing results in a memoization table to avoid redundant computation.",
      "The Byzantine Generals Problem describes a consensus challenge in distributed computing where nodes must agree on a strategy even when some nodes may be unreliable or actively malicious.",
      "Garbage collection algorithms such as mark-and-sweep and generational collection automatically reclaim memory occupied by objects that are no longer reachable through any reference chain in the program.",
      "SOLID principles in software engineering represent five design guidelines: Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, and Dependency Inversion, promoting maintainable code.",
      "WebAssembly is a binary instruction format that serves as a compilation target for high-level languages, enabling near-native performance for computationally intensive tasks running inside web browsers.",
    ],
    quotes: [
      "It does not matter how slowly you go as long as you do not stop. Patience and perseverance are the foundation of all accomplishment.",
      "Twenty years from now you will be more disappointed by the things that you didn't do than by the ones you did do, so throw off the bowlines, sail away from safe harbor, and catch the trade winds in your sails.",
      "I have learned over the years that when one's mind is made up, this diminishes fear; knowing what must be done, does away with fear and hesitation.",
      "Success is not final, failure is not fatal: it is the courage to continue that counts, for the true test of character is what one does when no one is watching.",
      "Darkness cannot drive out darkness; only light can do that. Hate cannot drive out hate; only love can do that. The measure of a man is what he does with power.",
    ],
  },
};

/* ══════════════════════════════════════════════════════════
   STATE
══════════════════════════════════════════════════════════ */
const state = {
  passage:        "",       // current passage text
  typed:          "",       // user-typed text so far
  difficulty:     "medium",
  category:       "general",
  timerDuration:  60,
  timeLeft:       60,
  timerId:        null,
  started:        false,
  finished:       false,
  correctChars:   0,
  incorrectChars: 0,
  totalTyped:     0,
  errors:         0,        // distinct error count (chars wrong at any point)
  wpmHistory:     [],       // WPM sampled every 10 seconds
  charErrors:     {},       // { charKey: errorCount } for weakness detection
  darkMode:       true,
  soundOn:        true,
};

/* ══════════════════════════════════════════════════════════
   DOM REFS
══════════════════════════════════════════════════════════ */
const $ = id => document.getElementById(id);

const els = {
  passageDisplay:   $("passageDisplay"),
  typingInput:      $("typingInput"),
  timerDisplay:     $("timerDisplay"),
  wpmDisplay:       $("wpmDisplay"),
  accDisplay:       $("accDisplay"),
  errDisplay:       $("errDisplay"),
  charsDisplay:     $("charsDisplay"),
  restartBtn:       $("restartBtn"),
  resultOverlay:    $("resultOverlay"),
  resultRestartBtn: $("resultRestartBtn"),
  finalWpm:         $("finalWpm"),
  finalAcc:         $("finalAcc"),
  finalErr:         $("finalErr"),
  finalChars:       $("finalChars"),
  badgesRow:        $("badgesRow"),
  weaknessBox:      $("weaknessBox"),
  wpmChart:         $("wpmChart"),
  historyList:      $("historyList"),
  streakRow:        $("streakRow"),
  bestWpmDisplay:   $("bestWpmDisplay"),
  dashBest:         $("dashBest"),
  dashAvg:          $("dashAvg"),
  dashStreak:       $("dashStreak"),
  dashTests:        $("dashTests"),
  themeToggle:      $("themeToggle"),
  themeIcon:        $("themeIcon"),
  soundToggle:      $("soundToggle"),
  soundIcon:        $("soundIcon"),
  difficultyGroup:  $("difficultyGroup"),
  categoryGroup:    $("categoryGroup"),
};

/* ══════════════════════════════════════════════════════════
   AUDIO
══════════════════════════════════════════════════════════ */
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;

function getAudioCtx() {
  if (!audioCtx) audioCtx = new AudioCtx();
  return audioCtx;
}

function playClick(correct) {
  if (!state.soundOn) return;
  try {
    const ctx  = getAudioCtx();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (correct) {
      osc.frequency.value = 900;
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07);
      osc.type = "sine";
    } else {
      osc.frequency.value = 160;
      osc.type = "sawtooth";
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    }
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  } catch (e) { /* audio not available */ }
}

/* ══════════════════════════════════════════════════════════
   LOCAL STORAGE HELPERS
══════════════════════════════════════════════════════════ */
const LS_KEYS = {
  best:    "typex_best_wpm",
  history: "typex_history",
  streak:  "typex_streak",
  tests:   "typex_tests",
  theme:   "typex_theme",
  sound:   "typex_sound",
};

function lsGet(key, fallback) {
  try { const v = localStorage.getItem(key); return v !== null ? JSON.parse(v) : fallback; }
  catch { return fallback; }
}
function lsSet(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

/* ══════════════════════════════════════════════════════════
   PASSAGE HELPERS
══════════════════════════════════════════════════════════ */
function pickPassage(diff, cat) {
  const pool = TEXT_POOL[diff][cat];
  return pool[Math.floor(Math.random() * pool.length)];
}

/* Build character spans for the passage display */
function renderPassage(text) {
  els.passageDisplay.innerHTML = text
    .split("")
    .map((ch, i) =>
      `<span class="char pending" data-index="${i}">${
        ch === " " ? "&#160;" : ch  // use &nbsp; so spaces show highlights
      }</span>`
    )
    .join("");
}

/* Get all char spans */
function getSpans() {
  return els.passageDisplay.querySelectorAll(".char");
}

/* ══════════════════════════════════════════════════════════
   INIT / RESTART
══════════════════════════════════════════════════════════ */
function init() {
  // Clear state
  state.passage        = pickPassage(state.difficulty, state.category);
  state.typed          = "";
  state.timeLeft       = state.timerDuration;
  state.started        = false;
  state.finished       = false;
  state.correctChars   = 0;
  state.incorrectChars = 0;
  state.totalTyped     = 0;
  state.errors         = 0;
  state.wpmHistory     = [];
  state.charErrors     = {};
  clearInterval(state.timerId);

  // Render
  renderPassage(state.passage);
  els.typingInput.value = "";
  els.typingInput.disabled = false;
  els.typingInput.placeholder = "Start typing to begin the test…";

  // Reset stats UI
  updateStatsUI(0, 100, state.timerDuration, 0, 0);
  els.timerDisplay.classList.remove("timer-low", "timer-mid");

  // Hide result overlay
  els.resultOverlay.classList.add("hidden");

  // Refresh dashboard
  refreshDashboard();

  // Focus input
  els.typingInput.focus();
}

/* ══════════════════════════════════════════════════════════
   TIMER
══════════════════════════════════════════════════════════ */
function startTimer() {
  state.started = true;
  // Sample WPM every 10s
  const sampleInterval = 10;
  let nextSample = sampleInterval;

  state.timerId = setInterval(() => {
    state.timeLeft--;
    els.timerDisplay.textContent = state.timeLeft;

    // Color cues
    if (state.timeLeft <= 10) {
      els.timerDisplay.classList.add("timer-low");
      els.timerDisplay.classList.remove("timer-mid");
    } else if (state.timeLeft <= 20) {
      els.timerDisplay.classList.add("timer-mid");
    }

    // WPM sample
    if (state.timeLeft === state.timerDuration - nextSample) {
      state.wpmHistory.push(calcWPM());
      nextSample += sampleInterval;
    }

    if (state.timeLeft <= 0) {
      endTest();
    }
  }, 1000);
}

/* ══════════════════════════════════════════════════════════
   CALCULATIONS
══════════════════════════════════════════════════════════ */
function calcWPM() {
  const elapsed = (state.timerDuration - state.timeLeft) || 1;
  return Math.round((state.correctChars / 5) / (elapsed / 60));
}

function calcAccuracy() {
  if (state.totalTyped === 0) return 100;
  return Math.round((state.correctChars / state.totalTyped) * 100);
}

/* ══════════════════════════════════════════════════════════
   STATS UI UPDATE
══════════════════════════════════════════════════════════ */
function updateStatsUI(wpm, acc, time, err, chars) {
  els.wpmDisplay.textContent   = wpm;
  els.accDisplay.textContent   = acc;
  els.timerDisplay.textContent = time;
  els.errDisplay.textContent   = err;
  els.charsDisplay.textContent = chars;
}

/* ══════════════════════════════════════════════════════════
   TYPING INPUT HANDLER
══════════════════════════════════════════════════════════ */
els.typingInput.addEventListener("input", handleInput);

function handleInput() {
  if (state.finished) return;

  const typed   = els.typingInput.value;
  const passage = state.passage;

  // Start timer on first character
  if (!state.started && typed.length > 0) {
    startTimer();
  }

  // Count chars typed since last keystroke
  const prevLen = state.typed.length;
  const newLen  = typed.length;
  const isDelete = newLen < prevLen;

  // --- Per-character comparison ---
  let correct = 0;
  let incorrect = 0;

  const spans = getSpans();

  // Find word boundaries so we can highlight current word
  const wordRanges = getWordRanges(passage);
  const currentWordRange = wordRanges.find(r => newLen >= r.start && newLen <= r.end);

  for (let i = 0; i < passage.length; i++) {
    const span = spans[i];
    span.className = "char"; // reset

    if (i < typed.length) {
      if (typed[i] === passage[i]) {
        span.classList.add("correct");
        correct++;
      } else {
        span.classList.add("incorrect");
        incorrect++;
      }
    } else if (i === typed.length) {
      span.classList.add("current");
    } else {
      span.classList.add("pending");
      // highlight current word (pending chars only)
      if (currentWordRange && i >= currentWordRange.start && i <= currentWordRange.end) {
        span.classList.add("current-word");
      }
    }
  }

  // Track errors (on new char, if wrong)
  if (!isDelete && newLen > 0 && newLen <= passage.length) {
    const newChar = typed[newLen - 1];
    const expChar = passage[newLen - 1];
    if (newChar !== expChar) {
      state.errors++;
      // Weakness detection: track per-char and per-bigram
      const key = expChar;
      state.charErrors[key] = (state.charErrors[key] || 0) + 1;
      playClick(false);
    } else {
      playClick(true);
    }
  }

  // Update state totals
  state.typed          = typed;
  state.correctChars   = correct;
  state.incorrectChars = incorrect;
  state.totalTyped     = typed.length;

  // Live stats
  const wpm = state.started ? calcWPM() : 0;
  const acc = calcAccuracy();
  updateStatsUI(wpm, acc, state.timeLeft, state.errors, state.totalTyped);

  // Auto-finish if passage complete
  if (typed.length >= passage.length) {
    endTest();
  }
}

/* Helper: compute word start/end indices */
function getWordRanges(text) {
  const ranges = [];
  let inWord = false;
  let start = 0;
  for (let i = 0; i < text.length; i++) {
    if (text[i] !== " " && !inWord) { inWord = true; start = i; }
    if ((text[i] === " " || i === text.length - 1) && inWord) {
      ranges.push({ start, end: text[i] === " " ? i - 1 : i });
      inWord = false;
    }
  }
  return ranges;
}

/* ══════════════════════════════════════════════════════════
   END TEST
══════════════════════════════════════════════════════════ */
function endTest() {
  if (state.finished) return;
  state.finished = true;
  clearInterval(state.timerId);

  // Push final sample
  state.wpmHistory.push(calcWPM());

  // Disable input
  els.typingInput.disabled = true;
  els.typingInput.placeholder = "Test complete!";

  const finalWpm = calcWPM();
  const finalAcc = calcAccuracy();

  // ── Save to localStorage ──
  saveResult(finalWpm, finalAcc);

  // ── Show results ──
  showResults(finalWpm, finalAcc);
}

/* ══════════════════════════════════════════════════════════
   SHOW RESULTS
══════════════════════════════════════════════════════════ */
function showResults(wpm, acc) {
  els.finalWpm.textContent   = wpm;
  els.finalAcc.textContent   = acc;
  els.finalErr.textContent   = state.errors;
  els.finalChars.textContent = state.totalTyped;

  // Badges
  const badges = [];
  if (wpm >= 80)  badges.push({ text: "⚡ LIGHTNING",        title: "WPM ≥ 80" });
  else if (wpm >= 60) badges.push({ text: "🏎 SPEEDSTER",    title: "WPM ≥ 60" });
  if (acc >= 99)  badges.push({ text: "✦ FLAWLESS",         title: "Accuracy ≥ 99%" });
  else if (acc >= 95) badges.push({ text: "🎯 ACCURACY MASTER", title: "Accuracy ≥ 95%" });
  if (wpm >= 100) badges.push({ text: "👑 CENTURION",        title: "WPM ≥ 100" });

  els.badgesRow.innerHTML = badges
    .map(b => `<div class="badge" title="${b.title}">${b.text}</div>`)
    .join("") || "";

  // Weakness detection
  renderWeakness();

  // WPM chart
  renderChart();

  // History
  renderHistory();

  // Streak
  renderStreak();

  // Show overlay
  els.resultOverlay.classList.remove("hidden");
  refreshDashboard();
}

/* ══════════════════════════════════════════════════════════
   WEAKNESS DETECTION
══════════════════════════════════════════════════════════ */
function renderWeakness() {
  const errs = state.charErrors;
  const sorted = Object.entries(errs).sort((a,b) => b[1] - a[1]);

  if (sorted.length === 0) {
    els.weaknessBox.classList.remove("visible");
    return;
  }

  const top = sorted.slice(0, 3);
  const chars = top.map(([ch]) => ch === " " ? "SPACE" : `'${ch}'`).join(", ");
  els.weaknessBox.textContent = `⚠ You had trouble with: ${chars}. Focus on these characters next time.`;
  els.weaknessBox.classList.add("visible");
}

/* ══════════════════════════════════════════════════════════
   WPM CHART (inline bar chart — pure CSS)
══════════════════════════════════════════════════════════ */
function renderChart() {
  const data = state.wpmHistory;
  if (!data.length) { els.wpmChart.innerHTML = ""; return; }

  const maxWpm = Math.max(...data, 1);

  els.wpmChart.innerHTML = data
    .map((wpm, i) => {
      const pct = Math.round((wpm / maxWpm) * 100);
      const label = `${(i + 1) * 10}s`;
      return `<div class="bar" style="height:${pct}%;" data-wpm="${wpm} WPM @ ${label}" title="${wpm} WPM at ${label}"></div>`;
    })
    .join("");
}

/* ══════════════════════════════════════════════════════════
   HISTORY & STREAK
══════════════════════════════════════════════════════════ */
function renderHistory() {
  const history = lsGet(LS_KEYS.history, []);
  if (!history.length) {
    els.historyList.innerHTML = `<div style="color:var(--text-muted);font-size:0.75rem;">No previous scores.</div>`;
    return;
  }

  els.historyList.innerHTML = history
    .slice()
    .reverse()
    .slice(0, 8)
    .map((item, i) => `
      <div class="history-item">
        <span class="hi-rank">#${i + 1}</span>
        <span class="hi-wpm">${item.wpm} WPM</span>
        <span class="hi-acc">${item.acc}% ACC</span>
        <span class="hi-time">${item.date}</span>
      </div>
    `)
    .join("");
}

function renderStreak() {
  const streak = lsGet(LS_KEYS.streak, 0);
  if (streak >= 3) {
    els.streakRow.innerHTML = `🔥 <span class="streak-hot">${streak} test streak</span> of high accuracy (≥90%)!`;
  } else if (streak > 0) {
    els.streakRow.textContent = `Streak: ${streak} high-accuracy test${streak > 1 ? "s" : ""} in a row.`;
  } else {
    els.streakRow.textContent = "";
  }
}

/* ══════════════════════════════════════════════════════════
   SAVE RESULT
══════════════════════════════════════════════════════════ */
function saveResult(wpm, acc) {
  // Best WPM
  const prevBest = lsGet(LS_KEYS.best, 0);
  if (wpm > prevBest) lsSet(LS_KEYS.best, wpm);

  // History (keep last 10)
  const history = lsGet(LS_KEYS.history, []);
  history.push({
    wpm,
    acc,
    date: new Date().toLocaleDateString(undefined, { month: "short", day: "numeric" }),
  });
  if (history.length > 10) history.splice(0, history.length - 10);
  lsSet(LS_KEYS.history, history);

  // Tests count
  lsSet(LS_KEYS.tests, (lsGet(LS_KEYS.tests, 0) || 0) + 1);

  // Streak (consecutive ≥90% accuracy)
  let streak = lsGet(LS_KEYS.streak, 0);
  if (acc >= 90) streak++;
  else streak = 0;
  lsSet(LS_KEYS.streak, streak);
}

/* ══════════════════════════════════════════════════════════
   DASHBOARD REFRESH
══════════════════════════════════════════════════════════ */
function refreshDashboard() {
  const best    = lsGet(LS_KEYS.best, null);
  const history = lsGet(LS_KEYS.history, []);
  const streak  = lsGet(LS_KEYS.streak, 0);
  const tests   = lsGet(LS_KEYS.tests, 0);

  const avg = history.length
    ? Math.round(history.reduce((s, h) => s + h.wpm, 0) / history.length)
    : null;

  els.dashBest.textContent   = best   !== null ? best  : "—";
  els.dashAvg.textContent    = avg    !== null ? avg   : "—";
  els.dashStreak.textContent = streak;
  els.dashTests.textContent  = tests;

  // Header best badge
  const bestVal = best !== null ? best : "—";
  els.bestWpmDisplay.textContent = bestVal;
}

/* ══════════════════════════════════════════════════════════
   DIFFICULTY & CATEGORY BUTTONS
══════════════════════════════════════════════════════════ */
els.difficultyGroup.addEventListener("click", e => {
  const btn = e.target.closest(".diff-btn");
  if (!btn) return;
  document.querySelectorAll(".diff-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  state.difficulty = btn.dataset.diff;
  init();
});

els.categoryGroup.addEventListener("click", e => {
  const btn = e.target.closest(".cat-btn");
  if (!btn) return;
  document.querySelectorAll(".cat-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  state.category = btn.dataset.cat;
  init();
});

/* ══════════════════════════════════════════════════════════
   RESTART BUTTONS
══════════════════════════════════════════════════════════ */
els.restartBtn.addEventListener("click", init);
els.resultRestartBtn.addEventListener("click", init);

/* ══════════════════════════════════════════════════════════
   THEME TOGGLE
══════════════════════════════════════════════════════════ */
function applyTheme(dark) {
  state.darkMode = dark;
  document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
  els.themeIcon.textContent = dark ? "☀" : "☾";
  lsSet(LS_KEYS.theme, dark);
}

els.themeToggle.addEventListener("click", () => applyTheme(!state.darkMode));

/* ══════════════════════════════════════════════════════════
   SOUND TOGGLE
══════════════════════════════════════════════════════════ */
function applySound(on) {
  state.soundOn = on;
  els.soundIcon.textContent = on ? "♪" : "♪̶";
  els.soundToggle.title = on ? "Sound ON (click to mute)" : "Sound OFF (click to enable)";
  lsSet(LS_KEYS.sound, on);
}

els.soundToggle.addEventListener("click", () => applySound(!state.soundOn));

/* ══════════════════════════════════════════════════════════
   KEYBOARD SHORTCUT: Esc to restart
══════════════════════════════════════════════════════════ */
document.addEventListener("keydown", e => {
  if (e.key === "Escape") init();
  // Tab in textarea — prevent focus stealing
  if (e.key === "Tab" && document.activeElement === els.typingInput) {
    e.preventDefault();
  }
});

/* ══════════════════════════════════════════════════════════
   PREVENT paste in typing area
══════════════════════════════════════════════════════════ */
els.typingInput.addEventListener("paste", e => e.preventDefault());

/* ══════════════════════════════════════════════════════════
   BOOT
══════════════════════════════════════════════════════════ */
(function boot() {
  // Restore preferences
  const savedTheme = lsGet(LS_KEYS.theme, true);
  const savedSound = lsGet(LS_KEYS.sound, true);
  applyTheme(savedTheme);
  applySound(savedSound);

  // Init app
  init();
  refreshDashboard();
})();
