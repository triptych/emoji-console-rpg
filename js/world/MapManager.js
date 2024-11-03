export class MapManager {
    constructor() {
        this.map = [
            ['🌳', '🌳', '🌳', '🌳', '🌳', '🌳', '🌳', '🌳', '🌳', '🌳'],
            ['🌳', '⬜', '⬜', '🌱', '🌱', '🌱', '⬜', '⬜', '⬜', '🌳'],
            ['🌳', '⬜', '⬜', '🌱', '🌱', '🌱', '⬜', '⬜', '⬜', '🌳'],
            ['🌳', '🌱', '🌱', '🌱', '🌱', '🌱', '🌱', '🌱', '🌱', '🌳'],
            ['🌳', '🌱', '🌱', '🌱', '🌱', '🌱', '🌱', '🌱', '🌱', '🌳'],
            ['🌳', '🌱', '🌱', '🌱', '🌱', '🌱', '🌱', '🌱', '🌱', '🌳'],
            ['🌳', '⬜', '⬜', '🌱', '🌱', '🌱', '⬜', '⬜', '⬜', '🌳'],
            ['🌳', '⬜', '⬜', '🌱', '🌱', '🌱', '⬜', '⬜', '⬜', '🌳'],
            ['🌳', '⬜', '⬜', '🌱', '🌱', '🌱', '⬜', '⬜', '⬜', '🌳'],
            ['🌳', '🌳', '🌳', '🌳', '🌳', '🌳', '🌳', '🌳', '🌳', '🌳']
        ];
    }

    update(deltaTime) {
        // No update logic needed for static map
    }

    render(renderer) {
        this.map.forEach((row, y) => {
            row.forEach((tile, x) => {
                renderer.drawTile(tile, x, y);
            });
        });
    }

    getTile(x, y) {
        const tileX = Math.floor(x / 16);
        const tileY = Math.floor(y / 16);
        if (tileX >= 0 && tileX < this.map[0].length && tileY >= 0 && tileY < this.map.length) {
            return this.map[tileY][tileX];
        }
        return '🌳'; // Return wall tile for out of bounds
    }

    isCollision(x, y) {
        const tile = this.getTile(x, y);
        return tile === '🌳'; // Trees are solid
    }
}
