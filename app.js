const STORAGE_KEY = "fidget_switch_simple_v1";

const countEl = document.getElementById("count");
const switchEl = document.getElementById("switch");
const rewardEl = document.getElementById("reward");

const rewards = [100, 1000, 3000, 5000, 10000];

let count = Number(localStorage.getItem(STORAGE_KEY)) || 0;
let isOn = false;

let startY = null;
let lastTriggerY = null;
let lastDirection = null;

render();

switchEl.addEventListener("pointerdown", e => {
  startY = e.clientY;
  lastTriggerY = e.clientY;
  switchEl.setPointerCapture(e.pointerId);
});

switchEl.addEventListener("pointermove", e => {
  if (lastTriggerY === null) return;

  const dy = e.clientY - lastTriggerY;

  if (Math.abs(dy) < 22) return;

  const direction = dy > 0 ? "down" : "up";

  if (direction === lastDirection) {
    lastTriggerY = e.clientY;
    return;
  }

  lastDirection = direction;
  lastTriggerY = e.clientY;

  toggleSwitch();
});

switchEl.addEventListener("pointerup", () => {
  startY = null;
  lastTriggerY = null;
  lastDirection = null;
});

switchEl.addEventListener("pointercancel", () => {
  startY = null;
  lastTriggerY = null;
  lastDirection = null;
});

function toggleSwitch() {
  isOn = !isOn;
  count++;

  localStorage.setItem(STORAGE_KEY, count);

  vibrate();
  playClick();
  render();
}

function render() {
  countEl.textContent = count.toLocaleString();

  switchEl.className = `switch ${isOn ? "on" : "off"}`;

  const next = rewards.find(r => count < r);

  if (next) {
    rewardEl.textContent = `다음 버튼까지 ${(next - count).toLocaleString()}회`;
  } else {
    rewardEl.textContent = "모든 버튼 해금 완료";
  }
}

function vibrate() {
  if (!navigator.vibrate) return;

  navigator.vibrate(14);
}

function playClick() {
  const ctx = new AudioContext();

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "square";
  osc.frequency.value = isOn ? 620 : 420;

  gain.gain.setValueAtTime(0.06, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.035);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.035);
}