export class Renderer {
    constructor(ctx) {
        if (!ctx) {
            throw new Error('Canvas context is required for Renderer');
        }
        this.ctx = ctx;
    }

    drawTile = (emoji, x, y, size = 16) => {
        try {
            this.ctx.font = `${size}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(emoji, x + size/2, y + size/2);
        } catch (error) {
            console.error('Error drawing tile:', error);
        }
    }

    drawCharacter = (emoji, x, y, size = 16) => {
        try {
            this.drawTile(emoji, x, y, size);
        } catch (error) {
            console.error('Error drawing character:', error);
        }
    }

    drawText = (text, x, y, size = 8) => {
        try {
            const currentFillStyle = this.ctx.fillStyle;
            this.ctx.font = `${size}px Arial`;
            // Keep the current fillStyle (color) that was set before calling drawText
            this.ctx.textAlign = 'left';
            this.ctx.textBaseline = 'top';
            this.ctx.fillText(text, x, y);
        } catch (error) {
            console.error('Error drawing text:', error);
        }
    }

    clear = () => {
        try {
            this.ctx.clearRect(0, 0, 160, 144);
        } catch (error) {
            console.error('Error clearing canvas:', error);
        }
    }
}
