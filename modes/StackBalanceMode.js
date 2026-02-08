// StackBalanceMode - Spatial reasoning and stability
// Teaches base/height relationships, center of mass through stacking

const GRAVITY = 400; // Pixels per second squared
const PLATFORM_HEIGHT = 8;
const PLATFORM_COLOR = '#8b7d6b';
const WOBBLE_DURATION = 0.8; // seconds before topple
const TOPPLE_FORCE = 150;
const LANDING_SNAP_THRESHOLD = 10;
const STABILITY_TOLERANCE = 0.6; // Ratio of center-of-mass offset to base width

class StackBalanceMode extends ModeBase {
    constructor(canvas, ctx, renderer) {
        super(canvas, ctx, renderer);
        this.platform = { x: 0, y: 0, width: 200 };
        this.stackedStones = [];
        this.fallingStones = [];
        this.availableStones = [];
        this.stackHeight = 0;
        this.isToppling = false;
        this.toppleTimer = 0;
        this.wobbleAmount = 0;
        this.wobbleDirection = 0;
        this.nextStoneId = 0;
    }

    init() {
        super.init();

        const center = this.renderer.getCenter();
        const dims = this.renderer.getDimensions();

        // Position platform near bottom
        this.platform.x = center.x;
        this.platform.y = dims.height - 100;

        // Create 10 stones at top area with varying sizes
        const stoneCount = 10;
        const trayWidth = dims.width * 0.8;
        const startX = center.x - trayWidth / 2;
        const spacing = trayWidth / (stoneCount - 1);

        for (let i = 0; i < stoneCount; i++) {
            const radiusVariation = STONE_RADIUS * (0.7 + Math.random() * 0.6);
            const x = startX + i * spacing;
            const y = 60 + Math.random() * 20;
            const stone = new Stone(x, y, this.nextStoneId++, {
                radius: radiusVariation,
                mass: radiusVariation / STONE_RADIUS // Mass proportional to size
            });
            stone._originalX = x;
            stone._originalY = y;
            stone._vy = 0; // Vertical velocity for falling
            stone._vx = 0; // Horizontal velocity for toppling
            stone._rotation = 0; // Rotation for topple animation
            stone._rotationSpeed = 0;
            stone._isStacked = false;
            stone._isFalling = false;
            stone._isToppling = false;
            this.availableStones.push(stone);
            this.addStone(stone);
        }
    }

    _getPlatformTop() {
        return this.platform.y - PLATFORM_HEIGHT / 2;
    }

    _getStackTop() {
        // Find the highest point of stacked stones
        if (this.stackedStones.length === 0) return this._getPlatformTop();

        let minY = this._getPlatformTop();
        this.stackedStones.forEach(stone => {
            const top = stone.y - stone.radius;
            if (top < minY) minY = top;
        });
        return minY;
    }

    _findLandingY(stone) {
        // Find where this stone would land (on platform or on top of another stone)
        let landingY = this._getPlatformTop() - stone.radius;

        this.stackedStones.forEach(stacked => {
            const dx = Math.abs(stone.x - stacked.x);
            const minDist = stone.radius + stacked.radius;

            // If horizontally overlapping
            if (dx < minDist * 0.8) {
                const stackedTop = stacked.y - stacked.radius - stone.radius;
                if (stackedTop < landingY) {
                    landingY = stackedTop;
                }
            }
        });

        return landingY;
    }

    _checkCollisionWithStacked(stone) {
        // Check if falling stone collides with any stacked stone or platform
        const platformTop = this._getPlatformTop();

        // Check platform collision
        if (stone.y + stone.radius >= platformTop) {
            stone.y = platformTop - stone.radius;
            return true;
        }

        // Check collision with stacked stones
        for (const stacked of this.stackedStones) {
            const dx = stone.x - stacked.x;
            const dy = stone.y - stacked.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const minDist = stone.radius + stacked.radius;

            if (dist < minDist && stone._vy > 0) {
                // Push stone up to sit on top
                const overlap = minDist - dist;
                stone.y -= overlap;
                return true;
            }
        }

        return false;
    }

    _calculateCenterOfMass() {
        if (this.stackedStones.length === 0) return { x: this.platform.x, totalMass: 0 };

        let totalMass = 0;
        let weightedX = 0;

        this.stackedStones.forEach(stone => {
            totalMass += stone.mass;
            weightedX += stone.x * stone.mass;
        });

        return {
            x: weightedX / totalMass,
            totalMass: totalMass
        };
    }

