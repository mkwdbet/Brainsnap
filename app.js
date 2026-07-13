const COUNTDOWN_STEPS = ["3", "2", "1", "시작!"];
const COUNTDOWN_STEP_MS = 600;
const RESULT_DELAY_MS = 1200;
const API_BASE_URL = "https://v4w3klaudj.execute-api.ap-northeast-2.amazonaws.com/api";
const AUTH_TOKEN_KEY = "memorySnapAuthToken";

const themes = [
  {
    name: "과일",
    items: [
      { name: "사과", icon: "🍎" },
      { name: "바나나", icon: "🍌" },
      { name: "포도", icon: "🍇" },
      { name: "딸기", icon: "🍓" },
      { name: "레몬", icon: "🍋" },
      { name: "수박", icon: "🍉" },
      { name: "체리", icon: "🍒" },
      { name: "복숭아", icon: "🍑" },
      { name: "키위", icon: "🥝" },
      { name: "파인애플", icon: "🍍" },
      { name: "망고", icon: "🥭" },
      { name: "멜론", icon: "🍈" }
    ]
  },
  {
    name: "간식",
    items: [
      { name: "쿠키", icon: "🍪" },
      { name: "도넛", icon: "🍩" },
      { name: "케이크", icon: "🍰" },
      { name: "컵케이크", icon: "🧁" },
      { name: "초콜릿", icon: "🍫" },
      { name: "사탕", icon: "🍬" },
      { name: "아이스크림", icon: "🍦" },
      { name: "팝콘", icon: "🍿" },
      { name: "프레첼", icon: "🥨" },
      { name: "마카롱", icon: "🍡" },
      { name: "푸딩", icon: "🍮" },
      { name: "꿀", icon: "🍯" }
    ]
  },
  {
    name: "동물",
    items: [
      { name: "강아지", icon: "🐶" },
      { name: "고양이", icon: "🐱" },
      { name: "토끼", icon: "🐰" },
      { name: "여우", icon: "🦊" },
      { name: "곰", icon: "🐻" },
      { name: "판다", icon: "🐼" },
      { name: "원숭이", icon: "🐵" },
      { name: "병아리", icon: "🐥" },
      { name: "펭귄", icon: "🐧" },
      { name: "개구리", icon: "🐸" },
      { name: "사자", icon: "🦁" },
      { name: "호랑이", icon: "🐯" }
    ]
  },
  {
    name: "물건",
    items: [
      { name: "시계", icon: "⌚" },
      { name: "카메라", icon: "📷" },
      { name: "전구", icon: "💡" },
      { name: "열쇠", icon: "🔑" },
      { name: "선물", icon: "🎁" },
      { name: "책", icon: "📚" },
      { name: "연필", icon: "✏️" },
      { name: "가방", icon: "🎒" },
      { name: "우산", icon: "☂️" },
      { name: "헤드폰", icon: "🎧" },
      { name: "트로피", icon: "🏆" },
      { name: "지도", icon: "🗺️" }
    ]
  }
];

const board = document.querySelector("#board");
const homeScreen = document.querySelector("#homeScreen");
const modeSelect = document.querySelector("#modeSelect");
const gameStage = document.querySelector("#gameStage");
const settingsButton = document.querySelector("#settingsButton");
const authButton = document.querySelector("#authButton");
const gameAuthButton = document.querySelector("#gameAuthButton");
const accountMenus = document.querySelectorAll(".account-menu");
const accountLogoutButtons = document.querySelectorAll(".account-logout-button");
const accountIdLabels = document.querySelectorAll("[data-account-id]");
const accountCoinLabels = document.querySelectorAll("[data-account-coins]");
const homeCoinCount = document.querySelector("#homeCoinCount");
const homeRecordCoins = document.querySelector("#homeRecordCoins");
const homeCardBestRound = document.querySelector("#homeCardBestRound");
const homeSequenceBestRound = document.querySelector("#homeSequenceBestRound");
const homeMissingBestRound = document.querySelector("#homeMissingBestRound");
const modePreview = document.querySelector("#modePreview");
const modePreviewContent = document.querySelector("#modePreviewContent");
const authModal = document.querySelector("#authModal");
const authCloseButton = document.querySelector("#authCloseButton");
const authTitle = document.querySelector("#authTitle");
const authDescription = document.querySelector("#authDescription");
const authForm = document.querySelector(".auth-form");
const authUserIdInput = document.querySelector("#authUserId");
const authPasswordInput = document.querySelector("#authPassword");
const authStatus = document.querySelector("#authStatus");
const accountSummary = document.querySelector("#accountSummary");
const accountUserId = document.querySelector("#accountUserId");
const accountCoins = document.querySelector("#accountCoins");
const loginButton = document.querySelector("#loginButton");
const signupButton = document.querySelector("#signupButton");
const anonymousNotice = document.querySelector("#anonymousNotice");
const cardModeButton = document.querySelector("#cardModeButton");
const sequenceModeButton = document.querySelector("#sequenceModeButton");
const missingModeButton = document.querySelector("#missingModeButton");
const modePlayButtons = document.querySelectorAll(".mode-play-button");
const modeRecordEls = {
  card: {
    round: document.querySelector("#cardBestRound")
  },
  sequence: {
    round: document.querySelector("#sequenceBestRound")
  },
  missing: {
    round: document.querySelector("#missingBestRound")
  }
};
const roundEl = document.querySelector("#round");
const streakEl = document.querySelector("#streak");
const bestRoundEl = document.querySelector("#bestRound");
const coinCountEl = document.querySelector("#coinCount");
const phaseLabel = document.querySelector("#phaseLabel");
const question = document.querySelector("#question");
const timerValue = document.querySelector("#timerValue");
const timeLimit = document.querySelector("#timeLimit");
const themeLabel = document.querySelector("#themeLabel");
const stageRound = document.querySelector("#stageRound");
const stageBestRound = document.querySelector("#stageBestRound");
const stageCoinCount = document.querySelector("#stageCoinCount");
const missionHint = document.querySelector("#missionHint");
const readyOverlay = document.querySelector("#readyOverlay");
const readyRound = document.querySelector("#readyRound");
const readyText = document.querySelector("#readyText");
const failOverlay = document.querySelector("#failOverlay");
const failMessage = document.querySelector("#failMessage");
const resultRound = document.querySelector("#resultRound");
const resultBestRound = document.querySelector("#resultBestRound");
const resultStreak = document.querySelector("#resultStreak");
const resultCoins = document.querySelector("#resultCoins");
const continueHint = document.querySelector("#continueHint");
const homeButton = document.querySelector("#homeButton");
const retryButton = document.querySelector("#retryButton");
const continueButton = document.querySelector("#continueButton");
const startButton = document.querySelector("#startButton");
const exitGameButton = document.querySelector("#exitGameButton");
let audioContext = null;

