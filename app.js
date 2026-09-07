const COUNTDOWN_STEPS = ["3", "2", "1", "시작!"];
const COUNTDOWN_STEP_MS = 600;
const RESULT_DELAY_MS = 1800;
const APP_INSTALL_URL = "https://memorysnap.org";
const START_MENTIONS = [
  "잘 보세요.",
  "위치를 잘 봐주세요.",
  "짧게 보여드립니다.",
  "이번 라운드를 준비하세요.",
  "갑니다."
];
const CONTINUE_START_MENTIONS = [
  "이어하기를 시작합니다.",
  "같은 라운드를 다시 준비합니다.",
  "이번 라운드부터 계속합니다.",
  "한 번 더 도전해보세요.",
  "한 번 더 보여드립니다."
];
const FAILURE_EASY_MENTIONS = [
  "아쉽습니다.",
  "정답을 놓쳤습니다.",
  "조금만 더 집중해보세요.",
  "다시 도전해보세요.",
  "다음엔 더 잘할 수 있습니다.",
  "이번 라운드는 실패입니다."
];
const FAILURE_NORMAL_MENTIONS = [
  "집중력을 다시 올려보세요.",
  "순간 기억이 조금 흔들렸습니다.",
  "위치를 다시 떠올려보세요.",
  "다음엔 더 차분히 보세요.",
  "정답과 다른 선택입니다.",
  "아쉽지만 기록은 여기까지입니다."
];
const FAILURE_HARD_MENTIONS = [
  "좋은 기록이었습니다.",
  "여기까지도 충분히 좋습니다.",
  "이번 기록을 넘어설 차례입니다.",
  "높은 라운드는 작은 차이가 큽니다.",
  "집중력이 오래 유지됐습니다.",
  "다음엔 기록을 갱신해보세요."
];
const FAILURE_MENTIONS = [
  ...FAILURE_EASY_MENTIONS,
  ...FAILURE_NORMAL_MENTIONS,
  ...FAILURE_HARD_MENTIONS
];
const COMBO_MENTIONS = {
  2: "좋은 흐름입니다.",
  3: "집중력이 올라오고 있어요.",
  4: "안정적으로 이어가고 있습니다.",
  5: "연속 정답 기록이 좋아지고 있어요.",
  6: "꽤 높은 집중력을 보여주고 있습니다.",
  7: "기록 갱신이 가까워졌습니다.",
  8: "훌륭한 흐름입니다.",
  9: "거의 완벽한 집중력입니다.",
  10: "대단한 기록입니다."
};
const OVER_COMBO_MENTIONS = [
  "집중력이 매우 좋습니다.",
  "기록을 계속 이어가고 있습니다.",
  "좋은 페이스입니다.",
  "높은 라운드까지 올라왔습니다.",
  "지금 흐름을 유지해보세요."
];
const BLOCKED_ADVICE_PATTERNS = [
  /https?:\/\//i,
  /www\./i,
  /@[a-z0-9._-]+\.[a-z]{2,}/i,
  /\b\d{2,3}-?\d{3,4}-?\d{4}\b/,
  /카톡|오픈채팅|텔레그램|광고|홍보|무료\s*코인/i,
  /시발|씨발|ㅅㅂ|병신|ㅂㅅ|개새|좆|fuck|sex/i
];
const isLocalApiHost = (
  ["127.0.0.1", "localhost"].includes(location.hostname)
  && Boolean(location.port)
) || /^192\.168\./.test(location.hostname)
  || /^10\./.test(location.hostname)
  || /^172\.(1[6-9]|2\d|3[0-1])\./.test(location.hostname);
const API_BASE_URL = isLocalApiHost
  ? `${location.protocol}//${location.hostname}:8787/api`
  : "https://v4w3klaudj.execute-api.ap-northeast-2.amazonaws.com/api";
const GOOGLE_CLIENT_ID = document.querySelector('meta[name="google-client-id"]')?.content.trim() || "";
const IS_EMBEDDED_PREVIEW = window.self !== window.top;
const AUTH_TOKEN_KEY = "memorySnapAuthToken";
const SOUND_ENABLED_KEY = "memorySnapSoundEnabled";
const VIBRATION_ENABLED_KEY = "memorySnapVibrationEnabled";
const INTRO_SEEN_KEY = "memorySnapIntroSeen";
let googleSignInInitialized = false;
let googleSignInRetryTimer = null;
let currentIntroStep = 0;
let introHighlightedElement = null;

const INTRO_STEPS = [
  {
    target: ".mode-card",
    title: "세 가지 기억력 게임이 있습니다.",
    description: "카드 위치, 불빛 순서, 사라진 물건 찾기 중 하나를 골라 짧게 플레이합니다."
  },
  {
    target: ".mode-play-button",
    title: "라운드를 넘길수록 어려워집니다.",
    description: "정답이면 다음 라운드로 넘어가고, 실패하면 결과 화면에서 다시 도전할 수 있습니다."
  },
  {
    target: ".home-records",
    title: "기록은 모드별로 저장됩니다.",
    description: "로그인하면 최고 라운드와 코인이 계정에 저장되고 TOP3 랭킹에 반영됩니다."
  },
  {
    target: ".home-actions",
    title: "코인은 이어하기에 사용합니다.",
    description: "회원가입, 친구 공유, TOP3 첫 조언 작성 같은 활동으로 코인을 받을 수 있습니다."
  }
];

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
const settingsModal = document.querySelector("#settingsModal");
const settingsCloseButton = document.querySelector("#settingsCloseButton");
const soundToggle = document.querySelector("#soundToggle");
const vibrationToggle = document.querySelector("#vibrationToggle");
const introModal = document.querySelector("#introModal");
const introCoach = document.querySelector("#introCoach");
const introCloseButton = document.querySelector("#introCloseButton");
const introStartButton = document.querySelector("#introStartButton");
const introReplayButton = document.querySelector("#introReplayButton");
const introStepLabel = document.querySelector("#introStepLabel");
const introTitle = document.querySelector("#introTitle");
const introDescription = document.querySelector("#introDescription");
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
const homeChallengeTitle = document.querySelector("#homeChallengeTitle");
const homeChallengeDetail = document.querySelector("#homeChallengeDetail");
const inviteShareButton = document.querySelector("#inviteShareButton");
const homeRankingPreview = document.querySelector("#homeRankingPreview");
const homeRankingEls = {
  card: {
    leader: document.querySelector("#homeCardLeader"),
    gap: document.querySelector("#homeCardGap")
  },
  sequence: {
    leader: document.querySelector("#homeSequenceLeader"),
    gap: document.querySelector("#homeSequenceGap")
  },
  missing: {
    leader: document.querySelector("#homeMissingLeader"),
    gap: document.querySelector("#homeMissingGap")
  }
};
const modePreview = document.querySelector("#modePreview");
const modePreviewContent = document.querySelector("#modePreviewContent");
const authModal = document.querySelector("#authModal");
const authCloseButton = document.querySelector("#authCloseButton");
const authTitle = document.querySelector("#authTitle");
const authDescription = document.querySelector("#authDescription");
const authLoginTab = document.querySelector("#authLoginTab");
const authSignupTab = document.querySelector("#authSignupTab");
const authForm = document.querySelector(".auth-form");
const authUserIdInput = document.querySelector("#authUserId");
const authPasswordInput = document.querySelector("#authPassword");
const authStatus = document.querySelector("#authStatus");
const accountSummary = document.querySelector("#accountSummary");
const accountUserId = document.querySelector("#accountUserId");
const accountProvider = document.querySelector("#accountProvider");
const accountEmailRow = document.querySelector("#accountEmailRow");
const accountEmail = document.querySelector("#accountEmail");
const accountCoins = document.querySelector("#accountCoins");
const loginButton = document.querySelector("#loginButton");
const signupButton = document.querySelector("#signupButton");
const deleteAccountButton = document.querySelector("#deleteAccountButton");
const googleSignInButton = document.querySelector("#googleSignInButton");
const googleLoginFallback = document.querySelector("#googleLoginFallback");
const googleLoginHint = document.querySelector("#googleLoginHint");
const anonymousNotice = document.querySelector("#anonymousNotice");
const rankingButton = document.querySelector("#rankingButton");
const rankingModal = document.querySelector("#rankingModal");
const rankingCloseButton = document.querySelector("#rankingCloseButton");
const rankingTabs = document.querySelectorAll(".ranking-tab");
const rankingSummary = document.querySelector("#rankingSummary");
const rankingList = document.querySelector("#rankingList");
const rankingAdviceEditor = document.querySelector("#rankingAdviceEditor");
const rankingAdviceInput = document.querySelector("#rankingAdviceInput");
const saveRankingAdviceButton = document.querySelector("#saveRankingAdviceButton");
const rankingStatus = document.querySelector("#rankingStatus");
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
const stageRankingBar = document.querySelector("#stageRankingBar");
const missionHint = document.querySelector("#missionHint");
const readyOverlay = document.querySelector("#readyOverlay");
const readyRound = document.querySelector("#readyRound");
const readyText = document.querySelector("#readyText");
const failOverlay = document.querySelector("#failOverlay");
const failTaunt = document.querySelector("#failTaunt");
const failMessage = document.querySelector("#failMessage");
const comboSticker = document.querySelector("#comboSticker");
const resultRound = document.querySelector("#resultRound");
const resultBestRound = document.querySelector("#resultBestRound");
const resultStreak = document.querySelector("#resultStreak");
const resultCoins = document.querySelector("#resultCoins");
const resultRankingTitle = document.querySelector("#resultRankingTitle");
const resultRankingDetail = document.querySelector("#resultRankingDetail");
const continueHint = document.querySelector("#continueHint");
const storyButton = document.querySelector("#storyButton");
const homeButton = document.querySelector("#homeButton");
const retryButton = document.querySelector("#retryButton");
const continueButton = document.querySelector("#continueButton");
const startButton = document.querySelector("#startButton");
const exitGameButton = document.querySelector("#exitGameButton");
const quickExitGameButton = document.querySelector("#quickExitGameButton");
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