    _isStackStable() {
        if (this.stackedStones.length <= 1) return { stable: true, tilt: 0 };

        const com = this._calculateCenterOfMass();
        const halfBase = this.platform.width / 2;
        const leftEdge = this.platform.x - halfBase;
        const rightEdge = this.platform.x + halfBase;

        // How far is center of mass from platform center, as ratio of half-base
        const offset = com.x - this.platform.x;
        const tilt = offset / halfBase;

        const stable = Math.abs(tilt) < STABILITY_TOLERANCE;

        return { stable, tilt };
    }

    _startTopple(tiltDirection) {
        this.isToppling = true;
        this.toppleTimer = 0;

        // Apply toppling forces to all stacked stones
        this.stackedStones.forEach((stone, i) => {
            stone._isToppling = true;
            stone._isStacked = false;

            // Higher stones get more force (lever effect)
            const heightFactor = 1 + (this.stackedStones.length - i) * 0.3;
            stone._vx = tiltDirection * TOPPLE_FORCE * heightFactor * (0.8 + Math.random() * 0.4);
            stone._vy = -50 * Math.random(); // Slight upward bounce
            stone._rotationSpeed = tiltDirection * (2 + Math.random() * 3);
        });

        // Move all to falling list
        this.fallingStones.push(...this.stackedStones);
        this.stackedStones = [];
        this.stackHeight = 0;
    }

    update(deltaTime) {
        if (deltaTime > 0.1) deltaTime = 0.1; // Clamp large delta times

        const dims = this.renderer.getDimensions();
        const platformTop = this._getPlatformTop();

        // Process falling stones
        for (let i = this.fallingStones.length - 1; i >= 0; i--) {
            const stone = this.fallingStones[i];

            // Apply gravity
            stone._vy += GRAVITY * deltaTime;
            stone.y += stone._vy * deltaTime;
            stone.x += stone._vx * deltaTime;

            // Apply rotation for toppling stones
            if (stone._isToppling) {
                stone._rotation += stone._rotationSpeed * deltaTime;
                // Friction on horizontal movement
                stone._vx *= 0.98;
            }

            // Check if stone has landed
            if (!stone._isToppling && this._checkCollisionWithStacked(stone)) {
                // Stone has landed on platform or stack
                stone._vy = 0;
                stone._vx = 0;
                stone._isFalling = false;
                stone._isStacked = true;
                this.fallingStones.splice(i, 1);
                this.stackedStones.push(stone);

                // Check stability after landing
                const stability = this._isStackStable();
                if (!stability.stable && !this.isToppling) {
                    this.wobbleAmount = Math.abs(stability.tilt);
                    this.wobbleDirection = stability.tilt > 0 ? 1 : -1;
                    this._startTopple(this.wobbleDirection);
                } else {
                    this._updateStackHeight();
                }
                continue;
            }

            // Remove toppling stones that fall off screen
            if (stone._isToppling && (stone.y > dims.height + 100 || stone.x < -100 || stone.x > dims.width + 100)) {
                this.fallingStones.splice(i, 1);
                this.removeStone(stone);
            }
        }

        // End topple animation when all toppling stones are gone
        if (this.isToppling) {
            this.toppleTimer += deltaTime;
            const hasToppling = this.fallingStones.some(s => s._isToppling);
            if (!hasToppling) {
                this.isToppling = false;
                this.wobbleAmount = 0;
            }
        }

        // Update non-dragged, non-falling stones (smooth target movement)
        this.stones.forEach(stone => {
            if (!stone.isDragging && !stone._isFalling && !stone._isToppling) {
                stone.update(deltaTime);
            }
        });
    }