const missingItems = [
  { name: "시계", src: "assets/objects/clock.png", x: 23, y: 70, size: 12 },
  { name: "카메라", src: "assets/objects/camera.png", x: 44, y: 67, size: 13 },
  { name: "열쇠", src: "assets/objects/key.png", x: 62, y: 72, size: 10 },
  { name: "머그컵", src: "assets/objects/mug.png", x: 75, y: 67, size: 10 },
  { name: "책", src: "assets/objects/book.png", x: 34, y: 43, size: 13 },
  { name: "휴대폰", src: "assets/objects/phone.png", x: 57, y: 43, size: 9 },
  { name: "트로피", src: "assets/objects/trophy.png", x: 70, y: 38, size: 10 },
  { name: "헤드폰", src: "assets/objects/headphones.png", x: 84, y: 72, size: 13 }
];

const game = {
  mode: "card",
  round: 1,
  streak: 0,
  theme: themes[0],
  cards: [],
  target: null,
  lastRoundSignature: "",
  failureSnapshot: null,
  sequence: [],
  sequenceInputIndex: 0,
  sequenceShowing: false,
  missingItems: [],
  missingTarget: null,
  missingOptions: [],
  missingHidden: false,
  acceptingInput: false,
  cardsHidden: false,
  timerId: null,
  delayId: null,
  countdownId: null,
  sequenceTimeouts: [],
  running: false,
  coins: 0,
  bestRounds: {
    card: 0,
    sequence: 0,
    missing: 0
  },
  coinsEarnedThisRun: 0,
  selectedMode: "",
  authView: "login",
  authMode: localStorage.getItem("memorySnapAuthMode") === "member" ? "member" : "",
  authToken: localStorage.getItem(AUTH_TOKEN_KEY) || "",
  currentUserId: localStorage.getItem("memorySnapUserId") || ""
};

settingsButton.addEventListener("click", () => alert("설정은 다음 단계에서 연결할게요."));
authButton.addEventListener("click", handleAccountButtonClick);
gameAuthButton.addEventListener("click", handleAccountButtonClick);
accountLogoutButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    event.stopPropagation();
    logoutUser();
  });
});
authCloseButton.addEventListener("click", hideAuthModal);
loginButton.addEventListener("click", handlePrimaryAuthAction);
signupButton.addEventListener("click", handleSecondaryAuthAction);
authModal.addEventListener("click", (event) => {
  if (event.target === authModal) hideAuthModal();
});
document.addEventListener("click", (event) => {
  if (event.target.closest(".account-control")) return;
  hideAccountMenus();
});
authPasswordInput.addEventListener("keydown", (event) => {
  if (game.authView === "account") return;
  if (event.key === "Enter") handleAuthSubmit(game.authView);
});
cardModeButton.addEventListener("click", () => selectHomeMode("card"));
sequenceModeButton.addEventListener("click", () => selectHomeMode("sequence"));
missingModeButton.addEventListener("click", () => selectHomeMode("missing"));
modePlayButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    event.stopPropagation();
    startGame(button.dataset.mode);
  });
});
[cardModeButton, sequenceModeButton, missingModeButton].forEach((button) => {
  button.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    selectHomeMode(button.id === "sequenceModeButton" ? "sequence" : button.id === "missingModeButton" ? "missing" : "card");
  });
});
startButton.addEventListener("click", () => startGame(game.mode));
homeButton.addEventListener("click", goHome);
exitGameButton.addEventListener("click", goHome);
retryButton.addEventListener("click", restartCurrentMode);
continueButton.addEventListener("click", continueFailedRound);
window.addEventListener("resize", () => {
  if (game.mode === "sequence") {
    renderSequenceBoard();
    return;
  }

  if (game.mode === "missing") {
    renderMissingBoard(game.missingHidden);
    return;
  }

  renderBoard(game.cardsHidden);
});

modePreview.appendChild(gameStage);
updateStats();
updateModeRecords();
updateHomeModeState();
updateContinueButton();
initAuthSession();
registerServiceWorker();

function startGame(mode = "card") {
  clearGameTimers();
  game.selectedMode = mode;
  updateHomeModeState();
  showGameStage();
  game.mode = mode;
  game.round = 1;
  game.streak = 0;
  game.running = true;
  game.coinsEarnedThisRun = 0;
  game.acceptingInput = false;
  game.cardsHidden = false;
  game.sequence = [];
  game.sequenceInputIndex = 0;
  game.sequenceShowing = false;
  game.sequenceTimeouts = [];
  game.missingItems = [];
  game.missingTarget = null;
  game.missingOptions = [];
  game.missingHidden = false;
  startButton.hidden = true;
  hideFailureOverlay();
  prepareRound();
}

