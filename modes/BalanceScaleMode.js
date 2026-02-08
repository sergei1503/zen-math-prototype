// BalanceScaleMode - Equality and weight relationships
// Teaches number equality, greater/less than through a physical balance scale

const BEAM_WIDTH = 400;
const BEAM_THICKNESS = 6;
const FULCRUM_SIZE = 30;
const PAN_RADIUS = 60;
const MAX_TILT_ANGLE = Math.PI / 8; // Max 22.5 degrees
const TILT_SMOOTH_SPEED = 4; // How fast beam animates to target angle
const BALANCE_THRESHOLD = 0.01; // Angle considered "balanced"
const BALANCE_GLOW_COLOR = 'rgba(180, 165, 140, 0.6)';
const BEAM_COLOR = '#8b7d6b';
const FULCRUM_COLOR = '#7a6f5d';
const PAN_COLOR = 'rgba(139, 125, 107, 0.2)';
const PAN_BORDER_COLOR = 'rgba(139, 125, 107, 0.5)';
const TRAY_Y_OFFSET = 80; // Distance from top for the stone tray

class BalanceScaleMode extends ModeBase {
    constructor(canvas, ctx, renderer) {
        super(canvas, ctx, renderer);
        this.beam = { x: 0, y: 0, width: BEAM_WIDTH, angle: 0, targetAngle: 0 };
        this.fulcrum = { x: 0, y: 0 };
        this.leftPan = { x: 0, y: 0, stones: [] };
        this.rightPan = { x: 0, y: 0, stones: [] };
        this.trayStones = [];
        this.isBalanced = false;
        this.balanceGlowTime = 0;
        this.nextStoneId = 0;
    }

    init() {
        super.init();

        const center = this.renderer.getCenter();
        const dims = this.renderer.getDimensions();

        // Position fulcrum and beam
        this.fulcrum.x = center.x;
        this.fulcrum.y = center.y + 40;
        this.beam.x = center.x;
        this.beam.y = this.fulcrum.y - FULCRUM_SIZE;

        // Update pan positions (will be recalculated based on beam angle)
        this._updatePanPositions();

        // Create 7 stones of varying mass in tray area at top
        const masses = [1, 1, 1, 2, 2, 3, 3];
        const trayWidth = dims.width * 0.6;
        const trayStartX = center.x - trayWidth / 2;
        const spacing = trayWidth / (masses.length - 1);

        masses.forEach((mass, i) => {
            const x = trayStartX + i * spacing;
            const y = TRAY_Y_OFFSET;
            const radius = STONE_RADIUS * (0.7 + mass * 0.2);
            const stone = new Stone(x, y, this.nextStoneId++, { radius, mass });
            stone._trayX = x;
            stone._trayY = y;
            stone._onPan = null; // 'left', 'right', or null
            this.trayStones.push(stone);
            this.addStone(stone);
        });
    }

    _updatePanPositions() {
        const halfWidth = this.beam.width / 2;
        const angle = this.beam.angle;
        const beamY = this.beam.y;
        const beamX = this.beam.x;

        // Pans are at the ends of the tilted beam
        this.leftPan.x = beamX - Math.cos(angle) * halfWidth;
        this.leftPan.y = beamY - Math.sin(-angle) * halfWidth;
        this.rightPan.x = beamX + Math.cos(angle) * halfWidth;
        this.rightPan.y = beamY + Math.sin(-angle) * halfWidth;
    }

    _calculateTiltAngle() {
        // Calculate torque on each side
        let leftTorque = 0;
        let rightTorque = 0;
        const halfWidth = this.beam.width / 2;

        this.leftPan.stones.forEach(stone => {
            leftTorque += stone.mass * halfWidth;
        });

        this.rightPan.stones.forEach(stone => {
            rightTorque += stone.mass * halfWidth;
        });

        // Difference in torque determines tilt
        const torqueDiff = rightTorque - leftTorque;
        const maxTorque = 6 * halfWidth; // Normalize against reasonable max

        // Map torque difference to angle
        return Math.max(-MAX_TILT_ANGLE, Math.min(MAX_TILT_ANGLE, (torqueDiff / maxTorque) * MAX_TILT_ANGLE));
    }