    render() {
        this.renderer.drawBackground();

        const ctx = this.ctx;
        const dims = this.renderer.getDimensions();

        // Draw platform
        ctx.save();
        ctx.fillStyle = PLATFORM_COLOR;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetY = 2;

        const platLeft = this.platform.x - this.platform.width / 2;
        const platTop = this.platform.y - PLATFORM_HEIGHT / 2;
        ctx.beginPath();
        ctx.roundRect(platLeft, platTop, this.platform.width, PLATFORM_HEIGHT, 3);
        ctx.fill();
        ctx.restore();

        // Draw platform legs
        ctx.save();
        ctx.fillStyle = PLATFORM_COLOR;
        ctx.fillRect(platLeft + 10, platTop + PLATFORM_HEIGHT, 6, 20);
        ctx.fillRect(platLeft + this.platform.width - 16, platTop + PLATFORM_HEIGHT, 6, 20);
        ctx.restore();

        // Draw all stones (available, stacked, falling)
        // Available stones first (in tray area)
        this.availableStones.forEach(stone => {
            if (!stone._isFalling && !stone._isStacked && !stone._isToppling && !stone.isDragging) {
                stone.draw(ctx);
            }
        });

        // Stacked stones
        this.stackedStones.forEach(stone => stone.draw(ctx));

        // Falling and toppling stones (with rotation for toppling)
        this.fallingStones.forEach(stone => {
            if (stone._isToppling && stone._rotation !== 0) {
                ctx.save();
                ctx.translate(stone.x, stone.y);
                ctx.rotate(stone._rotation);
                ctx.translate(-stone.x, -stone.y);
                stone.draw(ctx);
                ctx.restore();
            } else {
                stone.draw(ctx);
            }
        });

        // Draw dragged stone on top
        const dragged = this.stones.find(s => s.isDragging);
        if (dragged) {
            dragged.draw(ctx);
        }

        // Draw stack height indicator
        if (this.stackHeight > 0) {
            this.renderer.drawText(
                `${this.stackHeight}`,
                dims.width - 50,
                dims.height - 50,
                { fontSize: 24, color: 'rgba(107, 97, 82, 0.4)' }
            );
            this.renderer.drawText(
                'stacked',
                dims.width - 50,
                dims.height - 30,
                { fontSize: 12, color: 'rgba(107, 97, 82, 0.3)' }
            );
        }

        // Draw tray hint
        if (this.availableStones.some(s => !s._isStacked && !s._isFalling && !s._isToppling)) {
            this.renderer.drawText('drag stones down to stack', this.renderer.getCenter().x, 110, {
                fontSize: 14,
                color: 'rgba(107, 97, 82, 0.3)'
            });
        }

        // Wobble indicator before topple
        if (this.isToppling && this.toppleTimer < 0.3) {
            const wobble = Math.sin(this.toppleTimer * 30) * 3;
            ctx.save();
            ctx.strokeStyle = 'rgba(180, 140, 100, 0.3)';
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.moveTo(this.platform.x + wobble, this.platform.y - 200);
            ctx.lineTo(this.platform.x + wobble, this.platform.y);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.restore();
        }
    }

    _updateStackHeight() {
        this.stackHeight = this.stackedStones.length;
    }

    onPointerDown(x, y) {
        // Only allow picking up available stones (not stacked ones)
        for (let i = this.stones.length - 1; i >= 0; i--) {
            const stone = this.stones[i];
            if (stone.contains(x, y) && !stone._isStacked && !stone._isFalling && !stone._isToppling) {
                if (stone.startDrag()) {
                    this.moveStoneToTop(stone);
                    return stone;
                }
            }
        }
        return null;
    }

    onPointerMove(x, y, draggedStone) {
        if (draggedStone) {
            draggedStone.setPosition(x, y);
        }
    }

    onPointerUp(x, y, draggedStone) {
        if (!draggedStone) return;

        draggedStone.stopDrag();

        const platformTop = this._getPlatformTop();

        // If released above the platform area and below the tray, start falling
        if (y > 120 && x > this.platform.x - this.platform.width && x < this.platform.x + this.platform.width) {
            // Remove from available stones
            const idx = this.availableStones.indexOf(draggedStone);
            if (idx > -1) {
                this.availableStones.splice(idx, 1);
            }

            draggedStone._isFalling = true;
            draggedStone._vy = 0;
            draggedStone._vx = 0;
            this.fallingStones.push(draggedStone);
        } else {
            // Return to original position
            draggedStone.setTarget(draggedStone._originalX, draggedStone._originalY);
        }
    }

    cleanup() {
        super.cleanup();
        this.stackedStones = [];
        this.fallingStones = [];
        this.availableStones = [];
        this.stackHeight = 0;
        this.isToppling = false;
        this.toppleTimer = 0;
        this.wobbleAmount = 0;
        this.nextStoneId = 0;
    }

    static getMetadata() {
        return {
            id: 'stack-balance',
            name: 'Stack',
            icon: '🏛️',
            description: 'Stacking and spatial balance'
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { StackBalanceMode };
}
