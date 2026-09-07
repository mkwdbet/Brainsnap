import base64
import hashlib
import hmac
import json
import os
import secrets
import time
import urllib.error
import urllib.parse
import urllib.request
from decimal import Decimal

import boto3


USERS_TABLE = os.environ.get("USERS_TABLE", "MemorySnapUsers")
SESSIONS_TABLE = os.environ.get("SESSIONS_TABLE", "MemorySnapSessions")
GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID", "")
REWARD_COINS = {
    "signup": 1,
    "inviteShare": 1,
    "firstAdvice": 1,
}
PBKDF2_ITERATIONS = 120000

dynamodb = boto3.resource("dynamodb")
users_table = dynamodb.Table(USERS_TABLE)
sessions_table = dynamodb.Table(SESSIONS_TABLE)


def response(status_code, body):
    return {
        "statusCode": status_code,
        "headers": {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Content-Type": "application/json; charset=utf-8",
        },
        "body": json.dumps(body, ensure_ascii=False),
    }


def parse_body(event):
    raw_body = event.get("body") or "{}"
    if event.get("isBase64Encoded"):
        raw_body = base64.b64decode(raw_body).decode("utf-8")
    return json.loads(raw_body)


def route_path(event):
    path = event.get("rawPath") or event.get("path") or "/"
    if path.startswith("/api"):
        path = path[4:] or "/"
    return path


def method(event):
    return event.get("requestContext", {}).get("http", {}).get("method") or event.get("httpMethod", "GET")


def normalize_user_id(user_id):
    return str(user_id or "").strip().lower()


def valid_user_id(user_id):
    if len(user_id) < 3 or len(user_id) > 16:
        return False
    return all(ch.isalnum() or ch in "_-" for ch in user_id)


def hash_password(password, salt=None):
    salt = salt or secrets.token_hex(16)
    password_hash = hashlib.pbkdf2_hmac(
        "sha256",
        str(password).encode("utf-8"),
        salt.encode("utf-8"),
        PBKDF2_ITERATIONS,
    ).hex()
    return salt, password_hash


def verify_password(password, user):
    if not user.get("passwordHash") or not user.get("salt"):
        return False
    _, candidate_hash = hash_password(password, user["salt"])
    return hmac.compare_digest(candidate_hash, user["passwordHash"])


def best_rounds_from_user(user):
    rounds = user.get("bestRounds") or {}
    return {
        "card": int(rounds.get("card", 0)),
        "sequence": int(rounds.get("sequence", 0)),
        "missing": int(rounds.get("missing", 0)),
    }


def public_user(user_id, user):
    return {
        "userId": user_id,
        "provider": user.get("provider", "password"),
        "email": user.get("email", "") if user.get("provider") == "google" else "",
        "coins": int(user.get("coins", 0)),
        "rewardClaims": user.get("rewardClaims") or {},
        "bestRounds": best_rounds_from_user(user),
    }


def get_rankings():
    result = users_table.scan()
    users = result.get("Items", [])
    while "LastEvaluatedKey" in result:
        result = users_table.scan(ExclusiveStartKey=result["LastEvaluatedKey"])
        users.extend(result.get("Items", []))

    rankings = {}
    for mode_name in ["card", "sequence", "missing"]:
        entries = []
        for user in users:
            user_id = user.get("userId", "")
            round_value = best_rounds_from_user(user).get(mode_name, 0)
            if round_value <= 0:
                continue
            entries.append({
                "userId": user_id,
                "round": round_value,
                "coins": int(user.get("coins", 0)),
                "message": "" if (user.get("hiddenRankMessages") or {}).get(mode_name) else normalize_rank_message((user.get("rankMessages") or {}).get(mode_name))[:45],
            })

        rankings[mode_name] = sorted(
            entries,
            key=lambda entry: (-entry["round"], -entry["coins"], entry["userId"]),
        )[:3]

    return rankings


def normalize_rank_message(message):
    return " ".join(str(message or "").split())


BLOCKED_RANK_MESSAGE_PARTS = [
    "http://",
    "https://",
    "www.",
    "@",
    "카톡",
    "오픈채팅",
    "텔레그램",
    "광고",
    "홍보",
    "무료코인",
    "무료 코인",
    "시발",
    "씨발",
    "ㅅㅂ",
    "병신",
    "ㅂㅅ",
    "개새",
    "좆",
    "fuck",
    "sex",
]


