export class MapManager {
    constructor() {
        this.currentRoom = 0;
        this.rooms = [
            // Starting room (forest clearing)
            [
                ['🌲', '🌲', '🌲', '🌲', '🌲', '🌲', '🌲', '🌲', '🌲', '🌲'],
                ['🌲', '🌾', '🌾', '🌺', '🌾', '🌾', '🌺', '🌾', '🌾', '🌲'],
                ['🌲', '🌾', '🪨', '🌾', '🌾', '🌾', '🌾', '🪨', '🌾', '🌲'],
                ['🌲', '🌺', '🌾', '🌾', '🌾', '🌾', '🌾', '🌾', '🌺', '→'],
                ['🌲', '🌾', '🌾', '🌾', '🪨', '🌾', '🌾', '🌾', '🌾', '→'],
                ['🌲', '🌾', '🌾', '🌾', '🌾', '🌾', '🌾', '🌾', '🌾', '→'],
                ['🌲', '🌺', '🪨', '🌾', '🌾', '🌾', '🌾', '🪨', '🌺', '🌲'],
                ['🌲', '🌾', '🌾', '🌾', '🌾', '🌾', '🌾', '🌾', '🌾', '🌲'],
                ['🌲', '🌾', '🌾', '🌺', '🌾', '🌾', '🌺', '🌾', '🌾', '🌲'],
                ['🌲', '🌲', '🌲', '🌲', '🌲', '🌲', '🌲', '🌲', '🌲', '🌲']
            ],
            // Village area
            [
                ['🌲', '🌲', '🌲', '🌲', '🌲', '🌲', '🌲', '🌲', '🌲', '🌲'],
                ['←', '🌾', '🌾', '🏠', '🌾', '🌾', '🏠', '🌾', '🌾', '→'],
                ['←', '🌾', '🌺', '🌾', '🌾', '🌾', '🌾', '🌺', '🌾', '→'],
                ['←', '🌾', '🌾', '🌾', '🌾', '🌾', '🌾', '🌾', '🌾', '→'],
                ['🌲', '🌾', '🏠', '🌾', '⛲', '🌾', '🌾', '🏠', '🌾', '🌲'],
                ['🌲', '🌾', '🌾', '🌾', '🌾', '🌾', '🌾', '🌾', '🌾', '🌲'],
                ['🌲', '🌾', '🌺', '🌾', '🌾', '🌾', '🌾', '🌺', '🌾', '🌲'],
                ['🌲', '🌾', '🌾', '🏠', '🌾', '🌾', '🏠', '🌾', '🌾', '🌲'],
                ['🌲', '🌾', '🌾', '🌾', '🌾', '🌾', '🌾', '🌾', '🌾', '🌲'],
                ['🌲', '🌲', '🌲', '🌲', '⬇', '⬇', '🌲', '🌲', '🌲', '🌲']
            ],
            // Lake area
            [
                ['🌲', '🌲', '🌲', '🌲', '⬆', '⬆', '🌲', '🌲', '🌲', '🌲'],
                ['🌲', '🌾', '🌾', '💧', '💧', '💧', '💧', '🌾', '🌾', '🌲'],
                ['🌲', '🌾', '💧', '💧', '💧', '💧', '💧', '💧', '🌾', '🌲'],
                ['🌲', '💧', '💧', '💧', '🛶', '💧', '💧', '💧', '💧', '🌲'],
                ['🌲', '💧', '💧', '🛶', '💧', '💧', '🛶', '💧', '💧', '🌲'],
                ['🌲', '💧', '💧', '💧', '💧', '🛶', '💧', '💧', '💧', '🌲'],
                ['🌲', '🌾', '💧', '💧', '💧', '💧', '💧', '💧', '🌾', '🌲'],
                ['🌲', '🌾', '🌾', '💧', '💧', '💧', '💧', '🌾', '🌾', '🌲'],
                ['🌲', '🌺', '🌾', '🌾', '🌾', '🌾', '🌾', '🌾', '🌺', '🌲'],
                ['🌲', '🌲', '🌲', '🌲', '🌲', '🌲', '🌲', '🌲', '🌲', '🌲']
            ]
        ];
    }

    update(deltaTime) {
        // Check for room transitions
        const playerX = Math.floor(window.game.player.x);
        const playerY = Math.floor(window.game.player.y);

        // Right edge transition
        if (playerX >= 9 && this.getTile(playerX * 16, playerY * 16) === '→') {
            if (this.currentRoom < this.rooms.length - 1) {
                window.game.player.x = 1;
                this.currentRoom++;
            }
        }
        // Left edge transition
        else if (playerX <= 0 && this.getTile(playerX * 16, playerY * 16) === '←') {
            if (this.currentRoom > 0) {
                window.game.player.x = 8;
                this.currentRoom--;
            }
        }
        // Down edge transition
        else if (playerY >= 9 && this.getTile(playerX * 16, playerY * 16) === '⬇') {
            if (this.currentRoom < this.rooms.length - 1) {
                window.game.player.y = 1;
                this.currentRoom++;
            }
        }
        // Up edge transition
        else if (playerY <= 0 && this.getTile(playerX * 16, playerY * 16) === '⬆') {
            if (this.currentRoom > 0) {
                window.game.player.y = 8;
                this.currentRoom--;
            }
        }
    }

    render(renderer) {
        const currentMap = this.rooms[this.currentRoom];
        currentMap.forEach((row, y) => {
            row.forEach((tile, x) => {
                renderer.drawTile(tile, x, y);
            });
        });
    }

    getTile(x, y) {
        const tileX = Math.floor(x / 16);
        const tileY = Math.floor(y / 16);
        const currentMap = this.rooms[this.currentRoom];
        if (tileX >= 0 && tileX < currentMap[0].length && tileY >= 0 && tileY < currentMap.length) {
            return currentMap[tileY][tileX];
        }
        return '🌲'; // Return tree tile for out of bounds
    }

    isCollision(x, y) {
        const tile = this.getTile(x, y);
        // Define which tiles are solid/impassable - removed '💧' from the list
        const solidTiles = ['🌲', '🪨', '🏠', '⛲'];
        return solidTiles.includes(tile);
    }
}
