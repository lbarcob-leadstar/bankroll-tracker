# 🚀 Quick Start - Chrome Extension (Sidebar Version)

## Requirements
- **Chrome 114+** (Side Panel API support)
- Modern Chromium-based browser

## Step 1: Load the Extension in Chrome

1. **Open Chrome** and go to **`chrome://extensions/`**
2. **Enable "Developer mode"** (toggle in top-right corner)
3. Click **"Load unpacked"**
4. Navigate to `/Users/luis/Documents/bankroll-tracker/chrome-extension`
5. Click **"Select Folder"**

✅ You should now see "Mi Control de Apuestas" extension in your list

## Step 2: Test the Extension

1. Click the **extension icon** in your Chrome toolbar
2. The **side panel** opens on the right side of your browser
3. You'll see the betting form on the left and recent bets on the right
4. Fill in the form fields:
   - **Tipo de Apuesta**: Simple or Combined
   - **Casa**: betting company name
   - **Deporte**: select from dropdown
   - **Evento**: match/game name
   - **Mercado**: bet market (add multiple for combined)
   - **Cuota**: e.g., 2.50
   - **Importe**: amount bet
   - **Resultado**: select pending/win/loss
   - **Fecha**: auto-filled with today's date

5. Click **"Guardar Apuesta"** button
6. You should see a **success message** and the bet appears in the **Recent Bets** section on the right

## Step 3: Configure Firebase (Optional - For Sync)

Currently the extension stores bets **locally** only. To enable Firebase sync:

### 3a. In your main app:

After user logs in, send their credentials to the extension:

```javascript
// Add this to your login handler in index.html
if (chrome?.runtime?.id) {
  chrome.runtime.sendMessage({
    type: 'storeChromeCredentials',
    token: authResult.user.refreshToken,
    userId: authResult.user.uid
  });
}
```

### 3b. Update Firebase config in popup.js:

Edit lines 1-15 in `popup.js`:

```javascript
const FIREBASE_CONFIG = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

Get these values from: **Firebase Console → Project Settings → General → Your apps**

### 3c. Update API endpoint:

Around line 180 in `popup.js`, replace the sync URL:

```javascript
// OLD:
const response = await fetch('http://localhost:3000/api/sync-bet', {

// NEW - Replace with your actual backend:
const response = await fetch('https://your-api.com/api/sync-bet', {
```

## Step 4: Features Overview

| Feature | Status | Notes |
|---------|--------|-------|
| 📝 Quick Form Entry | ✅ Working | 7 fields matching main app |
| 💾 Local Save | ✅ Working | Stores in Chrome storage |
| 📊 Recent Bets | ✅ Working | Shows last 5 saved bets |
| ☁️ Firebase Sync | 🟡 Framework | Needs credentials + backend |
| 🔄 Auto-Sync | ✅ Working | Every 5 minutes (when enabled) |
| 🟢 Status Indicator | ✅ Working | Shows Ready/Syncing/Offline |
| 📲 Badge Counter | 🟡 Framework | Shows unsynced bets count |
| 🎨 Dark Theme | ✅ Working | Matches main app styling |

## Step 5: Troubleshooting

### Extension icon not appearing?
- Ensure it's enabled in `chrome://extensions/`
- Refresh the page
- Try unpinning and re-pinning from toolbar

### Form doesn't save?
- Open **Chrome DevTools** (F12 → Extension background scripts)
- Look for error messages in console
- Check `chrome.storage.local` values

### Sync not working?
- Click the status indicator to see error details
- Verify Firebase credentials are set correctly
- Check network tab to see if API calls are being made

### Can't uninstall extension?
- Right-click extension icon → "Remove from Chrome"
- Or go to `chrome://extensions/` and click trash icon

## Step 6: Next Enhancements

Coming soon:
- 🎯 Content script to auto-fill from betting websites
- 📸 OCR integration for screenshot analysis
- 🔄 Real-time sync with main app
- ⚙️ Extension settings page
- 📦 Chrome Web Store publication

---

**Questions?** Check the main [README.md](README.md) for more details.