function goHome() {
  clearGameTimers();
  hideReadyOverlay();
  hideFailureOverlay();
  game.round = 1;
  game.streak = 0;
  game.running = false;
  game.coinsEarnedThisRun = 0;
  game.acceptingInput = false;
  game.cardsHidden = false;
  game.failureSnapshot = null;
  game.sequence = [];
  game.sequenceInputIndex = 0;
  game.sequenceShowing = false;
  game.sequenceTimeouts = [];
  game.missingItems = [];
  game.missingTarget = null;
  game.missingOptions = [];
  game.missingHidden = false;
  game.theme = getThemeForRound(game.round);
  startButton.hidden = true;
  setPhase("준비", "카드 위치를 외울 준비가 됐나요?");
  timerValue.textContent = "준비";
  renderPreviewBoard();
  updateStats();
  showHomeScreen();
}

function restartCurrentMode() {
  if (!game.failureSnapshot) return;

  startGame(game.failureSnapshot.mode);
}

function continueFailedRound() {
  if (!game.failureSnapshot) return;
  if (!spendCoins(2)) {
    updateContinueButton();
    return;
  }

  clearGameTimers();
  showGameStage();
  hideFailureOverlay();
  hideReadyOverlay();
  game.round = game.failureSnapshot.round;
  game.streak = game.failureSnapshot.streak;
  game.mode = game.failureSnapshot.mode;
  game.running = true;
  game.coinsEarnedThisRun = game.failureSnapshot.coinsEarnedThisRun || 0;
  game.acceptingInput = false;
  game.cardsHidden = false;
  game.theme = getThemeForRound(game.round);
  startButton.hidden = true;
  prepareRound();
}

function showGameStage() {
  document.body.classList.add("is-home", "is-playing-home");
  document.body.classList.remove("is-mode-select");
  homeScreen.hidden = false;
  modeSelect.hidden = true;
  modePreviewContent.hidden = true;
  gameStage.hidden = false;
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
}

function showHomeScreen() {
  document.body.classList.add("is-home");
  document.body.classList.remove("is-mode-select", "is-playing-home");
  homeScreen.hidden = false;
  modeSelect.hidden = true;
  gameStage.hidden = true;
  modePreviewContent.hidden = false;
  game.selectedMode = "";
  updateStats();
  updateModeRecords();
  updateHomeModeState();
}

function showModeSelect() {
  document.body.classList.remove("is-home");
  document.body.classList.add("is-mode-select");
  homeScreen.hidden = true;
  gameStage.hidden = true;
  modeSelect.hidden = false;
  renderPreviewBoard();
  updateModeRecords();
}

function selectHomeMode(mode) {
  game.selectedMode = mode;
  updateHomeModeState();
}

function updateHomeModeState() {
  const buttons = {
    card: cardModeButton,
    sequence: sequenceModeButton,
    missing: missingModeButton
  };

  Object.entries(buttons).forEach(([mode, button]) => {
    button.classList.toggle("is-selected", game.selectedMode === mode);
    button.setAttribute("aria-pressed", String(game.selectedMode === mode));
  });

  if (!game.running) {
    renderModePreview(game.selectedMode);
  }
}

function renderModePreview(mode) {
  modePreviewContent.hidden = false;
  gameStage.hidden = true;

  if (!mode) {
    modePreviewContent.innerHTML = "<p>모드를 선택하면 플레이 미리보기가 표시됩니다.</p>";
    return;
  }

  if (mode === "sequence") {
    modePreviewContent.innerHTML = `
      <div class="preview-sequence" aria-label="빛나는 순서 미리보기">
        <span class="preview-pad"></span>
        <span class="preview-pad"></span>
        <span class="preview-pad"></span>
        <span class="preview-pad"></span>
      </div>
    `;
    return;
  }

  if (mode === "missing") {
    modePreviewContent.innerHTML = `
      <div class="preview-room" aria-label="사라진 물건 찾기 미리보기">
        <img src="assets/objects/clock.png" alt="">
        <img src="assets/objects/camera.png" alt="">
        <img src="assets/objects/mug.png" alt="">
      </div>
    `;
    return;
  }

  modePreviewContent.innerHTML = `
    <div class="preview-card-grid" aria-label="카드 위치 기억 미리보기">
      <span class="preview-card">🍎</span>
      <span class="preview-card">🍌</span>
      <span class="preview-card">🍇</span>
      <span class="preview-card">🍓</span>
      <span class="preview-card">🍋</span>
      <span class="preview-card">🍉</span>
    </div>
  `;
}

function prepareRound() {
  clearGameTimers();
  game.acceptingInput = false;
  game.cardsHidden = false;
  game.theme = getThemeForRound(game.round);

  if (game.mode === "sequence") {
    setPhase("준비", `${game.round}라운드, 빛나는 순서를 준비하세요.`);
  } else if (game.mode === "missing") {
    setPhase("준비", `${game.round}라운드, 사라질 물건을 찾아보세요.`);
  } else {
    setPhase("준비", `${game.round}라운드, ${game.theme.name} 테마를 준비하세요.`);
  }
  timerValue.textContent = "준비";
  renderReadyBoard();
  showReadyOverlay();
  updateStats();
  runReadyCountdown(startRound);
}

function startRound() {
  clearGameTimers();
  hideReadyOverlay();
  game.acceptingInput = false;
  game.cardsHidden = false;

  if (game.mode === "sequence") {
    startSequenceRound();
    return;
  }

  if (game.mode === "missing") {
    startMissingRound();
    return;
  }

  const round = createRound();
  game.cards = round.cards;
  game.target = round.target;
  game.lastRoundSignature = round.signature;

  updateStats();
  renderBoard(false);
  setPhase("관찰", `${getRevealSeconds().toFixed(1)}초 동안 카드 위치를 외워보세요.`);

  runRevealTimer(getRevealSeconds(), () => {
    game.cardsHidden = true;
    game.acceptingInput = true;
    renderBoard(true);
    updateStats();
    setPhase("선택", `${game.target.name} 카드는 어디에 있었나요?`);
    timerValue.textContent = "선택";
  });
}

