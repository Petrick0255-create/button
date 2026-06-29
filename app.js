const STORAGE_KEY = "click_switch_count_v1";

const countEl = document.getElementById("count");
const switchEl = document.getElementById("switch");

let count = Number(localStorage.getItem(STORAGE_KEY)) || 0;
let isOn = false;

let lastY = null;
let lastDir = null;

render();

switchEl.addEventListener("pointerdown", e => {
  lastY = e.clientY;
  lastDir = null;
  switchEl.setPointerCapture(e.pointerId);
});

switchEl.addEventListener("pointermove", e => {
  if (lastY === null) return;

  const dy = e.clientY - lastY;

  if (Math.abs(dy) < 18) return;

  const dir = dy > 0 ? "down" : "up";

  if (dir !== lastDir) {
    lastDir = dir;
    lastY = e.clientY;
    clickSwitch();
  }
});

switchEl.addEventListener("pointerup", resetTouch);
switchEl.addEventListener("pointercancel", resetTouch);

function clickSwitch() {
  isOn = !isOn;
  count++;

  localStorage.setItem(STORAGE_KEY, count);
  render();

  strongClickVibration();
}

function render() {
  countEl.textContent = count.toLocaleString();
  switchEl.className = `switch ${isOn ? "on" : "off"}`;
}

function resetTouch() {
  lastY = null;
  lastDir = null;
}

function strongClickVibration() {
  if (!navigator.vibrate) return;

  navigator.vibrate([7, 10, 18]);
}