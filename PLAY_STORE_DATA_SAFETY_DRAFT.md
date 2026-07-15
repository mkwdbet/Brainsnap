# Memory Snap Data Safety Draft

This is a draft for filling out Google Play Console. Verify each answer in the
console before submitting.

## App Data Collected

Memory Snap includes optional account functionality. If the user signs up or
logs in, the app sends account and progress data to the backend API.

### Personal Info

- User IDs: collected
- Purpose: app functionality, account management
- Required: optional, only for account login and synced progress
- Shared with third parties: no, except service providers used to host the app/backend

### App Activity

- App interactions / gameplay progress: collected
- Examples: coins, best rounds, selected game mode progress
- Purpose: app functionality
- Required: optional, mainly for logged-in progress sync
- Shared with third parties: no, except service providers used to host the app/backend

### Device Or Other IDs

- Not intentionally collected by app code
- Hosting and platform providers may process standard request logs

## Security Practices

- Data is transmitted over HTTPS.
- Passwords are sent to the backend for authentication. The local Node backend
  and production AWS Lambda backend hash passwords with PBKDF2-HMAC-SHA256
  before storage.
- Users can request privacy-related support by email:
  `mkwdbet@gmail.com`

## Data Deletion

Current privacy policy says deletion requests can be sent by email.

Before production submission, decide whether to add an in-app account deletion
button or document email-based deletion clearly in the Play Console data safety
form.

## Permissions

The web app uses:

- Vibration API when available, for game feedback
- Web Audio API for simple feedback sounds
- Service Worker / Cache Storage for offline-like PWA behavior
- Local Storage for tokens and local progress state

No camera, microphone, geolocation, contacts, SMS, or phone permissions are used
by the current web app code.

## Store Form Risk Notes

- Because login and saved progress exist, do not answer as "no data collected."
- Login and account sync should remain enabled for launch, so make sure the Play
  Console data safety answers disclose collected user IDs and gameplay progress.
