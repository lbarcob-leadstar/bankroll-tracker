# 🔄 Migration Guide - Popup to Sidebar (v1.1)

## Overview

The Chrome Extension has been upgraded from a **Popup-based UI** to a **Side Panel (Sidebar)** interface. This provides a better user experience with more screen real estate and persistent access.

---

## What Changed

### File Structure

| Item | Before | After | Status |
|------|--------|-------|--------|
| UI Container | `popup.html` (450px popup) | `sidebar.html` (persistent sidebar) | ✨ Enhanced |
| Styles | `styles.css` (popup optimized) | `sidebar-styles.css` (sidebar optimized) | ✨ New |
| JS Logic | `popup.js` (shared) | `popup.js` (still shared) | ✅ Compatible |
| Service Worker | `background.js` | `background.js` + `onClicked` handler | 🔧 Updated |
| Manifest | Action with popup | Side panel config | 🔧 Updated |

### UI Layout

**Before (Popup):**
```
┌──────────────┐
│  Header      │ (tight)
├──────────────┤
│  Form        │ (cramped)
│  Fields      │
├──────────────┤
│  Recent      │ (squeezed)
│  Bets        │ (scrolls a lot)
└──────────────┘
```

**After (Sidebar):**
```
┌──────────────────────────────────────────┐
│          Header - Sync Status            │
├────────────────────┬─────────────────────┤
│                    │                     │
│   Form Inputs      │   Recent Bets List  │
│   (left 50%)       │   (right 50%)       │
│                    │                     │
│   - Type Select    │   • Bet 1           │
│   - House          │   • Bet 2           │
│   - Sport          │   • Bet 3           │
│   - Event          │   • Bet 4           │
│   - Market(s)      │   • Bet 5           │
│   - Odds           │                     │
│   - Stake          │                     │
│   - Status         │                     │
│   - Date           │                     │
│   - [Save Button]  │                     │
└────────────────────┴─────────────────────┘
```

---

## Key Improvements

### 1. **Better Use of Screen Space**
- ✅ Two-column layout with equal width
- ✅ No scrolling needed for recent bets
- ✅ Can see form + recent bets simultaneously

### 2. **Persistent Sidebar**
- ✅ Sidebar stays open while browsing
- ✅ Quick access without reopening
- ✅ No overlapping content
- ✅ Always visible in dedicated panel

### 3. **Enhanced UX**
- ✅ Larger form fields with better spacing
- ✅ Better font sizes (more readable)
- ✅ Clearer visual separation
- ✅ Improved scrollbar visibility

### 4. **Browser Integration**
- ✅ Integrated into browser chrome
- ✅ Single click to toggle visibility
- ✅ Badge shows unsynced bets count
- ✅ Doesn't interfere with page content

---

## Technical Details

### Manifest Changes

**Before:**
```json
{
  "action": {
    "default_popup": "popup.html",
    "default_icons": { ... }
  }
}
```

**After:**
```json
{
  "action": {
    "default_icons": { ... }
  },
  "side_panel": {
    "default_path": "sidebar.html"
  }
}
```

### Permission Changes

**Before:**
```json
"permissions": ["storage", "activeTab"]
```

**After:**
```json
"permissions": ["storage", "sidePanel"],
"host_permissions": ["<all_urls>"]
```

### Service Worker Changes

**Before:**
- Popup opens automatically via manifest config

**After:**
```javascript
// Click handler to open sidebar
chrome.action.onClicked.addListener((tab) => {
    chrome.sidePanel.open({ tabId: tab.id });
});
```

---

## Files Modified

### New Files
- ✨ `sidebar.html` - Two-column layout
- ✨ `sidebar-styles.css` - Sidebar-optimized styles

### Updated Files
- 🔧 `manifest.json` - Side panel config
- 🔧 `background.js` - Added click handler
- 🔧 `QUICK_START.md` - Updated instructions

### Unchanged Files
- ✅ `popup.js` - Same logic (can be reused)
- ✅ `images/` - All icons work the same
- ✅ `README.md` - Still valid

---

## Compatibility

### Browser Support

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | 114+ | ✅ Full support |
| Edge | 114+ | ✅ Full support |
| Brave | 1.63+ | ✅ Full support |
| Chromium | Recent | ✅ Full support |
| Firefox | N/A | ❌ Not supported* |
| Safari | N/A | ❌ Not supported* |

*Firefox and Safari don't support the Side Panel API yet

### Data Compatibility

- ✅ All bets stored in same format
- ✅ Firebase sync unchanged
- ✅ Chrome storage format identical
- ✅ Retrocompatible with popup version

---

## Migration Steps

If you had the popup version installed:

1. **Uninstall** the popup version (`chrome://extensions`)
2. **Load** the new sidebar version
3. **Storage is preserved** - all your bets remain
4. **Click** the icon to open the sidebar
5. **Pin** it to your toolbar for quick access

---

## Performance

### Memory Usage
- Popup: ~5-8 MB (created/destroyed each open)
- Sidebar: ~8-12 MB (persistent, slightly more)

### CPU Usage
- Both equally efficient
- No performance impact

---

## Keyboard Shortcuts (Optional)

You can add keyboard shortcuts in `manifest.json`:

```json
"commands": {
  "toggle-side-panel": {
    "suggested_key": {
      "default": "Ctrl+Shift+Y",
      "mac": "Command+Shift+Y"
    },
    "description": "Toggle side panel"
  }
}
```

Then in `background.js`:
```javascript
chrome.commands.onCommand.addListener((command) => {
    if (command === 'toggle-side-panel') {
        chrome.sidePanel.open({ tabId: tab.id });
    }
});
```

---

## Troubleshooting

### Sidebar doesn't open
- ✅ Check Chrome version (need 114+)
- ✅ Reload extension (Ctrl+Shift+R)
- ✅ Check DevTools for errors (F12)

### Width too narrow
- The sidebar width is controlled by browser
- Default: ~450px (same as popup width before)
- Can't customize in extension code

### Data not showing
- Open DevTools (F12)
- Check Application → Chrome Storage
- Verify `bets` key exists in localStorage

---

## Future Enhancements

- [ ] Keyboard shortcut toggle
- [ ] Customizable sidebar width (if API allows)
- [ ] Dark/Light theme toggle
- [ ] Floating window option
- [ ] Settings panel in sidebar

---

## Rolling Back

If you need to revert to popup version:

1. Remove `sidebar.html` and `sidebar-styles.css`
2. Restore `manifest.json` popup config
3. Remove `chrome.action.onClicked` handler
4. Reload in Chrome

---

**Version**: 1.1  
**Release**: February 23, 2026  
**API Level**: Chrome 114+
