const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const PORT = Number(process.env.PORT || 8787);
const DATA_DIR = path.join(__dirname, "data");
const DB_PATH = path.join(DATA_DIR, "db.json");

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
        reject(new Error("요청이 너무 큽니다."));
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
        reject(new Error("JSON 형식이 올바르지 않습니다."));
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
  const next = hashPassword(password, user.salt);
  return crypto.timingSafeEqual(Buffer.from(next.hash, "hex"), Buffer.from(user.passwordHash, "hex"));
}

function publicUser(userId, user) {
  return {
    userId,
    coins: Number(user.coins || 0),
    bestRounds: {
      card: Number(user.bestRounds?.card || 0),
      sequence: Number(user.bestRounds?.sequence || 0),
      missing: Number(user.bestRounds?.missing || 0)
    }
  };
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
    bestRounds: {
      card: 0,
      sequence: 0,
      missing: 0
    },
    createdAt: new Date().toISOString()
  };
}

async function handleRequest(req, res) {
  if (req.method === "OPTIONS") {
    sendJson(res, 204, {});
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const db = readDb();

  try {
    if (req.method === "POST" && url.pathname === "/api/signup") {
      const body = await readBody(req);
      const userId = normalizeUserId(body.userId);
      const password = String(body.password || "");

      if (!validateUserId(userId)) {
        sendJson(res, 400, { error: "아이디는 영문/숫자/_/- 조합 3~16자로 입력하세요." });
        return;
      }

      if (password.length < 4) {
        sendJson(res, 400, { error: "비밀번호는 4자 이상 입력하세요." });
        return;
      }

      if (db.users[userId]) {
        sendJson(res, 409, { error: "이미 존재하는 아이디입니다." });
        return;
      }

      db.users[userId] = makeDefaultUser(password);
      const token = crypto.randomBytes(24).toString("hex");
      db.sessions[token] = userId;
      writeDb(db);
      sendJson(res, 201, { token, user: publicUser(userId, db.users[userId]) });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/login") {
      const body = await readBody(req);
      const userId = normalizeUserId(body.userId);
      const password = String(body.password || "");
      const user = db.users[userId];

      if (!user || !verifyPassword(password, user)) {
        sendJson(res, 401, { error: "아이디 또는 비밀번호가 맞지 않습니다." });
        return;
      }

      const token = crypto.randomBytes(24).toString("hex");
      db.sessions[token] = userId;
      writeDb(db);
      sendJson(res, 200, { token, user: publicUser(userId, user) });
      return;
    }

    const session = getUserFromRequest(req, db);
    if (!session) {
      sendJson(res, 401, { error: "로그인이 필요합니다." });
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/me") {
      sendJson(res, 200, { user: publicUser(session.userId, session.user) });
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
      if (Number.isFinite(Number(body.coins))) {
        session.user.coins = Math.max(0, Number(body.coins));
      }

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

    sendJson(res, 404, { error: "존재하지 않는 API입니다." });
  } catch (error) {
    sendJson(res, 500, { error: error.message || "서버 오류가 발생했습니다." });
  }
}

ensureDb();
http.createServer(handleRequest).listen(PORT, "127.0.0.1", () => {
  console.log(`Memory Snap local API: http://127.0.0.1:${PORT}`);
});