    _isOnLeftPan(x, y) {
        const dx = x - this.leftPan.x;
        const dy = y - this.leftPan.y;
        return Math.sqrt(dx * dx + dy * dy) < PAN_RADIUS + 20;
    }

    _isOnRightPan(x, y) {
        const dx = x - this.rightPan.x;
        const dy = y - this.rightPan.y;
        return Math.sqrt(dx * dx + dy * dy) < PAN_RADIUS + 20;
    }

    _positionStonesOnPan(pan) {
        // Arrange stones in a circular cluster on the pan
        const count = pan.stones.length;
        if (count === 0) return;

        if (count === 1) {
            pan.stones[0].setTarget(pan.x, pan.y - 15);
            return;
        }

        const radius = Math.min(PAN_RADIUS * 0.5, 20 + count * 5);
        pan.stones.forEach((stone, i) => {
            const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
            stone.setTarget(
                pan.x + Math.cos(angle) * radius,
                pan.y - 15 + Math.sin(angle) * radius
            );
        });
    }

    update(deltaTime) {
        // Calculate target beam angle
        this.beam.targetAngle = this._calculateTiltAngle();

        // Smoothly animate beam toward target angle
        const angleDiff = this.beam.targetAngle - this.beam.angle;
        this.beam.angle += angleDiff * Math.min(1, TILT_SMOOTH_SPEED * deltaTime);

        // Update pan positions based on beam angle
        this._updatePanPositions();

        // Update stone positions on pans (they ride the pan)
        this._positionStonesOnPan(this.leftPan);
        this._positionStonesOnPan(this.rightPan);

        // Check if balanced
        this.isBalanced = Math.abs(this.beam.angle) < BALANCE_THRESHOLD &&
            (this.leftPan.stones.length > 0 || this.rightPan.stones.length > 0);

        if (this.isBalanced) {
            this.balanceGlowTime += deltaTime;
        } else {
            this.balanceGlowTime = 0;
        }

        // Update all stones (smooth movement)
        super.update(deltaTime);
    }

