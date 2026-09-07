const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const https = require("https");

const PORT = Number(process.env.PORT || 8787);
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const DATA_DIR = path.join(__dirname, "data");
const DB_PATH = path.join(DATA_DIR, "db.json");
const REWARD_COINS = {
  signup: 1,
  inviteShare: 1,
  firstAdvice: 1
};

function createEmptyDb() {
  return {
    users: {},
    sessions: {}
  };
}

function ensureDb() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(createEmptyDb(), null, 2));
  }
}

function readDb() {
  ensureDb();
  return JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
}

function writeDb(db) {
  ensureDb();
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

function sendJson(res, statusCode, body) {
  res.writeHead(statusCode, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Content-Type": "application/json; charset=utf-8"
  });
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 100000) {
        reject(new Error("?붿껌???덈Т ?쎈땲??"));
        req.destroy();
      }
    });
    req.on("end", () => {
      if (!body) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error("JSON ?뺤떇???щ컮瑜댁? ?딆뒿?덈떎."));
      }
    });
    req.on("error", reject);
  });
}

function normalizeUserId(userId) {
  return String(userId || "").trim().toLowerCase();
}

function validateUserId(userId) {
  return /^[a-z0-9_-]{3,16}$/.test(userId);
}

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.pbkdf2Sync(String(password), salt, 120000, 32, "sha256").toString("hex");
  return { salt, hash };
}

function verifyPassword(password, user) {
  if (!user.passwordHash || !user.salt) return false;
  const next = hashPassword(password, user.salt);
  return crypto.timingSafeEqual(Buffer.from(next.hash, "hex"), Buffer.from(user.passwordHash, "hex"));
}

function publicUser(userId, user) {
  return {
    userId,
    provider: user.provider || "password",
    email: user.provider === "google" ? user.email || "" : "",
    coins: Number(user.coins || 0),
    rewardClaims: user.rewardClaims || {},
    bestRounds: {
      card: Number(user.bestRounds?.card || 0),
      sequence: Number(user.bestRounds?.sequence || 0),
      missing: Number(user.bestRounds?.missing || 0)
    }
  };
}

function getRankings(db) {
  const modes = ["card", "sequence", "missing"];
  return Object.fromEntries(
    modes.map((mode) => [
      mode,
      Object.entries(db.users)
        .map(([userId, user]) => ({
          userId,
          round: Number(user.bestRounds?.[mode] || 0),
          coins: Number(user.coins || 0),
          message: user.hiddenRankMessages?.[mode] ? "" : normalizeRankMessage(user.rankMessages?.[mode]).slice(0, 45)
        }))
        .filter((entry) => entry.round > 0)
        .sort((a, b) => b.round - a.round || b.coins - a.coins || a.userId.localeCompare(b.userId))
        .slice(0, 3)
    ])
  );
}

function normalizeRankMessage(message) {
  return String(message || "").replace(/\s+/g, " ").trim();
}

const blockedRankMessagePatterns = [
  /https?:\/\//i,
  /www\./i,
  /@[a-z0-9._-]+\.[a-z]{2,}/i,
  /\b\d{2,3}-?\d{3,4}-?\d{4}\b/,
  /카톡|오픈채팅|텔레그램|광고|홍보|무료\s*코인/i,
  /시발|씨발|ㅅㅂ|병신|ㅂㅅ|개새|좆|fuck|sex/i
];

function validateRankMessage(message) {
  const normalized = normalizeRankMessage(message);
  if (!normalized) return { ok: false, error: "조언을 한 줄 입력해주세요." };
  if (normalized.length > 45) return { ok: false, error: "조언은 45자까지만 가능합니다." };
  if (/(.)\1{6,}/.test(normalized.replace(/\s/g, ""))) {
    return { ok: false, error: "같은 글자를 너무 반복하면 저장할 수 없어요." };
  }
  if (blockedRankMessagePatterns.some((pattern) => pattern.test(normalized))) {
    return { ok: false, error: "욕설, 개인정보, 광고 문구는 사용할 수 없어요." };
  }
  return { ok: true, message: normalized };
}

function canWriteRankMessage(db, mode, userId) {
  return (getRankings(db)[mode] || []).some((entry) => entry.userId === userId);
}

function grantReward(user, type) {
  const coins = REWARD_COINS[type];
  if (!coins) return { awarded: false, coins: 0, message: "Unknown reward." };

  user.rewardClaims = user.rewardClaims || {};
  if (user.rewardClaims[type]) {
    return { awarded: false, coins: 0, message: "Reward already claimed." };
  }

  user.coins = Number(user.coins || 0) + coins;
  user.rewardClaims[type] = new Date().toISOString();
  return { awarded: true, coins, message: `Coin +${coins}` };
}

function getUserFromRequest(req, db) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  const userId = db.sessions[token];
  if (!token || !userId || !db.users[userId]) return null;
  return { token, userId, user: db.users[userId] };
}

function makeDefaultUser(password) {
  const secure = hashPassword(password);
  return {
    passwordHash: secure.hash,
    salt: secure.salt,
    coins: 0,
    rewardClaims: {},
    bestRounds: {
      card: 0,
      sequence: 0,
      missing: 0
    },
    createdAt: new Date().toISOString()
  };
}

