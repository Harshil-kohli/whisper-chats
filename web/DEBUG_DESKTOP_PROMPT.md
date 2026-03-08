# Debug Desktop Download Prompt

## Issue: Prompt not showing on production

### Quick Fixes to Try:

#### 1. Clear localStorage (Most Likely Issue)
If you clicked "Maybe Later" or dismissed the prompt, it won't show again.

**On Production Site:**
1. Open browser DevTools (F12)
2. Go to Console tab
3. Run this command:
```javascript
localStorage.removeItem('hideDesktopPrompt');
location.reload();
```

Or go to Application tab → Local Storage → Your domain → Delete `hideDesktopPrompt` key

#### 2. Check Console Logs
Open DevTools Console (F12) and look for:
- `🔍 Desktop Download Prompt Debug:` - Shows detection info
- `✅ Showing desktop download prompt` - Should appear if conditions are met
- `❌ Not showing desktop download prompt` - Shows why it's not appearing

#### 3. Use Debug Shortcut
Press `Ctrl+Shift+D` on the production site to see debug info popup

#### 4. Check Conditions
The prompt shows ONLY when ALL these are true:
- ✅ Screen width >= 1024px
- ✅ Not in Electron app
- ✅ Haven't dismissed it before (localStorage)
- ✅ Not on mobile device (iPhone/Android)

### Manual Test:

Run this in browser console on production:
```javascript
// Check all conditions
console.log({
  width: window.innerWidth,
  isDesktop: window.innerWidth >= 1024,
  isElectron: window.electron !== undefined,
  hasSeenPrompt: localStorage.getItem('hideDesktopPrompt'),
  isMobile: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent),
  userAgent: navigator.userAgent
});

// Force show prompt (bypass all checks)
localStorage.removeItem('hideDesktopPrompt');
location.reload();
```

### If Still Not Working:

1. **Check if component is imported:**
   - Open `web/src/App.jsx`
   - Should have: `import DesktopDownloadPrompt from "./components/DesktopDownloadPrompt";`
   - Should have: `<DesktopDownloadPrompt />` in the JSX

2. **Check build:**
   ```bash
   cd web
   npm run build
   ```
   Make sure no errors

3. **Deploy to Railway:**
   ```bash
   git add .
   git commit -m "Add debug logging to desktop prompt"
   git push
   ```

4. **Wait 2-3 minutes** for Railway to rebuild and deploy

5. **Hard refresh** the production site (Ctrl+Shift+R or Cmd+Shift+R)

### Common Issues:

❌ **Dismissed on production** → Clear localStorage
❌ **Mobile device** → Won't show on mobile
❌ **Small screen** → Resize to >1024px
❌ **Not deployed** → Push changes to Railway
❌ **Cached version** → Hard refresh (Ctrl+Shift+R)

### Force Show (For Testing):

Add this temporarily to the component to force it to show:

```javascript
// In DesktopDownloadPrompt.jsx, replace the useEffect with:
useEffect(() => {
  setShowPrompt(true); // Force show for testing
  setPlatform('windows');
}, []);
```

Then deploy and test. Remove after confirming it works.
