# Building Desktop App with Electron

## Setup

1. Install dependencies:
```bash
cd web
npm install
```

## Development

Run the app in development mode:
```bash
npm run electron:dev
```

This will:
- Start Vite dev server on http://localhost:5173
- Launch Electron window pointing to the dev server
- Enable hot reload

## Building for Production

### Build for all platforms:
```bash
npm run electron:build
```

### Build for specific platform:

**Windows:**
```bash
npm run electron:build:win
```
Output: `dist-electron/Whisper-Chat-Setup.exe` and `Whisper-Chat-Portable.exe`

**macOS:**
```bash
npm run electron:build:mac
```
Output: `dist-electron/Whisper-Chat.dmg` and `Whisper-Chat-mac.zip`

**Linux:**
```bash
npm run electron:build:linux
```
Output: `dist-electron/Whisper-Chat.AppImage` and `Whisper-Chat.deb`

## Distribution

### Option 1: GitHub Releases (Recommended)

1. Create a new release on GitHub
2. Upload the built files from `dist-electron/`
3. Update download links in `src/components/DesktopDownloadPrompt.jsx`:

```javascript
const downloadLinks = {
  windows: 'https://github.com/YOUR_USERNAME/whisper/releases/latest/download/Whisper-Chat-Setup.exe',
  mac: 'https://github.com/YOUR_USERNAME/whisper/releases/latest/download/Whisper-Chat.dmg',
  linux: 'https://github.com/YOUR_USERNAME/whisper/releases/latest/download/Whisper-Chat.AppImage'
};
```

### Option 2: Self-Hosting

1. Upload built files to your server
2. Update download links to point to your server

### Option 3: Auto-Update with GitHub

Add to `electron-builder.json`:
```json
{
  "publish": {
    "provider": "github",
    "owner": "YOUR_USERNAME",
    "repo": "whisper"
  }
}
```

## Features

- ✅ Native desktop app for Windows, macOS, and Linux
- ✅ Loads the web app (https://whisper-chats.up.railway.app)
- ✅ Native window controls
- ✅ Desktop notifications (can be added)
- ✅ System tray integration (can be added)
- ✅ Auto-updates (can be configured)

## Desktop Download Prompt

The web app automatically shows a download prompt to desktop users:
- Only shows on screens >= 1024px wide
- Detects user's operating system
- Can be dismissed (won't show again)
- Stored in localStorage

## Customization

### Change App Icon
Replace `public/icon.svg` with your icon (or use .png/.ico)

### Change App Name
Update in `electron-builder.json`:
```json
{
  "productName": "Your App Name",
  "appId": "com.yourcompany.yourapp"
}
```

### Add Native Features

Edit `electron/main.js` to add:
- System tray
- Native notifications
- Custom menu bar
- Deep linking
- File system access

## Troubleshooting

### Build fails on Windows
Install Windows Build Tools:
```bash
npm install --global windows-build-tools
```

### Build fails on macOS
Install Xcode Command Line Tools:
```bash
xcode-select --install
```

### App won't start
Check console logs in Electron DevTools (Ctrl+Shift+I)

## Notes

- The app loads the production URL by default
- For offline support, you'd need to bundle the built files
- Current setup requires internet connection
- All authentication is handled by Clerk (web-based)