function renderPreviewBoard() {
  if (game.mode === "sequence") {
    renderSequenceBoard();
    return;
  }

  if (game.mode === "missing") {
    renderMissingPreview();
    return;
  }

  const previewCount = getCardCount();
  game.theme = getThemeForRound(game.round);
  game.cards = game.theme.items.slice(0, previewCount);
  renderBoard(false);
}

function showReadyOverlay() {
  readyRound.textContent = `${game.round}라운드`;
  setReadyText(COUNTDOWN_STEPS[0]);
  readyOverlay.classList.add("is-visible");
}

function hideReadyOverlay() {
  readyOverlay.classList.remove("is-visible");
}

function showFailureOverlay(targetName) {
  failMessage.textContent = `정답은 ${targetName} 카드였습니다.`;
  updateFailSummary();
  updateContinueButton();
  failOverlay.classList.add("is-visible");
  failOverlay.setAttribute("aria-hidden", "false");
}

function hideFailureOverlay() {
  failOverlay.classList.remove("is-visible");
  failOverlay.setAttribute("aria-hidden", "true");
}

function runReadyCountdown(onDone) {
  let step = 0;

  setReadyText(COUNTDOWN_STEPS[step]);
  game.countdownId = setInterval(() => {
    step += 1;

    if (step >= COUNTDOWN_STEPS.length) {
      clearInterval(game.countdownId);
      game.delayId = setTimeout(onDone, 180);
      return;
    }

    setReadyText(COUNTDOWN_STEPS[step]);
  }, COUNTDOWN_STEP_MS);
}

function setReadyText(text) {
  readyText.textContent = text;
  readyText.classList.remove("is-popping");
  void readyText.offsetWidth;
  readyText.classList.add("is-popping");
}

function renderReadyBoard() {
  if (game.mode === "sequence") {
    renderSequenceBoard();
    return;
  }

  if (game.mode === "missing") {
    renderMissingReadyBoard();
    return;
  }

  game.cards = Array.from({ length: getCardCount() }, (_, index) => ({
    name: `${index + 1}번 카드`,
    icon: ""
  }));
  game.cardsHidden = true;
  renderBoard(true);
}

function renderBoard(hidden) {
  board.innerHTML = "";
  board.className = "board";
  board.style.gridTemplateColumns = `repeat(${getColumnCount(game.cards.length)}, minmax(80px, 1fr))`;

  game.cards.forEach((item) => {
    const card = document.createElement("button");
    card.className = `card${hidden ? " is-hidden" : ""}`;
    card.type = "button";
    card.setAttribute("aria-label", hidden ? "뒤집힌 카드" : item.name);
    card.disabled = !hidden || !game.acceptingInput;
    card.addEventListener("click", () => chooseCard(card, item));

    card.innerHTML = `
      <span class="card-inner">
        <span class="card-face card-front">
          <span class="card-emoji" aria-hidden="true">${item.icon}</span>
          <span class="card-name">${item.name}</span>
        </span>
        <span class="card-face card-back"></span>
      </span>
    `;

    board.appendChild(card);
  });
}

function pulseStageFeedback(type) {
  if (!gameStage) return;

  gameStage.classList.remove("is-success-pulse", "is-fail-pulse");
  void gameStage.offsetWidth;
  gameStage.classList.add(type === "success" ? "is-success-pulse" : "is-fail-pulse");

  window.setTimeout(() => {
    gameStage.classList.remove("is-success-pulse", "is-fail-pulse");
  }, 520);
}

function chooseCard(card, item) {
  if (!game.acceptingInput) return;

  game.acceptingInput = false;
  game.cardsHidden = false;
  const isCorrect = item.name === game.target.name;
  const allCards = [...document.querySelectorAll(".card")];

  allCards.forEach((button, index) => {
    button.disabled = true;
    button.classList.remove("is-hidden");

    if (game.cards[index].name === game.target.name) {
      button.classList.add("is-correct");
    }
  });

  if (isCorrect) {
    pulseStageFeedback("success");
    playFeedback("success");
    vibrate(35);
    game.streak += 1;
    game.round += 1;
    const isNewBest = saveBestRound(true);
    updateStats();
    setPhase("정답", isNewBest ? "신기록! 코인 1개를 얻고 다음 라운드로 넘어갑니다." : "좋아요. 다음 라운드로 자동으로 넘어갑니다.");
    timerValue.textContent = "성공";
    game.delayId = setTimeout(prepareRound, RESULT_DELAY_MS);
    return;
  }

  pulseStageFeedback("fail");
  playFeedback("fail");
  vibrate([80, 40, 80]);
  game.failureSnapshot = {
    mode: game.mode,
    round: game.round,
    streak: game.streak,
    coinsEarnedThisRun: game.coinsEarnedThisRun
  };
  allCards.forEach((button, index) => {
    const isTarget = game.cards[index].name === game.target.name;
    if (!isTarget && button !== card) {
      button.classList.add("is-dimmed");
    }
  });
  card.classList.add("is-wrong", "is-selected-wrong");
  saveBestRound();
  setPhase("실패", `정답은 ${game.target.name} 카드였습니다.`);
  timerValue.textContent = "실패";
  showFailureOverlay(game.target.name);
}

function startSequenceRound() {
  game.sequence = createSequence();
  game.sequenceInputIndex = 0;
  game.sequenceShowing = true;
  updateStats();
  renderSequenceBoard();
  setPhase("관찰", "빛나는 순서를 기억하세요.");
  timerValue.textContent = "보기";
  playSequence();
}

function createSequence() {
  const length = getSequenceLength();
  return Array.from({ length }, () => Math.floor(Math.random() * 4));
}