const missingLayoutSlots = [
  { x: 21, y: 68, size: 12 },
  { x: 36, y: 45, size: 13 },
  { x: 52, y: 67, size: 13 },
  { x: 67, y: 42, size: 11 },
  { x: 82, y: 68, size: 13 },
  { x: 88, y: 45, size: 10 },
  { x: 28, y: 36, size: 10 },
  { x: 74, y: 74, size: 10 }
];

const missingRooms = [
  { name: "침실 책상", src: "assets/room-bedroom.png" },
  { name: "거실", src: "assets/room-living.png" },
  { name: "작업방", src: "assets/room-bg.png" }
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
  continuingWithCoins: false,
  sequence: [],
  sequenceInputIndex: 0,
  sequenceShowing: false,
  missingItems: [],
  missingTarget: null,
  missingOptions: [],
  missingRoom: missingRooms[0],
  missingHidden: false,
  acceptingInput: false,
  cardsHidden: false,
  timerId: null,
  delayId: null,
  countdownId: null,
  comboToastId: null,
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
  currentUserId: localStorage.getItem("memorySnapUserId") || "",
  currentUserProvider: localStorage.getItem("memorySnapUserProvider") || "",
  currentUserEmail: localStorage.getItem("memorySnapUserEmail") || "",
  rewardClaims: {},
  rankingMode: "card",
  rankings: null,
  soundEnabled: localStorage.getItem(SOUND_ENABLED_KEY) !== "false",
  vibrationEnabled: localStorage.getItem(VIBRATION_ENABLED_KEY) !== "false"
};

