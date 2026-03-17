# 🧪 Local Testing Guide - Mood News PWA

## What You Should See

1. **Title**: "🧠 Mood News App" at the top
2. **Install Button**: 📲 "Install App" button in the **top-right corner** (may vary by browser)
3. **Search Bar**: Input field with placeholder "Search news..."
4. **Mood Buttons**: 4 buttons - happy, sad, angry, focus
5. **News Grid**: Multiple news cards with images, titles, descriptions
6. **PWA Badge**: Top-left corner shows offline/update notifications

---

## 🔍 Debugging Checklist

### Step 1: Open DevTools Console
- Press **F12** or **Ctrl+Shift+I**
- Go to **Console** tab
- Look for messages starting with 📰, ✅, ❌

### Step 2: Check for News Fetch Messages
You should see:
```
📰 Fetching news for: positive
🔗 API URL: https://api.currentsapi.services/v1/search?keywords=positive&apiKey=...
📊 API Response: {news: Array(n), ...}
✅ Articles loaded: 10
```

### Step 3: Troubleshoot Common Issues

#### ❌ "API ERROR: Failed to fetch"
- **Cause**: CORS issue or API endpoint is down
- **Solution**: 
  - Check internet connection
  - Verify API key is correct
  - Try opening the API URL directly in new tab:
    ```
    https://api.currentsapi.services/v1/search?keywords=positive&apiKey=gl7JoUc199uxMVp8rIZcZ8rxD3tjrBGAiL_NUyUJ_isIUBr5
    ```

#### ❌ No news cards appearing
- **Cause**: CSS not loaded or articles array empty
- **Solution**:
  - Hard refresh: **Ctrl+Shift+R** (Windows) or **Cmd+Shift+R** (Mac)
  - Check Network tab in DevTools to see if CSS is loading
  - Check Console for any JavaScript errors

#### ❌ Install button not showing
- **Cause**: PWA manifest not found or browser doesn't support
- **Solution**:
  - This is NORMAL on localhost
  - Install button shows on HTTPS (Netlify provides this)
  - Check DevTools → Application → Manifest to verify it loads
  - Check Application → Service Workers for SW registration

---

## ✅ Verification Steps

### 1. Check if Manifest Loads
1. Open DevTools (F12)
2. Go to **Application** tab
3. Left sidebar → **Manifest**
4. Should show: "short_name: MoodNews", theme_color: #0f172a, etc.

**If manifest shows "❌"**:
- Manifest URL is wrong (was `/manifest.json`, now `/manifest.webmanifest`)
- Already fixed! ✅

### 2. Check if Service Worker Registers
1. Open DevTools
2. Go to **Application** tab
3. Left sidebar → **Service Workers**
4. Should show: Status = "activated and running"

### 3. Test News Loading
1. Wait 2-3 seconds for page to load
2. You should see 10 news cards appear
3. Try clicking mood buttons to load different news
4. Try searching for "python" in search bar

### 4. Check API Response Manually
Open in new tab:
```
https://api.currentsapi.services/v1/search?keywords=positive&apiKey=gl7JoUc199uxMVp8rIZcZ8rxD3tjrBGAiL_NUyUJ_isIUBr5
```
If you see JSON with "news" array → API is working ✅

---

## 📱 Install Button Behavior

### On Localhost (http://localhost:4173)
- Install button likely **WON'T show** (PWA protocol requires HTTPS)
- This is expected for local testing

### On Netlify (HTTPS)
- Install button **WILL show** automatically
- Works on: Chrome, Edge, Firefox, Samsung Internet, Opera
- iOS Safari: Shows in Share menu

### To Force Test on Localhost
(For developers only)
Add to index.html before closing `</body>`:
```html
<script>
  // Force show install button for testing
  window.addEventListener('beforeinstallprompt', (e) => {
    console.log('Installing app!');
    console.log('beforeinstallprompt fired');
  });
</script>
```

---

## 🚀 What to Do Next

### If Everything Works Locally ✅
1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Click "Add new site"
3. Connect your Git repo (push code to GitHub first)
4. Deploy with:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`

### If News Isn't Loading ❌
1. Check DevTools Console for error messages
2. Share the error message from console
3. Verify API key: `gl7JoUc199uxMVp8rIZcZ8rxD3tjrBGAiL_NUyUJ_isIUBr5`

### If Install Button Doesn't Show ⚠️
1. This is NORMAL on localhost
2. Will show on Netlify (HTTPS)
3. DevTools → Application → Manifest should be valid
4. DevTools → Application → Service Workers should be activated

---

## 🔧 Common Fixes

### Hard Refresh (clears cache)
- Windows: **Ctrl+Shift+R** or **Ctrl+F5**
- Mac: **Cmd+Shift+R** or **Cmd+Option+R**

### Clear Service Worker Cache
1. Open DevTools
2. Application → Service Workers
3. Click "Unregister" button
4. Refresh page

### Check Current Mood Selection
- Look at Console
- You should see: `📰 Fetching news for: positive` (or sad/politics/technology)

---

## 📊 Expected Console Output

```javascript
// First visit
📰 Fetching news for: positive
🔗 API URL: https://api.currentsapi.services/v1/search?keywords=positive&apiKey=gl7JoUc199uxMVp8rIZcZ8rxD3tjrBGAiL_NUyUJ_isIUBr5
📊 API Response: {news: Array(10), ...}
✅ Articles loaded: 10

// If you click "sad" mood
📰 Fetching news for: world
🔗 API URL: https://api.currentsapi.services/v1/search?keywords=world&apiKey=gl7JoUc199uxMVp8rIZcZ8rxD3tjrBGAiL_NUyUJ_isIUBr5
📊 API Response: {news: Array(10), ...}
✅ Articles loaded: 10
```

---

## 🎯 Summary

| Feature | Should See | If Missing |
|---------|-----------|-----------|
| Title & Layout | "🧠 Mood News App" centered | Refresh page with Ctrl+Shift+R |
| News Cards | 10 articles with images | Check Console for API errors |
| Mood Buttons | 4 buttons (happy, sad, angry, focus) | CSS not loading - check Network tab |
| Search Bar | Input field at top | CSS not loading - check Network tab |
| Install Button | 📲 in top-right (may not show on localhost) | NORMAL - will show on Netlify |
| PWA Badge | Top-left corner notification | May not show on localhost |
| Service Worker | Listed in DevTools → Application | May not activate on localhost |

---

Still having issues? Check these in order:
1. ✅ Open http://localhost:4173 in Chrome or Edge
2. ✅ Press F12 to open DevTools
3. ✅ Go to Console tab
4. ✅ Look for 📰 and ✅ messages
5. ✅ Share any ❌ error messages
