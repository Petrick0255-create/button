const BUTTONS = [
  {
    id: "red",
    name: "기본 스위치",
    desc: "가볍고 기본적인 딸깍감",
    need: 0
  },
  {
    id: "blue",
    name: "청량 스위치",
    desc: "경쾌한 딸깍감",
    need: 100
  },
  {
    id: "black",
    name: "묵직 스위치",
    desc: "단단하고 묵직한 클릭감",
    need: 1000
  },
  {
    id: "green",
    name: "탄성 스위치",
    desc: "통통 튀는 클릭감",
    need: 3000
  },
  {
    id: "gold",
    name: "금속 스위치",
    desc: "고급스럽고 찰칵거리는 클릭감",
    need: 10000
  }
];

const STORAGE_KEY = "fidget_button_v1";

let state = {
  total: 0,
  today: 0,
  date: getToday(),
  currentButton: "red",
  switchOn: false,
  boostUntil: 0
};

const totalCount = document.getElementById("totalCount");
const todayCount = document.getElementById("todayCount");
const switchEl = document.getElementById("switch");
const progressBar = document.getElementById("progressBar");
const nextRewardText = document.getElementById("nextRewardText");
const buttonList = document.getElementById("buttonList");
const adBtn = document.getElementById("adBtn");
const resetBtn = document.getElementById("resetBtn");

load();
render();

switchEl.addEventListener("click", () => {
  clickSwitch();
});

adBtn.addEventListener("click", () => {
  // 나중에 실제 광고 SDK 연결할 자리
  state.boostUntil = Date.now() + 10 * 60 * 1000;
  save();
  render();
  alert("10분 동안 클릭 수가 2배로 올라갑니다.");
});

resetBtn.addEventListener("click", () => {
  if (!confirm("기록을 초기화할까요?")) return;

  localStorage.removeItem(STORAGE_KEY);

  state = {
    total: 0,
    today: 0,
    date: getToday(),
    currentButton: "red",
    switchOn: false,
    boostUntil: 0
  };

  save();
  render();
});

function clickSwitch() {
  checkDate();

  const multiplier = isBoostActive() ? 2 : 1;

  state.total += multiplier;
  state.today += multiplier;
  state.switchOn = !state.switchOn;

  playClick();
  vibrate();

  save();
  render();
}

function render() {
  checkDate();

  totalCount.textContent = state.total.toLocaleString();
  todayCount.textContent = `오늘 ${state.today.toLocaleString()}회`;

  switchEl.className = `switch ${state.currentButton} ${state.switchOn ? "on" : "off"}`;

  renderProgress();
  renderButtonList();
  renderAdButton();
}

function renderProgress() {
  const next = BUTTONS.find(btn => btn.need > state.total);

  if (!next) {
    nextRewardText.textContent = "모든 스위치를 해금했습니다.";
    progressBar.style.width = "100%";
    return;
  }

  const prevNeed = getPrevNeed(next.need);
  const current = state.total - prevNeed;
  const target = next.need - prevNeed;
  const percent = Math.min(100, (current / target) * 100);

  nextRewardText.textContent =
    `다음 보상까지 ${(next.need - state.total).toLocaleString()}회`;

  progressBar.style.width = `${percent}%`;
}

function renderButtonList() {
  buttonList.innerHTML = "";

  BUTTONS.forEach(btn => {
    const unlocked = state.total >= btn.need;
    const active = state.currentButton === btn.id;

    const item = document.createElement("div");
    item.className = `button-item ${unlocked ? "" : "locked"}`;

    item.innerHTML = `
      <div>
        <div class="button-name">${btn.name}</div>
        <div class="button-desc">${btn.desc}</div>
        ${
          unlocked
            ? ""
            : `<div class="unlock">${btn.need.toLocaleString()}회 달성 시 해금</div>`
        }
      </div>

      <button class="use-btn ${active ? "active" : ""}">
        ${active ? "사용중" : unlocked ? "사용" : "잠김"}
      </button>
    `;

    const useBtn = item.querySelector(".use-btn");

    useBtn.addEventListener("click", () => {
      if (!unlocked) return;

      state.currentButton = btn.id;
      save();
      render();
    });

    buttonList.appendChild(item);
  });
}

function renderAdButton() {
  if (isBoostActive()) {
    const left = Math.ceil((state.boostUntil - Date.now()) / 1000);
    const min = Math.floor(left / 60);
    const sec = String(left % 60).padStart(2, "0");
    adBtn.textContent = `클릭 x2 적용 중 ${min}:${sec}`;
  } else {
    adBtn.textContent = "광고 보면 10분 동안 클릭 x2";
  }
}

function playClick() {
  const audio = new AudioContext();

  const osc = audio.createOscillator();
  const gain = audio.createGain();

  const current = BUTTONS.find(btn => btn.id === state.currentButton);

  let freq = 500;

  if (current.id === "blue") freq = 750;
  if (current.id === "black") freq = 300;
  if (current.id === "green") freq = 620;
  if (current.id === "gold") freq = 900;

  osc.frequency.value = freq;
  gain.gain.value = 0.08;

  osc.connect(gain);
  gain.connect(audio.destination);

  osc.start();
  osc.stop(audio.currentTime + 0.035);
}

function vibrate() {
  if (!navigator.vibrate) return;

  if (state.currentButton === "red") navigator.vibrate(15);
  if (state.currentButton === "blue") navigator.vibrate(10);
  if (state.currentButton === "black") navigator.vibrate(30);
  if (state.currentButton === "green") navigator.vibrate([10, 20, 10]);
  if (state.currentButton === "gold") navigator.vibrate([20, 20, 20]);
}

function getPrevNeed(nextNeed) {
  const previous = BUTTONS
    .filter(btn => btn.need < nextNeed)
    .map(btn => btn.need);

  return Math.max(...previous);
}

function isBoostActive() {
  return state.boostUntil > Date.now();
}

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function checkDate() {
  const today = getToday();

  if (state.date !== today) {
    state.date = today;
    state.today = 0;
    save();
  }
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function load() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) return;

  try {
    state = {
      ...state,
      ...JSON.parse(saved)
    };

    checkDate();
  } catch (e) {
    console.error(e);
  }
}

setInterval(renderAdButton, 1000);