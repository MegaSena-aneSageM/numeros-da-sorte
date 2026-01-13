# GitHub Pages Blank Page Fix

## Problem
After running `npm run deploy`, the GitHub Pages site at `https://megasena-anesagem.github.io/numeros-da-sorte/` showed a blank page.

## Root Cause
React Router's `BrowserRouter` requires server-side routing configuration to work properly. GitHub Pages is a static file host and doesn't support server-side routing for React apps.

When users navigate to the root URL, GitHub Pages serves `index.html` correctly. However, `BrowserRouter` expects the server to handle routes like `/privacy`, `/about`, etc., which GitHub Pages cannot do without additional configuration.

## Solution ✅
Changed from `BrowserRouter` to `HashRouter` in `src/App.jsx`.

### What Changed

**Before (caused blank page):**
```javascript
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
```

**After (works on GitHub Pages):**
```javascript
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
```

### Why This Works

**BrowserRouter:**
- Uses HTML5 History API
- Creates clean URLs: `/`, `/privacy`, `/about`
- Requires server configuration to redirect all routes to `index.html`
- ❌ Doesn't work on GitHub Pages without extra setup

**HashRouter:**
- Uses URL hash (`#`) for routing
- Creates hash URLs: `/`, `/#/privacy`, `/#/about`
- All navigation happens client-side
- ✅ Works perfectly on GitHub Pages (and any static host)

## URL Structure After Fix

| Page | URL |
|------|-----|
| Home | `https://megasena-anesagem.github.io/numeros-da-sorte/` |
| Privacy Policy | `https://megasena-anesagem.github.io/numeros-da-sorte/#/privacy` |
| About | `https://megasena-anesagem.github.io/numeros-da-sorte/#/about` |
| Contact | `https://megasena-anesagem.github.io/numeros-da-sorte/#/contact` |

## Deploy Steps

1. ✅ **Fixed** - Changed to HashRouter in `src/App.jsx`
2. ✅ **Built** - Ran `npm run build` successfully
3. ⏳ **Deploy** - Run `npm run deploy` to push changes
4. ⏳ **Verify** - Visit the site to confirm it loads

## How to Deploy the Fix

```bash
npm run deploy
```

This will:
1. Build the project with the HashRouter fix
2. Deploy to the `gh-pages` branch
3. GitHub will automatically update your live site (takes 1-2 minutes)

## Verification Checklist

After deploying, verify:
- [ ] Home page loads (not blank)
- [ ] Can see the Mega-Sena predictor interface
- [ ] Footer links work (Privacy, About, Contact)
- [ ] Clicking footer links navigates correctly
- [ ] URL changes to include `#` (e.g., `/#/privacy`)
- [ ] Browser back/forward buttons work
- [ ] Can generate predictions
- [ ] Refresh button works

## Additional Notes

### Browser Cache
If you still see a blank page after deploying:
1. Hard refresh: `Ctrl + F5` (Windows) or `Cmd + Shift + R` (Mac)
2. Clear browser cache
3. Open in incognito/private window
4. Wait 2-3 minutes for GitHub Pages to update

### Alternative Solution (Not Used)
We could have kept `BrowserRouter` and added a `404.html` workaround, but `HashRouter` is simpler and more reliable for GitHub Pages.

## Technical Details

### File Modified
- **File:** `src/App.jsx`
- **Change:** Line 1 - Import statement
- **Lines modified:** 1 line
- **Risk:** Low (only routing mechanism changed, no functionality affected)

### Build Output
```
✓ 48 modules transformed
✓ Build successful in 1.98s
dist/index.html                  1.06 kB
dist/assets/index-o9XZQHis.css  26.51 kB
dist/assets/index-BronT5vW.js   225.15 kB
```

### Impact
- ✅ Site will now load correctly on GitHub Pages
- ✅ All pages accessible via hash routes
- ✅ No functionality lost
- ℹ️ URLs include `#` symbol (standard for static hosting)

## Reference

### HashRouter vs BrowserRouter

| Feature | HashRouter | BrowserRouter |
|---------|-----------|---------------|
| URL Format | `/#/page` | `/page` |
| Server Config | Not needed | Required |
| GitHub Pages | ✅ Works | ❌ Needs workaround |
| SEO | Slightly worse | Better |
| User Experience | Good | Slightly better |
| Reliability on static hosts | ✅ High | ⚠️ Requires setup |

For a GitHub Pages deployment, **HashRouter is the recommended approach**.

## Status

✅ **Fix Applied**
✅ **Build Successful**
✅ **Ready to Deploy**

Run `npm run deploy` to push the fix to production!

---

**Last Updated:** January 13, 2026
**Status:** Ready for deployment
