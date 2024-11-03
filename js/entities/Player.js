export class Player {
    constructor() {
        this.x = 5;
        this.y = 5;
        this.emoji = '🧙‍♂️';
        this.moveSpeed = 0.1; // Tiles per millisecond
        this.lastMove = 0;
        this.moveDelay = 200; // Milliseconds between moves
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
}
