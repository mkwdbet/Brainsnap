# Memory Snap Deployment

## Recommended Fast Launch Path

Use Cloudflare Workers + static assets for the public web/PWA launch.

### Cloudflare Pages Settings

- Framework preset: None
- Build command: `npm run build:web`
- Build output directory: `dist`
- Deploy command: `npx wrangler deploy --assets dist --compatibility-date 2026-07-14`
- Root directory: repository root
- Production branch: `main`

The Worker compatibility date and asset directory are pinned in `wrangler.jsonc`.

### Production URLs

- App: `https://memorysnap.org`
- Privacy policy: `https://memorysnap.org/privacy.html`
- Fallback Worker URL: `https://brainsnap.mkwdbet.workers.dev`

### Files Served

- `index.html`
- `styles.css`
- `app.js`
- `manifest.webmanifest`
- `sw.js`
- `privacy.html`
- `assets/`
- `_headers`
- `_redirects`

### Before Public Launch

1. Replace the privacy policy contact section with the real developer email.
2. Confirm the AWS API used by `API_BASE_URL` is ready for public traffic.
3. Test on Android Chrome, iPhone Safari, and desktop Chrome.
4. Capture Play Store screenshots from a real phone.
5. Create the Google Play developer account and start closed testing.

### Android Track

For a new personal Google Play developer account, start closed testing as soon
as possible. Google Play may require at least 12 opted-in testers for 14
continuous days before production access is available.
