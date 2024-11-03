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
        this.renderer.setGameState(this.gameState);
        this.input = new InputHandler();
        this.mapManager = new MapManager();
        this.player = new Player();
        this.battleSystem = new BattleSystem();

        this.lastTime = 0;
        this.battleChance = 0.1; // 10% chance of battle when walking on grass

        // Ensure canvas has focus for keyboard input
        this.canvas.tabIndex = 1;
        this.canvas.focus();
        this.canvas.addEventListener('click', () => this.canvas.focus());

        // Load saved game if exists
        if (this.gameState.loadGame()) {
            this.gameState.setState('EXPLORING');
        }

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

        switch(this.gameState.currentState) {
            case 'SPLASH':
                this.gameState.splashAnimationFrame++;
                if (input.aPressed || input.startPressed) {
                    console.log('Starting game...');
                    this.gameState.setState('EXPLORING');
                }
                break;

            case 'EXPLORING':
                if (input.startPressed) {
                    this.gameState.toggleMenu();
                    break;
                }

                const oldX = this.player.x;
                const oldY = this.player.y;

                this.player.update(deltaTime, input);

                if (this.mapManager.isCollision(this.player.x * 16, this.player.y * 16)) {
                    this.player.x = oldX;
                    this.player.y = oldY;
                }

                if (oldX !== this.player.x || oldY !== this.player.y) {
                    this.checkBattleTrigger();
                }

                this.mapManager.update(deltaTime);
                break;

            case 'BATTLE':
                this.battleSystem.update(deltaTime, input, this.gameState);
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

    renderSplashScreen = () => {
        const ctx = this.ctx;
        ctx.fillStyle = '#9bbc0f';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Calculate animation progress (0 to 1)
        const progress = Math.min(1, (Date.now() - this.gameState.splashStartTime) / 2000);

        // Animated title
        ctx.fillStyle = '#0f380f';
        ctx.font = '16px monospace';
        ctx.textAlign = 'center';

        // Apply bounce effect
        const bounce = Math.sin(progress * Math.PI) * (1 - progress) * 10;
        const y = 50 + bounce;

        ctx.fillText('Emoji Game', this.canvas.width / 2, y);
        ctx.fillText('System', this.canvas.width / 2, y + 20);

        // Fade in press start text
        if (progress > 0.5) {
            const alpha = Math.min(1, (progress - 0.5) * 2);
            ctx.fillStyle = `rgba(15, 56, 15, ${alpha})`;
            ctx.font = '8px monospace';
            ctx.fillText('PRESS START', this.canvas.width / 2, 100);
        }

        // Draw decorative emoji
        const emoji = ['🎮', '🎲', '🎯', '🎪'];
        emoji.forEach((e, i) => {
            const angle = (progress * Math.PI * 2) + (i * Math.PI / 2);
            const x = this.canvas.width / 2 + Math.cos(angle) * 40;
            const y = 72 + Math.sin(angle) * 20;
            ctx.font = '16px serif';
            ctx.fillText(e, x, y);
        });
    }

    render = () => {
        this.ctx.fillStyle = '#9bbc0f';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        switch(this.gameState.currentState) {
            case 'SPLASH':
                this.renderSplashScreen();
                break;

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
