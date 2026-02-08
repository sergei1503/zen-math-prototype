# Testing Instructions

## Quick Test (Desktop Browser)

1. Open `index.html` in Chrome/Safari/Firefox
2. You should see 8 smooth stones on a sand-colored background
3. Try dragging stones around - they should move smoothly
4. Drag stones close together - they should show a subtle group indicator
5. Drag them apart - groups should break naturally

## iPad/Tablet Test (Real Validation)

### Setup
1. Transfer `index.html`, `style.css`, and `app.js` to iPad
   - Option 1: AirDrop the folder
   - Option 2: Email yourself the files
   - Option 3: Use iCloud Drive
   - Option 4: Host on GitHub Pages for easy access

2. Open `index.html` in Safari on iPad

### What Should Happen
- ✅ Full-screen zen garden appears
- ✅ Stones respond immediately to touch
- ✅ Smooth dragging with no lag
- ✅ Stones close together show subtle grouping
- ✅ No pinch-zoom or text selection interfering

### Observation Checklist

During the 15-20 minute test session:

**Immediate Engagement (0-2 min)**
- [ ] Does she touch the screen right away?
- [ ] Does she discover stones move?
- [ ] Does she smile or show interest?

**Exploration (2-10 min)**
- [ ] Does she experiment with different arrangements?
- [ ] Does she notice the grouping effect?
- [ ] Does she intentionally create groups?
- [ ] Does she try splitting groups?

**Learning Observable (5-15 min)**
- [ ] Does she group stones by quantity (2+2, 3+3, etc.)?
- [ ] Does she try different ways to make the same total?
- [ ] Does she discover patterns?

**Engagement Quality**
- [ ] How long does she play total? _____ minutes
- [ ] Does she ask for help/explanation?
- [ ] Does she look frustrated or bored?
- [ ] Does she ask to play again?

**Comparison Test**
- [ ] After playing, offer Toca Boca
- [ ] Which does she choose?
- [ ] Later in the day, which does she ask for?

## Red Flags (Validation Failure)

- ❌ Plays less than 2 minutes
- ❌ Asks "what am I supposed to do?"
- ❌ Immediately asks for Toca Boca instead
- ❌ Gets frustrated or confused
- ❌ No observable learning/pattern discovery

## Success Indicators (Validation Pass)

- ✅ Plays 5+ minutes without intervention
- ✅ Discovers grouping naturally
- ✅ Experiments with arrangements
- ✅ Asks to play again later
- ✅ Shows she's thinking/learning (even if quiet)

## GitHub Pages Hosting (Optional)

For easy iPad access without file transfer:

```bash
cd ~/repos/zen-math-prototype
git branch gh-pages
git checkout gh-pages
git push origin gh-pages
```

Then access at: `https://[your-username].github.io/zen-math-prototype/`

## Notes Space

Use this section to capture observations:

**Session 1 (Date: ______)**
- Duration: _____ minutes
- First reaction:
- Behavior observed:
- Learning indicators:
- Interest level (1-10): _____
- Asked to play again? Y/N

**Session 2 (if applicable)**
- Duration: _____ minutes
- Compared to session 1:
- Pattern:

**Conclusions:**