    render() {
        this.renderer.drawBackground();

        const ctx = this.ctx;
        const center = this.renderer.getCenter();

        // Draw tray label
        this.renderer.drawText('drag stones onto the pans', center.x, TRAY_Y_OFFSET + 50, {
            fontSize: 14,
            color: 'rgba(107, 97, 82, 0.35)'
        });

        // Draw fulcrum (triangle)
        ctx.save();
        ctx.fillStyle = FULCRUM_COLOR;
        ctx.beginPath();
        ctx.moveTo(this.fulcrum.x, this.fulcrum.y - FULCRUM_SIZE);
        ctx.lineTo(this.fulcrum.x - FULCRUM_SIZE * 0.7, this.fulcrum.y + 5);
        ctx.lineTo(this.fulcrum.x + FULCRUM_SIZE * 0.7, this.fulcrum.y + 5);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // Draw balance glow on fulcrum when balanced
        if (this.isBalanced) {
            ctx.save();
            const pulse = 0.5 + 0.5 * Math.sin(this.balanceGlowTime * 3);
            const glowRadius = FULCRUM_SIZE * 1.5 + pulse * 10;
            const gradient = ctx.createRadialGradient(
                this.fulcrum.x, this.fulcrum.y - FULCRUM_SIZE * 0.5, 0,
                this.fulcrum.x, this.fulcrum.y - FULCRUM_SIZE * 0.5, glowRadius
            );
            gradient.addColorStop(0, `rgba(180, 165, 140, ${0.3 * pulse})`);
            gradient.addColorStop(1, 'rgba(180, 165, 140, 0)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(this.fulcrum.x, this.fulcrum.y - FULCRUM_SIZE * 0.5, glowRadius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // Draw beam (thick line, rotated)
        ctx.save();
        ctx.translate(this.beam.x, this.beam.y);
        ctx.rotate(this.beam.angle);

        ctx.strokeStyle = BEAM_COLOR;
        ctx.lineWidth = BEAM_THICKNESS;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-this.beam.width / 2, 0);
        ctx.lineTo(this.beam.width / 2, 0);
        ctx.stroke();

        ctx.restore();

        // Draw left pan
        this._drawPan(this.leftPan);

        // Draw right pan
        this._drawPan(this.rightPan);

        // Draw mass indicators near tray stones
        this.trayStones.forEach(stone => {
            if (stone._onPan === null) {
                this.renderer.drawCountIndicator(stone.mass, stone.x, stone.y + stone.radius + 15);
            }
        });

        // Draw all stones
        this.stones.forEach(stone => stone.draw(ctx));

        // Draw weight totals under each pan
        const leftTotal = this.leftPan.stones.reduce((sum, s) => sum + s.mass, 0);
        const rightTotal = this.rightPan.stones.reduce((sum, s) => sum + s.mass, 0);

        if (leftTotal > 0) {
            this.renderer.drawCountIndicator(leftTotal, this.leftPan.x, this.leftPan.y + PAN_RADIUS + 25);
        }
        if (rightTotal > 0) {
            this.renderer.drawCountIndicator(rightTotal, this.rightPan.x, this.rightPan.y + PAN_RADIUS + 25);
        }
    }

    _drawPan(pan) {
        const ctx = this.ctx;
        ctx.save();

        // Pan circle (dish)
        ctx.fillStyle = PAN_COLOR;
        ctx.strokeStyle = PAN_BORDER_COLOR;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(pan.x, pan.y, PAN_RADIUS, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Connection line from beam to pan
        ctx.strokeStyle = BEAM_COLOR;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(pan.x, pan.y - PAN_RADIUS);
        ctx.lineTo(pan.x, this.beam.y + (pan.y > this.beam.y ? 0 : 0));
        ctx.stroke();

        ctx.restore();
    }

    onPointerDown(x, y) {
        const stone = this.findStoneAtPosition(x, y);
        if (stone) {
            if (stone.startDrag()) {
                this.moveStoneToTop(stone);

                // Remove from pan if on one
                if (stone._onPan === 'left') {
                    const idx = this.leftPan.stones.indexOf(stone);
                    if (idx > -1) this.leftPan.stones.splice(idx, 1);
                    stone._onPan = null;
                } else if (stone._onPan === 'right') {
                    const idx = this.rightPan.stones.indexOf(stone);
                    if (idx > -1) this.rightPan.stones.splice(idx, 1);
                    stone._onPan = null;
                }

                return stone;
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

        // Check if dropped on left pan
        if (this._isOnLeftPan(x, y)) {
            draggedStone._onPan = 'left';
            this.leftPan.stones.push(draggedStone);
            this._positionStonesOnPan(this.leftPan);
            return;
        }

        // Check if dropped on right pan
        if (this._isOnRightPan(x, y)) {
            draggedStone._onPan = 'right';
            this.rightPan.stones.push(draggedStone);
            this._positionStonesOnPan(this.rightPan);
            return;
        }

        // Otherwise, return to tray position
        draggedStone._onPan = null;
        draggedStone.setTarget(draggedStone._trayX, draggedStone._trayY);
    }

    cleanup() {
        super.cleanup();
        this.leftPan.stones = [];
        this.rightPan.stones = [];
        this.trayStones = [];
        this.isBalanced = false;
        this.balanceGlowTime = 0;
        this.nextStoneId = 0;
    }

    static getMetadata() {
        return {
            id: 'balance-scale',
            name: 'Balance',
            icon: '⚖️',
            description: 'Balance and equality'
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BalanceScaleMode };
}