function makeGoogleUser(profile) {
  return {
    passwordHash: "",
    salt: "",
    provider: "google",
    googleSub: profile.sub,
    email: profile.email || "",
    coins: 0,
    rewardClaims: {},
    bestRounds: {
      card: 0,
      sequence: 0,
      missing: 0
    },
    createdAt: new Date().toISOString()
  };
}

function findUserByGoogleSub(db, googleSub) {
  return Object.entries(db.users).find(([, user]) => user.googleSub === googleSub) || null;
}

function makeGoogleUserId(db, profile) {
  const emailName = String(profile.email || "").split("@")[0] || "google";
  const base = normalizeUserId(emailName.replace(/[^a-z0-9_-]/gi, "")).slice(0, 12) || "google";
  if (!db.users[base]) return base;

  const suffix = String(profile.sub || crypto.randomBytes(4).toString("hex")).slice(-6).toLowerCase();
  const fallback = `${base.slice(0, 9)}_${suffix}`;
  if (!db.users[fallback]) return fallback;

  let index = 1;
  while (db.users[`${base.slice(0, 10)}_${index}`]) index += 1;
  return `${base.slice(0, 10)}_${index}`;
}

function verifyGoogleToken(credential) {
  return new Promise((resolve, reject) => {
    if (!GOOGLE_CLIENT_ID) {
      reject(new Error("Google Client ID媛 ?쒕쾭???ㅼ젙?섏? ?딆븯?듬땲??"));
      return;
    }

    const url = new URL("https://oauth2.googleapis.com/tokeninfo");
    url.searchParams.set("id_token", credential);

    https
      .get(url, (response) => {
        let body = "";
        response.on("data", (chunk) => {
          body += chunk;
        });
        response.on("end", () => {
          let data = {};
          try {
            data = JSON.parse(body || "{}");
          } catch {
            reject(new Error("Google 濡쒓렇???묐떟???뺤씤?????놁뒿?덈떎."));
            return;
          }

          if (response.statusCode !== 200) {
            reject(new Error(data.error_description || "Google ?좏겙???좏슚?섏? ?딆뒿?덈떎."));
            return;
          }

          if (data.aud !== GOOGLE_CLIENT_ID) {
            reject(new Error("Google Client ID媛 ?쇱튂?섏? ?딆뒿?덈떎."));
            return;
          }

          if (!["accounts.google.com", "https://accounts.google.com"].includes(data.iss)) {
            reject(new Error("Google 諛쒓툒?먭? ?щ컮瑜댁? ?딆뒿?덈떎."));
            return;
          }

          if (!data.sub) {
            reject(new Error("Google 怨꾩젙 ?앸퀎?먮? ?뺤씤?????놁뒿?덈떎."));
            return;
          }

          if (data.email_verified !== "true" && data.email_verified !== true) {
            reject(new Error("?몄쬆??Google ?대찓?쇰쭔 ?ъ슜?????덉뒿?덈떎."));
            return;
          }

          resolve(data);
        });
      })
      .on("error", () => reject(new Error("Google 濡쒓렇???쒕쾭???곌껐?????놁뒿?덈떎.")));
  });
}

