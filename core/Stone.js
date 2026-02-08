// Stone class - Enhanced for multi-mode physics
// Represents a draggable stone with physics properties

const STONE_RADIUS = 35; // Base size for stones
const COLORS = {
    stone: ['#8b7d6b', '#9a8c7a', '#7a6f5d', '#6b6152', '#a39482'],
    stoneHighlight: '#b8a894',
    shadow: 'rgba(0, 0, 0, 0.15)'
};

class Stone {
    constructor(x, y, id, properties = {}) {
        // Position
        this.x = x;
        this.y = y;
        this.id = id;
        this.targetX = x;
        this.targetY = y;

        // Rendering
        this.radius = properties.radius || (STONE_RADIUS + Math.random() * 10 - 5);
        this.color = properties.color || COLORS.stone[Math.floor(Math.random() * COLORS.stone.length)];

        // Organic shape variation (not perfect circles)
        this.shapeOffset = Array(8).fill(0).map(() => Math.random() * 4 - 2);

        // Physics properties (NEW)
        this.mass = properties.mass || 1.0;
        this.dragCoefficient = 1 / this.mass; // Heavier = slower
        this.velocity = { x: 0, y: 0 };

        // Structure metadata (NEW - for NumberStructures mode)
        this.structureId = null;
        this.structureIndex = null;

        // State
        this.isDragging = false;
        this.isLocked = properties.isLocked || false; // For challenges
        this.group = null; // Reference to group this stone belongs to
    }

    draw(ctx) {
        ctx.save();

        // Shadow for depth
        ctx.shadowColor = COLORS.shadow;
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 3;

        // Draw organic stone shape
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const r = this.radius + this.shapeOffset[i];
            const px = this.x + Math.cos(angle) * r;
            const py = this.y + Math.sin(angle) * r;

            if (i === 0) {
                ctx.moveTo(px, py);
            } else {
                ctx.lineTo(px, py);
            }
        }
        ctx.closePath();

        // Fill stone
        ctx.fillStyle = this.isDragging ? COLORS.stoneHighlight : this.color;
        ctx.fill();

        // Subtle highlight for 3D effect
        const gradient = ctx.createRadialGradient(
            this.x - this.radius * 0.3,
            this.y - this.radius * 0.3,
            0,
            this.x,
            this.y,
            this.radius
        );
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.1)');
        ctx.fillStyle = gradient;
        ctx.fill();

        // Visual indicator if locked (for challenges)
        if (this.isLocked) {
            ctx.strokeStyle = 'rgba(139, 125, 107, 0.5)';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        ctx.restore();
    }

    contains(x, y) {
        const dx = x - this.x;
        const dy = y - this.y;
        return dx * dx + dy * dy <= this.radius * this.radius;
    }

    distanceTo(other) {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    update(deltaTime = 1) {
        if (this.isDragging) return;

        // Mass-based smooth movement animation
        const ease = 0.2 * this.dragCoefficient;
        this.x += (this.targetX - this.x) * ease;
        this.y += (this.targetY - this.y) * ease;

        // Apply velocity if physics engine is active
        if (this.velocity.x !== 0 || this.velocity.y !== 0) {
            this.x += this.velocity.x * deltaTime;
            this.y += this.velocity.y * deltaTime;
        }
    }

    // Start dragging this stone
    startDrag() {
        if (this.isLocked) return false;
        this.isDragging = true;
        return true;
    }

    // Stop dragging
    stopDrag() {
        this.isDragging = false;
    }

    // Set target position (for smooth movement)
    setTarget(x, y) {
        this.targetX = x;
        this.targetY = y;
    }

    // Immediate position update (for dragging)
    setPosition(x, y) {
        this.x = x;
        this.y = y;
        this.targetX = x;
        this.targetY = y;
    }

    // Clone this stone
    clone() {
        return new Stone(this.x, this.y, `${this.id}-clone`, {
            radius: this.radius,
            color: this.color,
            mass: this.mass,
            isLocked: this.isLocked
        });
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Stone, STONE_RADIUS, COLORS };
}
