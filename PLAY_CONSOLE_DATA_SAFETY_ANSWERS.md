# Memory Snap Play Console Data Safety Answers

Use this as a practical checklist while filling out Google Play Console.
Re-check the final console preview before submitting.

## Data Collection And Security

### Does your app collect or share any of the required user data types?

Answer: `Yes`

Reason: Memory Snap has optional login, saved coins, saved records, rankings,
Google sign-in, and TOP3 advice messages.

### Is all user data collected by your app encrypted in transit?

Answer: `Yes`

Reason: production web/app traffic uses HTTPS.

### Do you provide a way for users to request that their data is deleted?

Answer: `Yes`

Use these paths:

- In-app path: `Account screen > Delete account button`
- Web/support path: `https://memorysnap.org/privacy.html`
- Support email: `mkwdbet@gmail.com`

## Data Types To Select

### Personal Info

Select:

- `User IDs`
- `Email address`

Do not select unless added later:

- Name
- Phone number
- Address
- Race and ethnicity
- Political or religious beliefs
- Sexual orientation
- Other info

### App Activity

Select:

- `App interactions`
- `Other user-generated content`
- `Other actions`

Why:

- App interactions / other actions: gameplay progress, mode records, coins,
  ranking position, continue usage
- Other user-generated content: TOP3 one-line advice messages

Do not select unless added later:

- In-app search history
- Installed apps
- Web browsing history

### App Info And Performance

Current answer: normally `No`

Select crash logs or diagnostics only if you add Firebase Crashlytics, analytics,
or another SDK that sends crash/performance data off the device.

### Device Or Other IDs

Current answer: normally `No`

The current app code does not intentionally collect advertising IDs, Android IDs,
or other device IDs. If you add analytics, ads, push notifications, or attribution
SDKs later, review this again.

## Per Data Type Answers

Use the same pattern for each selected data type below.

### User IDs

- Collected: `Yes`
- Shared: `No`
- Processed ephemerally: `No`
- Required or optional: `Optional`
- Purpose:
  - `App functionality`
  - `Account management`

### Email Address

- Collected: `Yes`, only for Google sign-in users
- Shared: `No`
- Processed ephemerally: `No`
- Required or optional: `Optional`
- Purpose:
  - `App functionality`
  - `Account management`

### App Interactions

- Collected: `Yes`
- Shared: `No`
- Processed ephemerally: `No`
- Required or optional: `Optional`
- Purpose:
  - `App functionality`

Note: Do not select `Analytics` unless you later add a real analytics SDK or
analytics dashboard. The current main use is gameplay state and saved records.

### Other Actions

- Collected: `Yes`
- Shared: `No`
- Processed ephemerally: `No`
- Required or optional: `Optional`
- Purpose:
  - `App functionality`

Examples: coins, best rounds, mode records, streaks, ranking results.

### Other User-Generated Content

- Collected: `Yes`
- Shared: `No`
- Processed ephemerally: `No`
- Required or optional: `Optional`
- Purpose:
  - `App functionality`

Example: TOP3 one-line advice message shown in rankings.

## Sharing

For selected data types, answer `No` for sharing.

Reason: Memory Snap does not sell user data or share it for ads. Google sign-in
and AWS/Cloudflare infrastructure are service providers used to run the app,
not user-data sale or advertising sharing.

## Account Deletion Answers

If Play Console asks whether users can create accounts:

Answer: `Yes`

If it asks whether users can delete accounts in-app:

Answer: `Yes`

If it asks for a deletion web link:

Use:

`https://memorysnap.org/privacy.html`

If it asks what is deleted:

Answer: account data and associated app data.

Explain:

- USER ID
- Google sign-in link data for the Memory Snap account
- coins
- best records
- rankings
- TOP3 advice messages

If it asks whether some data may be retained:

Answer conservatively: some data may be retained if required for legal, security,
or abuse-prevention reasons.

## Content Rating / User Content Note

For content rating or app content questions:

- User-generated public content exists: `Yes`
- Type: short text only, TOP3 advice messages
- Media upload: `No`
- Chat/messaging between users: `No`
- Public profile photos: `No`
- Moderation/removal: inappropriate text can be reported, hidden, and removed

## Do Not Claim

Do not claim:

- No data collected
- No account deletion path
- No user-generated content
- No rankings or public user IDs

Those would conflict with the current app.
