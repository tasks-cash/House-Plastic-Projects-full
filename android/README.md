# AgroPulse Android

Native Android WebView wrapper for the AgroPulse web app.

## Open in Android Studio

1. Open Android Studio → **File → Open**
2. Select the `android` folder in this repository
3. Wait for Gradle sync to finish
4. Run on a device or emulator (**Run ▶**)

## Build from command line

Requires JDK 17 and Android SDK (Android Studio installs both).

```bash
cd android
./gradlew assembleDebug
```

APK output: `app/build/outputs/apk/debug/app-debug.apk`

## App behavior

- Splash screen (dark green, AgroPulse branding)
- Loads `https://agro.rafalszelenc.store/login` on launch
- JavaScript, `localStorage`, and cookies enabled (login session persists)
- All `agro.rafalszelenc.store` pages stay inside the app
- Back button navigates WebView history
- Loading progress bar at the top
- Offline error screen with retry
- Microphone and camera permissions for voice-to-text and future photo uploads

## Requirements

- Android Studio Ladybug (2024.2) or newer recommended
- JDK 17
- Android SDK 35
- Minimum device API 23 (Android 6.0)

## Package

`com.agropulse.app`
