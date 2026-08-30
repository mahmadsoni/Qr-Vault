# QR Vault

**Private QR Tools. Simple. Fast.**

QR Vault is a privacy-first QR toolkit: generate customizable QR codes, scan
codes with your camera, and keep everything in a local, on-device vault.
No accounts, no backend, no tracking — your QR data never leaves your
device. Available as a website, an installable PWA, and a native Android
app.

🌐 Live site: **https://mahmadsoni.github.io/Qr-Vault/**

---

## Features

- **QR Generator** — Text, URL, Wi-Fi, Contact (vCard), Email, Phone, SMS,
  Location, WhatsApp, and Telegram, each with the correct dedicated fields.
- **Customization** — live preview, size, margin, foreground/background
  color, error-correction level, and an optional center logo, while keeping
  the code scannable.
- **QR Scanner** — real rear-camera scanning with clear handling for denied
  permissions, unavailable cameras, unsupported browsers, and invalid codes.
- **Vault** — local IndexedDB storage with search, favorites, filtering,
  open/copy/download/share, delete, and clear-all.
- **Privacy-first** — no hidden tracking, no analytics on QR content, no
  external upload, no account, no backend database.
- **PWA** — installable, offline-capable after first load, with app icons,
  splash, and a dedicated offline fallback.
- **Android app** — the same web app packaged with Capacitor into a real
  Android application (`com.mahmadsoni.qrvault`).
- **Three languages** — Tajik (default), Russian, and English, switchable
  anywhere in the app.

## Screenshots

_Add screenshots here:_

| Home | Create | Scan | Vault |
|------|--------|------|-------|
| `assets/images/screenshot-home.png` | `assets/images/screenshot-create.png` | `assets/images/screenshot-scan.png` | `assets/images/screenshot-vault.png` |

## Supported languages

- 🇹🇯 Tajik (`TJ`) — default
- 🇷🇺 Russian (`RU`)
- 🇬🇧 English (`EN`)

## Privacy architecture

QR Vault never sends QR content anywhere:

- All generated and scanned QR data is stored **only** in the browser's
  IndexedDB (`web/js/storage.js`), on the device itself.
- The only network requests the app makes are to load the QR
  encode/decode libraries from a CDN (`qrcode` and `jsQR`) and, once
  cached by the service worker, none at all.
- There is no user account, no backend server, and no analytics that
  inspects QR content.

## Project structure

```
Qr-Vault/
├── web/                     # The static site — deployed as-is to Pages
│   ├── index.html
│   ├── manifest.json
│   ├── sw.js
│   ├── css/
│   ├── js/
│   └── assets/icons/
├── android/                 # Capacitor Android project
│   ├── app/
│   ├── gradle/
│   ├── build.gradle
│   ├── settings.gradle
│   ├── gradlew / gradlew.bat
├── capacitor.config.json
├── package.json
├── .github/workflows/
│   ├── pages.yml            # Deploys web/ to GitHub Pages
│   └── android-apk.yml      # Builds the Android APK
├── .nojekyll
├── LICENSE
└── README.md
```

## PWA installation

1. Visit **https://mahmadsoni.github.io/Qr-Vault/** in Chrome/Edge on Android or
   desktop.
2. Tap the in-app **Install** button, or use the browser menu → **Add to
   Home screen / Install app**.
3. The app then launches standalone and works offline after the first
   successful load.

## Android APK build (fully automatic — no PC or phone needed)

Every push to `main` triggers **Actions → Android APK**, which:

1. Installs Node & Java on a GitHub-hosted runner.
2. Runs `npx cap sync android` to copy `web/` into the native project.
3. Regenerates the Gradle wrapper and runs `./gradlew assembleDebug`.
4. Uploads the result as an artifact named **`QR-Vault-Android`**
   (containing `QR-Vault-Android.apk`).

To get the APK:

- Go to **Actions → Android APK → (latest run) → Artifacts**, or
- Go to **Actions → Android APK → Run workflow** to trigger a manual build.

### Signed release builds (optional)

By default the workflow produces a debug APK, which needs no secrets.
To produce a signed release APK instead, add these repository secrets
(**Settings → Secrets and variables → Actions**):

| Secret | Description |
|---|---|
| `KEYSTORE_BASE64` | Your `.jks` keystore, base64-encoded |
| `KEYSTORE_PASSWORD` | Keystore password |
| `KEY_ALIAS` | Key alias |
| `KEY_PASSWORD` | Key password |

Once set, the workflow automatically switches to `assembleRelease` and
signs the APK. When you publish a GitHub Release, the APK is also
attached to it automatically.

## GitHub Pages deployment

`  .github/workflows/pages.yml` publishes the contents of `web/` straight
to GitHub Pages. Since this repository is named `Qr-Vault` (not
`mahmadsoni.github.io`), Pages serves it under a sub-path:
`https://mahmadsoni.github.io/Qr-Vault/`. The app uses only relative
asset paths (no `<base href>`), so it works correctly at that sub-path
and unchanged inside the Android app.

## Termux deployment

From an Android phone with [Termux](https://termux.dev/) — no PC and no
Android Studio required:

```bash
pkg update
pkg install git

git clone https://github.com/mahmadsoni/Qr-Vault.git
cd Qr-Vault

# ... replace/update files as needed ...

git add .
git commit -m "Build QR Vault"
git push origin main
```

After `git push origin main`:

- **Website** — automatically redeployed to `https://mahmadsoni.github.io/Qr-Vault/`
  by the `pages.yml` workflow.
- **APK** — automatically rebuilt by the `android-apk.yml` workflow and
  available under **Actions → Android APK → (run) → Artifacts**.

## License

MIT — see [`LICENSE`](./LICENSE).
