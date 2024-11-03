export class Renderer {
    constructor(ctx) {
        this.ctx = ctx;
        this.gameState = null; // Will be set by main game
        // Calculate offsets based on canvas dimensions (160x144)
        this.offsetX = (160 - (8 * 16)) / 2; // Assuming 8 tiles width
        this.offsetY = (144 - (8 * 16)) / 2; // Assuming 8 tiles height
    }

    setGameState(gameState) {
        this.gameState = gameState;
    }

    drawCharacter(emoji, x, y, size = 16) {
        this.ctx.font = `${size}px serif`;
        this.ctx.fillText(emoji, x + this.offsetX, y + this.offsetY);
    }

    drawTile(emoji, x, y, size = 16) {
        this.ctx.font = `${size}px serif`;
        this.ctx.fillText(emoji, x * size + this.offsetX, y * size + this.offsetY);
    }

    drawText(text, x, y, size = 16) {
        this.ctx.font = `${size}px monospace`;
        this.ctx.fillText(text, x, y);
    }

    drawStats(x, y) {
        if (!this.gameState) return;

        const stats = this.gameState.player.stats;
        this.ctx.fillStyle = '#ffffff';
        this.drawText(`HP: ${stats.hp}/${stats.maxHp}`, x, y, 8);
        this.drawText(`MP: ${stats.mp}/${stats.maxMp}`, x, y + 10, 8);
    }
}
