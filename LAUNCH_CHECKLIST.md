# Memory Snap Launch Checklist

## Current Launch State

- Public web app: `https://memorysnap.org`
- Privacy policy: `https://memorysnap.org/privacy.html`
- Fallback Worker URL: `https://brainsnap.mkwdbet.workers.dev`
- Production web host: Cloudflare Worker/Assets, not the old AWS S3 bucket
- Android debug APK builds locally with `npm.cmd run apk:debug`
- Android release AAB builds locally with `npm.cmd run aab:release`

## Is A Website Required For App Release?

A full web version is not strictly required to release an Android app.

For a Google Play release, however, a public privacy policy URL is usually
needed when an app has accounts, user IDs, authentication, saved progress, or
other user data. Keeping the web/PWA version is useful because it gives us:

- A stable privacy policy URL for Play Console.
- A public product page users can open before the Play Store release.
- A place to link APK testers while closed testing is pending.
- A domain-backed contact and support presence.

## This Week Target

1. Finalize public website and privacy policy. Done locally; Cloudflare deploy needs `CLOUDFLARE_API_TOKEN`.
2. Create Google Play developer account. Done.
3. Prepare Play Console listing. In progress.
4. Build release-ready Android artifact. Done: `android\app\build\outputs\bundle\release\app-release.aab`
5. Start internal testing first, then closed testing as soon as the listing forms are ready.

## Required Before Google Play Submission

- App name: `Memory Snap`
- Short description: done in `PLAY_STORE_COPY.md`
- Full description: done in `PLAY_STORE_COPY.md`
- App icon: available in `assets/icons/`
- Screenshots: still needed from phone or local phone preview
- Privacy policy URL: `https://memorysnap.org/privacy.html`
- Developer contact email: `mkwdbet@gmail.com`
- Data safety form: answer checklist available in `PLAY_CONSOLE_DATA_SAFETY_ANSWERS.md`
- Content rating questionnaire: still needed
- Internal testing release: next step
- Closed testing testers: still needed
- Release signing key backup: required before uploading production builds

## Immediate Play Console Upload Steps

1. Create the app in Play Console.
2. Fill the main store listing using `PLAY_STORE_COPY.md`.
3. Add the privacy policy URL: `https://memorysnap.org/privacy.html`.
4. Complete App access, Ads, Content rating, Target audience, Data safety, and Government apps forms.
5. Open Testing > Internal testing.
6. Create a new release and upload `android\app\build\outputs\bundle\release\app-release.aab`.
7. Add testers and share the opt-in link.

## Public Web Deploy

Build the static files:

`npm.cmd run build:web`

Deploy the public website:

`npx.cmd wrangler deploy --assets dist --compatibility-date 2026-07-14`

If the terminal is non-interactive, set `CLOUDFLARE_API_TOKEN` first. AWS S3 sync
does not update `memorysnap.org` because the domain currently points to
Cloudflare.

## Production Data Reset

Before a real public launch, clear the test accounts, ranking records, advice
messages, reward claims, and active login sessions from DynamoDB.

Dry run first:

`npm.cmd run reset:prod:data`

Actual reset:

`powershell -ExecutionPolicy Bypass -File scripts/reset-production-data.ps1 -Confirm RESET_MEMORY_SNAP_PROD`

This deletes rows from `MemorySnapUsers` and `MemorySnapSessions`. It does not
delete tables, Lambda code, Cloudflare assets, or app configuration.

## Google Play Closed Testing Note

New personal developer accounts may need to run closed testing with at least
12 opted-in testers for 14 continuous days before production access is
available. Start this clock as early as possible after the developer account is
created.
