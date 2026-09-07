# Memory Snap Play Console Form Answers

Use this when Play Console asks questions. The wording in Play Console can change, but these are the intended answers for the current app.

## Store Listing

| Field | Answer |
| --- | --- |
| App name | `Memory Snap` |
| Short description | `방금 본 걸 맞히는 짧고 자극적인 기억력 미니게임` |
| Full description | Copy from `PLAY_STORE_COPY.md` |
| App category | Game |
| Game category | Puzzle |
| Tags | Puzzle, Casual, Brain training, Memory, Offline playable if available |
| Contact email | `mkwdbet@gmail.com` |
| Website | `https://memorysnap.org` |
| Privacy policy | `https://memorysnap.org/privacy.html` |

## App Access

| Question | Answer |
| --- | --- |
| Are all features available without special access? | `Yes`, basic gameplay is available without login. |
| Does any feature require login? | Explain that login is optional for saved coins, best records, rankings, and TOP3 advice messages. |
| Test account required? | Usually `No` if reviewers can play without login. If Google asks for login testing, provide a temporary test account. |

Suggested note:

```text
The game can be played without login. Login is optional and is used for saving coins, best records, rankings, and TOP3 advice messages.
```

## Ads

| Question | Answer |
| --- | --- |
| Does your app contain ads? | `No` |

Change this only if ads are added later.

## Content Rating

Use conservative answers.

| Topic | Answer |
| --- | --- |
| App type | Game |
| Violence | No |
| Blood/gore | No |
| Sexual content | No |
| Profanity | No |
| Alcohol/tobacco/drugs | No |
| Gambling | No |
| In-app purchases | No, unless coin purchase is added later |
| User interaction | Yes, public ranking names and TOP3 one-line advice messages |
| User-generated content | Yes, text-only TOP3 advice messages |
| UGC moderation | Yes, basic text blocking and report/hide support |
| Location sharing | No |
| Personal information sharing between users | No intentional sharing beyond public ranking user IDs and TOP3 messages |

Suggested UGC explanation:

```text
Users who reach TOP3 in a game mode can write a short text-only advice message shown in the ranking screen. Messages are length-limited, obvious unsafe text is blocked, and other users can report inappropriate messages.
```

## Target Audience

Recommended initial answer:

| Field | Answer |
| --- | --- |
| Target age | `13-15`, `16-17`, `18 and over` |
| Appeal to children? | `No` |
| Store presence for children | `No` |

Reason: the game is casual, but it has login, public ranking IDs, and short user-generated text. Starting as 13+ is simpler than positioning it for children.

## Data Safety

Main answer:

| Question | Answer |
| --- | --- |
| Does the app collect user data? | `Yes` |
| Is data encrypted in transit? | `Yes` |
| Can users request deletion? | `Yes` |
| Is account deletion available in app? | `Yes` |
| Is data shared? | `No` for sale/ads. Service providers are used to operate the app. |

Select data types:

| Data type | Select? | Purpose |
| --- | --- | --- |
| User IDs | Yes | App functionality, account management |
| Email address | Yes, only Google login | App functionality, account management |
| App interactions | Yes | Saved progress, records, coins, rankings |
| Other actions | Yes | Gameplay results, continue usage, mode records |
| Other user-generated content | Yes | TOP3 one-line advice messages |
| Crash logs | No, unless crash reporting SDK is added |
| Diagnostics | No, unless analytics/diagnostics SDK is added |
| Device or other IDs | No, unless ads/analytics/push SDK is added |

For each selected data type:

| Field | Answer |
| --- | --- |
| Collected | Yes |
| Shared | No |
| Processed ephemerally | No |
| Required or optional | Optional |
| Purpose | App functionality. Add account management for User ID and Email. |

## Account Deletion

| Question | Answer |
| --- | --- |
| Can users create accounts? | Yes |
| Can users delete accounts in app? | Yes |
| Deletion URL | `https://memorysnap.org/privacy.html` |
| What is deleted? | User ID, Google account link for Memory Snap, coins, best records, rankings, TOP3 advice messages |
| Retention | Some data may be retained if required for legal, security, or abuse-prevention reasons |

## Data Deletion Request Text

```text
Users can delete their Memory Snap account in the app from the account screen. This deletes server-side coins, best records, rankings, and TOP3 advice messages associated with the Memory Snap account. Users can also request support at mkwdbet@gmail.com.
```

## Government Apps

| Question | Answer |
| --- | --- |
| Is this a government app? | No |

## Financial Features

| Question | Answer |
| --- | --- |
| Does the app provide financial products or services? | No |

## Health Features

| Question | Answer |
| --- | --- |
| Does the app provide health or medical features? | No |

## News

| Question | Answer |
| --- | --- |
| Is this a news app? | No |

## Internal Test Release

Release name:

```text
0.1.0 internal test 1
```

Release notes:

```text
Memory Snap internal test release.
- Three memory game modes
- Optional Google sign-in
- Coins, records, and TOP3 rankings
- TOP3 advice messages with report support
- Result sharing and mobile layout polish
```

Upload:

```text
android/app/build/outputs/bundle/release/app-release.aab
```

## Things Not To Say

- Do not say the app collects no data.
- Do not say there is no user-generated content.
- Do not say accounts cannot be deleted.
- Do not say it has ads unless ads are added.
- Do not claim analytics/crash reporting unless an SDK is actually added.
