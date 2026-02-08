# Quick Start Guide

## Fastest Path to Testing on iPad

### Option 1: GitHub Pages (Recommended - No Setup)

```bash
cd ~/repos/zen-math-prototype

# Create GitHub repo
gh repo create zen-math-prototype --public --source=. --remote=origin --push

# Enable GitHub Pages
gh repo view --web
# Go to Settings > Pages > Source: main branch > Save
```

Wait 2-3 minutes, then open on iPad:
`https://[your-github-username].github.io/zen-math-prototype/`

### Option 2: Local Network (Quick Test)

```bash
cd ~/repos/zen-math-prototype

# Start simple HTTP server
python3 -m http.server 8000
```

Find your computer's IP:
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

On iPad, open Safari and go to:
`http://[your-ip]:8000/index.html`

### Option 3: AirDrop (Offline)

1. Select all files in Finder
2. AirDrop to iPad
3. On iPad, open Files app
4. Tap `index.html`
5. Choose "Safari"

## Desktop Testing First

Before testing with daughter, verify it works:

```bash
cd ~/repos/zen-math-prototype
open index.html
```

You should see:
- Sand-colored zen garden background
- 8 organic-shaped stones in earthy colors
- Smooth dragging with mouse
- Subtle grouping effect when stones are close

## Troubleshooting

**Stones don't move:**
- Check browser console (F12) for errors
- Try different browser (Chrome/Safari/Firefox)

**Grouping doesn't show:**
- Drag stones closer together (within ~80px)
- Should see subtle oval indicator

**Touch doesn't work on iPad:**
- Make sure you're using Safari (best iOS support)
- Check that `user-scalable=no` is in viewport meta tag
- Verify no JavaScript errors in Safari dev tools

**Performance issues:**
- Reduce number of stones in `app.js` (change `initialCount`)
- Lower animation detail (increase `ease` value in update function)

## Next Steps After First Test

1. Capture observations in `TESTING.md`
2. If successful: show to 3-5 other parents
3. If needs iteration: note what to improve
4. If validation passes: plan next learning experience
