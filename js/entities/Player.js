export class Player {
    constructor() {
        this.x = 5;
        this.y = 5;
        this.emoji = '🧙‍♂️';
        this.moveSpeed = 0.1; // Tiles per millisecond
        this.lastMove = 0;
        this.moveDelay = 200; // Milliseconds between moves

        // Initialize player stats
        this.stats = {
            hp: 20,
            maxHp: 20,
            mp: 10,
            maxMp: 10,
            level: 1,
            exp: 0
        };

        // Initialize spells
        this.spells = [
            { name: '🔥 Fire', mpCost: 3, damage: 5 },
            { name: '❄️ Ice', mpCost: 4, damage: 6 },
            { name: '💚 Heal', mpCost: 5, healing: 8 }
        ];
    }

    update = (deltaTime, input) => {
        const currentTime = performance.now();
        if (currentTime - this.lastMove > this.moveDelay) {
            let newX = this.x;
            let newY = this.y;

            if (input.up) newY--;
            if (input.down) newY++;
            if (input.left) newX--;
            if (input.right) newX++;

            // Collision checking would go here
            this.x = newX;
            this.y = newY;

            if (input.up || input.down || input.left || input.right) {
                this.lastMove = currentTime;
            }
        }
    }

    render = (renderer) => {
        renderer.drawCharacter(this.emoji, this.x * 16, this.y * 16);
    }

    takeDamage(amount) {
        this.stats.hp = Math.max(0, this.stats.hp - amount);
        return this.stats.hp > 0;
    }

    heal(amount) {
        this.stats.hp = Math.min(this.stats.maxHp, this.stats.hp + amount);
    }

    useMp(amount) {
        if (this.stats.mp >= amount) {
            this.stats.mp -= amount;
            return true;
        }
        return false;
    }

    restoreMp(amount) {
        this.stats.mp = Math.min(this.stats.maxMp, this.stats.mp + amount);
    }
}