function renderSequenceBoard(activeIndex = -1) {
  const pads = [
    { label: "초록", icon: "●" },
    { label: "노랑", icon: "●" },
    { label: "빨강", icon: "●" },
    { label: "파랑", icon: "●" }
  ];

  board.innerHTML = "";
  board.className = "board sequence-board";
  board.style.gridTemplateColumns = "repeat(2, minmax(96px, 1fr))";

  pads.forEach((pad, index) => {
    const button = document.createElement("button");
    button.className = `sequence-pad pad-${index}${activeIndex === index ? " is-lit" : ""}`;
    button.type = "button";
    button.disabled = !game.acceptingInput;
    button.setAttribute("aria-label", `${pad.label} 버튼`);
    button.innerHTML = `
      <span aria-hidden="true">${pad.icon}</span>
      <strong>${pad.label}</strong>
    `;
    button.addEventListener("click", () => chooseSequencePad(index));
    board.appendChild(button);
  });
}

function playSequence() {
  game.acceptingInput = false;
  renderSequenceBoard();

  game.sequence.forEach((padIndex, step) => {
    const timeoutId = setTimeout(() => {
      renderSequenceBoard(padIndex);
      playToneFeedback(420 + padIndex * 120);
      setTimeout(() => renderSequenceBoard(), 260);

      if (step === game.sequence.length - 1) {
        game.delayId = setTimeout(() => {
          game.sequenceShowing = false;
          game.acceptingInput = true;
          renderSequenceBoard();
          updateStats();
          setPhase("선택", "방금 본 순서대로 눌러보세요.");
          timerValue.textContent = `${game.sequenceInputIndex + 1}/${game.sequence.length}`;
        }, 520);
      }
    }, 520 + step * 620);
    game.sequenceTimeouts.push(timeoutId);
  });
}

function chooseSequencePad(index) {
  if (!game.acceptingInput || game.mode !== "sequence") return;

  const expected = game.sequence[game.sequenceInputIndex];
  if (index !== expected) {
    playFeedback("fail");
    vibrate([80, 40, 80]);
    game.acceptingInput = false;
    game.failureSnapshot = {
      mode: game.mode,
      round: game.round,
      streak: game.streak,
      coinsEarnedThisRun: game.coinsEarnedThisRun
    };
    setPhase("실패", "순서를 놓쳤습니다.");
    timerValue.textContent = "실패";
    failMessage.textContent = `${game.sequenceInputIndex + 1}번째 순서가 달랐어요.`;
    saveBestRound();
    updateFailSummary();
    updateContinueButton();
    failOverlay.classList.add("is-visible");
    failOverlay.setAttribute("aria-hidden", "false");
    return;
  }

  playToneFeedback(520 + index * 130);
  vibrate(20);
  game.sequenceInputIndex += 1;
  timerValue.textContent = `${game.sequenceInputIndex}/${game.sequence.length}`;
  renderSequenceBoard(index);
  setTimeout(() => renderSequenceBoard(), 180);

  if (game.sequenceInputIndex < game.sequence.length) return;

  game.acceptingInput = false;
  playFeedback("success");
  game.streak += 1;
  game.round += 1;
  const isNewBest = saveBestRound(true);
  updateStats();
  setPhase("정답", isNewBest ? "신기록! 코인 1개를 얻고 다음 순서로 넘어갑니다." : "좋아요. 다음 순서로 넘어갑니다.");
  timerValue.textContent = "성공";
  game.delayId = setTimeout(prepareRound, RESULT_DELAY_MS);
}

function startMissingRound() {
  const round = createMissingRound();
  game.missingItems = round.items;
  game.missingTarget = round.target;
  game.missingOptions = round.options;
  game.missingHidden = false;
  game.acceptingInput = false;
  updateStats();
  renderMissingBoard(false);
  setPhase("관찰", `${getMissingRevealSeconds().toFixed(1)}초 동안 물건들을 기억하세요.`);
  runRevealTimer(getMissingRevealSeconds(), () => {
    game.missingHidden = true;
    game.acceptingInput = true;
    renderMissingBoard(true);
    updateStats();
    setPhase("선택", "어떤 물건이 사라졌나요?");
    timerValue.textContent = "선택";
  });
}

function createMissingRound() {
  const count = getMissingItemCount();
  const items = shuffle(missingItems).slice(0, count);
  const target = items[Math.floor(Math.random() * items.length)];
  const optionPool = shuffle(missingItems.filter((item) => item.name !== target.name)).slice(0, getMissingOptionCount() - 1);
  const options = shuffle([target, ...optionPool]);
  return { items, target, options };
}

function renderMissingPreview() {
  game.missingItems = missingItems.slice(0, getMissingItemCount());
  game.missingTarget = null;
  game.missingOptions = [];
  game.missingHidden = false;
  renderMissingBoard(false);
}

function renderMissingReadyBoard() {
  game.missingItems = Array.from({ length: getMissingItemCount() }, (_, index) => ({
    name: `${index + 1}번 물건`,
    src: "",
    x: 18 + index * 8,
    y: 65,
    size: 10
  }));
  game.missingTarget = null;
  game.missingOptions = [];
  game.missingHidden = true;
  renderMissingBoard(true);
}

function renderMissingBoard(hiddenTarget) {
  const visibleItems = hiddenTarget && game.missingTarget
    ? game.missingItems.filter((item) => item.name !== game.missingTarget.name)
    : game.missingItems;

  board.innerHTML = "";
  board.className = "board missing-board";
  board.style.gridTemplateColumns = "";

  const scene = document.createElement("div");
  scene.className = "missing-scene";
  visibleItems.forEach((item) => {
    const object = document.createElement("div");
    object.className = "missing-object";
    object.style.left = `${item.x}%`;
    object.style.top = `${item.y}%`;
    object.style.width = `${item.size}%`;
    if (item.src) {
      object.innerHTML = `<img src="${item.src}" alt="${item.name}">`;
    }
    scene.appendChild(object);
  });
  board.appendChild(scene);

  const options = document.createElement("div");
  options.className = "missing-options";
  const optionItems = game.missingOptions.length ? game.missingOptions : visibleItems.slice(0, 4);
  optionItems.forEach((item) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "missing-option";
    button.disabled = !game.acceptingInput || !game.missingTarget;
    button.setAttribute("aria-label", item.name);
    button.title = item.name;
    button.innerHTML = item.src ? `<img src="${item.src}" alt="">` : "";
    button.addEventListener("click", () => chooseMissingOption(button, item));
    options.appendChild(button);
  });
  board.appendChild(options);
}

