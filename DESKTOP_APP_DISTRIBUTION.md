# Desktop App Distribution Guide

## Current Status
The Windows desktop app is built locally in `web/dist-electron/` but not included in git due to file size limits.

## Option 1: GitHub Releases (Recommended)

### Steps to Create a Release:

1. **Build the app locally:**
   ```bash
   cd web
   npm run electron:build:win
   ```

2. **Create a GitHub Release:**
   - Go to: https://github.com/Harshil-kohli/whisper-chats/releases
   - Click "Create a new release"
   - Tag version: `v1.0.0` (or your version)
   - Release title: `Whisper Chat v1.0.0 - Windows Desktop App`
   - Description:
     ```
     ## Whisper Chat Desktop App
     
     ### Windows Installation:
     1. Download `Whisper-Chat-Windows.zip`
     2. Extract the ZIP file
     3. Run `Whisper Chat.exe`
     
     ### Features:
     - Native desktop experience
     - Faster performance
     - System notifications
     - Offline support
     ```

3. **Upload the build file:**
   - Drag and drop `web/dist-electron/Whisper-Chat-Windows.zip` to the release
   - Click "Publish release"

4. **Update the download link:**
   After publishing, the download URL will be:
   ```
   https://github.com/Harshil-kohli/whisper-chats/releases/download/v1.0.0/Whisper-Chat-Windows.zip
   ```

### Update Component with Direct Download:

Once you have the release URL, update `web/src/components/DesktopDownloadPrompt.jsx`:

```javascript
const handleDownload = () => {
  if (isMobile) {
    // Mobile PWA instructions...
  } else {
    // Direct download link
    const downloadUrl = 'https://github.com/Harshil-kohli/whisper-chats/releases/download/v1.0.0/Whisper-Chat-Windows.zip';
    
    window.location.href = downloadUrl;
    
    setTimeout(() => {
      alert('Download started!\n\nExtract the ZIP and run "Whisper Chat.exe"');
    }, 500);
  }
  
  handleDismiss();
};
```

## Option 2: Cloud Storage (Alternative)

Upload `Whisper-Chat-Windows.zip` to:
- Google Drive (make public)
- Dropbox (create public link)
- AWS S3 / Cloudflare R2
- Any CDN service

Then use that URL in the component.

## Option 3: Self-Host on Railway

Add the ZIP file to your Railway deployment:

1. Create a `public/downloads` folder
2. Upload the ZIP there
3. Serve it as a static file
4. URL: `https://whisper-chats.up.railway.app/downloads/Whisper-Chat-Windows.zip`

**Note:** This increases deployment size significantly.

## Recommended Approach

Use **GitHub Releases** - it's free, reliable, and designed for distributing software releases.

## Auto-Update Setup (Future)

For automatic updates, consider using:
- `electron-updater` package
- Point to GitHub Releases
- Users get automatic updates when new versions are published
