// NumberStructuresMode - Numbers as physical stone arrangements
// Teaches visual number sense, addition through combination, decomposition

// Canonical patterns for numbers (offsets from center, spacing ~50px)
const NUMBER_PATTERNS = {
    1: [{x: 0, y: 0}],
    2: [{x: -25, y: 0}, {x: 25, y: 0}],
    3: [{x: 0, y: -25}, {x: -25, y: 25}, {x: 25, y: 25}],
    4: [{x: -25, y: -25}, {x: 25, y: -25}, {x: -25, y: 25}, {x: 25, y: 25}],
    5: [{x: -25, y: -25}, {x: 25, y: -25}, {x: 0, y: 0}, {x: -25, y: 25}, {x: 25, y: 25}],
    6: [{x: -25, y: -30}, {x: 25, y: -30}, {x: -25, y: 0}, {x: 25, y: 0}, {x: -25, y: 30}, {x: 25, y: 30}],
    7: [{x: -25, y: -30}, {x: 25, y: -30}, {x: -25, y: 0}, {x: 25, y: 0}, {x: -25, y: 30}, {x: 0, y: 30}, {x: 25, y: 30}],
    8: [{x: -37, y: -25}, {x: -12, y: -25}, {x: 12, y: -25}, {x: 37, y: -25},
        {x: -37, y: 25}, {x: -12, y: 25}, {x: 12, y: 25}, {x: 37, y: 25}],
    9: [{x: -30, y: -30}, {x: 0, y: -30}, {x: 30, y: -30},
        {x: -30, y: 0}, {x: 0, y: 0}, {x: 30, y: 0},
        {x: -30, y: 30}, {x: 0, y: 30}, {x: 30, y: 30}],
    10: [{x: -50, y: -25}, {x: -25, y: -25}, {x: 0, y: -25}, {x: 25, y: -25}, {x: 50, y: -25},
         {x: -50, y: 25}, {x: -25, y: 25}, {x: 0, y: 25}, {x: 25, y: 25}, {x: 50, y: 25}]
};

const STRUCTURE_MERGE_DISTANCE = 120;
const PATTERN_RECOGNITION_THRESHOLD = 40;
const STRUCTURE_LINE_COLOR = 'rgba(139, 125, 107, 0.25)';
const GHOST_COLOR = 'rgba(139, 125, 107, 0.08)';
const GLOW_COLOR = 'rgba(180, 165, 140, 0.4)';

class NumberStructuresMode extends ModeBase {
    constructor(canvas, ctx, renderer) {
        super(canvas, ctx, renderer);
        this.structures = []; // Array of {id, value, stones, centerX, centerY, intact}
        this.recognizedPatterns = []; // {value, x, y, time} for glow effects
        this.nextStructureId = 0;
        this.nextStoneId = 0;
    }

    init() {
        super.init();

        const center = this.renderer.getCenter();

        // Create initial structures: a "3" on the left, a "5" on the right
        this._createStructure(3, center.x - 150, center.y);
        this._createStructure(5, center.x + 150, center.y);
    }

    _createStructure(value, centerX, centerY) {
        const pattern = NUMBER_PATTERNS[value];
        if (!pattern) return null;

        const structureId = this.nextStructureId++;
        const structureStones = [];

        pattern.forEach((offset, index) => {
            const stone = new Stone(centerX + offset.x, centerY + offset.y, this.nextStoneId++);
            stone.structureId = structureId;
            stone.structureIndex = index;
            this.addStone(stone);
            structureStones.push(stone);
        });

        const structure = {
            id: structureId,
            value: value,
            stones: structureStones,
            centerX: centerX,
            centerY: centerY,
            intact: true
        };

        this.structures.push(structure);
        return structure;
    }

    _getStructureCenter(stones) {
        if (stones.length === 0) return {x: 0, y: 0};
        let sumX = 0, sumY = 0;
        stones.forEach(s => { sumX += s.x; sumY += s.y; });
        return {x: sumX / stones.length, y: sumY / stones.length};
    }