def validate_rank_message(message):
    normalized = normalize_rank_message(message)
    compact = "".join(normalized.split()).lower()
    if not normalized:
        raise ValueError("조언을 한 줄 입력해주세요.")
    if len(normalized) > 45:
        raise ValueError("조언은 45자까지만 가능합니다.")
    if any(ch * 7 in compact for ch in set(compact)):
        raise ValueError("같은 글자를 너무 반복하면 저장할 수 없어요.")
    if any(part in compact or part in normalized.lower() for part in BLOCKED_RANK_MESSAGE_PARTS):
        raise ValueError("욕설, 개인정보, 광고 문구는 사용할 수 없어요.")
    if any(ch.isdigit() for ch in compact) and len([ch for ch in compact if ch.isdigit()]) >= 8:
        raise ValueError("개인정보로 보이는 숫자는 사용할 수 없어요.")
    return normalized


def can_write_rank_message(mode_name, user_id):
    return any(entry["userId"] == user_id for entry in get_rankings().get(mode_name, []))


def grant_reward(user, reward_type):
    coins = REWARD_COINS.get(reward_type)
    if not coins:
        return {"awarded": False, "coins": 0, "message": "Unknown reward."}

    claims = user.get("rewardClaims") or {}
    if claims.get(reward_type):
        user["rewardClaims"] = claims
        return {"awarded": False, "coins": 0, "message": "Reward already claimed."}

    user["coins"] = Decimal(int(user.get("coins", 0)) + coins)
    claims[reward_type] = str(int(time.time()))
    user["rewardClaims"] = claims
    return {"awarded": True, "coins": coins, "message": f"Coin +{coins}"}


def get_user(user_id):
    result = users_table.get_item(Key={"userId": user_id})
    return result.get("Item")


def find_user_by_google_sub(google_sub):
    result = users_table.scan(
        FilterExpression="googleSub = :googleSub",
        ExpressionAttributeValues={":googleSub": google_sub},
    )
    users = result.get("Items", [])
    while "LastEvaluatedKey" in result and not users:
        result = users_table.scan(
            ExclusiveStartKey=result["LastEvaluatedKey"],
            FilterExpression="googleSub = :googleSub",
            ExpressionAttributeValues={":googleSub": google_sub},
        )
        users.extend(result.get("Items", []))
    return users[0] if users else None


def make_google_user_id(profile):
    email_name = str(profile.get("email") or "").split("@")[0] or "google"
    base = "".join(ch for ch in normalize_user_id(email_name) if ch.isalnum() or ch in "_-")[:12] or "google"
    if not get_user(base):
        return base

    suffix = str(profile.get("sub") or secrets.token_hex(4))[-6:].lower()
    fallback = f"{base[:9]}_{suffix}"
    if not get_user(fallback):
        return fallback

    index = 1
    while get_user(f"{base[:10]}_{index}"):
        index += 1
    return f"{base[:10]}_{index}"


def make_google_user(user_id, profile):
    return {
        "userId": user_id,
        "passwordHash": "",
        "salt": "",
        "provider": "google",
        "googleSub": profile["sub"],
        "email": profile.get("email", ""),
        "coins": Decimal(0),
        "rewardClaims": {},
        "bestRounds": {
            "card": Decimal(0),
            "sequence": Decimal(0),
            "missing": Decimal(0),
        },
        "createdAt": int(time.time()),
    }


def verify_google_token(credential):
    if not GOOGLE_CLIENT_ID:
        raise ValueError("Google Client ID媛 ?쒕쾭???ㅼ젙?섏? ?딆븯?듬땲??")

    query = urllib.parse.urlencode({"id_token": credential})
    try:
        with urllib.request.urlopen(f"https://oauth2.googleapis.com/tokeninfo?{query}", timeout=6) as result:
            profile = json.loads(result.read().decode("utf-8"))
    except urllib.error.HTTPError as error:
        body = error.read().decode("utf-8")
        try:
            data = json.loads(body or "{}")
        except json.JSONDecodeError:
            data = {}
        raise ValueError(data.get("error_description") or "Google ?좏겙???좏슚?섏? ?딆뒿?덈떎.")

    if profile.get("aud") != GOOGLE_CLIENT_ID:
        raise ValueError("Google Client ID媛 ?쇱튂?섏? ?딆뒿?덈떎.")
    if profile.get("iss") not in ["accounts.google.com", "https://accounts.google.com"]:
        raise ValueError("Google 諛쒓툒?먭? ?щ컮瑜댁? ?딆뒿?덈떎.")
    if not profile.get("sub"):
        raise ValueError("Google 怨꾩젙 ?앸퀎?먮? ?뺤씤?????놁뒿?덈떎.")
    if profile.get("email_verified") not in [True, "true", "True"]:
        raise ValueError("?몄쬆??Google ?대찓?쇰쭔 ?ъ슜?????덉뒿?덈떎.")

    return profile


