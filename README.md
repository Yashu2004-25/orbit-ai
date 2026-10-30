# Orbit

Orbit: a fast, clean AI chat app for Windows and Android, powered by Groq.

---

## 📥 Downloads

[![Download for Windows (.exe)](https://img.shields.io/badge/Download-Windows%20(.exe)-blue?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/YOUR_GITHUB_USERNAME/orbit-chatbot/releases/latest/download/Orbit-Setup.exe)
[![Download for Android (.apk)](https://img.shields.io/badge/Download-Android%20(.apk)-emerald?style=for-the-badge&logo=android&logoColor=white)](https://github.com/YOUR_GITHUB_USERNAME/orbit-chatbot/releases/latest/download/Orbit.apk)

> *All versions: see the [Releases](https://github.com/YOUR_GITHUB_USERNAME/orbit-chatbot/releases) page.*  
> *(Remember to replace `YOUR_GITHUB_USERNAME` with your actual GitHub username!)*

---

## 🚀 How to Install

### On Windows
1. Click the **Download for Windows (.exe)** button above to get `Orbit-Setup.exe`.
2. Double-click the downloaded setup file.
3. If Windows SmartScreen shows a warning (*"Windows protected your PC"*), click **More info** and then click **Run anyway** (this warning occurs because open-source apps are not digitally code-signed with expensive commercial certificates).

### On Android
1. Click the **Download for Android (.apk)** button above on your Android phone to download `Orbit.apk`.
2. Tap the downloaded file to install it.
3. If prompted by Android, toggle **Allow from this source** under *Install unknown apps*.

---

## 🔑 First-Time Setup (3 Simple Steps)

1. **Get a free Groq API key**: Visit [console.groq.com/keys](https://console.groq.com/keys) and create a free key in seconds.
2. **Open Orbit**: On first launch, the Settings window will open automatically.
3. **Paste your key and start chatting**: Click **Test key** to confirm it works, click **Save**, and ask Orbit anything!

---

## ✨ Features

- **ChatGPT-Style Design**: Clean, calm, modern typography with lots of white space and subtle animations.
- **Dark & Light Modes**: Seamlessly tracks your system preferences or toggles manually with custom design tokens.
- **Persistent Chat History**: All conversations are automatically saved in local device storage with auto-naming, renaming, and deletion.
- **Real-Time Streaming**: Live token streaming with a gentle three-dot "thinking" animation and an instant Stop button.
- **Rich Markdown & Code Highlighting**: Never shows raw markdown syntax. Formats lists, quotes, tables, and includes dark syntax-highlighted code blocks with a one-click **Copy code** button.
- **Model Switcher (Only Working Models)**: Dynamically fetches available chat models from Groq while filtering out retired models (such as old Llama 3.1/3.3/4 variants). Safe smart defaults include `GPT-OSS 120B` and `GPT-OSS 20B`.
- **Auto-Scroll with Manual Override**: Automatically scrolls to bottom while streaming, but stops forcing scroll if you browse upwards, offering a floating "scroll to bottom" button.

---

## 🔒 Privacy & Security

- **Your key stays on your device**: API keys are saved exclusively in your device's local storage and are never sent anywhere except directly to Groq's official API endpoint (`api.groq.com`).
- **Private chats**: All your conversations remain on your device.
- ⚠️ **Developer Notice**: When building installers or APKs to distribute publicly, **never** include your personal API key in `.env`.

---

## 🛠️ For Developers

### Prerequisites
- Node.js (v18+)
- npm
- Android Studio (for Android builds)

### 1. Install Dependencies
```bash
npm install
```

### 2. Local Web Development
```bash
npm run dev
```

### 3. Test Desktop Windows App (Electron)
```bash
npm run electron
```

### 4. Build Windows Installer (`Orbit-Setup.exe`)
```bash
npm run dist:win
```
The installer will be generated in `release/Orbit-Setup.exe`.

### 5. Build Android APK (Capacitor)
```bash
# 1. Build web production bundle
npm run build

# 2. Sync changes into Android project
npx cap sync

# 3. Open in Android Studio
npx cap open android
```
Inside Android Studio:
- Select **Build > Build Bundle(s) / APK(s) > Build APK(s)**
- Find the APK at `android/app/build/outputs/apk/debug/app-debug.apk`
- Rename it to `Orbit.apk`

---

## 📁 Project Layout

```
orbit-chatbot/
├── android/                   # Native Android Capacitor project
├── electron/
│   └── main.js               # Electron desktop window configuration
├── src/
│   ├── components/
│   │   ├── Sidebar.jsx       # Chat history drawer & settings trigger
│   │   ├── TopBar.jsx        # Navigation, sidebar toggle & model dropdown
│   │   ├── ModelPicker.jsx   # Dynamic model selector
│   │   ├── ChatWindow.jsx    # Centered conversation view & scroll manager
│   │   ├── MessageItem.jsx   # Message bubble, copy & regenerate
│   │   ├── MarkdownView.jsx  # Rich markdown parser without raw symbols
│   │   ├── CodeBlock.jsx     # Syntax-highlighted code box with copy button
│   │   ├── ChatInput.jsx     # Floating auto-expanding input box
│   │   ├── EmptyState.jsx    # Centered greeting & suggestion chips
│   │   └── SettingsModal.jsx # API key tester & theme settings
│   ├── services/
│   │   └── groq.js           # Groq streaming service (pure fetch)
│   ├── hooks/
│   │   └── useChats.js       # Persistent chat storage & conversation state
│   ├── App.jsx               # Main application container
│   ├── main.jsx              # React DOM entry point
│   └── index.css             # Tailwind CSS tokens & theme definitions
├── public/
│   ├── icon.png              # App icon
│   └── icon.svg              # Vector app icon
├── .env.example              # Environment variables template
├── .gitignore                # Git exclusions
├── capacitor.config.json     # Mobile app configuration
├── vite.config.js            # Vite bundler configuration (base: './')
├── package.json              # Dependencies & build scripts
└── README.md                 # Documentation & download badges
```

---

## 📄 License
MIT License. Free for personal and commercial use.

