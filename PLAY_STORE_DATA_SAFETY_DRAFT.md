# Memory Snap Data Safety Draft

This is a draft for filling out Google Play Console. Verify each answer in the
console before submitting.

## App Data Collected

Memory Snap includes optional account functionality. Users can play without an
account, but login is required for synced coins, saved records, rankings, and
TOP3 advice messages.

### Personal Info

- User IDs: collected
- Email address: collected only when the user signs in with Google
- Purpose: app functionality, account management, saved progress, rankings
- Required: optional, only for account login and synced features
- Shared with third parties: no sale or advertising sharing. Google sign-in and
  hosting/backend service providers may process data to provide the service.

### App Activity

- App interactions / gameplay progress: collected
- Examples: coins, best rounds, selected mode records, ranking position,
  TOP3 advice message
- Purpose: app functionality, saved progress, rankings, competition features
- Required: optional, mainly for logged-in progress sync and rankings
- Shared with third parties: no sale or advertising sharing. Hosting/backend
  service providers may process data to provide the service.
- User-generated TOP3 advice messages can be reported and hidden if
  inappropriate.

### Device Or Other IDs

- Not intentionally collected by app code
- Hosting and platform providers may process standard request logs

## Security Practices

- Data is transmitted over HTTPS.
- Passwords are sent to the backend for authentication and are hashed with
  PBKDF2-HMAC-SHA256 before storage.
- Google sign-in uses Google ID tokens. The backend verifies the token and uses
  Google's account subject identifier for account matching.
- Users can request privacy-related support by email:
  `mkwdbet@gmail.com`

## Data Deletion

- In-app account deletion is available from the account screen.
- Deleting the Memory Snap account removes server-side coins, records, rankings,
  and TOP3 advice messages.
- If the user signed in with Google, deleting the Memory Snap game account does
  not delete the user's Google account.
- Users can also request support by email: `mkwdbet@gmail.com`

## Permissions

The web app uses:

- Vibration API when available, for game feedback
- Web Audio API for simple feedback sounds
- Service Worker / Cache Storage for offline-like PWA behavior
- Local Storage for tokens and local progress state

No camera, microphone, geolocation, contacts, SMS, or phone permissions are used
by the current web app code.

## Store Form Risk Notes

- Do not answer "no data collected" while login, saved coins, rankings, or TOP3
  advice messages exist.
- Disclose user IDs, optional Google email address, gameplay progress, rankings,
  and user-generated TOP3 advice messages.