def get_session_user(event):
    headers = event.get("headers") or {}
    auth_header = headers.get("authorization") or headers.get("Authorization") or ""
    token = auth_header[7:] if auth_header.startswith("Bearer ") else ""
    if not token:
        return None

    session_result = sessions_table.get_item(Key={"token": token})
    session = session_result.get("Item")
    if not session:
        return None

    user_id = session.get("userId")
    user = get_user(user_id)
    if not user:
        return None

    return {"token": token, "userId": user_id, "user": user}


def handle_signup(body):
    user_id = normalize_user_id(body.get("userId"))
    password = str(body.get("password") or "")

    if not valid_user_id(user_id):
        return response(400, {"error": "?꾩씠?붾뒗 ?곷Ц/?レ옄/_/- 議고빀 3~16?먮줈 ?낅젰?섏꽭??"})
    if len(password) < 4:
        return response(400, {"error": "鍮꾨?踰덊샇??4???댁긽 ?낅젰?섏꽭??"})
    if get_user(user_id):
        return response(409, {"error": "?대? 議댁옱?섎뒗 ?꾩씠?붿엯?덈떎."})

    salt, password_hash = hash_password(password)
    user = {
        "userId": user_id,
        "passwordHash": password_hash,
        "salt": salt,
        "coins": Decimal(0),
        "rewardClaims": {},
        "bestRounds": {
            "card": Decimal(0),
            "sequence": Decimal(0),
            "missing": Decimal(0),
        },
        "createdAt": int(time.time()),
    }
    reward = grant_reward(user, "signup")
    users_table.put_item(Item=user)

    token = secrets.token_hex(24)
    sessions_table.put_item(Item={"token": token, "userId": user_id, "createdAt": int(time.time())})
    return response(201, {"token": token, "user": public_user(user_id, user), "reward": reward})


def handle_login(body):
    user_id = normalize_user_id(body.get("userId"))
    password = str(body.get("password") or "")
    user = get_user(user_id)

    if not user or not verify_password(password, user):
        return response(401, {"error": "?꾩씠???먮뒗 鍮꾨?踰덊샇媛 留욎? ?딆뒿?덈떎."})

    token = secrets.token_hex(24)
    sessions_table.put_item(Item={"token": token, "userId": user_id, "createdAt": int(time.time())})
    return response(200, {"token": token, "user": public_user(user_id, user)})


def handle_google_login(body):
    profile = verify_google_token(str(body.get("credential") or ""))
    user = find_user_by_google_sub(profile["sub"])

    if user:
        user_id = user["userId"]
        user["email"] = profile.get("email") or user.get("email", "")
        users_table.put_item(Item=user)
    else:
        user_id = make_google_user_id(profile)
        user = make_google_user(user_id, profile)
        grant_reward(user, "signup")
        users_table.put_item(Item=user)

    token = secrets.token_hex(24)
    sessions_table.put_item(Item={"token": token, "userId": user_id, "createdAt": int(time.time())})
    return response(200, {"token": token, "user": public_user(user_id, user)})


def handle_progress(session, body):
    user = session["user"]
    user_id = session["userId"]

    incoming_rounds = body.get("bestRounds") or {}
    best_rounds = best_rounds_from_user(user)
    for mode_name in ["card", "sequence", "missing"]:
        try:
            next_round = int(incoming_rounds.get(mode_name, 0))
        except (TypeError, ValueError):
            next_round = 0
        best_rounds[mode_name] = max(best_rounds[mode_name], next_round)

    user["bestRounds"] = {key: Decimal(value) for key, value in best_rounds.items()}
    users_table.put_item(Item=user)
    return response(200, {"user": public_user(user_id, user)})


