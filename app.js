const STORAGE_KEY = "fidget_switch_full_v1";

const SWITCHES = [
  { id: "basic", label: "0", need: 0, haptic: "medium", coins: 0 },
  { id: "blue", label: "100", need: 100, haptic: "light", coins: 0 },
  { id: "yellow", label: "500", need: 500, haptic: "medium", coins: 0 },
  { id: "wood", label: "1000", need: 1000, haptic: "rigid", coins: 1 },
  { id: "silver", label: "3000", need: 3000, haptic: "heavy", coins: 3 },
  { id: "gold", label: "5000", need: 5000, haptic: "heavy", coins: 5 },
  { id: "diamond", label: "10000", need: 10000, haptic: "heavy", coins: 10 }
];

const countEl = document.getElementById("count");
const switchEl = document.getElementById("switch");
const tabsEl = document.getElementById("unlockTabs");
const toastEl = document.getElementById("toast");
const coinLayer = document.getElementById("coinLayer");

let state = {
  count: 0,
  current: "basic",
  unlocked: ["basic"]
};

let isOn = false;
let lastY = null;
let lastDir = null;
let lastClickTime = 0;

load();
render();

document.addEventListener("touchmove", e => e.preventDefault(), { passive: false });

switchEl.addEventListener("pointerdown", e => {
  lastY = e.clientY;
  lastDir = null;
  switchEl.setPointerCapture(e.pointerId);
});

switchEl.addEventListener("pointermove", e => {
  if (lastY === null) return;

  const dy = e.clientY - lastY;

  if (Math.abs(dy) < 14) return;

  const dir = dy > 0 ? "down" : "up";

  if (dir === lastDir) {
    lastY = e.clientY;
    return;
  }

  const now = Date.now();

  if (now - lastClickTime < 36) return;

  lastDir = dir;
  lastY = e.clientY;
  lastClickTime = now;

  clickSwitch();
});

switchEl.addEventListener("pointerup", resetTouch);
switchEl.addEventListener("pointercancel", resetTouch);

function clickSwitch() {
  isOn = !isOn;
  state.count++;

  checkUnlocks();

  save();
  render();

  const current = getCurrentSwitch();

  hapticClick(current.haptic);

  if (current.coins > 0) {
    spawnCoins(current.coins);
  }
}

function checkUnlocks() {
  SWITCHES.forEach(sw => {
    if (state.count >= sw.need && !state.unlocked.includes(sw.id)) {
      state.unlocked.push(sw.id);
      state.current = sw.id;
      showToast();
      hapticUnlock();
    }
  });
}

function render() {
  countEl.textContent = state.count.toLocaleString();

  switchEl.className = `switch ${state.current} ${isOn ? "on" : "off"}`;

  renderTabs();
}

function renderTabs() {
  tabsEl.innerHTML = "";

  SWITCHES.forEach(sw => {
    const tab = document.createElement("button");
    const unlocked = state.unlocked.includes(sw.id);
    const active = state.current === sw.id;

    tab.className = `tab ${unlocked ? "unlocked" : ""} ${active ? "active" : ""}`;
    tab.textContent = sw.label;

    tab.addEventListener("click", () => {
      if (!unlocked) return;

      state.current = sw.id;
      save();
      render();
      hapticClick(sw.haptic);
    });

    tabsEl.appendChild(tab);
  });
}

function getCurrentSwitch() {
  return SWITCHES.find(sw => sw.id === state.current) || SWITCHES[0];
}

function showToast() {
  toastEl.classList.add("show");

  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    toastEl.classList.remove("show");
  }, 1400);
}

function spawnCoins(amount) {
  const rect = switchEl.getBoundingClientRect();

  for (let i = 0; i < amount; i++) {
    const coin = document.createElement("div");
    coin.className = "coin";

    const startX = rect.right - 20;
    const startY = rect.top + rect.height * (0.35 + Math.random() * 0.3);

    coin.style.left = `${startX}px`;
    coin.style.top = `${startY}px`;

    const x = 40 + Math.random() * 90;
    const y = -80 + Math.random() * 160;

    coin.style.setProperty("--x", `${x}px`);
    coin.style.setProperty("--y", `${y}px`);

    coinLayer.appendChild(coin);

    setTimeout(() => coin.remove(), 700);
  }
}

function hapticClick(style = "medium") {
  try {
    const sdk =
      window.AppsInToss ||
      window.appsInToss ||
      window.Toss ||
      window.toss;

    if (sdk?.generateHapticFeedback) {
      sdk.generateHapticFeedback({
        type: "impact",
        style
      });
      return;
    }
  } catch (e) {}

  if (navigator.vibrate) {
    if (style === "light") navigator.vibrate(7);
    else if (style === "medium") navigator.vibrate([6, 8, 13]);
    else if (style === "heavy") navigator.vibrate([10, 12, 24]);
    else navigator.vibrate([8, 10, 18]);
  }
}

function hapticUnlock() {
  try {
    const sdk =
      window.AppsInToss ||
      window.appsInToss ||
      window.Toss ||
      window.toss;

    if (sdk?.generateHapticFeedback) {
      sdk.generateHapticFeedback({
        type: "notification",
        notificationType: "success"
      });
      return;
    }
  } catch (e) {}

  if (navigator.vibrate) {
    navigator.vibrate([40, 30, 40]);
  }
}

function resetTouch() {
  lastY = null;
  lastDir = null;
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));

    if (!saved) return;

    state = {
      ...state,
      ...saved
    };

    if (!state.unlocked.includes("basic")) {
      state.unlocked.unshift("basic");
    }
  } catch (e) {
    console.error(e);
  }
}