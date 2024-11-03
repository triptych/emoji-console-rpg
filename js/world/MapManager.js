export class MapManager {
    constructor() {
        this.currentMap = {
            tiles: [
                ['🌱', '🌱', '🌱', '🌳', '🌱', '🌱', '🌱', '🌱', '🌱', '🌱'],
                ['🌱', '🪨', '🌱', '🌱', '🌱', '🌱', '🌱', '🌱', '🌳', '🌱'],
                ['🌱', '🌱', '🌱', '🌱', '🏠', '🌱', '🌱', '🌱', '🌱', '🌱'],
                ['🌱', '🌱', '🌱', '🌱', '🌱', '🌱', '🌱', '🪨', '🌱', '🌱'],
                ['🌳', '🌱', '🌱', '🌱', '🌱', '🌱', '🌱', '🌱', '🌱', '🌱'],
                ['🌱', '🌱', '🪨', '🌱', '🌱', '🌱', '🌳', '🌱', '🌱', '🌱'],
                ['🌱', '🌱', '🌱', '🌱', '🌱', '🌱', '🌱', '🌱', '🌱', '🌱'],
                ['🌱', '🌳', '🌱', '🌱', '🌱', '🪨', '🌱', '🌱', '🌱', '🌱'],
                ['🌱', '🌱', '🌱', '🌱', '🌱', '🌱', '🌱', '🌱', '🌳', '🌱'],
                ['🌱', '🌱', '🌱', '🌳', '🌱', '🌱', '🌱', '🌱', '🌱', '🌱']
            ],
            collision: [
                '🌳', '🪨', '🏠'
            ]
        };
    }

    getTile = (x, y) => {
        if (y >= 0 && y < this.currentMap.tiles.length &&
            x >= 0 && x < this.currentMap.tiles[y].length) {
            return this.currentMap.tiles[y][x];
        }
        return null;
    }

    isCollision = (x, y) => {
        const tile = this.getTile(x, y);
        return tile && this.currentMap.collision.includes(tile);
    }

    update = (deltaTime) => {
        // Update map state if needed
    }

    render = (renderer) => {
        const tileSize = 16;
        this.currentMap.tiles.forEach((row, y) => {
            row.forEach((tile, x) => {
                renderer.drawTile(tile, x * tileSize, y * tileSize);
            });
        });
    }
}
