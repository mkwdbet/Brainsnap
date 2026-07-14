# Memory Snap Mobile Build

## Current State

- Capacitor is installed.
- Android project exists in `android/`.
- Web assets are copied into `www/` with:

```powershell
npm run build:app
```

- Android sync is done with:

```powershell
npm run cap:sync
```

## Required Local Setup

Install Android Studio:

https://developer.android.com/studio

During setup, install:

- Android SDK
- Android SDK Platform
- Android SDK Build-Tools
- Android Emulator, optional for testing
- Android Studio bundled JDK

After Android Studio is installed, reopen PowerShell and check:

```powershell
java --version
```

If `java` is still unavailable, set `JAVA_HOME` to Android Studio's bundled JDK,
usually:

```powershell
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
$env:Path = "$env:JAVA_HOME\bin;$env:Path"
```

This project also uses:

```text
android\local.properties
```

with this SDK path:

```properties
sdk.dir=C\:\\Users\\mkwdb\\AppData\\Local\\Android\\Sdk
```

## Build Debug APK

```powershell
cd android
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
$env:Path = "$env:JAVA_HOME\bin;$env:Path"
.\gradlew.bat assembleDebug
```

Debug APK output:

```text
android\app\build\outputs\apk\debug\app-debug.apk
```

## Open In Android Studio

```powershell
npm run cap:open
```

## Usual Update Flow

After editing the web game:

```powershell
npm run cap:sync
cd android
.\gradlew.bat assembleDebug
```

## Fast Phone UI Testing

For small UI changes, use the dev-server APK instead of sending a new APK every
time.

1. Start the local dev server:

```powershell
npm.cmd run dev
```

The dev APK points to the PC's current LAN/Wi-Fi IP automatically when you run
`npm.cmd run cap:dev`. You can check the current IP with:

```powershell
ipconfig
```

2. Build a dev APK that points to that URL:

```powershell
npm.cmd run cap:dev
cd android
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
$env:Path = "$env:JAVA_HOME\bin;$env:Path"
.\gradlew.bat assembleDebug
```

3. Install the APK once:

```text
android\app\build\outputs\apk\debug\app-debug.apk
```

After that, edit `index.html`, `styles.css`, or `app.js` and reopen the app on
the phone. The app loads the PC dev server directly, so reinstalling the APK is
not needed for normal web UI changes.

Requirements:

- PC and phone must be on the same Wi-Fi.
- The PC must keep the dev server running.
- If the PC IP changes, run `ipconfig`, update `CAP_SERVER_URL`, then run
  `npm run cap:dev` and rebuild the APK once.

Return to bundled production assets with:

```powershell
npm run cap:prod
```
