import { dungeonLevels } from './levels/dungeon.js';

export class MapManager {
    constructor() {
        this.levels = dungeonLevels;
        this.currentRoom = 0;
        this.currentLevel = this.levels[this.currentRoom];
        this.tileSize = 16;
        this.rooms = this.levels.map(level => level.map);
    }

    getCurrentLevel() {
        return this.levels[this.currentRoom];
    }

    isCollision(x, y) {
        const gridX = Math.floor(x / this.tileSize);
        const gridY = Math.floor(y / this.tileSize);
        return this.isWall(gridX, gridY);
    }

    isWall(x, y) {
        const level = this.getCurrentLevel();
        if (!level.map[y] || !level.map[y][x]) return true;
        const tile = level.map[y][x];
        return tile === '⬛' || tile === '🌳' || tile === '🌲';
    }

    isExit(x, y) {
        const level = this.getCurrentLevel();
        return level.exits.some(exit => exit.x === x && exit.y === y);
    }

    getExitDestination(x, y) {
        const level = this.getCurrentLevel();
        const exit = level.exits.find(exit => exit.x === x && exit.y === y);
        return exit ? exit.toRoom : null;
    }

    changeRoom(newRoom) {
        if (newRoom >= 0 && newRoom < this.levels.length) {
            this.currentRoom = newRoom;
            this.currentLevel = this.levels[this.currentRoom];
            return true;
        }
        return false;
    }

    update(deltaTime) {
        const player = window.game.player;
        if (this.isExit(Math.floor(player.x), Math.floor(player.y))) {
            const newRoom = this.getExitDestination(Math.floor(player.x), Math.floor(player.y));
            if (newRoom !== null) {
                this.changeRoom(newRoom);
                // Adjust player position based on exit location
                const currentLevel = this.getCurrentLevel();
                const entranceExit = currentLevel.exits.find(exit => exit.toRoom === this.currentRoom);
                if (entranceExit) {
                    player.x = entranceExit.x;
                    player.y = entranceExit.y - 1; // Move player one tile away from the entrance
                }
            }
        }
    }

    render(renderer) {
        const level = this.getCurrentLevel();

        // Draw the map
        level.map.forEach((row, y) => {
            [...row].forEach((tile, x) => {
                if (tile !== '⬜') {
                    renderer.ctx.font = '16px serif';
                    renderer.ctx.textAlign = 'center';
                    renderer.ctx.fillText(
                        tile,
                        x * this.tileSize + this.tileSize/2,
                        y * this.tileSize + this.tileSize
                    );
                }
            });
        });

        // Draw room name
        renderer.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        renderer.ctx.fillRect(0, 0, 160, 16);
        renderer.ctx.fillStyle = '#ffffff';
        renderer.ctx.font = '10px monospace';
        renderer.ctx.textAlign = 'center';
        renderer.ctx.fillText(level.name, 80, 12);
    }
}
