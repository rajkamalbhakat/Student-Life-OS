# Orbit Android — source preview
Built by Rajkamal.

STATUS: Android source prepared, but NOT compiled or device-tested. There is NO APK inside this ZIP. The authoring environment lacks Android SDK/Gradle and cannot download them.

This is an ONLINE Android WebView client for your existing Orbit web application, not an offline rewrite. It requires a working deployed HTTPS website and the existing backend/database. No account records, credentials, web server or API key are bundled. On first launch, enter your deployed website address using Website. Do not enter a GitHub repository or localhost address.

## Produce a test APK using GitHub
1. Extract this ZIP. Open the Orbit-Android folder.
2. Upload its `android` and `.github` folders into the ROOT of your Student-Life-OS repository. Preserve any existing workflow files. Do not wrap them in an extra Orbit-Android folder. No web-app source files need to be replaced.
3. In GitHub choose Actions > Build Android APK > Run workflow. The workflow must be on the default branch for manual triggering.
4. When the build succeeds, open its run and download the Orbit-Android-APK artifact.
5. Extract that artifact ZIP: app-debug.apk is the installable test file. Copy it to your Android phone and open it. Permit installation from that file-opening app if prompted.
6. Launch Orbit and enter your actual deployed HTTPS website origin. Register/sign in and test saving a task, relaunching, imports and dictation.

The debug signing key is temporary and can change between GitHub runs. A later APK may require uninstalling the earlier test app. Production distribution requires your own stable private release signing key. Never upload that key to GitHub. This is not a Play Store release build.

## Android Studio alternative
Open the `android` directory with Android Studio. Use JDK 17, SDK platform 35 and build tools 35.0.0. Gradle 8.11.1 with Android plugin 8.9.2 is configured. No Gradle wrapper binary is supplied; select a local Gradle 8.11.1 distribution or use the workflow above. Run `gradle :app:assembleDebug :app:lintDebug` from android. Output: app/build/outputs/apk/debug/app-debug.apk.

## Included source
- HTTPS-only website setup, session cookies, Reload and back navigation.
- Built by Rajkamal credit and screen inset handling.
- Android document picker for the website's import forms.
- Dictate button uses an installed Android speech recognition service, places transcription in Orbit's voice command field and requires manual review/Run command. Speech may be processed online by the device's provider. No automatic task execution.
- External HTTPS links open in the system browser. TLS certificate errors are never bypassed. No JavaScript-to-Java bridge is exposed.

## Known limitations
- No APK compilation, Android lint, emulator or physical-device validation completed here.
- No offline tasks or offline account sign-in. Existing hosted features rely on the web app and server being functional.
- Blob/file exports are not implemented in this Android client: use the deployed website in Chrome for export/download.
- The web page's own Listen button and speech synthesis depend on Android WebView support. Use the native Dictate toolbar button for recognition. Spoken playback is unverified.
- AI requires OPENAI_API_KEY on the SERVER. Do not embed a provider key in this Android app.
- Existing local SQLite accounts do not automatically migrate to hosted PostgreSQL.

Build compatibility: https://developer.android.com/build/releases/agp-8-9-0-release-notes
WebView implementation reference: https://developer.android.com/develop/ui/views/layout/webapps/webview