function chooseMissingOption(button, item) {
  if (!game.acceptingInput || game.mode !== "missing") return;

  game.acceptingInput = false;
  const isCorrect = item.name === game.missingTarget.name;
  [...document.querySelectorAll(".missing-option")].forEach((option) => {
    option.disabled = true;
  });

  if (isCorrect) {
    button.classList.add("is-correct");
    playFeedback("success");
    vibrate(35);
    game.streak += 1;
    game.round += 1;
    const isNewBest = saveBestRound(true);
    updateStats();
    setPhase("정답", isNewBest ? "신기록! 코인 1개를 얻고 다음 장면으로 넘어갑니다." : "좋아요. 다음 장면으로 넘어갑니다.");
    timerValue.textContent = "성공";
    game.delayId = setTimeout(prepareRound, RESULT_DELAY_MS);
    return;
  }

  button.classList.add("is-wrong");
  playFeedback("fail");
  vibrate([80, 40, 80]);
  game.failureSnapshot = {
    mode: game.mode,
    round: game.round,
    streak: game.streak,
    coinsEarnedThisRun: game.coinsEarnedThisRun
  };
  saveBestRound();
  setPhase("실패", `사라진 물건은 ${game.missingTarget.name}였습니다.`);
  timerValue.textContent = "실패";
  failMessage.textContent = `사라진 물건은 ${game.missingTarget.name}였습니다.`;
  updateFailSummary();
  updateContinueButton();
  failOverlay.classList.add("is-visible");
  failOverlay.setAttribute("aria-hidden", "false");
}

function runRevealTimer(seconds, onDone) {
  let remaining = seconds;
  timerValue.textContent = remaining.toFixed(1);

  game.timerId = setInterval(() => {
    remaining = Math.max(0, remaining - 0.1);
    timerValue.textContent = remaining.toFixed(1);

    if (remaining <= 0) {
      clearInterval(game.timerId);
      onDone();
    }
  }, 100);
}

function clearGameTimers() {
  clearInterval(game.timerId);
  clearInterval(game.countdownId);
  clearTimeout(game.delayId);
  game.sequenceTimeouts.forEach((timeoutId) => clearTimeout(timeoutId));
  game.sequenceTimeouts = [];
}

function setPhase(label, text) {
  phaseLabel.textContent = label;
  question.textContent = text;
}

function updateStats() {
  roundEl.textContent = game.round;
  streakEl.textContent = game.streak;
  bestRoundEl.textContent = getStoredBestRound();
  coinCountEl.textContent = game.coins;
  homeCoinCount.textContent = game.coins;
  homeRecordCoins.textContent = game.coins;
  stageRound.textContent = game.round;
  stageBestRound.textContent = getStoredBestRound();
  stageCoinCount.textContent = game.coins;
  missionHint.textContent = getMissionHint();
  updateAccountMenus();
  if (game.mode === "sequence") {
    timeLimit.textContent = `순서 길이 : ${getSequenceLength()}개`;
    themeLabel.textContent = "모드 : 빛나는 순서";
    return;
  }

  if (game.mode === "missing") {
    timeLimit.textContent = `관찰시간 : ${getMissingRevealSeconds().toFixed(1)}초`;
    themeLabel.textContent = `물건 : ${getMissingItemCount()}개 · 선택지 : ${getMissingOptionCount()}개`;
    return;
  }

  timeLimit.textContent = `제한시간 : ${getRevealSeconds().toFixed(1)}초`;
  themeLabel.textContent = `테마 : ${getThemeForRound(game.round).name}`;
}

function getMissionHint() {
  if (game.mode === "sequence") {
    return game.sequenceShowing ? "빛난 순서를 눈으로 따라가세요." : "방금 본 순서대로 버튼을 눌러보세요.";
  }

  if (game.mode === "missing") {
    return game.missingHidden ? "방에서 사라진 물건을 선택하세요." : "방 안의 물건 위치를 빠르게 기억하세요.";
  }

  return game.cardsHidden ? "뒤집힌 카드 중 정답 카드를 선택하세요." : "카드 위치와 그림을 함께 기억하세요.";
}

function saveBestRound(awardCoin = false) {
  const storedRound = getStoredBestRound();
  if (game.round > storedRound) {
    game.bestRounds[game.mode] = game.round;
    persistGuestProgress();
    if (awardCoin) {
      addCoins(1);
    } else {
      syncProgress();
    }
    updateModeRecords();
    return true;
  }

  updateModeRecords();
  return false;
}

function getStoredBestRound(mode = game.mode) {
  return Number(game.bestRounds[mode] || 0);
}

function getBestRoundKey(mode = game.mode) {
  if (mode === "missing") return "memorySnapMissingBestRound";
  return mode === "sequence" ? "memorySnapSequenceBestRound" : "memorySnapCardBestRound";
}

function updateModeRecords() {
  ["card", "sequence", "missing"].forEach((mode) => {
    modeRecordEls[mode].round.textContent = getStoredBestRound(mode);
  });
  homeCardBestRound.textContent = getStoredBestRound("card");
  homeSequenceBestRound.textContent = getStoredBestRound("sequence");
  homeMissingBestRound.textContent = getStoredBestRound("missing");
}

async function initAuthSession() {
  if (!game.authToken) {
    game.authMode = "";
    localStorage.removeItem("memorySnapAuthMode");
    setAccountButtonText("로그인/회원가입");
    updateStats();
    updateModeRecords();
    return;
  }

  try {
    const data = await apiRequest("/me");
    applyServerUser(data.user);
    game.authMode = "member";
    localStorage.setItem("memorySnapAuthMode", "member");
    hideAuthModal();
  } catch {
    game.authToken = "";
    game.authMode = "";
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem("memorySnapAuthMode");
    setAccountButtonText("로그인/회원가입");
  }
}

