# Memory Snap Launch Checklist

## Current Launch State

- Public web app: `https://memorysnap.org`
- Privacy policy: `https://memorysnap.org/privacy.html`
- Fallback Worker URL: `https://brainsnap.mkwdbet.workers.dev`
- Android debug APK builds locally with `npm.cmd run apk:debug`

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

1. Finalize public website and privacy policy.
2. Create Google Play developer account.
3. Prepare Play Console listing.
4. Build release-ready Android artifact.
5. Start closed testing as soon as the developer account is ready.

## Required Before Google Play Submission

- App name: `Memory Snap`
- Short description: done in `PLAY_STORE_COPY.md`
- Full description: done in `PLAY_STORE_COPY.md`
- App icon: available in `assets/icons/`
- Screenshots: still needed from phone
- Privacy policy URL: `https://memorysnap.org/privacy.html`
- Developer contact email: still needed
- Data safety form: still needed
- Content rating questionnaire: still needed
- Closed testing testers: still needed

## Google Play Closed Testing Note

New personal developer accounts may need to run closed testing with at least
12 opted-in testers for 14 continuous days before production access is
available. Start this clock as early as possible after the developer account is
created.
