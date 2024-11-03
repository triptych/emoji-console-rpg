import { GameState } from './state/GameState.js';
import { Renderer } from './graphics/Renderer.js';
import { InputHandler } from './input/InputHandler.js';
import { MapManager } from './world/MapManager.js';
import { Player } from './entities/Player.js';
import { BattleSystem } from './battle/BattleSystem.js';

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.setupCanvas();

        this.gameState = new GameState();
        this.renderer = new Renderer(this.ctx);
        this.input = new InputHandler();
        this.mapManager = new MapManager();
        this.player = new Player();
        this.battleSystem = new BattleSystem();

        this.lastTime = 0;
        this.battleChance = 0.1; // 10% chance of battle when walking on grass
        this.init();
    }

    setupCanvas = () => {
        this.canvas.width = 160;
        this.canvas.height = 144;
        this.ctx.imageSmoothingEnabled = false;
    }

    init = () => {
        this.gameLoop();
    }

    checkBattleTrigger = () => {
        const currentTile = this.mapManager.getTile(this.player.x, this.player.y);
        if (currentTile === '🌱' && Math.random() < this.battleChance) {
            this.gameState.setState('BATTLE');
            this.battleSystem.startBattle({
                emoji: '👾',
                name: 'Wild Monster',
                level: 1,
                hp: 10,
                maxHp: 10
            });
        }
    }

    update = (deltaTime) => {
        const input = this.input.getInput();

        // Handle START button for menu - only toggle on button press, not hold
        if (input.startPressed) {
            this.gameState.toggleMenu();
        }

        switch(this.gameState.currentState) {
            case 'EXPLORING':
                const oldX = this.player.x;
                const oldY = this.player.y;

                this.player.update(deltaTime, input);

                // Check collision after movement
                if (this.mapManager.isCollision(this.player.x, this.player.y)) {
                    this.player.x = oldX;
                    this.player.y = oldY;
                }

                // Check for battle trigger if position changed
                if (oldX !== this.player.x || oldY !== this.player.y) {
                    this.checkBattleTrigger();
                }

                this.mapManager.update(deltaTime);
                break;

            case 'BATTLE':
                this.battleSystem.update(deltaTime, input);
                if (!this.battleSystem.inBattle) {
                    this.gameState.setState('EXPLORING');
                }
                break;

            case 'MENU':
                if (input.up) {
                    this.gameState.selectPreviousMenuOption();
                }
                if (input.down) {
                    this.gameState.selectNextMenuOption();
                }
                if (input.aPressed) {
                    this.gameState.executeMenuOption();
                }
                if (input.bPressed) {
                    this.gameState.toggleMenu();
                }
                break;
        }
    }

    render = () => {
        this.ctx.fillStyle = '#9bbc0f';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        switch(this.gameState.currentState) {
            case 'EXPLORING':
                this.mapManager.render(this.renderer);
                this.player.render(this.renderer);
                break;
            case 'BATTLE':
                this.battleSystem.render(this.renderer);
                break;
            case 'MENU':
                // Render the game world behind the menu
                this.mapManager.render(this.renderer);
                this.player.render(this.renderer);

                // Render semi-transparent menu background
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                this.ctx.fillRect(10, 10, 140, 80);

                // Render menu options
                this.gameState.menuOptions.forEach((option, index) => {
                    const isSelected = index === this.gameState.selectedMenuOption;
                    this.renderer.drawText(
                        `${isSelected ? '▶️ ' : '  '}${option}`,
                        20,
                        20 + (index * 15),
                        10
                    );
                });

                // Render controls hint
                this.renderer.drawText('🅰️:Select 🅱️:Back', 20, 120, 8);
                break;
        }
    }

    gameLoop = (currentTime = 0) => {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        this.update(deltaTime);
        this.render();

        requestAnimationFrame(this.gameLoop);
    }
}

window.addEventListener('load', () => {
    new Game();
});
