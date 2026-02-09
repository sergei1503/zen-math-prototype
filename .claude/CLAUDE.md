# Zen Math - Project Instructions

## 📚 System Documentation

**Complete system documentation:** See [`SYSTEM_OVERVIEW.md`](../SYSTEM_OVERVIEW.md)

The SYSTEM_OVERVIEW.md file contains:
- Current implementation status
- Architecture details
- Mode descriptions and pedagogical goals
- Physics engine documentation
- Visual design language
- Running/testing instructions
- Validation results

**Quick reference files:**
- `README.md` - Project intro and quick start
- `QUICKSTART.md` - Deployment guide
- `TESTING.md` - Validation checklist
- `SYSTEM_OVERVIEW.md` - Complete system docs (this is the main reference)

---

## 🎯 Project Context

**What:** Contemplative, physics-based math learning for 6+ year olds
**Status:** Phase 5 Complete - Multi-mode learning system fully implemented
**Validation:** Tested with actual 6-year-old, competes with Toca Boca
**Philosophy:** Beautiful, calm, child-led discovery (no scores, timers, pressure)

---

## 🏗️ Architecture Quick Reference

```
core/          # Shared systems (Stone, Physics, Renderer, NumberStructure)
modes/         # Learning modes (FreeExplore, Balance, NumberStructures, StackBalance)
challenges/    # Challenge system (Engine, Library)
ui/            # UI components (ModeSelector, HintSystem)
app.js         # Main controller + mode manager
```

**Key Pattern:** Modes inherit from `ModeBase`, lifecycle: `init()` → `update()` → `render()` → `cleanup()`

---

## 🚀 Development Commands

```bash
# Start local dev server
./dev-server.sh
# Opens http://localhost:3051

# Manual start
python3 -m http.server 3051

# Test module loading
open http://localhost:3051/test.html
```

**Port:** Uses 3051 (configured in `.project-config.json`)

---

## 🎨 Design Guidelines

