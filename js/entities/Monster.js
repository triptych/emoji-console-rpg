export class Monster {
    constructor(x, y, emoji = '👾', name = 'Wild Monster', level = 1, hp = 10, maxHp = 10) {
        this.x = x;
        this.y = y;
        this.emoji = emoji;
        this.name = name;
        this.level = level;
        this.hp = hp;
        this.maxHp = maxHp;
        this.moveTimer = 0;
        this.moveInterval = 1000; // Move every 1 second
        this.directions = [
            { dx: 0, dy: -1 }, // up
            { dx: 1, dy: 0 },  // right
            { dx: 0, dy: 1 },  // down
            { dx: -1, dy: 0 }  // left
        ];

        // Animation properties
        this.shakeOffset = { x: 0, y: 0 };
        this.shakeAmount = 3;
        this.shakeDuration = 200; // milliseconds
        this.shakeTimer = 0;
        this.isShaking = false;
    }

    update(deltaTime, mapManager) {
        this.moveTimer += deltaTime;
        if (this.moveTimer >= this.moveInterval) {
            this.moveTimer = 0;
            this.moveRandomly(mapManager);
        }

        // Update shake animation
        this.updateAnimation(deltaTime);
    }

    updateAnimation(deltaTime) {
        if (this.isShaking) {
            this.shakeTimer += deltaTime;

            if (this.shakeTimer < this.shakeDuration) {
                // Calculate shake offset using sine waves for a smooth shake effect
                const progress = this.shakeTimer / this.shakeDuration;
                const shake = Math.sin(progress * Math.PI * 4) * this.shakeAmount * (1 - progress);
                this.shakeOffset.x = shake;
                this.shakeOffset.y = shake * 0.5;
            } else {
                // Reset shake
                this.isShaking = false;
                this.shakeTimer = 0;
                this.shakeOffset.x = 0;
                this.shakeOffset.y = 0;
            }
        }
    }

    startShake() {
        this.isShaking = true;
        this.shakeTimer = 0;
    }

    moveRandomly(mapManager) {
        const direction = this.directions[Math.floor(Math.random() * this.directions.length)];
        const newX = this.x + direction.dx;
        const newY = this.y + direction.dy;

        // Check collision at the new position
        if (!mapManager.isCollision(newX * 16, newY * 16)) {
            this.x = newX;
            this.y = newY;
        }
    }

    render(renderer) {
        renderer.drawText(this.emoji, this.x * 16, this.y * 16 + 12, 16);
    }

    getBattleStats() {
        return {
            emoji: this.emoji,
            name: this.name,
            level: this.level,
            hp: this.hp,
            maxHp: this.maxHp
        };
    }
}
