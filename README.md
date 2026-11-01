# Orbit

Orbit is a React/Vite chat client for Groq, packaged for Windows with Electron and Android with Capacitor. It supports local extraction of text from TXT, Markdown, CSV, PDF, and DOCX files, plus image questions over PNG and JPEG files using Groq vision models.

## File attachments

Use the paperclip button or drop files onto the chat input. Supported types are `.txt`, `.md`, `.csv`, `.pdf`, `.docx`, `.png`, `.jpg`, and `.jpeg`; each file is limited to 20 MB. PDF and Word parsing runs in the app on the device. Document text is included in the chat request (up to 100,000 characters per file). Images are sent as data URLs to a vision-capable Groq model. When an image is attached while a text-only model is selected, Orbit automatically requests `qwen/qwen3.8-27b`. Groq currently supports up to three images in one request.

Files and extracted text are stored with local chat history in browser storage. Avoid attaching sensitive documents on shared devices. Scanned PDFs without an embedded text layer need OCR and currently produce an empty-text warning.

## Local development and parsing checks

```powershell
npm install
npm run dev
```

Open the local Vite URL, set a Groq key in Settings, then attach one file of each supported type. Ask a question that requires its contents. Confirm that text and DOCX/PDF answers use extracted text, and that an image question invokes a vision model. You can test parsing without a key by selecting files and checking the attachment chips; sending requires a key. PDFs are text extraction only (no OCR).

## Groq API key

The recommended setup is for each user to paste their own Groq API key into **Settings**. Orbit stores it in local storage on that device. Never commit a real key. `.env` files are ignored by Git, but `VITE_*` variables are embedded into browser assets at build time and are not secret; do not put a shared production key in `VITE_GROQ_API_KEY`. A production service should proxy Groq requests through a backend if you need centrally managed credentials.

For local-only Vite use, you may create `.env.local`:

```dotenv
VITE_GROQ_API_KEY=gsk_your_local_development_key
```

Remove this key before sharing built assets. Do not ship builds with a developer key.

## Build the Windows executable

On Windows with Node.js installed:

```powershell
npm install
npm run dist:win
```

The installer is written to `release/Orbit-Setup.exe`. The `release/` output is ignored by Git by default.

## Build the Android APK

Install Android Studio and its Android SDK, then configure `ANDROID_HOME` and ensure the SDK platform tools are on `PATH`. From PowerShell:

```powershell
npm install
npm run android:sync
cd android
.\gradlew.bat assembleDebug
```

The debug APK is `android/app/build/outputs/apk/debug/app-debug.apk`. For a release APK, configure signing in Gradle/Android Studio and build the signed release variant; do not commit keystores or passwords. You can also open the generated Android project with `npx cap open android` and use Android Studio's Build APK action.

## Git commit and push

Before pushing, inspect the files and make sure no `.env`, API key, signing key, or unwanted build artifact is staged. Set `origin` to your repository if needed. The repo ignores generated executables/APKs by default, so force-add only the specific binaries when you intend to publish them directly in Git; GitHub recommends Releases for large binaries.

```powershell
# Optional: configure the remote once
git remote add origin https://github.com/OWNER/REPOSITORY.git

# Build first, then stage source and (if desired) the generated binaries
npm run dist:win
npm run android:apk
git add .
git add -f release/Orbit-Setup.exe android/app/build/outputs/apk/debug/app-debug.apk
git status --short
git diff --cached --check
git commit -m "feat: add multimodal file support for text, images, pdf, and docx"
git push -u origin HEAD
```

If binaries exceed the repository's file-size limits, publish them as GitHub Release assets or use Git LFS instead of adding them to normal Git history.

## Project structure

- `src/` — React app, chat UI, Groq service, and file parsers
- `public/` — static app icons
- `docs/` — project artwork
- `electron/` — Windows desktop wrapper
- `android/` — Capacitor Android project
- `release/` — generated Windows package output
