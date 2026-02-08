// FreeExploreMode - Open-ended discovery mode
// Current prototype refactored into mode architecture

const GROUP_THRESHOLD = 80; // Distance for stones to group together
const GROUP_COLOR = 'rgba(139, 125, 107, 0.15)';

class StoneGroup {
    constructor(stones) {
        this.stones = stones;
        this.id = Date.now();
    }

    contains(stone) {
        return this.stones.includes(stone);
    }
}

class FreeExploreMode extends ModeBase {
    constructor(canvas, ctx, renderer) {
        super(canvas, ctx, renderer);
        this.groups = [];
    }

    init() {
        super.init();

        // Initialize stones in circular pattern
        const initialCount = 8;
        const center = this.renderer.getCenter();
        const spread = 150;

        for (let i = 0; i < initialCount; i++) {
            const angle = (i / initialCount) * Math.PI * 2;
            const distance = spread + Math.random() * 50;
            const x = center.x + Math.cos(angle) * distance;
            const y = center.y + Math.sin(angle) * distance;
            this.addStone(new Stone(x, y, i));
        }

        // Initial group detection
        this.updateGroups();
    }

    update(deltaTime) {
        super.update(deltaTime);
        // Groups are updated on pointer up, not every frame
    }

    render() {
        // Draw background
        this.renderer.drawBackground();

        // Draw groups first (behind stones)
        this.groups.forEach(group => {
            this.renderer.drawGroupIndicator(group.stones, GROUP_COLOR);
        });

        // Draw stones
        this.stones.forEach(stone => stone.draw(this.ctx));
    }

    onPointerDown(x, y) {
        const stone = this.findStoneAtPosition(x, y);
        if (stone) {
            stone.startDrag();
            this.moveStoneToTop(stone);
            return stone;
        }
        return null;
    }

    onPointerMove(x, y, draggedStone) {
        if (draggedStone) {
            // Immediate position update while dragging
            draggedStone.setPosition(x, y);
        }
    }

    onPointerUp(x, y, draggedStone) {
        if (draggedStone) {
            draggedStone.stopDrag();
        }
        // Update groups after drag
        this.updateGroups();
    }

    // Group detection based on proximity
    updateGroups() {
        this.groups = [];
        const processed = new Set();

        for (let i = 0; i < this.stones.length; i++) {
            if (processed.has(i)) continue;

            const group = [this.stones[i]];
            processed.add(i);

            // Find nearby stones
            for (let j = 0; j < this.stones.length; j++) {
                if (i === j || processed.has(j)) continue;

                // Check if stone j is close to any stone in current group
                for (let stone of group) {
                    if (this.stones[j].distanceTo(stone) < GROUP_THRESHOLD) {
                        group.push(this.stones[j]);
                        processed.add(j);
                        break;
                    }
                }
            }

            if (group.length >= 2) {
                this.groups.push(new StoneGroup(group));
            }
        }
    }

    cleanup() {
        super.cleanup();
        this.groups = [];
    }

    static getMetadata() {
        return {
            id: 'free-explore',
            name: 'Free Explore',
            icon: '🪨',
            description: 'Open-ended discovery and grouping'
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { FreeExploreMode };
}