**Visual Language:**
- Earth tones (#8b7d6b, #9a8c7a, #7a6f5d)
- Soft sand gradient background
- Organic shapes (not geometric perfection)
- Subtle glows and shadows
- Minimal UI (hidden until needed)

**Interaction Feel:**
- Mass-based physics (heavy stones feel heavy)
- Smooth easing (ease-in-out)
- Touch-optimized (iPad primary target)
- 60fps animations (requestAnimationFrame)

**No-Nos:**
- No bright colors or harsh contrasts
- No scores, timers, or stress indicators
- No cluttered UI or excessive text
- No gamification tricks (streaks, points, levels)

---

## 🧠 Code Patterns

### Adding a New Mode
1. Create `modes/YourMode.js` extending `ModeBase`
2. Implement lifecycle: `init()`, `update(deltaTime)`, `render()`, `cleanup()`
3. Add input handlers: `onPointerDown()`, `onPointerMove()`, `onPointerUp()`
4. Register in `app.js`: `modeManager.registerMode(YourMode)`
5. Add metadata: `static getMetadata()` with id, name, icon, description

### Using PhysicsEngine
```javascript
// Mass-based drag
const newPos = PhysicsEngine.applyMassDrag(stone.x, stone.y, targetX, targetY, stone.mass);

// Gravity simulation
stone.velocity = PhysicsEngine.applyGravity(stone.velocity.x, stone.velocity.y, deltaTime);

// Collision detection
const collision = PhysicsEngine.checkCollision(stone1, stone2);
if (collision.colliding) {
    PhysicsEngine.resolveCollision(stone1, stone2);
}

// Balance calculations
const tilt = PhysicsEngine.calculateBeamTilt(leftStones, rightStones, fulcrumX);
```

### Stone Creation
```javascript
const stone = new Stone(x, y, id, {
    radius: 35,           // Size
    mass: 1.5,            // Mass (affects drag, physics)
    color: '#8b7d6b',     // Earth tone
    label: '3',           // Optional text on stone
    isLocked: false       // For challenges
});
```

---

## 🧪 Testing Guidelines

**Primary Validation:**
- Test with actual children (6+ years old)
- No instructions given (discoverability test)
- Observe natural interaction patterns
- Compare engagement vs existing apps

**Technical Testing:**
- iPad Safari (primary target)
- Touch gestures (drag, tap, multi-touch)
- 60fps performance
- Module loading (test.html)

---

## 📦 Module System

**Pattern:** Vanilla JavaScript classes, browser-compatible modules
**Load Order:** Managed in `index.html` (order matters!)

```html
<!-- Core systems first -->
<script src="core/Stone.js"></script>
<script src="core/Renderer.js"></script>
<script src="core/PhysicsEngine.js"></script>

<!-- Then modes -->
<script src="modes/ModeBase.js"></script>
<script src="modes/FreeExploreMode.js"></script>

<!-- Finally main controller -->
<script src="app.js"></script>
```

**No build step required** - runs directly in browser.

---

## 🎯 Current Features (Phase 5 Complete)

✅ **4 Game Modes:**
- Free Explore (stone creation, grouping)
- Balance Scale (equality, weight relationships)
- Number Structures (1-20 patterns)
- Stack Balance (gravity, stability)

✅ **Core Systems:**
- Stone system (mass, physics, rendering)
- PhysicsEngine (drag, gravity, collision, balance)
- Renderer (backgrounds, groups, text utilities)
- NumberStructure (pattern definitions 1-20)

✅ **Challenge System:**
- Challenge engine (loader, validator)
- Challenge library (15+ challenges)
- Hint system (non-intrusive)

✅ **UI Components:**
- Mode selector
- Hint system

---

## 🚧 Future Expansion Ideas

### Gravity Mode (Free Explore Enhancement)
- Physics simulation with gravitational pull
- Combine stones → affects gravity
- Throw stones for momentum
- Lock/unlock groups
- Start simulation button
- Achievements for quick grouping/ungrouping

### Multi-Lever Balance (Multiplication)
- Stacked levers
- Groups on different sides (2×3 vs 4×2)
- Visual multiplication concepts
- Multi-level balance challenges

### Other Ideas
- Pattern Builder (free-form creation)
- Measurement Mode (length, area, volume)
- Sound design (subtle, satisfying)
- Parent dashboard (progress insights, hidden from child)

---

## 💡 Development Philosophy

**Validation First:**
- Test every feature with actual children
- Don't assume what will engage
- Measure against existing apps (Toca Boca benchmark)

**Simplicity Over Cleverness:**
- Vanilla JS > frameworks
- Clear code > clever code
- Fewer features, better polish

**Aesthetic Matters:**
- Beautiful materials invite engagement
- Calm design supports deep learning
- Visual feedback > text instructions

**Child-Led:**
- No tutorials or hand-holding
- Discovery through exploration
- Follow the child's curiosity

---

## 📝 Git Workflow

**Current branch:** `main`
**Port:** 3051 (configured for local dev)

**Commit Pattern:**
```bash
# Make changes
git add .
git commit -m "Brief description of changes"
git push origin main
```

**Recent Milestones:**
- ✅ Phase 1: Foundation refactor
- ✅ Phase 2: Core systems (Stone, Physics, Renderer)
- ✅ Phase 3: Core modes (FreeExplore, Balance, NumberStructures, StackBalance)
- ✅ Phase 4: Challenge system
- ✅ Phase 5: Polish and integration

---

## 🤖 Working with Claude

**When asking for help:**
- Reference `SYSTEM_OVERVIEW.md` for architecture
- Specify which mode you're working on
- Include relevant file paths
- Test with actual iPad when possible

**Code style preferences:**
- Clear variable names over terse
- Comments for "why", not "what"
- Consistent formatting (2-space indent)
- ES6 classes and arrow functions

**Testing expectations:**
- Always test in browser (not just theory)
- Check iPad Safari specifically
- Verify 60fps performance
- Test with touch gestures

---

**For complete details, see [`SYSTEM_OVERVIEW.md`](../SYSTEM_OVERVIEW.md)**
