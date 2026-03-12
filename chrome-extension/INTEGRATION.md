# 🔗 Integration Guide - Main App ↔ Chrome Extension

This document explains how to connect the Chrome extension with your main betting app.

## Overview

The extension can work in two modes:

1. **Standalone Mode** (Current):
   - Saves bets to Chrome local storage
   - No sync with main app
   - ✅ Works immediately

2. **Connected Mode** (Recommended):
   - Shares auth credentials with main app
   - Syncs bets bidirectionally
   - 🟡 Requires configuration

## Integration Steps

### Step 1: Add Message Handler to Main App

In your `index.html` (in the Firebase auth success handler), add:

**Location**: After the user successfully logs in (around line 1000-1200 where you handle `auth.onAuthStateChanged`)

```javascript
// After successful login, send credentials to Chrome extension
function sendCredentialsToExtension(user) {
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
    try {
      user.getIdToken().then(token => {
        chrome.runtime.sendMessage({
          type: 'storeChromeCredentials',
          token: token,
          userId: user.uid,
          email: user.email
        });
        console.log('✅ Credentials sent to extension');
      });
    } catch (error) {
      console.log('Extension not available or not installed');
    }
  }
}

// Call this after successful login:
// sendCredentialsToExtension(user);
```

**Example integration in your existing auth flow**:

```javascript
// Find your existing auth handler (probably around line 1050)
auth.onAuthStateChanged(async (user) => {
  if (user) {
    console.log('User logged in:', user.email);
    
    // ← ADD THIS LINE:
    sendCredentialsToExtension(user);
    
    // ... rest of your existing code
    document.getElementById('loginContainer').style.display = 'none';
    document.getElementById('appContainer').style.display = 'block';
  } else {
    // User logged out
    document.getElementById('loginContainer').style.display = 'block';
    document.getElementById('appContainer').style.display = 'none';
  }
});
```

### Step 2: Configure Extension Firebase

Edit `/chrome-extension/popup.js` lines 1-15:

```javascript
// Replace with YOUR Firebase config from Console:
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyC...",           // Your API Key
  authDomain: "myproject.firebaseapp.com",
  projectId: "myproject",
  storageBucket: "myproject.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123def456"
};

// Initialize Firebase (keep as is):
const app = firebase.initializeApp(FIREBASE_CONFIG);
const db = firebase.firestore(app);
```

**Where to find these values**:
1. Open [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Project Settings** (gear icon)
4. Click **General** tab
5. Scroll down to "Your apps"
6. Find your Web app
7. Click **Config** button
8. Copy all values inside the config object

### Step 3: Enable Cross-App Communication

The extension's `background.js` already listens for messages. Just ensure your login handler calls `sendCredentialsToExtension()`.

**Message Flow**:
```
Main App Login
    ↓
Main App sends message to Extension:
  { type: 'storeChromeCredentials', token, userId, email }
    ↓
Extension receives & stores in chrome.storage.sync
    ↓
Extension uses token for future Firebase sync
```

### Step 4: Bidirectional Sync (Optional)

To sync bets FROM the extension TO the main app:

**In your main app**, add a listener for bets:

```javascript
// Around line 5700, add this to your loadBets() or data initialization section:
function listenForExtensionBets() {
  // Periodically check if extension has new bets to sync
  setInterval(async () => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['bets'], (result) => {
        if (result.bets && result.bets.length > 0) {
          console.log('Extension bets available:', result.bets);
          // You can sync these to your app's data
        }
      });
    }
  }, 30000); // Check every 30 seconds
}

// Call on app startup:
// listenForExtensionBets();
```

### Step 5: Verify Integration

1. **Load extension** in Chrome (if not already)
2. **Open main app** and log in
3. **Extension popup** should show:
   - ✅ Status: "Ready to sync" (green dot)
   - ✅ Badge showing "0" unsynced bets
   - ✅ Recent bets section (if you've saved any)

4. **Test**: 
   - Save a bet in extension
   - Check if badge increments
   - Refresh main app
   - Check if bet appears

## File Modifications Summary

| File | Location | Change | Type |
|------|----------|--------|------|
| index.html | Line ~1050 | Add `sendCredentialsToExtension(user)` | Minor add |
| index.html | Line ~1000 | Add `sendCredentialsToExtension()` function | New function |
| popup.js | Lines 1-15 | Update FIREBASE_CONFIG | Config update |
| popup.js | Line 180 | Update API endpoint URL | Config update |

## API Endpoint (Backend)

If you have a backend server, the extension will POST bets to:

```javascript
POST /api/sync-bet
Content-Type: application/json
Authorization: Bearer {token}

{
  "userId": "user123",
  "bet": {
    "house": "Bet365",
    "sport": "Football",
    "event": "Real Madrid vs Barcelona",
    "market": "1x2",
    "odds": 2.50,
    "stake": 10,
    "status": "pending",
    "date": "2024-02-23",
    "timestamp": 1708700400000
  }
}
```

### Backend Response (Expected):

```json
{
  "success": true,
  "message": "Bet synced",
  "docId": "bet_12345"
}
```

## Firestore Database (Firebase Sync)

Recommended collection structure in your Firestore database:

```
users/{userId}/bets/{betId}
├── house: string
├── sport: string
├── event: string
├── market: string
├── odds: number
├── stake: number
├── status: string (pending|win|loss)
├── date: date
├── source: string ("app" | "extension")
├── timestamp: timestamp
└── synced: boolean
```

## Testing Checklist

- [ ] Extension loads in Chrome without errors
- [ ] Extension icon shows in toolbar
- [ ] Popup opens and form displays correctly
- [ ] Can fill and save a bet locally
- [ ] Bet appears in "Recent Bets" section
- [ ] Credentials sent to extension after main app login
- [ ] Extension syncs with Firebase after credentials received
- [ ] Badge shows correct unsynced count
- [ ] Status indicator shows correct sync state
- [ ] Bets saved in extension appear in main app after refresh

## Troubleshooting Integration

### Issue: "Extension not available" Message

**Problem**: Chrome extension not installed or disabled

**Solution**:
- Go to `chrome://extensions/`
- Verify extension is enabled
- Check extension ID and reload

### Issue: Credentials Not Syncing

**Problem**: Message not reaching extension

**Solution**:
- Open Chrome DevTools (F12)
- Go to **Application** tab
- Check **Chrome Storage → Sync**
- Should show `authToken` and `userId`

If empty: Main app not sending message correctly

### Issue: Firebase Sync Fails

**Problem**: "Invalid API Key" or 403 errors

**Solution**:
- Verify Firebase config is correct
- Check project permissions in Firebase Console
- Look at browser console for actual error message

### Issue: CORS Errors

**Problem**: Backend API rejecting extension requests

**Solution**:
- Add `chrome-extension://` to CORS whitelist on backend:
  ```
  Access-Control-Allow-Origin: chrome-extension://*
  ```

---

**Next Steps**: After integration works, consider:
- 🎯 Content scripts to auto-fill forms from betting websites
- 📊 Sync dashboard in extension showing live stats
- ⚙️ Settings page for extension configuration
- 📤 Export capabilities directly from extension

Need help? Contact Luis or check Chrome Extension docs: https://developer.chrome.com/docs/extensions/
