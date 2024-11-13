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
        const playerX = Math.floor(window.game.player.x);
        const playerY = Math.floor(window.game.player.y);
        const currentTile = this.rooms[this.currentRoom][playerY][playerX];

        console.log('MapManager update:', {
            playerX,
            playerY,
            currentTile,
            currentRoom: this.currentRoom
        });

        // Handle transitions based on current room and position
        if (this.currentRoom === 0) {
            // From starting room to village (right)
            if (playerX >= 8 && currentTile === '→') {  // Changed from 9 to 8
                console.log('Transitioning: Starting room -> Village');
                window.game.player.x = 1;
                this.currentRoom = 1;
            }
        }
        else if (this.currentRoom === 1) {
            // From village to starting room (left)
            if (playerX <= 0 && currentTile === '←') {
                console.log('Transitioning: Village -> Starting room');
                window.game.player.x = 8;  // Changed from 8 to match right transition
                this.currentRoom = 0;
            }
            // From village to lake (down)
            else if (playerY >= 8 && currentTile === '⬇') {  // Changed from 9 to 8
                console.log('Transitioning: Village -> Lake');
                window.game.player.y = 1;
                this.currentRoom = 2;
            }
        }
        else if (this.currentRoom === 2) {
            // From lake to village (up)
            if (playerY <= 0 && currentTile === '⬆') {
                console.log('Transitioning: Lake -> Village');
                window.game.player.y = 8;  // Changed to match down transition
                this.currentRoom = 1;
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

        console.log('Getting tile at:', {
            rawX: x,
            rawY: y,
            tileX,
            tileY,
            currentRoom: this.currentRoom
        });

        // Ensure we're within bounds
        if (tileX >= 0 && tileX < 10 && tileY >= 0 && tileY < 10) {
            const tile = this.rooms[this.currentRoom][tileY][tileX];
            console.log('Found tile:', tile);
            return tile;
        }

        console.log('Out of bounds, returning tree');
        return '🌲';
    }

    isCollision(x, y) {
        const tile = this.getTile(x, y);
        // Don't treat transition tiles as collisions
        const transitionTiles = ['→', '←', '⬆', '⬇'];
        if (transitionTiles.includes(tile)) {
            return false;
        }
        const solidTiles = ['🌲', '🪨', '🏠', '⛲'];
        const isBlocked = solidTiles.includes(tile);
        console.log('Collision check:', { x, y, tile, isBlocked });
        return isBlocked;
    }
}
