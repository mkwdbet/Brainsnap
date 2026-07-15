import base64
import hashlib
import hmac
import json
import os
import secrets
import time
from decimal import Decimal

import boto3


USERS_TABLE = os.environ.get("USERS_TABLE", "MemorySnapUsers")
SESSIONS_TABLE = os.environ.get("SESSIONS_TABLE", "MemorySnapSessions")
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
        "coins": int(user.get("coins", 0)),
        "bestRounds": best_rounds_from_user(user),
    }


def get_user(user_id):
    result = users_table.get_item(Key={"userId": user_id})
    return result.get("Item")


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
        return response(400, {"error": "아이디는 영문/숫자/_/- 조합 3~16자로 입력하세요."})
    if len(password) < 4:
        return response(400, {"error": "비밀번호는 4자 이상 입력하세요."})
    if get_user(user_id):
        return response(409, {"error": "이미 존재하는 아이디입니다."})

    salt, password_hash = hash_password(password)
    user = {
        "userId": user_id,
        "passwordHash": password_hash,
        "salt": salt,
        "coins": Decimal(0),
        "bestRounds": {
            "card": Decimal(0),
            "sequence": Decimal(0),
            "missing": Decimal(0),
        },
        "createdAt": int(time.time()),
    }
    users_table.put_item(Item=user)

    token = secrets.token_hex(24)
    sessions_table.put_item(Item={"token": token, "userId": user_id, "createdAt": int(time.time())})
    return response(201, {"token": token, "user": public_user(user_id, user)})


def handle_login(body):
    user_id = normalize_user_id(body.get("userId"))
    password = str(body.get("password") or "")
    user = get_user(user_id)

    if not user or not verify_password(password, user):
        return response(401, {"error": "아이디 또는 비밀번호가 맞지 않습니다."})

    token = secrets.token_hex(24)
    sessions_table.put_item(Item={"token": token, "userId": user_id, "createdAt": int(time.time())})
    return response(200, {"token": token, "user": public_user(user_id, user)})


def handle_progress(session, body):
    user = session["user"]
    user_id = session["userId"]

    if isinstance(body.get("coins"), (int, float)):
        user["coins"] = Decimal(max(0, int(body["coins"])))

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
        if method(event) == "POST" and path == "/signup":
            return handle_signup(parse_body(event))

        if method(event) == "POST" and path == "/login":
            return handle_login(parse_body(event))

        session = get_session_user(event)
        if not session:
            return response(401, {"error": "로그인이 필요합니다."})

        if method(event) == "GET" and path == "/me":
            return response(200, {"user": public_user(session["userId"], session["user"])})

        if method(event) == "POST" and path == "/logout":
            sessions_table.delete_item(Key={"token": session["token"]})
            return response(200, {"ok": True})

        if method(event) == "POST" and path == "/progress":
            return handle_progress(session, parse_body(event))

        return response(404, {"error": "존재하지 않는 API입니다."})
    except json.JSONDecodeError:
        return response(400, {"error": "요청 형식이 올바르지 않습니다."})
    except Exception:
        return response(500, {"error": "서버 오류가 발생했습니다."})
