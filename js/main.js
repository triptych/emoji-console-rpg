import { GameState } from './state/GameState.js';
import { Renderer } from './graphics/Renderer.js';
import { InputHandler } from './input/InputHandler.js';
import { MapManager } from './world/MapManager.js';
import { Player } from './entities/Player.js';
import { BattleSystem } from './battle/BattleSystem.js';
import { Monster } from './entities/Monster.js';

class Game {
    constructor() {
        console.log('Game initializing...');
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

        // Initialize monsters
        this.monsters = [
            new Monster(5, 5, '👻', 'Ghost', 2, 15, 15),
            new Monster(8, 3, '🐉', 'Dragon', 3, 20, 20),
            new Monster(3, 7, '🧟', 'Zombie', 1, 10, 10)
        ];

        this.lastTime = 0;

        // Ensure canvas has focus for keyboard input
        this.canvas.tabIndex = 1;
        this.canvas.focus();
        this.canvas.addEventListener('click', () => {
            console.log('Canvas clicked, focusing...');
            this.canvas.focus();
        });

        this.init();
    }

    setupCanvas = () => {
        this.canvas.width = 160;
        this.canvas.height = 144;
        this.ctx.imageSmoothingEnabled = false;
    }

    init = () => {
        console.log('Game initialized, starting game loop');
        this.gameLoop();
    }

    checkMonsterCollision = () => {
        for (let monster of this.monsters) {
            if (monster.x === this.player.x && monster.y === this.player.y) {
                console.log('Monster collision!');
                this.gameState.setState('BATTLE');
                this.battleSystem.startBattle(monster.getBattleStats());
                // Remove the monster after starting battle
                this.monsters = this.monsters.filter(m => m !== monster);
                return true;
            }
        }
        return false;
    }

    update = (deltaTime) => {
        const input = this.input.getInput();

        switch(this.gameState.currentState) {
            case 'SPLASH':
                this.gameState.splashAnimationFrame++;
                if (input.aPressed || input.startPressed) {
                    console.log('Input detected on splash screen, transitioning to EXPLORING');
                    if (this.gameState.hasSaveGame) {
                        this.gameState.loadGame();
                    }
                    this.gameState.setState('EXPLORING');
                }
                break;

            case 'EXPLORING':
                if (input.startPressed) {
                    console.log('Opening menu');
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

                // Update monsters
                for (let monster of this.monsters) {
                    monster.update(deltaTime, this.mapManager);
                }

                if (oldX !== this.player.x || oldY !== this.player.y) {
                    this.checkMonsterCollision();
                }

                this.mapManager.update(deltaTime);
                break;

            case 'BATTLE':
                this.battleSystem.update(deltaTime, input, this.gameState);
                if (!this.battleSystem.inBattle) {
                    console.log('Battle ended, returning to exploration');
                    this.gameState.setState('EXPLORING');
                    // Spawn a new monster to replace the defeated one
                    if (this.monsters.length < 3) {
                        const positions = [
                            {x: 5, y: 5}, {x: 8, y: 3}, {x: 3, y: 7},
                            {x: 6, y: 4}, {x: 4, y: 6}, {x: 7, y: 5}
                        ];
                        const monsterTypes = [
                            {emoji: '👻', name: 'Ghost', level: 2},
                            {emoji: '🐉', name: 'Dragon', level: 3},
                            {emoji: '🧟', name: 'Zombie', level: 1},
                            {emoji: '🦇', name: 'Bat', level: 1},
                            {emoji: '🐺', name: 'Wolf', level: 2}
                        ];

                        // Find a position that's not occupied by other monsters or the player
                        const validPositions = positions.filter(pos => {
                            return !this.monsters.some(m => m.x === pos.x && m.y === pos.y) &&
                                   !(this.player.x === pos.x && this.player.y === pos.y);
                        });

                        if (validPositions.length > 0) {
                            const pos = validPositions[Math.floor(Math.random() * validPositions.length)];
                            const type = monsterTypes[Math.floor(Math.random() * monsterTypes.length)];
                            const hp = 10 + (type.level * 5);
                            this.monsters.push(new Monster(pos.x, pos.y, type.emoji, type.name, type.level, hp, hp));
                        }
                    }
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
                    console.log('Executing menu option:', this.gameState.menuOptions[this.gameState.selectedMenuOption]);
                    this.gameState.executeMenuOption();
                }
                if (input.bPressed) {
                    console.log('Closing menu');
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

            // Show "Continue" text if save exists
            if (this.gameState.hasSaveGame) {
                ctx.fillText('(SAVE DATA EXISTS)', this.canvas.width / 2, 110);
            }
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
                // Render monsters
                for (let monster of this.monsters) {
                    monster.render(this.renderer);
                }
                this.player.render(this.renderer);
                break;

            case 'BATTLE':
                this.battleSystem.render(this.renderer);
                break;

            case 'MENU':
                // Render the game world behind the menu
                this.mapManager.render(this.renderer);
                for (let monster of this.monsters) {
                    monster.render(this.renderer);
                }
                this.player.render(this.renderer);

                // Render semi-transparent menu background with larger size
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
                this.ctx.fillRect(5, 5, 150, 100);

                // Add menu border
                this.ctx.strokeStyle = '#ffffff';
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(5, 5, 150, 100);

                // Render menu options with better spacing and contrast
                this.gameState.menuOptions.forEach((option, index) => {
                    const isSelected = index === this.gameState.selectedMenuOption;

                    // Draw selection highlight
                    if (isSelected) {
                        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
                        this.ctx.fillRect(10, 10 + (index * 20), 140, 18);
                    }

                    // Draw text with shadow for better readability
                    this.ctx.fillStyle = '#000000';
                    this.renderer.drawText(
                        `${isSelected ? '▶️ ' : '  '}${option}`,
                        11,
                        25 + (index * 20),
                        12
                    );
                    this.ctx.fillStyle = '#ffffff';
                    this.renderer.drawText(
                        `${isSelected ? '▶️ ' : '  '}${option}`,
                        10,
                        24 + (index * 20),
                        12
                    );
                });

                // Render controls hint at the bottom
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
                this.ctx.fillRect(5, 110, 150, 20);
                this.ctx.strokeRect(5, 110, 150, 20);

                this.ctx.fillStyle = '#ffffff';
                this.renderer.drawText('🅰️:Select 🅱️:Back', 10, 124, 10);
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
    console.log('Window loaded, creating game instance');
    new Game();
});