    _checkStructureIntact(structure) {
        // Check if all stones are still near their expected pattern positions
        const center = this._getStructureCenter(structure.stones);
        const pattern = NUMBER_PATTERNS[structure.value];
        if (!pattern || structure.stones.length !== pattern.length) return false;

        for (let i = 0; i < structure.stones.length; i++) {
            const stone = structure.stones[i];
            const expected = pattern[stone.structureIndex];
            const dx = stone.x - (center.x + expected.x);
            const dy = stone.y - (center.y + expected.y);
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > PATTERN_RECOGNITION_THRESHOLD) return false;
        }
        return true;
    }

    _recognizePattern(stones) {
        // Try to match a group of loose stones to a canonical pattern
        if (stones.length < 1 || stones.length > 10) return null;

        const pattern = NUMBER_PATTERNS[stones.length];
        if (!pattern) return null;

        const center = this._getStructureCenter(stones);

        // Try to match each stone to a pattern position
        const used = new Set();
        let totalError = 0;

        for (const offset of pattern) {
            let bestDist = Infinity;
            let bestIdx = -1;

            for (let i = 0; i < stones.length; i++) {
                if (used.has(i)) continue;
                const dx = stones[i].x - (center.x + offset.x);
                const dy = stones[i].y - (center.y + offset.y);
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < bestDist) {
                    bestDist = dist;
                    bestIdx = i;
                }
            }

            if (bestIdx === -1 || bestDist > PATTERN_RECOGNITION_THRESHOLD) return null;
            used.add(bestIdx);
            totalError += bestDist;
        }

        // Average error must be reasonable
        if (totalError / stones.length > PATTERN_RECOGNITION_THRESHOLD * 0.7) return null;

        return stones.length;
    }

    _findLooseStones() {
        // Stones not in any intact structure
        const intactStoneIds = new Set();
        this.structures.forEach(s => {
            if (s.intact) {
                s.stones.forEach(st => intactStoneIds.add(st.id));
            }
        });
        return this.stones.filter(s => !intactStoneIds.has(s.id));
    }

    _findNearbyLooseGroups(looseStones) {
        // Cluster loose stones by proximity
        const groups = [];
        const assigned = new Set();

        for (let i = 0; i < looseStones.length; i++) {
            if (assigned.has(i)) continue;

            const group = [looseStones[i]];
            assigned.add(i);

            // Expand group by proximity
            let changed = true;
            while (changed) {
                changed = false;
                for (let j = 0; j < looseStones.length; j++) {
                    if (assigned.has(j)) continue;
                    for (const stone of group) {
                        if (looseStones[j].distanceTo(stone) < 80) {
                            group.push(looseStones[j]);
                            assigned.add(j);
                            changed = true;
                            break;
                        }
                    }
                }
            }

            groups.push(group);
        }

        return groups;
    }

    _tryMergeStructures() {
        // Check if two intact structures are close enough to merge
        for (let i = 0; i < this.structures.length; i++) {
            if (!this.structures[i].intact) continue;
            for (let j = i + 1; j < this.structures.length; j++) {
                if (!this.structures[j].intact) continue;

                const ci = this._getStructureCenter(this.structures[i].stones);
                const cj = this._getStructureCenter(this.structures[j].stones);
                const dx = ci.x - cj.x;
                const dy = ci.y - cj.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < STRUCTURE_MERGE_DISTANCE) {
                    const newValue = this.structures[i].value + this.structures[j].value;
                    if (newValue > 10) continue; // Don't merge beyond 10

                    // Merge: remove old structures, create new one
                    const midX = (ci.x + cj.x) / 2;
                    const midY = (ci.y + cj.y) / 2;

                    // Remove old stones
                    this.structures[i].stones.forEach(s => this.removeStone(s));
                    this.structures[j].stones.forEach(s => this.removeStone(s));

                    // Mark old structures as removed
                    this.structures[i].intact = false;
                    this.structures[i].stones = [];
                    this.structures[j].intact = false;
                    this.structures[j].stones = [];

                    // Create new merged structure
                    const newStructure = this._createStructure(newValue, midX, midY);

                    // Animate stones to their new positions
                    if (newStructure) {
                        const pattern = NUMBER_PATTERNS[newValue];
                        newStructure.stones.forEach((stone, idx) => {
                            stone.setTarget(midX + pattern[idx].x, midY + pattern[idx].y);
                        });
                    }

                    // Add recognition glow
                    this.recognizedPatterns.push({
                        value: newValue,
                        x: midX,
                        y: midY,
                        time: 2.0
                    });

                    return true;
                }
            }
        }
        return false;
    }

    update(deltaTime) {
        super.update(deltaTime);

        // Update structure states
        this.structures.forEach(structure => {
            if (structure.stones.length > 0) {
                structure.intact = this._checkStructureIntact(structure);
                if (structure.intact) {
                    const center = this._getStructureCenter(structure.stones);
                    structure.centerX = center.x;
                    structure.centerY = center.y;
                }
            }
        });

        // Fade recognition glow effects
        this.recognizedPatterns = this.recognizedPatterns.filter(p => {
            p.time -= deltaTime;
            return p.time > 0;
        });

        // Clean up empty structures
        this.structures = this.structures.filter(s => s.stones.length > 0);
    }

    render() {
        this.renderer.drawBackground();

        const ctx = this.ctx;

        // Draw ghost outlines for patterns that could form
        const looseStones = this._findLooseStones();
        const groups = this._findNearbyLooseGroups(looseStones);
        groups.forEach(group => {
            if (group.length >= 2 && NUMBER_PATTERNS[group.length]) {
                const center = this._getStructureCenter(group);
                const pattern = NUMBER_PATTERNS[group.length];

                // Draw ghost dots
                ctx.save();
                ctx.fillStyle = GHOST_COLOR;
                pattern.forEach(offset => {
                    ctx.beginPath();
                    ctx.arc(center.x + offset.x, center.y + offset.y, STONE_RADIUS * 0.5, 0, Math.PI * 2);
                    ctx.fill();
                });
                ctx.restore();
            }
        });

        // Draw connecting lines for intact structures
        this.structures.forEach(structure => {
            if (structure.intact && structure.stones.length >= 2) {
                this.renderer.drawConnectingLines(structure.stones, STRUCTURE_LINE_COLOR, 1.5);
            }
        });

        // Draw recognition glow effects
        this.recognizedPatterns.forEach(p => {
            ctx.save();
            const alpha = p.time / 2.0;
            const glowRadius = 60 + (1 - alpha) * 30;
            const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowRadius);
            gradient.addColorStop(0, `rgba(180, 165, 140, ${0.4 * alpha})`);
            gradient.addColorStop(1, 'rgba(180, 165, 140, 0)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(p.x, p.y, glowRadius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });

        // Draw all stones
        this.stones.forEach(stone => stone.draw(ctx));

        // Draw number labels near intact structures
        this.structures.forEach(structure => {
            if (structure.intact) {
                this.renderer.drawCountIndicator(
                    structure.value,
                    structure.centerX,
                    structure.centerY - 55
                );
            }
        });
    }

    onPointerDown(x, y) {
        const stone = this.findStoneAtPosition(x, y);
        if (stone) {
            stone.startDrag();
            this.moveStoneToTop(stone);

            // If dragged stone was part of a structure, mark it as broken
            const structure = this.structures.find(s => s.stones.includes(stone));
            if (structure) {
                structure.intact = false;
            }

            return stone;
        }
        return null;
    }

    onPointerMove(x, y, draggedStone) {
        if (draggedStone) {
            draggedStone.setPosition(x, y);
        }
    }

    onPointerUp(x, y, draggedStone) {
        if (draggedStone) {
            draggedStone.stopDrag();
        }

        // 1. Re-check which structures are intact
        this.structures.forEach(structure => {
            if (structure.stones.length > 0) {
                structure.intact = this._checkStructureIntact(structure);
                if (structure.intact) {
                    const center = this._getStructureCenter(structure.stones);
                    structure.centerX = center.x;
                    structure.centerY = center.y;
                }
            }
        });

        // 2. Check if loose stones form new patterns
        const looseStones = this._findLooseStones();
        const groups = this._findNearbyLooseGroups(looseStones);

        groups.forEach(group => {
            const value = this._recognizePattern(group);
            if (value) {
                const center = this._getStructureCenter(group);
                const structureId = this.nextStructureId++;
                const pattern = NUMBER_PATTERNS[value];

                // Assign stones to new structure and snap to pattern positions
                group.forEach((stone, idx) => {
                    stone.structureId = structureId;
                    stone.structureIndex = idx;
                    stone.setTarget(center.x + pattern[idx].x, center.y + pattern[idx].y);
                });

                this.structures.push({
                    id: structureId,
                    value: value,
                    stones: group,
                    centerX: center.x,
                    centerY: center.y,
                    intact: true
                });

                // Add recognition glow
                this.recognizedPatterns.push({
                    value: value,
                    x: center.x,
                    y: center.y,
                    time: 2.0
                });
            }
        });

        // 3. Check if two intact structures are close enough to merge
        this._tryMergeStructures();
    }

    cleanup() {
        super.cleanup();
        this.structures = [];
        this.recognizedPatterns = [];
        this.nextStructureId = 0;
        this.nextStoneId = 0;
    }

    static getMetadata() {
        return {
            id: 'number-structures',
            name: 'Numbers',
            icon: '🔢',
            description: 'Physical number representations'
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { NumberStructuresMode };
}