async function handleRequest(req, res) {
  if (req.method === "OPTIONS") {
    sendJson(res, 204, {});
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const db = readDb();

  try {
    if (req.method === "GET" && url.pathname === "/api/rankings") {
      sendJson(res, 200, { rankings: getRankings(db) });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/signup") {
      const body = await readBody(req);
      const userId = normalizeUserId(body.userId);
      const password = String(body.password || "");

      if (!validateUserId(userId)) {
        sendJson(res, 400, { error: "?꾩씠?붾뒗 ?곷Ц/?レ옄/_/- 議고빀 3~16?먮줈 ?낅젰?섏꽭??" });
        return;
      }

      if (password.length < 4) {
        sendJson(res, 400, { error: "鍮꾨?踰덊샇??4???댁긽 ?낅젰?섏꽭??" });
        return;
      }

      if (db.users[userId]) {
        sendJson(res, 409, { error: "?대? 議댁옱?섎뒗 ?꾩씠?붿엯?덈떎." });
        return;
      }

      db.users[userId] = makeDefaultUser(password);
      const reward = grantReward(db.users[userId], "signup");
      const token = crypto.randomBytes(24).toString("hex");
      db.sessions[token] = userId;
      writeDb(db);
      sendJson(res, 201, { token, user: publicUser(userId, db.users[userId]), reward });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/login") {
      const body = await readBody(req);
      const userId = normalizeUserId(body.userId);
      const password = String(body.password || "");
      const user = db.users[userId];

      if (!user || !verifyPassword(password, user)) {
        sendJson(res, 401, { error: "?꾩씠???먮뒗 鍮꾨?踰덊샇媛 留욎? ?딆뒿?덈떎." });
        return;
      }

      const token = crypto.randomBytes(24).toString("hex");
      db.sessions[token] = userId;
      writeDb(db);
      sendJson(res, 200, { token, user: publicUser(userId, user) });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/google-login") {
      const body = await readBody(req);
      const profile = await verifyGoogleToken(String(body.credential || ""));
      const existing = findUserByGoogleSub(db, profile.sub);
      const userId = existing ? existing[0] : makeGoogleUserId(db, profile);

      if (!existing) {
        db.users[userId] = makeGoogleUser(profile);
        grantReward(db.users[userId], "signup");
      } else {
        db.users[userId].email = profile.email || db.users[userId].email || "";
      }

      const token = crypto.randomBytes(24).toString("hex");
      db.sessions[token] = userId;
      writeDb(db);
      sendJson(res, 200, { token, user: publicUser(userId, db.users[userId]) });
      return;
    }

    const session = getUserFromRequest(req, db);
    if (!session) {
      sendJson(res, 401, { error: "濡쒓렇?몄씠 ?꾩슂?⑸땲??" });
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/me") {
      sendJson(res, 200, { user: publicUser(session.userId, session.user) });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/delete-account") {
      delete db.sessions[session.token];
      delete db.users[session.userId];
      writeDb(db);
      sendJson(res, 200, { ok: true });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/logout") {
      delete db.sessions[session.token];
      writeDb(db);
      sendJson(res, 200, { ok: true });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/progress") {
      const body = await readBody(req);

      if (body.bestRounds && typeof body.bestRounds === "object") {
        ["card", "sequence", "missing"].forEach((mode) => {
          const nextRound = Number(body.bestRounds[mode]);
          if (Number.isFinite(nextRound)) {
            session.user.bestRounds[mode] = Math.max(Number(session.user.bestRounds[mode] || 0), nextRound);
          }
        });
      }

      writeDb(db);
      sendJson(res, 200, { user: publicUser(session.userId, session.user) });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/reward") {
      const body = await readBody(req);
      const reward = grantReward(session.user, String(body.type || ""));
      writeDb(db);
      sendJson(res, 200, { user: publicUser(session.userId, session.user), reward });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/ranking-message") {
      const body = await readBody(req);
      const mode = ["card", "sequence", "missing"].includes(body.mode) ? body.mode : "";
      if (!mode) {
        sendJson(res, 400, { error: "모드가 올바르지 않습니다." });
        return;
      }

      if (!canWriteRankMessage(db, mode, session.userId)) {
        sendJson(res, 403, { error: "TOP3 안에 들어야 조언을 남길 수 있습니다." });
        return;
      }

      session.user.rankMessages = session.user.rankMessages || {};
      const hadAnyAdvice = Object.values(session.user.rankMessages).some((message) => normalizeRankMessage(message));
      const validation = validateRankMessage(body.message);
      if (!validation.ok) {
        sendJson(res, 400, { error: validation.error });
        return;
      }

      session.user.rankMessages[mode] = validation.message;
      session.user.hiddenRankMessages = session.user.hiddenRankMessages || {};
      delete session.user.hiddenRankMessages[mode];
      const reward = hadAnyAdvice ? { awarded: false, coins: 0 } : grantReward(session.user, "firstAdvice");
      writeDb(db);
      sendJson(res, 200, { rankings: getRankings(db), user: publicUser(session.userId, session.user), reward });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/ranking-message-report") {
      const body = await readBody(req);
      const mode = ["card", "sequence", "missing"].includes(body.mode) ? body.mode : "";
      const reportedUserId = normalizeUserId(body.userId);
      const reportedUser = db.users[reportedUserId];

      if (!mode || !reportedUser) {
        sendJson(res, 400, { error: "신고할 조언을 찾을 수 없습니다." });
        return;
      }

      if (reportedUserId === session.userId) {
        sendJson(res, 400, { error: "본인 조언은 신고할 수 없습니다." });
        return;
      }

      const message = String(reportedUser.rankMessages?.[mode] || "").trim();
      if (!message || reportedUser.hiddenRankMessages?.[mode]) {
        sendJson(res, 400, { error: "이미 숨겨졌거나 신고할 조언이 없습니다." });
        return;
      }

      reportedUser.rankMessageReports = reportedUser.rankMessageReports || {};
      reportedUser.rankMessageReports[mode] = reportedUser.rankMessageReports[mode] || [];
      if (!reportedUser.rankMessageReports[mode].includes(session.userId)) {
        reportedUser.rankMessageReports[mode].push(session.userId);
      }
      reportedUser.hiddenRankMessages = reportedUser.hiddenRankMessages || {};
      reportedUser.hiddenRankMessages[mode] = true;
      writeDb(db);
      sendJson(res, 200, { rankings: getRankings(db) });
      return;
    }
    sendJson(res, 404, { error: "議댁옱?섏? ?딅뒗 API?낅땲??" });
  } catch (error) {
    sendJson(res, 500, { error: error.message || "?쒕쾭 ?ㅻ쪟媛 諛쒖깮?덉뒿?덈떎." });
  }
}

ensureDb();
http.createServer(handleRequest).listen(PORT, "127.0.0.1", () => {
  console.log(`Memory Snap local API: http://127.0.0.1:${PORT}`);
});