async function handleAuthSubmit(type) {
  const userId = authUserIdInput.value.trim();
  const password = authPasswordInput.value;
  const path = type === "signup" ? "/signup" : "/login";

  setAuthStatus(type === "signup" ? "회원가입 중..." : "로그인 중...");
  setAuthButtonsDisabled(true);

  try {
    const data = await apiRequest(path, {
      method: "POST",
      body: { userId, password },
      includeAuth: false
    });
    game.authToken = data.token;
    localStorage.setItem(AUTH_TOKEN_KEY, data.token);
    game.authMode = "member";
    localStorage.setItem("memorySnapAuthMode", "member");
    applyServerUser(data.user);
    hideAuthModal();
  } catch (error) {
    setAuthStatus(error.message || "로그인 서버에 연결할 수 없어요.", true);
  } finally {
    setAuthButtonsDisabled(false);
  }
}

async function apiRequest(path, options = {}) {
  const headers = {
    "Content-Type": "application/json"
  };
  const includeAuth = options.includeAuth !== false;
  if (includeAuth && game.authToken) {
    headers.Authorization = `Bearer ${game.authToken}`;
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: options.method || "GET",
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined
    });
  } catch {
    throw new Error("로그인 서버에 연결할 수 없어요.");
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "서버 요청에 실패했습니다.");
  }
  return data;
}

function applyServerUser(user) {
  game.currentUserId = user.userId;
  game.coins = Number(user.coins || 0);
  game.bestRounds = {
    card: Number(user.bestRounds?.card || 0),
    sequence: Number(user.bestRounds?.sequence || 0),
    missing: Number(user.bestRounds?.missing || 0)
  };
  localStorage.setItem("memorySnapUserId", user.userId);
  setAccountButtonText(user.userId);
  updateStats();
  updateModeRecords();
  updateContinueButton();
}

function persistGuestProgress() {
  return;
}

function isLoggedIn() {
  return game.authMode === "member" && Boolean(game.authToken);
}

function syncProgress() {
  if (!isLoggedIn()) return;
  apiRequest("/progress", {
    method: "POST",
    body: {
      coins: game.coins,
      bestRounds: game.bestRounds
    }
  })
    .then((data) => applyServerUser(data.user))
    .catch(() => {
      setAccountButtonText(`${game.currentUserId || "USER"} · 오프라인`);
    });
}

function setAuthStatus(message, isError = false) {
  authStatus.textContent = message;
  authStatus.classList.toggle("is-error", isError);
}

function setAuthButtonsDisabled(disabled) {
  loginButton.disabled = disabled;
  signupButton.disabled = disabled;
}

function handleAccountButtonClick(event) {
  event.stopPropagation();
  if (isLoggedIn()) {
    toggleAccountMenu(event.currentTarget);
    return;
  }

  hideAccountMenus();
  showAuthModal();
}

function handlePrimaryAuthAction() {
  if (game.authView === "account") {
    logoutUser();
    return;
  }

  handleAuthSubmit(game.authView);
}

function handleSecondaryAuthAction() {
  if (game.authView === "account") {
    hideAuthModal();
    return;
  }

  toggleAuthView();
}

function showAuthModal() {
  setAuthView("login");
  setAuthStatus("");
  authModal.hidden = false;
  authModal.classList.add("is-visible");
  authModal.setAttribute("aria-hidden", "false");
  setTimeout(() => authUserIdInput.focus(), 0);
}

function hideAuthModal() {
  authModal.classList.remove("is-visible");
  authModal.hidden = true;
  authModal.setAttribute("aria-hidden", "true");
}

function toggleAccountMenu(button) {
  const menu = button.closest(".account-control")?.querySelector(".account-menu");
  if (!menu) return;
  const shouldOpen = menu.hidden;
  hideAccountMenus();
  if (shouldOpen) {
    updateAccountMenus();
    menu.hidden = false;
  }
}

function hideAccountMenus() {
  accountMenus.forEach((menu) => {
    menu.hidden = true;
  });
}

function updateAccountMenus() {
  accountIdLabels.forEach((label) => {
    label.textContent = game.currentUserId || "USER";
  });
  accountCoinLabels.forEach((label) => {
    label.textContent = game.coins;
  });
}

function toggleAuthView() {
  setAuthView(game.authView === "login" ? "signup" : "login");
}

function setAuthView(view) {
  game.authView = view;
  const isAccount = view === "account";
  const isSignup = view === "signup";
  authForm.hidden = isAccount;
  accountSummary.hidden = !isAccount;
  anonymousNotice.hidden = isAccount;

  if (isAccount) {
    accountUserId.textContent = game.currentUserId || "USER";
    accountCoins.textContent = game.coins;
  }

  authTitle.textContent = isAccount ? "계정" : isSignup ? "회원가입" : "로그인";
  authDescription.textContent = isAccount
    ? "로그인 상태입니다."
    : isSignup
    ? "아이디와 비밀번호만으로 바로 시작할 수 있어요."
    : "계정별로 코인과 최고기록이 저장됩니다.";
  loginButton.textContent = isAccount ? "로그아웃" : isSignup ? "회원가입" : "로그인";
  signupButton.textContent = isAccount ? "닫기" : isSignup ? "로그인으로 전환" : "회원가입으로 전환";
  authPasswordInput.autocomplete = isSignup ? "new-password" : "current-password";
  setAuthStatus("");
}

async function logoutUser() {
  hideAccountMenus();
  setAuthStatus("로그아웃 중...");
  setAuthButtonsDisabled(true);

  try {
    if (game.authToken) {
      await apiRequest("/logout", { method: "POST" });
    }
  } catch {
    // Local logout should still succeed even if the server session is already gone.
  } finally {
    clearMemberSession();
    setAuthButtonsDisabled(false);
    hideAuthModal();
  }
}

