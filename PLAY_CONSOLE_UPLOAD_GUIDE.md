# Memory Snap Play Console Upload Guide

## 1. Create App

- App name: `Memory Snap`
- Default language: Korean
- App or game: Game
- Free or paid: Free

## 2. Main Store Listing

- App name: `Memory Snap`
- Short description: `방금 본 걸 맞히는 짧고 자극적인 기억력 미니게임`
- Full description: use `PLAY_STORE_COPY.md`
- App icon: `assets/icons/icon-512.png`
- Screenshots: portrait screenshots from `store-screenshots-play-1080x1920`
- Category: Game / Puzzle
- Contact email: `mkwdbet@gmail.com`
- Privacy policy: `https://memorysnap.org/privacy.html`

## 3. Screenshot Order

Recommended portrait screenshots:

1. Home screen with all three modes
2. Card memory gameplay
3. Sequence memory gameplay
4. Missing object gameplay
5. Failure/result screen
6. TOP3 ranking screen

Recommended screenshot captions:

- `방금 봤잖아요.`
- `3초 안에 외우고 맞히세요`
- `카드, 불빛, 사라진 물건`
- `틀리면 다시. 맞히면 다음 라운드.`
- `TOP3면 조언까지 남깁니다`
- `기억력은 핑계가 안 됩니다`

## 4. App Content Forms

Use these answers as the starting point. Confirm every screen before submitting.

- App access: all or some functionality is available without login. Login is optional for saved records, coins, rankings, and TOP3 advice messages.
- Ads: No, unless ads are added later.
- Content rating: Game, casual/puzzle memory game. No violence, gambling, alcohol, drugs, sexual content, or realistic user-to-user chat.
- User-generated content: rankings can show a short one-line TOP3 advice message written by ranked users. It is text-only, limited in length, blocked for obvious unsafe text, and can be reported/hidden if inappropriate.
- Target audience: choose the intended audience conservatively. If children are included, Google may ask for extra child-safety and family policy answers.
- News app: No.
- Government app: No.
- Financial features: No.
- Health features: No.

## 5. Data Safety

Use `PLAY_CONSOLE_DATA_SAFETY_ANSWERS.md` while filling out the console.
Keep `PLAY_STORE_DATA_SAFETY_DRAFT.md` as the shorter summary.

Disclose:

- User ID for optional account login
- Optional Google email address when signing in with Google
- Gameplay progress, best records, coins, rankings, and TOP3 advice messages
- Passwords are not stored directly; the backend hashes password data before storage
- Data is transmitted over HTTPS
- In-app account deletion is available from the account screen
- Account/data deletion support requests go to `mkwdbet@gmail.com`

Do not answer "no data collected" while login, saved coins, rankings, or TOP3 advice messages exist.

## 6. Internal Testing

Upload this file:

`android/app/build/outputs/bundle/release/app-release.aab`

Suggested release name:

`0.1.0 internal test 1`

Suggested release notes:

```text
Memory Snap internal test release.
- Three memory game modes
- Optional Google sign-in
- Coins, records, and TOP3 rankings
- TOP3 advice messages with report support
- Result sharing and mobile layout polish
```

Add testers by Google email, then share the opt-in link.

## 7. Before Closed Testing

- Prepare at least 12 testers if the account is subject to Google's personal developer testing requirement.
- Ask testers to opt in and keep the app installed/testable during the test period.
- Collect issues around login, rankings, screen fit, and game difficulty.

## 8. Release Key Warning

Back up these files somewhere private:

- `android/app/memorysnap-release.keystore`
- `android/keystore.properties`

Losing them can make future app updates difficult or impossible.
