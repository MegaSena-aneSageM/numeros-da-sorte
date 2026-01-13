# Deployment Guide

## Quick Deploy

```bash
npm run deploy
```

This will:
1. Build the project (`npm run build`)
2. Deploy to GitHub Pages (`gh-pages -d dist`)

## What's New in This Version

### Daily Updates at 02:02 AM 🕐
- Smart cache expiration at 02:02 AM daily
- 70-80% reduction in API calls
- Enhanced UI with cache age display
- Next update time indicator
- Cache versioning system

### Google AdSense Integration 💰
- AdSense script in HTML head
- Strategic ad placements (top, middle, bottom)
- Auto-responsive ad format

### Essential Pages for AdSense ✓
- Privacy Policy page
- About Us page
- Contact page
- Footer with page links

### API Integration ✨
- Real-time data from Mega-Sena APIs
- Automatic updates with daily cache
- Manual refresh button
- Loading states and error handling

### Enhanced Features
- Dynamic frequency calculations
- Live statistics
- Cache age display ("há X horas")
- Next update time ("amanhã às 02:02")
- Fallback to static data if APIs fail

## Verify After Deploy

1. Visit your GitHub Pages URL: `https://megasena-anesagem.github.io/numeros-da-sorte/`
2. Check browser console for any errors
3. Verify the page loads correctly (not blank)
4. Test navigation to essential pages (Privacy, About, Contact)
5. Verify "Atualizado:" shows cache age (e.g., "há 3 horas")
6. Check "Próxima atualização:" shows next update time
7. Test the "🔄 Atualizar" refresh button
8. Generate some predictions to verify functionality

## Important: GitHub Pages Routing Fix

**Issue:** Blank page after deployment with React Router.

**Solution:** Changed from `BrowserRouter` to `HashRouter` in `src/App.jsx`.

**How it works:**
- `BrowserRouter`: Uses clean URLs like `/privacy` (requires server-side routing)
- `HashRouter`: Uses hash URLs like `/#/privacy` (works on static hosts like GitHub Pages)

**URLs after fix:**
- Home: `https://megasena-anesagem.github.io/numeros-da-sorte/`
- Privacy: `https://megasena-anesagem.github.io/numeros-da-sorte/#/privacy`
- About: `https://megasena-anesagem.github.io/numeros-da-sorte/#/about`
- Contact: `https://megasena-anesagem.github.io/numeros-da-sorte/#/contact`

## Troubleshooting

### Build Fails
```bash
npm install
npm run build
```

### Deploy Fails
```bash
# Check GitHub Pages settings
# Repository > Settings > Pages
# Source: gh-pages branch
```

### API Not Loading
- Check browser console
- Verify internet connection
- App will use cached/static data as fallback

## Files Structure

```
dist/
├── index.html          # Main HTML
├── assets/
│   ├── index-*.js     # Main JS bundle (includes API code)
│   └── index-*.css    # Styles
└── qrcode_pix.jpg     # PIX QR code
```

## Monitoring

After deployment, monitor:
- API fetch success rate (browser Network tab)
- Cache hit rate (localStorage)
- User experience (loading times)
- Error rates (console errors)

---

**Ready to deploy!** Just run `npm run deploy` 🚀
