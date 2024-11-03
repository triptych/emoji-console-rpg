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
    }

    update(deltaTime, mapManager) {
        this.moveTimer += deltaTime;
        if (this.moveTimer >= this.moveInterval) {
            this.moveTimer = 0;
            this.moveRandomly(mapManager);
        }
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
