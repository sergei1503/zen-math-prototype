// Zen Math - Main Application Controller
// Multi-mode learning system with mode management

const canvas = document.getElementById('garden-canvas');
const ctx = canvas.getContext('2d');

// Initialize renderer
const renderer = new Renderer(canvas, ctx);

// Set canvas to full window size
function resizeCanvas() {
    renderer.resize();
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Mode Manager
class ModeManager {
    constructor() {
        this.currentMode = null;
        this.modes = new Map();
        this.draggedStone = null;
        this.dragOffsetX = 0;
        this.dragOffsetY = 0;
    }

    // Register a mode
    registerMode(ModeClass) {
        const metadata = ModeClass.getMetadata();
        this.modes.set(metadata.id, {
            class: ModeClass,
            metadata: metadata,
            instance: null
        });
    }

    // Switch to a different mode
    switchMode(modeId) {
        // Cleanup current mode
        if (this.currentMode) {
            this.currentMode.cleanup();
        }

        // Get mode data
        const modeData = this.modes.get(modeId);
        if (!modeData) {
            console.error(`Mode ${modeId} not found`);
            return;
        }

        // Create new instance
        modeData.instance = new modeData.class(canvas, ctx, renderer);
        this.currentMode = modeData.instance;

        // Initialize mode
        this.currentMode.init();

        console.log(`Switched to mode: ${modeData.metadata.name}`);
    }

    // Get current mode
    getCurrentMode() {
        return this.currentMode;
    }

    // Get event position (handles both mouse and touch)
    getEventPosition(e) {
        const rect = canvas.getBoundingClientRect();
        const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
        const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
        return {x, y};
    }

    // Event handlers
    onPointerDown(e) {
        e.preventDefault();
        if (!this.currentMode) return;

        const {x, y} = this.getEventPosition(e);

        // Let mode handle the pointer down
        this.draggedStone = this.currentMode.onPointerDown(x, y);

        if (this.draggedStone) {
            this.dragOffsetX = x - this.draggedStone.x;
            this.dragOffsetY = y - this.draggedStone.y;
        }
    }

    onPointerMove(e) {
        e.preventDefault();
        if (!this.currentMode) return;

        const {x, y} = this.getEventPosition(e);

        // Calculate adjusted position with offset
        const adjustedX = this.draggedStone ? x - this.dragOffsetX : x;
        const adjustedY = this.draggedStone ? y - this.dragOffsetY : y;

        // Let mode handle the pointer move
        this.currentMode.onPointerMove(adjustedX, adjustedY, this.draggedStone);
    }

    onPointerUp(e) {
        e.preventDefault();
        if (!this.currentMode) return;

        const {x, y} = this.getEventPosition(e);

        // Let mode handle the pointer up
        this.currentMode.onPointerUp(x, y, this.draggedStone);

        // Clear dragged stone
        this.draggedStone = null;
    }

    // Handle window blur (pause dragging)
    onBlur() {
        if (this.draggedStone) {
            this.draggedStone.stopDrag();
            this.draggedStone = null;
        }
    }
}

// Initialize mode manager
const modeManager = new ModeManager();

// Register available modes
modeManager.registerMode(FreeExploreMode);

// Set initial mode
modeManager.switchMode('free-explore');

// Bind event listeners
canvas.addEventListener('mousedown', (e) => modeManager.onPointerDown(e));
canvas.addEventListener('mousemove', (e) => modeManager.onPointerMove(e));
canvas.addEventListener('mouseup', (e) => modeManager.onPointerUp(e));
canvas.addEventListener('touchstart', (e) => modeManager.onPointerDown(e));
canvas.addEventListener('touchmove', (e) => modeManager.onPointerMove(e));
canvas.addEventListener('touchend', (e) => modeManager.onPointerUp(e));
window.addEventListener('blur', () => modeManager.onBlur());

// Animation loop
let lastTime = 0;
function animate(currentTime) {
    const deltaTime = (currentTime - lastTime) / 1000; // Convert to seconds
    lastTime = currentTime;

    const mode = modeManager.getCurrentMode();
    if (mode && mode.isActive) {
        mode.update(deltaTime);
        mode.render();
    }

    requestAnimationFrame(animate);
}

// Start animation
requestAnimationFrame(animate);

// Export mode manager for potential external control
if (typeof window !== 'undefined') {
    window.modeManager = modeManager;
}