settingsButton.addEventListener("click", showSettingsModal);
settingsCloseButton.addEventListener("click", hideSettingsModal);
settingsModal.addEventListener("click", (event) => {
  if (event.target === settingsModal) hideSettingsModal();
});
soundToggle.addEventListener("change", () => updateFeedbackSetting("sound", soundToggle.checked));
vibrationToggle.addEventListener("change", () => updateFeedbackSetting("vibration", vibrationToggle.checked));
introCloseButton.addEventListener("click", hideIntroModal);
introStartButton.addEventListener("click", advanceIntroStep);
introReplayButton.addEventListener("click", () => {
  hideSettingsModal();
  showIntroModal(false);
});
introModal.addEventListener("click", (event) => {
  if (event.target === introModal) hideIntroModal();
});
authButton.addEventListener("click", handleAccountButtonClick);
gameAuthButton.addEventListener("click", handleAccountButtonClick);
accountLogoutButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    event.stopPropagation();
    logoutUser();
  });
});
rankingButton.addEventListener("click", showRankingModal);
rankingCloseButton.addEventListener("click", hideRankingModal);
rankingModal.addEventListener("click", (event) => {
  if (event.target === rankingModal) hideRankingModal();
});
rankingTabs.forEach((button) => {
  button.addEventListener("click", () => setRankingMode(button.dataset.rankingMode));
});
rankingList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-report-ranking-message]");
  if (!button) return;
  reportRankingAdvice(button.dataset.reportRankingMessage);
});
saveRankingAdviceButton.addEventListener("click", saveRankingAdvice);
authCloseButton.addEventListener("click", hideAuthModal);
authLoginTab.addEventListener("click", () => setAuthView("login"));
authSignupTab.addEventListener("click", () => setAuthView("signup"));
loginButton.addEventListener("click", handlePrimaryAuthAction);
signupButton.addEventListener("click", handleSecondaryAuthAction);
deleteAccountButton.addEventListener("click", handleDeleteAccountV2);
authModal.addEventListener("click", (event) => {
  if (event.target === authModal) hideAuthModal();
});
document.addEventListener("click", (event) => {
  if (event.target.closest(".account-control")) return;
  hideAccountMenus();
});
document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  hideAccountMenus();
  hideAuthModal();
  hideRankingModal();
  hideSettingsModal();
  hideIntroModal();
});
authPasswordInput.addEventListener("keydown", (event) => {
  if (game.authView === "account") return;
  if (event.key === "Enter") handleAuthSubmit(game.authView);
});
authUserIdInput.addEventListener("input", () => {
  const cleanValue = authUserIdInput.value.toLowerCase().replace(/[^a-z0-9_-]/g, "");
  if (authUserIdInput.value !== cleanValue) authUserIdInput.value = cleanValue;
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
quickExitGameButton.addEventListener("click", goHome);
retryButton.addEventListener("click", restartCurrentMode);
continueButton.addEventListener("click", continueFailedRound);
storyButton.addEventListener("click", shareStoryResult);
inviteShareButton?.addEventListener("click", shareInstallLink);
window.addEventListener("resize", () => {
  if (!introModal.hidden) {
    positionIntroCoach();
  }

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
syncSettingsControls();
initAuthSession();
initGoogleSignIn();
window.addEventListener("memorysnap-google-ready", () => initGoogleSignIn());
loadRankings();
registerServiceWorker();
showIntroOnFirstLaunch();

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
  game.continuingWithCoins = false;
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
  game.continuingWithCoins = false;
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
  setPhase("준비", "라운드를 준비하세요.");
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
  game.continuingWithCoins = true;
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
    <div class="preview-card-grid" aria-label="방금 본 카드 맞히기 미리보기">
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
    setPhase("준비", `${game.round}R. 불빛 순서 준비.`);
  } else if (game.mode === "missing") {
    setPhase("준비", `${game.round}R. 사라질 물건 준비.`);
  } else {
    setPhase("준비", `${game.round}R. ${game.theme.name} 카드 준비.`);
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
  setPhase("관찰", `${getRevealSeconds().toFixed(1)}초 동안 위치를 확인하세요.`);

  runRevealTimer(getRevealSeconds(), () => {
    game.cardsHidden = true;
    game.acceptingInput = true;
    renderBoard(true);
    updateStats();
    setPhase("선택", `${game.target.name} 카드는 어디였나요?`);
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
  setReadyText(getCountdownSteps()[0]);
  readyOverlay.classList.add("is-visible");
}

function hideReadyOverlay() {
  readyOverlay.classList.remove("is-visible");
}

function showFailureOverlay(detail = "") {
  setFailureCopy(detail);
  updateFailSummary();
  updateResultRanking();
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
  const countdownSteps = getCountdownSteps();
  game.continuingWithCoins = false;

  setReadyText(countdownSteps[step]);
  game.countdownId = setInterval(() => {
    step += 1;

    if (step >= countdownSteps.length) {
      clearInterval(game.countdownId);
      game.delayId = setTimeout(onDone, 180);
      return;
    }

    setReadyText(countdownSteps[step]);
  }, COUNTDOWN_STEP_MS);
}

function setReadyText(text) {
  readyText.textContent = text;
  readyText.classList.remove("is-popping");
  void readyText.offsetWidth;
  readyText.classList.add("is-popping");
}

function getCountdownSteps() {
  const mentions = game.continuingWithCoins ? CONTINUE_START_MENTIONS : START_MENTIONS;
  return ["3", "2", "1", randomFrom(mentions)];
}

function randomFrom(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function getFailureMessage(detail) {
  return `${getFailureTaunt()} ${detail}`;
}

function setFailureCopy(detail) {
  if (failTaunt) failTaunt.textContent = getFailureTaunt();
  failMessage.textContent = detail;
  failMessage.hidden = !detail;
}

function getFailureTaunt() {
  const failedRound = Math.max(1, game.round);

  if (failedRound >= 6 || game.streak >= 4) {
    return randomFrom(FAILURE_HARD_MENTIONS);
  }

  if (failedRound >= 3 || game.streak >= 2) {
    return randomFrom(FAILURE_NORMAL_MENTIONS);
  }

  return randomFrom(FAILURE_EASY_MENTIONS);
}

function getComboMessage(streak) {
  if (streak < 2) return "";
  const mention = COMBO_MENTIONS[streak] || randomFrom(OVER_COMBO_MENTIONS);
  return `${streak}연속 · ${mention}`;
}

function showComboReaction() {
  const message = getComboMessage(game.streak);
  if (!message || !comboSticker) return;

  showResultReaction(message);
}

function showResultReaction(message) {
  if (!message || !comboSticker) return;

  playFeedback("combo");
  vibrate([25, 30, 25]);
  pulseStageFeedback("combo");
  comboSticker.textContent = message;
  comboSticker.classList.remove("is-visible");
  comboSticker.setAttribute("aria-hidden", "false");
  void comboSticker.offsetWidth;
  comboSticker.classList.add("is-visible");
  clearTimeout(game.comboToastId);
  game.comboToastId = setTimeout(() => {
    comboSticker.classList.remove("is-visible");
    comboSticker.setAttribute("aria-hidden", "true");
  }, 1450);
}

function getSuccessMessage(isNewBest, nextLabel) {
  const clearedRound = Math.max(1, game.round - 1);

  if (isNewBest && clearedRound >= 7) {
    return `새로운 최고 기록입니다. ${nextLabel}를 준비합니다.`;
  }

  if (isNewBest && clearedRound >= 4) {
    return `좋은 기록입니다. ${nextLabel}를 준비합니다.`;
  }

  const message = getComboMessage(game.streak);
  if (message) return `${message} ${nextLabel}를 준비합니다.`;
  return `정답입니다. ${nextLabel}를 준비합니다.`;
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
  board.dataset.cardCount = String(game.cards.length);
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

  gameStage.classList.remove("is-success-pulse", "is-fail-pulse", "is-combo-pulse");
  void gameStage.offsetWidth;
  const className = type === "combo" ? "is-combo-pulse" : type === "success" ? "is-success-pulse" : "is-fail-pulse";
  gameStage.classList.add(className);

  window.setTimeout(() => {
    gameStage.classList.remove("is-success-pulse", "is-fail-pulse", "is-combo-pulse");
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
    const isNewBest = saveBestRound(false);
    updateStats();
    showResultReaction(getSuccessMessage(isNewBest, "다음 라운드"));
    setPhase("정답", "맞았습니다.");
    timerValue.textContent = "OK";
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
  setPhase("실패", "다시 보면 보입니다.");
  timerValue.textContent = "실패";
  showFailureOverlay("방금 선택한 카드는 정답이 아니었습니다.");
}

function startSequenceRound() {
  game.sequence = createSequence();
  game.sequenceInputIndex = 0;
  game.sequenceShowing = true;
  updateStats();
  renderSequenceBoard();
  setPhase("관찰", "불빛 순서를 확인하세요.");
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
          setPhase("선택", "방금 본 순서대로 누르세요.");
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
    setPhase("실패", "순서가 달랐습니다.");
    timerValue.textContent = "실패";
    setFailureCopy(`${game.sequenceInputIndex + 1}번째 입력이 달랐습니다.`);
    saveBestRound();
    updateFailSummary();
    updateResultRanking();
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
  const isNewBest = saveBestRound(false);
  updateStats();
  showResultReaction(getSuccessMessage(isNewBest, "다음 순서"));
  setPhase("정답", "맞았습니다.");
  timerValue.textContent = "OK";
  game.delayId = setTimeout(prepareRound, RESULT_DELAY_MS);
}

function startMissingRound() {
  const round = createMissingRound();
  game.missingItems = round.items;
  game.missingTarget = round.target;
  game.missingOptions = round.options;
  game.missingRoom = round.room;
  game.missingHidden = false;
  game.acceptingInput = false;
  updateStats();
  renderMissingBoard(false);
  setPhase("관찰", `${getMissingRevealSeconds().toFixed(1)}초 동안 물건을 확인하세요.`);
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
  const slots = shuffle(missingLayoutSlots).slice(0, count);
  const room = missingRooms[(game.round - 1) % missingRooms.length];
  const scale = getMissingObjectScale();
  const items = shuffle(missingItems).slice(0, count).map((item, index) => ({
    ...item,
    ...slots[index],
    size: Math.max(7, Math.round(slots[index].size * scale * 10) / 10)
  }));
  const target = items[Math.floor(Math.random() * items.length)];
  const optionPool = shuffle(missingItems.filter((item) => item.name !== target.name)).slice(0, getMissingOptionCount() - 1);
  const options = shuffle([target, ...optionPool]);
  return { items, target, options, room };
}

function renderMissingPreview() {
  const count = getMissingItemCount();
  game.missingRoom = missingRooms[game.round % missingRooms.length];
  game.missingItems = missingItems.slice(0, count).map((item, index) => ({
    ...item,
    ...missingLayoutSlots[index]
  }));
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
  game.missingRoom = missingRooms[(game.round - 1) % missingRooms.length];
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
  scene.style.backgroundImage = `url("${game.missingRoom?.src || missingRooms[0].src}")`;
  scene.setAttribute("aria-label", `${game.missingRoom?.name || "방"} 장면`);
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
  options.dataset.optionCount = String(optionItems.length);
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
    const isNewBest = saveBestRound(false);
    updateStats();
    showResultReaction(getSuccessMessage(isNewBest, "다음 장면"));
    setPhase("정답", "맞았습니다.");
    timerValue.textContent = "OK";
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
  setFailureCopy(`사라진 물건은 ${game.missingTarget.name}였습니다.`);
  updateFailSummary();
  updateResultRanking();
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
  clearTimeout(game.comboToastId);
  if (comboSticker) {
    comboSticker.classList.remove("is-visible");
    comboSticker.setAttribute("aria-hidden", "true");
  }
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
  updateStageRankingBar();
  updateInviteShareButton();
  missionHint.textContent = getMissionHint();
  updateAccountMenus();
  if (game.mode === "sequence") {
    timeLimit.textContent = `순서 길이 : ${getSequenceLength()}개`;
    themeLabel.textContent = "모드 : 불빛 따라 누르기";
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
    return game.sequenceShowing ? "빛난 순서를 그대로 기억하세요." : "같은 순서로 눌러주세요.";
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
  updateHomeChallenge();
  renderHomeRankingPreview(!game.rankings);
}

function updateHomeChallenge() {
  if (!homeChallengeTitle || !homeChallengeDetail) return;

  const modes = ["card", "sequence", "missing"]
    .map((mode) => ({ mode, round: getStoredBestRound(mode), label: getHomeModeName(mode) }))
    .sort((a, b) => a.round - b.round);
  const target = modes[0];
  const nextRound = target.round + 1;

  if (modes.every((item) => item.round === 0)) {
    homeChallengeTitle.textContent = "첫 기록부터 남겨보세요.";
    homeChallengeDetail.textContent = "일단 1R만 넘겨도 기록은 시작됩니다.";
    return;
  }

  homeChallengeTitle.textContent = `${target.label} ${nextRound}R 도전`;
  homeChallengeDetail.textContent = `현재 ${target.round}R입니다. 낮은 기록부터 끌어올려보시죠.`;
}

function getHomeModeName(mode) {
  if (mode === "sequence") return "불빛";
  if (mode === "missing") return "물건";
  return "카드";
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
  const userId = authUserIdInput.value.trim().toLowerCase();
  const password = authPasswordInput.value;
  const path = type === "signup" ? "/signup" : "/login";
  const validation = validateAuthFields(userId, password);

  if (validation) {
    setAuthStatus(validation.message, true);
    validation.target.focus();
    return;
  }

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

function initGoogleSignIn(attempt = 0) {
  if (!googleSignInButton || !googleLoginHint) return;

  if (!GOOGLE_CLIENT_ID) {
    googleSignInButton.hidden = true;
    googleLoginFallback.hidden = true;
    googleLoginHint.hidden = false;
    return;
  }

  if (IS_EMBEDDED_PREVIEW) {
    googleSignInButton.hidden = true;
    googleSignInButton.innerHTML = "";
    googleLoginFallback.hidden = false;
    googleLoginFallback.textContent = "전체화면에서 Google 로그인";
    googleLoginFallback.disabled = false;
    googleLoginHint.hidden = false;
    googleLoginHint.textContent = "폰 미리보기 안에서는 Google 로그인이 제한될 수 있습니다.";
    if (!googleLoginFallback.dataset.bound) {
      googleLoginFallback.dataset.bound = "true";
      googleLoginFallback.addEventListener("click", promptGoogleLogin);
    }
    return;
  }

  if (!window.google?.accounts?.id) {
    googleSignInButton.hidden = true;
    googleLoginFallback.hidden = true;
    googleLoginHint.hidden = false;
    googleLoginHint.textContent = "Google 로그인을 불러오는 중입니다.";

    if (attempt < 20) {
      window.clearTimeout(googleSignInRetryTimer);
      googleSignInRetryTimer = window.setTimeout(() => initGoogleSignIn(attempt + 1), 300);
      return;
    }

    googleLoginHint.textContent = "Google 로그인을 불러오지 못했습니다. USER ID 로그인으로 진행해주세요.";
    return;
  }

  window.clearTimeout(googleSignInRetryTimer);
  googleLoginHint.hidden = true;
  googleSignInButton.hidden = false;
  googleLoginFallback.hidden = true;
  googleLoginFallback.textContent = "Google로 로그인";
  googleLoginFallback.disabled = false;
  googleSignInButton.innerHTML = "";

  window.google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: handleGoogleCredential,
    ux_mode: "popup"
  });
  window.google.accounts.id.renderButton(googleSignInButton, {
    theme: "outline",
    size: "large",
    width: Math.min(340, googleSignInButton.clientWidth || 340),
    text: "signin_with"
  });
  googleSignInInitialized = true;

  if (!googleLoginFallback.dataset.bound) {
    googleLoginFallback.dataset.bound = "true";
    googleLoginFallback.addEventListener("click", promptGoogleLogin);
  }
}

function promptGoogleLogin() {
  if (IS_EMBEDDED_PREVIEW) {
    window.open("index.html", "_blank", "noopener,noreferrer");
    return;
  }

  if (!window.google?.accounts?.id || !googleSignInInitialized) {
    initGoogleSignIn();
    setAuthStatus("Google 로그인을 아직 불러오는 중입니다.", true);
    return;
  }

  try {
    window.google.accounts.id.prompt();
  } catch {
    setAuthStatus("Google 로그인 창을 열지 못했습니다. USER ID 로그인으로 진행해주세요.", true);
  }
}

async function handleGoogleCredential(response) {
  if (!response?.credential) {
    setAuthStatus("Google 로그인 정보를 받지 못했습니다.", true);
    return;
  }

  setAuthStatus("Google 로그인 중...");
  setAuthButtonsDisabled(true);

  try {
    const data = await apiRequest("/google-login", {
      method: "POST",
      body: { credential: response.credential },
      includeAuth: false
    });
    game.authToken = data.token;
    localStorage.setItem(AUTH_TOKEN_KEY, data.token);
    game.authMode = "member";
    localStorage.setItem("memorySnapAuthMode", "member");
    applyServerUser(data.user);
    hideAuthModal();
    loadRankings();
  } catch (error) {
    setAuthStatus(error.message || "Google 로그인에 실패했습니다.", true);
  } finally {
    setAuthButtonsDisabled(false);
  }
}

function validateAuthFields(userId, password) {
  if (!/^[a-z0-9_-]{3,16}$/.test(userId)) {
    return {
      message: "USER ID는 영어 소문자, 숫자, _, - 조합 3~16자로 입력하세요.",
      target: authUserIdInput
    };
  }

  if (password.length < 4) {
    return {
      message: "비밀번호는 4자 이상 입력하세요.",
      target: authPasswordInput
    };
  }

  return null;
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
  game.currentUserProvider = user.provider || "password";
  game.currentUserEmail = user.email || "";
  game.coins = Number(user.coins || 0);
  game.rewardClaims = user.rewardClaims || {};
  game.bestRounds = {
    card: Number(user.bestRounds?.card || 0),
    sequence: Number(user.bestRounds?.sequence || 0),
    missing: Number(user.bestRounds?.missing || 0)
  };
  localStorage.setItem("memorySnapUserId", user.userId);
  localStorage.setItem("memorySnapUserProvider", game.currentUserProvider);
  localStorage.setItem("memorySnapUserEmail", game.currentUserEmail);
  setAccountButtonText(user.userId);
  updateStats();
  updateModeRecords();
  updateContinueButton();
}

async function claimActivityReward(type) {
  if (!isLoggedIn()) {
    return { awarded: false, message: "로그인하면 코인을 받을 수 있습니다." };
  }

  const data = await apiRequest("/reward", {
    method: "POST",
    body: { type }
  });
  applyServerUser(data.user);
  return data.reward || { awarded: false };
}

async function loadRankings() {
  if (!rankingModal.hidden) setRankingStatus("랭킹을 불러오는 중...");
  try {
    const data = await apiRequest("/rankings", { includeAuth: false });
    game.rankings = data.rankings || {};
    renderRankings();
    renderHomeRankingPreview();
    updateStageRankingBar();
    if (!rankingModal.hidden) setRankingStatus("");
  } catch (error) {
    game.rankings = null;
    renderRankings();
    renderHomeRankingPreview(true);
    updateStageRankingBar();
    if (!rankingModal.hidden) setRankingStatus(error.message || "랭킹 서버에 연결할 수 없어요.", true);
  }
}

function showRankingModal() {
  rankingModal.hidden = false;
  rankingModal.classList.add("is-visible");
  rankingModal.setAttribute("aria-hidden", "false");
  setRankingMode(game.rankingMode || "card", false);
  loadRankings();
}

function hideRankingModal() {
  rankingModal.classList.remove("is-visible");
  rankingModal.hidden = true;
  rankingModal.setAttribute("aria-hidden", "true");
}

function setRankingMode(mode, shouldRender = true) {
  game.rankingMode = mode || "card";
  rankingTabs.forEach((button) => {
    const isActive = button.dataset.rankingMode === game.rankingMode;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });
  if (shouldRender) renderRankings();
}

function setRankingStatus(message, isError = false) {
  rankingStatus.textContent = message;
  rankingStatus.classList.toggle("is-error", isError);
}

function renderHomeRankingPreview(isOffline = false) {
  ["card", "sequence", "missing"].forEach((mode) => {
    const els = homeRankingEls[mode];
    if (!els?.leader || !els?.gap) return;

    const label = getModeLabel(mode);
    const labelEl = els.leader.parentElement?.querySelector("span");
    if (labelEl) labelEl.textContent = `${label} 랭킹`;

    if (isOffline) {
      els.leader.textContent = "랭킹 확인 안 됨";
      els.gap.textContent = "잠시 후 다시 확인";
      return;
    }

    const info = getRankingInfo(mode);

    if (!isLoggedIn()) {
      els.leader.textContent = "랭킹 미등록";
      els.gap.textContent = info.leader ? `1위 ${info.leader.userId} · ${info.leader.round}R` : "로그인하면 기록 저장";
      return;
    }

    if (!info.entries.length) {
      els.leader.textContent = "랭킹 대기";
      els.gap.textContent = info.myRound > 0 ? `내 기록 ${info.myRound}R` : "첫 기록이면 1위";
      return;
    }

    if (info.myRank === 1) {
      els.leader.textContent = "현재 1위";
      els.gap.textContent = `내 기록 ${info.myRound}R`;
      return;
    }

    if (info.myRank > 1) {
      els.leader.textContent = `현재 ${info.myRank}위`;
      els.gap.textContent = `1위까지 ${info.gapToLeader}R`;
      return;
    }

    els.leader.textContent = "TOP3 밖";
    els.gap.textContent = info.third
      ? `3위까지 ${info.gapToTop3}R`
      : `1위 ${info.leader.userId} · ${info.leader.round}R`;
  });
}

function getRankingInfo(mode) {
  const entries = game.rankings?.[mode] || [];
  const myRound = getStoredBestRound(mode);
  const myIndex = entries.findIndex((entry) => entry.userId === game.currentUserId);
  const leader = entries[0] || null;
  const third = entries[2] || null;

  return {
    entries,
    leader,
    third,
    myRound,
    myRank: myIndex >= 0 ? myIndex + 1 : 0,
    gapToLeader: leader ? Math.max(1, leader.round - myRound + 1) : 1,
    gapToTop3: third ? Math.max(1, third.round - myRound + 1) : 1
  };
}

function updateStageRankingBar() {
  if (!stageRankingBar) return;

  const label = getModeLabel(game.mode);
  const info = getRankingInfo(game.mode);

  if (!game.rankings) {
    stageRankingBar.textContent = `${label} 랭킹 확인 중입니다.`;
    return;
  }

  if (!isLoggedIn()) {
    stageRankingBar.textContent = "로그인하면 기록이 랭킹에 반영됩니다.";
    return;
  }

  if (!info.entries.length) {
    stageRankingBar.textContent = `${label} 랭킹 비어 있음 · 첫 기록이면 1위입니다.`;
    return;
  }

  if (info.myRank >= 1 && info.myRank <= 3) {
    stageRankingBar.textContent = `현재 TOP3 ${info.myRank}위 · 조언 남길 자격 있음`;
    return;
  }

  if (info.third) {
    stageRankingBar.textContent = `TOP3까지 ${info.gapToTop3}R · 지금 기록 ${info.myRound}R`;
    return;
  }

  stageRankingBar.textContent = `${label} 1위 ${info.leader.round}R · 내 최고 ${info.myRound}R`;
}

function updateInviteShareButton() {
  if (!inviteShareButton || inviteShareButton.disabled) return;

  if (!isLoggedIn()) {
    inviteShareButton.textContent = "친구에게 보내기 · 로그인하면 코인 +1";
    return;
  }

  inviteShareButton.textContent = game.rewardClaims?.inviteShare
    ? "친구에게 설치링크 보내기"
    : "카카오톡으로 친구에게 보내기 · 코인 +1";
}

function renderRankings() {
  const entries = game.rankings?.[game.rankingMode] || [];
  rankingList.innerHTML = "";
  renderRankingSummary(entries);
  updateRankingAdviceEditor(entries);

  if (!entries.length) {
    const empty = document.createElement("li");
    empty.className = "ranking-empty";
    empty.textContent = "아직 TOP3가 없습니다. 첫 기록을 남겨보세요.";
    rankingList.appendChild(empty);
    return;
  }

  entries.forEach((entry, index) => {
    const item = document.createElement("li");
    const place = index + 1;
    item.className = entry.userId === game.currentUserId ? "is-me" : "";
    item.dataset.place = String(place);
    const message = String(entry.message || "").trim();
    const canReport = message && isLoggedIn() && entry.userId !== game.currentUserId;
    item.innerHTML = `
      <span class="ranking-place">${getRankingBadge(place)}</span>
      <div class="ranking-main">
        <strong>${entry.userId}</strong>
        <span class="ranking-message-line">
          ${message ? `<em>${escapeHtml(message)}</em>` : `<em class="is-empty">아직 조언을 작성하지 않았습니다.</em>`}
          ${canReport ? `<button class="ranking-report-button" type="button" data-report-ranking-message="${escapeHtml(entry.userId)}">신고</button>` : ""}
        </span>
      </div>
      <span>${entry.round}R</span>
      <small>${entry.coins}코인</small>
    `;
    rankingList.appendChild(item);
  });
}

function renderRankingSummary(entries) {
  if (!rankingSummary) return;

  const label = getModeLabel(game.rankingMode);
  const info = getRankingInfo(game.rankingMode);
  const leader = entries[0] || null;
  const third = entries[2] || null;

  if (!isLoggedIn()) {
    rankingSummary.innerHTML = `
      <span>${label}</span>
      <strong>로그인하면 랭킹 경쟁 시작</strong>
      <small>${leader ? `현재 1위 ${escapeHtml(leader.userId)} · ${leader.round}R` : "아직 TOP3가 비어 있습니다."}</small>
    `;
    return;
  }

  if (!entries.length) {
    rankingSummary.innerHTML = `
      <span>${label}</span>
      <strong>아직 등록된 기록이 없습니다</strong>
      <small>첫 기록을 남기면 TOP3에 표시됩니다.</small>
    `;
    return;
  }

  if (info.myRank >= 1 && info.myRank <= 3) {
    rankingSummary.innerHTML = `
      <span>${label}</span>
      <strong>현재 TOP3 ${info.myRank}위</strong>
      <small>한 줄 조언을 남길 수 있습니다.</small>
    `;
    return;
  }

  if (third) {
    rankingSummary.innerHTML = `
      <span>${label}</span>
      <strong>TOP3까지 ${info.gapToTop3}R</strong>
      <small>내 기록 ${info.myRound}R · 3위 ${escapeHtml(third.userId)} ${third.round}R</small>
    `;
    return;
  }

  rankingSummary.innerHTML = `
    <span>${label}</span>
    <strong>TOP3 자리가 남았습니다</strong>
    <small>내 기록 ${info.myRound}R · 기록을 올리면 TOP3에 들어갈 수 있습니다.</small>
  `;
}

function getRankingBadge(place) {
  return String(place);
}

function updateRankingAdviceEditor(entries = game.rankings?.[game.rankingMode] || []) {
  const myEntry = entries.find((entry) => entry.userId === game.currentUserId);
  const canWrite = isLoggedIn() && Boolean(myEntry);
  rankingAdviceEditor.hidden = !canWrite;
  saveRankingAdviceButton.disabled = !canWrite;
  if (canWrite) {
    rankingAdviceInput.value = myEntry.message || "";
  }
}

async function saveRankingAdvice() {
  const message = rankingAdviceInput.value.trim();
  const validation = validateRankingAdvice(message);
  if (!validation.ok) {
    setRankingStatus(validation.message, true);
    return;
  }

  setRankingStatus("조언 새기는 중...");
  saveRankingAdviceButton.disabled = true;

  try {
    const data = await apiRequest("/ranking-message", {
      method: "POST",
      body: { mode: game.rankingMode, message }
    });
    game.rankings = data.rankings || {};
    if (data.user) applyServerUser(data.user);
    renderRankings();
    renderHomeRankingPreview();
    setRankingStatus(data.reward?.awarded ? "첫 조언 보상으로 코인 +1 지급했습니다." : "TOP3의 조언으로 등록했습니다.");
  } catch (error) {
    setRankingStatus(error.message || "조언 저장에 실패했습니다.", true);
  } finally {
    saveRankingAdviceButton.disabled = false;
  }
}

async function reportRankingAdvice(userId) {
  if (!isLoggedIn()) {
    setRankingStatus("로그인 후 신고할 수 있습니다.", true);
    return;
  }

  const confirmed = window.confirm("이 TOP3 조언 문구를 신고하고 숨길까요?");
  if (!confirmed) return;

  setRankingStatus("신고 처리 중...");
  try {
    const data = await apiRequest("/ranking-message-report", {
      method: "POST",
      body: { mode: game.rankingMode, userId }
    });
    game.rankings = data.rankings || {};
    renderRankings();
    renderHomeRankingPreview();
    setRankingStatus("신고했습니다. 해당 문구는 숨김 처리됩니다.");
  } catch (error) {
    setRankingStatus(error.message || "신고 처리에 실패했습니다.", true);
  }
}

function validateRankingAdvice(message) {
  if (!message) {
    return { ok: false, message: "조언을 한 줄 입력해주세요." };
  }

  if (message.length > 45) {
    return { ok: false, message: "조언은 45자까지만 가능합니다." };
  }

  if (/(.)\1{6,}/.test(message.replace(/\s/g, ""))) {
    return { ok: false, message: "같은 글자를 너무 반복하면 저장할 수 없어요." };
  }

  if (BLOCKED_ADVICE_PATTERNS.some((pattern) => pattern.test(message))) {
    return { ok: false, message: "욕설, 개인정보, 광고 문구는 사용할 수 없어요." };
  }

  return { ok: true, message: "" };
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[char]));
}

function persistGuestProgress() {
  return;
}

function isLoggedIn() {
  return game.authMode === "member" && Boolean(game.authToken);
}

function syncProgress() {
  if (!isLoggedIn()) return Promise.resolve(null);
  return apiRequest("/progress", {
    method: "POST",
    body: {
      coins: game.coins,
      bestRounds: game.bestRounds
    }
  })
    .then((data) => applyServerUser(data.user))
    .catch(() => {
      setAccountButtonText(`${game.currentUserId || "USER"} · 오프라인`);
      return null;
    });
}

function setAuthStatus(message, isError = false) {
  authStatus.textContent = message;
  authStatus.classList.toggle("is-error", isError);
}

function setAuthButtonsDisabled(disabled) {
  loginButton.disabled = disabled;
  signupButton.disabled = disabled;
  deleteAccountButton.disabled = disabled;
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

async function handleDeleteAccount() {
  if (!isLoggedIn()) return;
  const confirmed = window.confirm("계정을 삭제하면 코인, 기록, 랭킹 정보가 모두 삭제됩니다. 계속할까요?");
  if (!confirmed) return;

  setAuthStatus("계정 삭제 중...");
  setAuthButtonsDisabled(true);

  try {
    await apiRequest("/delete-account", { method: "POST" });
    clearMemberSession();
    hideAuthModal();
    hideAccountMenus();
    loadRankings();
  } catch (error) {
    setAuthStatus(error.message || "계정 삭제에 실패했습니다.", true);
  } finally {
    setAuthButtonsDisabled(false);
  }
}

async function handleDeleteAccountV2() {
  if (!isLoggedIn()) return;
  const deleteMessage = game.currentUserProvider === "google"
    ? "게임 계정만 삭제됩니다. Google 계정 자체는 삭제되지 않지만, 코인/기록/랭킹은 모두 사라집니다. 계속할까요?"
    : "계정을 삭제하면 코인, 기록, 랭킹 정보가 모두 삭제됩니다. 계속할까요?";
  const confirmed = window.confirm(deleteMessage);
  if (!confirmed) return;

  setAuthStatus("계정 삭제 중...");
  setAuthButtonsDisabled(true);

  try {
    await apiRequest("/delete-account", { method: "POST" });
    clearMemberSession();
    hideAuthModal();
    hideAccountMenus();
    loadRankings();
  } catch (error) {
    setAuthStatus(error.message || "계정 삭제에 실패했습니다.", true);
  } finally {
    setAuthButtonsDisabled(false);
  }
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

function showSettingsModal() {
  syncSettingsControls();
  settingsModal.hidden = false;
  settingsModal.classList.add("is-visible");
  settingsModal.setAttribute("aria-hidden", "false");
  setTimeout(() => soundToggle.focus(), 0);
}

function hideSettingsModal() {
  settingsModal.classList.remove("is-visible");
  settingsModal.hidden = true;
  settingsModal.setAttribute("aria-hidden", "true");
}

function showIntroOnFirstLaunch() {
  if (localStorage.getItem(INTRO_SEEN_KEY) === "true") return;

  window.setTimeout(() => showIntroModal(true), 450);
}

function showIntroModal(markAsSeen = true) {
  if (!introModal) return;

  if (markAsSeen) {
    localStorage.setItem(INTRO_SEEN_KEY, "true");
  }

  currentIntroStep = 0;
  introModal.hidden = false;
  document.body.classList.add("is-tutorial");
  introModal.classList.add("is-visible");
  introModal.setAttribute("aria-hidden", "false");
  renderIntroStep();
  window.setTimeout(() => introStartButton?.focus(), 0);
}

function hideIntroModal() {
  if (!introModal) return;

  localStorage.setItem(INTRO_SEEN_KEY, "true");
  clearIntroHighlight();
  document.body.classList.remove("is-tutorial");
  introModal.classList.remove("is-visible");
  introModal.hidden = true;
  introModal.setAttribute("aria-hidden", "true");
}

function advanceIntroStep() {
  if (currentIntroStep >= INTRO_STEPS.length - 1) {
    hideIntroModal();
    return;
  }

  currentIntroStep += 1;
  renderIntroStep();
}

function renderIntroStep() {
  const step = INTRO_STEPS[currentIntroStep];
  if (!step) {
    hideIntroModal();
    return;
  }

  clearIntroHighlight();
  introHighlightedElement = document.querySelector(step.target);
  introHighlightedElement?.classList.add("tutorial-highlight");

  introStepLabel.textContent = `${currentIntroStep + 1} / ${INTRO_STEPS.length}`;
  introTitle.textContent = step.title;
  introDescription.textContent = step.description;
  introStartButton.textContent = currentIntroStep === INTRO_STEPS.length - 1 ? "시작하기" : "다음";
  positionIntroCoach();
}

function clearIntroHighlight() {
  introHighlightedElement?.classList.remove("tutorial-highlight");
  introHighlightedElement = null;
}

function positionIntroCoach() {
  if (!introCoach || !introHighlightedElement) return;

  const rect = introHighlightedElement.getBoundingClientRect();
  const cardWidth = Math.min(320, window.innerWidth - 28);
  const belowTop = rect.bottom + 12;
  const aboveTop = rect.top - 172;
  const useAbove = belowTop + 160 > window.innerHeight && aboveTop > 12;
  const top = Math.max(10, Math.min(useAbove ? aboveTop : belowTop, window.innerHeight - 172));
  const left = Math.max(14, Math.min(rect.left, window.innerWidth - cardWidth - 14));

  introCoach.style.setProperty("--tutorial-card-width", `${cardWidth}px`);
  introCoach.style.setProperty("--tutorial-card-top", `${top}px`);
  introCoach.style.setProperty("--tutorial-card-left", `${left}px`);
}

function syncSettingsControls() {
  soundToggle.checked = game.soundEnabled;
  vibrationToggle.checked = game.vibrationEnabled;
}

function updateFeedbackSetting(type, enabled) {
  if (type === "sound") {
    game.soundEnabled = enabled;
    localStorage.setItem(SOUND_ENABLED_KEY, String(enabled));
    return;
  }

  game.vibrationEnabled = enabled;
  localStorage.setItem(VIBRATION_ENABLED_KEY, String(enabled));
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
  authLoginTab.hidden = isAccount;
  authSignupTab.hidden = isAccount;
  accountSummary.hidden = !isAccount;
  anonymousNotice.hidden = isAccount;
  authLoginTab.classList.toggle("is-active", !isSignup && !isAccount);
  authSignupTab.classList.toggle("is-active", isSignup);
  authLoginTab.setAttribute("aria-selected", String(!isSignup && !isAccount));
  authSignupTab.setAttribute("aria-selected", String(isSignup));
  deleteAccountButton.hidden = !isAccount;

  if (isAccount) {
    accountUserId.textContent = game.currentUserId || "USER";
    accountProvider.textContent = game.currentUserProvider === "google" ? "Google 계정" : "USER ID 계정";
    accountEmailRow.hidden = game.currentUserProvider !== "google" || !game.currentUserEmail;
    accountEmail.textContent = game.currentUserEmail || "-";
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
  signupButton.hidden = !isAccount;
  authPasswordInput.autocomplete = isSignup ? "new-password" : "current-password";
  authTitle.textContent = isAccount ? "계정" : isSignup ? "회원가입" : "로그인";
  authDescription.textContent = isAccount
    ? game.currentUserProvider === "google"
      ? "Google 계정으로 로그인되어 있습니다. 게임 계정만 관리됩니다."
      : "로그인 상태입니다. 여기서 로그아웃하거나 계정을 삭제할 수 있어요."
    : isSignup
    ? "USER ID와 비밀번호만으로 바로 시작할 수 있어요."
    : "계정별로 코인과 최고기록이 저장됩니다.";
  loginButton.textContent = isAccount ? "로그아웃" : isSignup ? "회원가입" : "로그인";
  signupButton.textContent = isAccount ? "닫기" : isSignup ? "로그인으로 전환" : "회원가입으로 전환";
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
  game.currentUserProvider = "";
  game.currentUserEmail = "";
  game.coins = 0;
  game.bestRounds = { card: 0, sequence: 0, missing: 0 };
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem("memorySnapAuthMode");
  localStorage.removeItem("memorySnapUserId");
  localStorage.removeItem("memorySnapUserProvider");
  localStorage.removeItem("memorySnapUserEmail");
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
  const isMember = isLoggedIn();
  const canContinue = isMember && game.coins >= 2;
  continueButton.hidden = false;
  continueButton.disabled = !canContinue;
  continueButton.textContent = canContinue ? "코인 2개로 이어하기" : "코인 부족";
  continueButton.title = !isMember ? "로그인하면 코인 이어하기를 사용할 수 있습니다." : game.coins < 2 ? "코인이 2개 이상 필요합니다." : "";
}

function updateFailSummary() {
  const bestRound = getStoredBestRound(game.mode);
  resultRound.textContent = `${game.round}라운드`;
  resultBestRound.textContent = `${bestRound}라운드`;
  resultStreak.textContent = `${game.streak}회`;
  resultCoins.textContent = `${game.coins}개`;

  if (isLoggedIn() && game.coins >= 2) {
    continueHint.textContent = `코인 2개를 사용하면 ${game.round}라운드부터 이어갈 수 있습니다.`;
    return;
  }

  continueHint.textContent = isLoggedIn()
    ? ""
    : "로그인하면 코인을 모아 이어가기를 사용할 수 있습니다.";
}

async function updateResultRanking() {
  if (!isLoggedIn()) {
    resultRankingTitle.textContent = "랭킹 미등록";
    resultRankingDetail.textContent = "로그인하면 기록이 저장됩니다.";
    return;
  }

  resultRankingTitle.textContent = "랭킹 확인 중";
  resultRankingDetail.textContent = "기록을 비교하는 중입니다.";

  await syncProgress();

  try {
    const data = await apiRequest("/rankings", { includeAuth: false });
    game.rankings = data.rankings || {};
    renderHomeRankingPreview();

    const info = getRankingInfo(game.mode);
    const label = getModeLabel(game.mode);

    if (!info.entries.length) {
      resultRankingTitle.textContent = `${label} 랭킹 준비 중`;
      resultRankingDetail.textContent = "아직 등록된 기록이 없습니다. 첫 기록을 남겨보세요.";
      return;
    }

    if (info.myRank === 1) {
      resultRankingTitle.textContent = `${label} 전체 1위`;
      resultRankingDetail.textContent = "현재 이 모드에서 가장 높은 기록입니다.";
      return;
    }

    if (info.myRank > 1) {
      resultRankingTitle.textContent = `${label} 전체 ${info.myRank}위`;
      resultRankingDetail.textContent = `1위 ${info.leader.userId}까지 ${info.gapToLeader}R 남았습니다.`;
      return;
    }

    if (info.third) {
      resultRankingTitle.textContent = "TOP3 문 앞";
      resultRankingDetail.textContent = `3위까지 ${info.gapToTop3}R 남았습니다.`;
      return;
    }

    resultRankingTitle.textContent = `${label} 랭킹 등록 대기`;
    resultRankingDetail.textContent = "기록은 저장됐습니다. 더 높은 라운드에 도전해보세요.";
  } catch {
    resultRankingTitle.textContent = "랭킹 확인 실패";
    resultRankingDetail.textContent = "기록은 계정에 저장했습니다. 잠시 후 다시 확인하세요.";
  }
}

async function shareStoryResult() {
  const originalText = storyButton.textContent;
  storyButton.disabled = true;
  storyButton.textContent = "공유 준비 중";

  try {
    const blob = await createStoryBlob();
    const filename = `memory-snap-${game.mode}-${game.round}r.png`;
    const file = new File([blob], filename, { type: "image/png" });

    if (navigator.canShare?.({ files: [file] }) && navigator.share) {
      await navigator.share({
        title: "Memory Snap",
        text: "Memory Snap에서 순간 기억력에 도전해보세요.",
        files: [file]
      });
      storyButton.textContent = "공유됨";
    } else {
      downloadBlob(blob, filename);
      storyButton.textContent = "공유 미지원 · 저장됨";
    }
  } catch {
    storyButton.textContent = "공유 취소됨";
  } finally {
    setTimeout(() => {
      storyButton.disabled = false;
      storyButton.textContent = originalText;
    }, 1200);
  }
}

async function shareInstallLink() {
  if (!inviteShareButton) return;

  inviteShareButton.disabled = true;
  inviteShareButton.textContent = "공유 준비 중";

  try {
    const shareData = {
      title: "Memory Snap",
      text: "Memory Snap에서 순간 기억력에 도전해보세요.",
      url: APP_INSTALL_URL
    };

    if (navigator.share) {
      await navigator.share(shareData);
    } else if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(APP_INSTALL_URL);
      inviteShareButton.textContent = "링크 복사됨";
    } else {
      window.prompt("친구에게 보낼 링크입니다.", APP_INSTALL_URL);
    }

    const reward = await claimActivityReward("inviteShare");
    inviteShareButton.textContent = reward.awarded
      ? "친구 초대 보상 · 코인 +1"
      : reward.message || "이미 받은 보상입니다";
  } catch (error) {
    inviteShareButton.textContent = error.message || "공유 취소됨";
  } finally {
    setTimeout(() => {
      inviteShareButton.disabled = false;
      updateInviteShareButton();
    }, 1500);
  }
}

function createStoryBlob() {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1920;
    const context = canvas.getContext("2d");
    drawStoryResult(context, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Story image creation failed"));
        return;
      }
      resolve(blob);
    }, "image/png", 0.96);
  });
}

function drawStoryResult(context, width, height) {
  const modeName = getStoryModeName(game.mode);
  const taunt = failTaunt?.textContent || randomFrom(FAILURE_MENTIONS);
  const grade = getStoryGrade(game.round);
  const subLine = getStorySubLine(game.round);
  const roundText = `${game.round}라운드까지 도전했습니다.`;
  const bestText = `최고 ${getStoredBestRound(game.mode)}R · 연속 ${game.streak}회`;
  const footer = getStoryFooter(game.mode);

  const gradient = context.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#f8fbfd");
  gradient.addColorStop(0.42, "#eaf7f4");
  gradient.addColorStop(1, "#172033");
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);

  context.fillStyle = "rgba(16, 168, 150, 0.2)";
  context.beginPath();
  context.arc(width * 0.9, height * 0.12, 260, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = "rgba(23, 32, 51, 0.1)";
  context.beginPath();
  context.arc(width * 0.08, height * 0.82, 310, 0, Math.PI * 2);
  context.fill();

  roundRect(context, 78, 96, width - 156, height - 192, 42);
  context.fillStyle = "rgba(255, 255, 255, 0.9)";
  context.fill();
  context.lineWidth = 4;
  context.strokeStyle = "rgba(23, 32, 51, 0.12)";
  context.stroke();

  context.fillStyle = "#172033";
  drawText(context, "MEMORY SNAP", 118, 190, 58, 900, width - 236);
  drawText(context, "순간 기억력 도전 결과", 118, 310, 78, 1000, width - 236, 1.06);

  roundRect(context, 118, 500, width - 236, 360, 28);
  context.fillStyle = "#172033";
  context.fill();

  roundRect(context, 162, 548, 330, 72, 999);
  context.fillStyle = grade.color;
  context.fill();
  context.fillStyle = "#ffffff";
  drawText(context, grade.label, 194, 566, 34, 1000, 270);
  drawText(context, modeName, 162, 655, 42, 900, width - 324);
  drawText(context, roundText, 162, 740, 58, 1000, width - 324, 1.08);
  context.fillStyle = "rgba(255, 255, 255, 0.72)";
  drawText(context, subLine, 162, 825, 34, 900, width - 324);

  context.fillStyle = "#0f8f78";
  drawText(context, taunt, 118, 1015, 72, 1000, width - 236, 1.08);

  context.fillStyle = "#5f6f84";
  drawText(context, bestText, 118, 1228, 38, 900, width - 236);
  drawText(context, footer, 118, 1348, 48, 900, width - 236, 1.2);

  roundRect(context, 118, 1588, width - 236, 150, 30);
  context.fillStyle = "#10a896";
  context.fill();
  context.fillStyle = "#ffffff";
  drawText(context, "지금 기록에 도전해보세요.", 166, 1668, 48, 1000, width - 332, 1.08);
}

function drawText(context, text, x, y, size, weight, maxWidth, lineHeight = 1.16) {
  context.font = `${weight} ${size}px Inter, Pretendard, Arial, sans-serif`;
  context.textBaseline = "top";
  const words = String(text).split(" ");
  let line = "";
  let cursorY = y;

  words.forEach((word, index) => {
    const test = line ? `${line} ${word}` : word;
    if (context.measureText(test).width > maxWidth && line) {
      context.fillText(line, x, cursorY);
      line = word;
      cursorY += size * lineHeight;
    } else {
      line = test;
    }

    if (index === words.length - 1 && line) {
      context.fillText(line, x, cursorY);
    }
  });
}

function roundRect(context, x, y, width, height, radius) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function getStoryModeName(mode) {
  if (mode === "sequence") return "불빛 따라 누르기";
  if (mode === "missing") return "사라진 물건 찾기";
  return "카드 위치 기억";
}

function getStoryGrade(round) {
  if (round >= 9) return { label: "상위 기록", color: "#172033" };
  if (round >= 6) return { label: "좋은 기록", color: "#0f8f78" };
  if (round >= 3) return { label: "도전 기록", color: "#10a896" };
  return { label: "첫 도전", color: "#df5b48" };
}

function getStorySubLine(round) {
  if (round >= 9) return "높은 집중력을 보여준 기록입니다";
  if (round >= 6) return "순간 기억력이 안정적으로 유지됐습니다";
  if (round >= 3) return "조금 더 높은 라운드에 도전해보세요";
  return "첫 기록을 남겼습니다";
}

function getStoryFooter(mode) {
  if (mode === "sequence") return "반짝인 순서를 기억하는 모드입니다.";
  if (mode === "missing") return "장면에서 사라진 물건을 찾는 모드입니다.";
  return "카드 위치를 기억하는 모드입니다.";
}

function getModeLabel(mode) {
  if (mode === "sequence") return "순서";
  if (mode === "missing") return "물건";
  return "카드";
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
  if (game.round >= 6) return 8;
  if (game.round >= 3) return 7;
  if (game.round >= 2) return 6;
  return 5;
}

function getMissingOptionCount() {
  if (game.round >= 7) return 8;
  if (game.round >= 5) return 7;
  if (game.round >= 3) return 6;
  if (game.round >= 2) return 5;
  return 4;
}

function getMissingRevealSeconds() {
  if (game.round >= 9) return 2.2;
  if (game.round >= 7) return 2.4;
  if (game.round >= 5) return 2.6;
  if (game.round >= 3) return 2.8;
  if (game.round >= 2) return 3.0;
  return 3.2;
}

function getMissingObjectScale() {
  if (game.round >= 9) return 0.72;
  if (game.round >= 7) return 0.8;
  if (game.round >= 5) return 0.88;
  return 1;
}

function shuffle(list) {
  return [...list].sort(() => Math.random() - 0.5);
}

function playFeedback(type) {
  if (!game.soundEnabled) return;

  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    audioContext = audioContext || new AudioContext();
    if (audioContext.state === "suspended") {
      audioContext.resume();
    }

    if (type === "success") {
      playTone(audioContext, 620, 0, 0.08, 0.13, "triangle");
      playTone(audioContext, 880, 0.07, 0.1, 0.15, "triangle");
      playTone(audioContext, 1180, 0.15, 0.08, 0.1, "sine");
      return;
    }

    if (type === "combo") {
      playTone(audioContext, 520, 0, 0.07, 0.12, "triangle");
      playTone(audioContext, 780, 0.06, 0.08, 0.13, "triangle");
      playTone(audioContext, 1080, 0.13, 0.1, 0.15, "triangle");
      playTone(audioContext, 1440, 0.22, 0.08, 0.1, "sine");
      return;
    }

    playTone(audioContext, 150, 0, 0.14, 0.22, "square");
    playTone(audioContext, 92, 0.09, 0.22, 0.28, "sawtooth");
    playTone(audioContext, 240, 0.21, 0.08, 0.13, "square");
  } catch (error) {
    // Sound is optional and can be blocked by browser settings.
  }
}

function playToneFeedback(frequency) {
  if (!game.soundEnabled) return;

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
  if (game.vibrationEnabled && navigator.vibrate) {
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
