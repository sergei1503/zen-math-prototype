// Stone Counting Garden - Zen Math Prototype
// Interactive, intuitive math concept learning through visual exploration

const canvas = document.getElementById('garden-canvas');
const ctx = canvas.getContext('2d');

// Set canvas to full window size
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    render();
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Stone configuration
const STONE_RADIUS = 35; // Base size for stones
const GROUP_THRESHOLD = 80; // Distance for stones to group together
const COLORS = {
    stone: ['#8b7d6b', '#9a8c7a', '#7a6f5d', '#6b6152', '#a39482'], // Earthy stone colors
    stoneHighlight: '#b8a894',
    group: 'rgba(139, 125, 107, 0.15)', // Subtle group indicator
    shadow: 'rgba(0, 0, 0, 0.15)'
};

// Stone class
class Stone {
    constructor(x, y, id) {
        this.x = x;
        this.y = y;
        this.id = id;
        this.radius = STONE_RADIUS + Math.random() * 10 - 5; // Slight size variation
        this.color = COLORS.stone[Math.floor(Math.random() * COLORS.stone.length)];
        this.isDragging = false;
        this.group = null;
        this.targetX = x;
        this.targetY = y;

        // Organic shape variation (not perfect circles)
        this.shapeOffset = Array(8).fill(0).map(() => Math.random() * 4 - 2);
    }

    draw() {
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

    update() {
        // Smooth movement animation
        const ease = 0.2;
        this.x += (this.targetX - this.x) * ease;
        this.y += (this.targetY - this.y) * ease;
    }
}

// Stone group (visual only, no text)
class StoneGroup {
    constructor(stones) {
        this.stones = stones;
        this.id = Date.now();
    }

    draw() {
        if (this.stones.length < 2) return;

        // Calculate group bounds
        const positions = this.stones.map(s => ({x: s.x, y: s.y}));
        const minX = Math.min(...positions.map(p => p.x));
        const maxX = Math.max(...positions.map(p => p.x));
        const minY = Math.min(...positions.map(p => p.y));
        const maxY = Math.max(...positions.map(p => p.y));

        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;
        const width = maxX - minX + STONE_RADIUS * 3;
        const height = maxY - minY + STONE_RADIUS * 3;

        // Draw subtle group circle
        ctx.save();
        ctx.fillStyle = COLORS.group;
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, width / 2, height / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    contains(stone) {
        return this.stones.includes(stone);
    }
}

// Initialize stones - start with 8 stones in a loose arrangement
const stones = [];
const initialCount = 8;
const centerX = canvas.width / 2;
const centerY = canvas.height / 2;
const spread = 150;

for (let i = 0; i < initialCount; i++) {
    const angle = (i / initialCount) * Math.PI * 2;
    const distance = spread + Math.random() * 50;
    const x = centerX + Math.cos(angle) * distance;
    const y = centerY + Math.sin(angle) * distance;
    stones.push(new Stone(x, y, i));
}

// Groups
let groups = [];

// Interaction state
let draggedStone = null;
let dragOffsetX = 0;
let dragOffsetY = 0;

// Touch/mouse event handling
function getEventPosition(e) {
    const rect = canvas.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
    return {x, y};
}

function onPointerDown(e) {
    e.preventDefault();
    const {x, y} = getEventPosition(e);

    // Find stone under pointer (from top down)
    for (let i = stones.length - 1; i >= 0; i--) {
        if (stones[i].contains(x, y)) {
            draggedStone = stones[i];
            draggedStone.isDragging = true;
            dragOffsetX = x - draggedStone.x;
            dragOffsetY = y - draggedStone.y;

            // Move to top of drawing order
            stones.splice(i, 1);
            stones.push(draggedStone);
            break;
        }
    }
}

function onPointerMove(e) {
    e.preventDefault();
    if (!draggedStone) return;

    const {x, y} = getEventPosition(e);
    draggedStone.targetX = x - dragOffsetX;
    draggedStone.targetY = y - dragOffsetY;
    draggedStone.x = draggedStone.targetX; // Immediate update while dragging
    draggedStone.y = draggedStone.targetY;
}

function onPointerUp(e) {
    e.preventDefault();
    if (draggedStone) {
        draggedStone.isDragging = false;
        draggedStone = null;
    }

    // Update groups after drag
    updateGroups();
}

// Group detection based on proximity
function updateGroups() {
    groups = [];
    const processed = new Set();

    for (let i = 0; i < stones.length; i++) {
        if (processed.has(i)) continue;

        const group = [stones[i]];
        processed.add(i);

        // Find nearby stones
        for (let j = 0; j < stones.length; j++) {
            if (i === j || processed.has(j)) continue;

            // Check if stone j is close to any stone in current group
            for (let stone of group) {
                if (stones[j].distanceTo(stone) < GROUP_THRESHOLD) {
                    group.push(stones[j]);
                    processed.add(j);
                    break;
                }
            }
        }

        if (group.length >= 2) {
            groups.push(new StoneGroup(group));
        }
    }
}

// Event listeners
canvas.addEventListener('mousedown', onPointerDown);
canvas.addEventListener('mousemove', onPointerMove);
canvas.addEventListener('mouseup', onPointerUp);
canvas.addEventListener('touchstart', onPointerDown);
canvas.addEventListener('touchmove', onPointerMove);
canvas.addEventListener('touchend', onPointerUp);

// Animation loop
function render() {
    // Clear canvas with subtle texture
    ctx.fillStyle = '#e8dcc4';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw subtle sand texture
    ctx.save();
    ctx.globalAlpha = 0.03;
    for (let i = 0; i < 100; i++) {
        ctx.fillStyle = Math.random() > 0.5 ? '#d4c5ab' : '#f0e6d2';
        ctx.fillRect(
            Math.random() * canvas.width,
            Math.random() * canvas.height,
            2, 2
        );
    }
    ctx.restore();

    // Draw groups first (behind stones)
    groups.forEach(group => group.draw());

    // Update and draw stones
    stones.forEach(stone => {
        stone.update();
        stone.draw();
    });

    requestAnimationFrame(render);
}

// Start the animation
updateGroups();
render();

// Handle window blur/focus (pause/resume)
window.addEventListener('blur', () => {
    if (draggedStone) {
        draggedStone.isDragging = false;
        draggedStone = null;
    }
});
