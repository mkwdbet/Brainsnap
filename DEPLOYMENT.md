# Memory Snap Deployment

## Recommended Fast Launch Path

Use Cloudflare Pages for the public web/PWA launch.

### Cloudflare Pages Settings

- Framework preset: None
- Build command: `npm run build:web`
- Build output directory: `dist`
- Deploy command: `npx wrangler deploy --assets dist`
- Root directory: repository root
- Production branch: `main`

The Worker compatibility date and asset directory are pinned in `wrangler.jsonc`.

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

1. Buy or choose a domain.
2. Connect the custom domain in Cloudflare Pages.
3. Replace the privacy policy contact section with the real developer email.
4. Confirm the AWS API used by `API_BASE_URL` is ready for public traffic.
5. Test on Android Chrome, iPhone Safari, and desktop Chrome.

### Android Track

For a new personal Google Play developer account, start closed testing as soon
as possible. Google Play may require at least 12 opted-in testers for 14
continuous days before production access is available.