def lambda_handler(event, context):
    if method(event) == "OPTIONS":
        return response(204, {})

    path = route_path(event)

    try:
        if method(event) == "GET" and path == "/rankings":
            return response(200, {"rankings": get_rankings()})

        if method(event) == "POST" and path == "/signup":
            return handle_signup(parse_body(event))

        if method(event) == "POST" and path == "/login":
            return handle_login(parse_body(event))

        if method(event) == "POST" and path == "/google-login":
            return handle_google_login(parse_body(event))

        session = get_session_user(event)
        if not session:
            return response(401, {"error": "濡쒓렇?몄씠 ?꾩슂?⑸땲??"})

        if method(event) == "GET" and path == "/me":
            return response(200, {"user": public_user(session["userId"], session["user"])})

        if method(event) == "POST" and path == "/delete-account":
            sessions_table.delete_item(Key={"token": session["token"]})
            users_table.delete_item(Key={"userId": session["userId"]})
            return response(200, {"ok": True})

        if method(event) == "POST" and path == "/logout":
            sessions_table.delete_item(Key={"token": session["token"]})
            return response(200, {"ok": True})

        if method(event) == "POST" and path == "/progress":
            return handle_progress(session, parse_body(event))

        if method(event) == "POST" and path == "/reward":
            user = session["user"]
            reward = grant_reward(user, str(parse_body(event).get("type") or ""))
            users_table.put_item(Item=user)
            return response(200, {"user": public_user(session["userId"], user), "reward": reward})

        if method(event) == "POST" and path == "/ranking-message":
            body = parse_body(event)
            mode_name = body.get("mode") if body.get("mode") in ["card", "sequence", "missing"] else ""
            if not mode_name:
                return response(400, {"error": "모드가 올바르지 않습니다."})
            if not can_write_rank_message(mode_name, session["userId"]):
                return response(403, {"error": "TOP3 안에 들어야 조언을 남길 수 있습니다."})

            user = session["user"]
            user["rankMessages"] = user.get("rankMessages") or {}
            had_any_advice = any(normalize_rank_message(message) for message in user["rankMessages"].values())
            user["rankMessages"][mode_name] = validate_rank_message(body.get("message"))
            user["hiddenRankMessages"] = user.get("hiddenRankMessages") or {}
            user["hiddenRankMessages"].pop(mode_name, None)
            reward = {"awarded": False, "coins": 0} if had_any_advice else grant_reward(user, "firstAdvice")
            users_table.put_item(Item=user)
            return response(200, {"rankings": get_rankings(), "user": public_user(session["userId"], user), "reward": reward})

        if method(event) == "POST" and path == "/ranking-message-report":
            body = parse_body(event)
            mode_name = body.get("mode") if body.get("mode") in ["card", "sequence", "missing"] else ""
            reported_user_id = normalize_user_id(body.get("userId"))
            reported_user = get_user(reported_user_id)
            if not mode_name or not reported_user:
                return response(400, {"error": "신고할 조언을 찾을 수 없습니다."})
            if reported_user_id == session["userId"]:
                return response(400, {"error": "본인 조언은 신고할 수 없습니다."})

            message = str((reported_user.get("rankMessages") or {}).get(mode_name, "")).strip()
            if not message or (reported_user.get("hiddenRankMessages") or {}).get(mode_name):
                return response(400, {"error": "이미 숨겨졌거나 신고할 조언이 없습니다."})

            reported_user["rankMessageReports"] = reported_user.get("rankMessageReports") or {}
            reported_user["rankMessageReports"][mode_name] = reported_user["rankMessageReports"].get(mode_name) or []
            if session["userId"] not in reported_user["rankMessageReports"][mode_name]:
                reported_user["rankMessageReports"][mode_name].append(session["userId"])
            reported_user["hiddenRankMessages"] = reported_user.get("hiddenRankMessages") or {}
            reported_user["hiddenRankMessages"][mode_name] = True
            users_table.put_item(Item=reported_user)
            return response(200, {"rankings": get_rankings()})
        return response(404, {"error": "議댁옱?섏? ?딅뒗 API?낅땲??"})
    except json.JSONDecodeError:
        return response(400, {"error": "?붿껌 ?뺤떇???щ컮瑜댁? ?딆뒿?덈떎."})
    except ValueError as error:
        return response(400, {"error": str(error)})
    except Exception:
        return response(500, {"error": "?쒕쾭 ?ㅻ쪟媛 諛쒖깮?덉뒿?덈떎."})