function clearMemberSession() {
  game.authMode = "";
  game.authToken = "";
  game.currentUserId = "";
  game.coins = 0;
  game.bestRounds = { card: 0, sequence: 0, missing: 0 };
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem("memorySnapAuthMode");
  localStorage.removeItem("memorySnapUserId");
  setAccountButtonText("로그인/회원가입");
  updateStats();
  updateModeRecords();
  updateContinueButton();
}

function setAccountButtonText(text) {
  authButton.textContent = text;
  gameAuthButton.textContent = text;
}

function addCoins(amount) {
  if (!isLoggedIn()) return;

  game.coins += amount;
  game.coinsEarnedThisRun += amount;
  persistGuestProgress();
  syncProgress();
  updateStats();
}

function spendCoins(amount) {
  if (!isLoggedIn()) return false;
  if (game.coins < amount) return false;
  game.coins -= amount;
  persistGuestProgress();
  syncProgress();
  updateStats();
  return true;
}

function updateContinueButton() {
  continueButton.disabled = !isLoggedIn() || game.coins < 2;
  continueButton.textContent = "코인 2개로 이어하기";
  continueButton.title = !isLoggedIn() ? "로그인하면 코인 이어하기를 사용할 수 있습니다." : game.coins < 2 ? "코인이 2개 이상 필요합니다." : "";
}

function updateFailSummary() {
  const bestRound = getStoredBestRound(game.mode);
  resultRound.textContent = `${game.round}라운드`;
  resultBestRound.textContent = `${bestRound}라운드`;
  resultStreak.textContent = `${game.streak}회`;
  resultCoins.textContent = `${game.coins}개`;

  if (!isLoggedIn()) {
    continueHint.textContent = "로그인하면 코인을 모아 이어하기를 사용할 수 있어요.";
    return;
  }

  if (game.coins >= 2) {
    continueHint.textContent = `코인 2개를 쓰면 ${game.round}라운드부터 이어갈 수 있어요.`;
    return;
  }

  if (game.coinsEarnedThisRun > 0) {
    continueHint.textContent = `이번에 신기록을 세워 코인 ${game.coinsEarnedThisRun}개를 얻었어요.`;
    return;
  }

  continueHint.textContent = "코인이 부족해요. 로그인 상태에서 신기록을 세우면 코인을 얻을 수 있어요.";
}

function createRound() {
  let cards = [];
  let target = null;
  let signature = "";

  for (let attempt = 0; attempt < 12; attempt += 1) {
    const roundTheme = getThemeForRound(game.round);
    cards = shuffle(roundTheme.items).slice(0, getCardCount());
    target = cards[Math.floor(Math.random() * cards.length)];
    signature = `${cards.map((item) => item.name).join("|")}::${target.name}`;

    if (signature !== game.lastRoundSignature) {
      break;
    }
  }

  return { cards, target, signature };
}

function getThemeForRound(round) {
  return themes[Math.floor((round - 1) / 3) % themes.length];
}

function getCardCount() {
  if (game.round >= 10) return 12;
  if (game.round >= 7) return 10;
  if (game.round >= 4) return 8;
  return 6;
}

function getColumnCount(cardCount) {
  if (cardCount <= 6) return 3;
  if (cardCount <= 10) return window.innerWidth < 720 ? 4 : 5;
  return window.innerWidth < 720 ? 3 : 4;
}

function getRevealSeconds() {
  const cardCount = getCardCount();
  if (cardCount >= 12) return 4.0;
  if (cardCount >= 10) return 3.6;
  if (cardCount >= 8) return 3.2;
  return Math.max(2.8, 3.2 - Math.min(game.round - 1, 2) * 0.2);
}

function getSequenceLength() {
  return Math.min(9, game.round + 2);
}

function getMissingItemCount() {
  if (game.round >= 8) return 8;
  if (game.round >= 5) return 7;
  if (game.round >= 2) return 6;
  return 5;
}

function getMissingOptionCount() {
  if (game.round >= 8) return 6;
  if (game.round >= 4) return 5;
  return 4;
}

function getMissingRevealSeconds() {
  const count = getMissingItemCount();
  if (count >= 8) return 3.5;
  if (count >= 7) return 3.2;
  if (count >= 6) return 3.0;
  return 2.8;
}

function shuffle(list) {
  return [...list].sort(() => Math.random() - 0.5);
}

function playFeedback(type) {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    audioContext = audioContext || new AudioContext();
    if (audioContext.state === "suspended") {
      audioContext.resume();
    }

    if (type === "success") {
      playTone(audioContext, 660, 0, 0.11, 0.12, "triangle");
      playTone(audioContext, 920, 0.1, 0.14, 0.14, "triangle");
      return;
    }

    playTone(audioContext, 180, 0, 0.18, 0.2, "square");
    playTone(audioContext, 110, 0.16, 0.26, 0.24, "sawtooth");
  } catch (error) {
    // Sound is optional and can be blocked by browser settings.
  }
}

function playToneFeedback(frequency) {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    audioContext = audioContext || new AudioContext();
    if (audioContext.state === "suspended") {
      audioContext.resume();
    }
    playTone(audioContext, frequency, 0, 0.08, 0.08, "triangle");
  } catch (error) {
    // Sound is optional and can be blocked by browser settings.
  }
}

function playTone(context, frequency, delay, duration, volume, type) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.frequency.value = frequency;
  oscillator.type = type;
  gain.gain.setValueAtTime(0.0001, context.currentTime + delay);
  gain.gain.exponentialRampToValueAtTime(volume, context.currentTime + delay + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + delay + duration);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(context.currentTime + delay);
  oscillator.stop(context.currentTime + delay + duration + 0.02);
}

function vibrate(pattern) {
  if (navigator.vibrate) {
    navigator.vibrate(pattern);
  }
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {
      // PWA support is optional; the game still runs without a service worker.
    });
  });
}
