import { GameState } from './state/GameState.js';
import { Renderer } from './graphics/Renderer.js';
import { InputHandler } from './input/InputHandler.js';
import { MapManager } from './world/MapManager.js';
import { Player } from './entities/Player.js';
import { BattleSystem } from './battle/BattleSystem.js';
import { Monster } from './entities/Monster.js';
import { AudioManager } from './audio/AudioManager.js';

class Game {
    constructor() {
        console.log('Game initializing...');
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.setupCanvas();

        // Make game instance globally available for MapManager
        window.game = this;

        // Initialize player first
        this.player = new Player();

        // Initialize core game systems
        this.gameState = new GameState();
        this.gameState.setPlayer(this.player);

        this.renderer = new Renderer(this.ctx);
        this.renderer.setGameState(this.gameState);
        this.input = new InputHandler();
        this.mapManager = new MapManager();
        this.battleSystem = new BattleSystem();
        this.audioManager = new AudioManager();
        this.audioInitialized = false;

        // Initialize monsters with room assignments
        this.monsters = [
            new Monster(5, 5, '👻', 'Ghost', 2, 15, 15, 0),
            new Monster(8, 3, '🐉', 'Dragon', 3, 20, 20, 1),
            new Monster(3, 7, '🧟', 'Zombie', 1, 10, 10, 2)
        ];

        this.lastTime = 0;

        // Ensure canvas has focus for keyboard input
        this.canvas.tabIndex = 1;
        this.canvas.focus();
        this.canvas.addEventListener('click', () => {
            console.log('Canvas clicked, focusing...');
            this.canvas.focus();
        });

        // Handle resize events
        window.addEventListener('resize', this.setupCanvas);

        // Add click handler for audio initialization
        document.addEventListener('click', async () => {
            if (!this.audioInitialized) {
                try {
                    console.log('Attempting to initialize audio system...');
                    await this.audioManager.initialize();
                    this.audioInitialized = true;
                    console.log('Audio system initialized successfully');
                } catch (error) {
                    console.error('Failed to initialize audio system:', error);
                }
            }
        });

        this.init();
    }

    setupCanvas = () => {
        const baseWidth = 160;
        const baseHeight = 144;
        const dpr = window.devicePixelRatio || 1;
        const scale = 3;

        this.canvas.width = baseWidth * scale * dpr;
        this.canvas.height = baseHeight * scale * dpr;
        this.ctx.scale(scale * dpr, scale * dpr);
        this.ctx.imageSmoothingEnabled = false;
    }

    init = () => {
        console.log('Game initialized, starting game loop');
        this.gameLoop();
    }

    checkNPCCollision = () => {
        for (let npc of this.gameState.npcs) {
            if (npc.isCollidingWith(this.player)) {
                this.gameState.showDialog(npc);
                return true;
            }
        }
        return false;
    }

    checkMonsterCollision = () => {
        const currentRoomMonsters = this.monsters.filter(m => m.room === this.mapManager.currentRoom);
        for (let monster of currentRoomMonsters) {
            if (monster.x === this.player.x && monster.y === this.player.y) {
                console.log('Monster collision!');
                this.gameState.setState('BATTLE');
                this.battleSystem.startBattle(monster.getBattleStats());
                this.monsters = this.monsters.filter(m => m !== monster);
                return true;
            }
        }
        return false;
    }

    handleMovement(input, deltaTime) {
        const oldX = this.player.x;
        const oldY = this.player.y;
        const oldRoom = this.mapManager.currentRoom;

        // Update player position
        this.player.update(deltaTime, input);

        // Get the current tile at player's position
        const currentTile = this.mapManager.rooms[this.mapManager.currentRoom][Math.floor(this.player.y)][Math.floor(this.player.x)];
        console.log('Current tile:', currentTile, 'at position:', this.player.x, this.player.y);

        // Check if we're on a transition tile
        const isTransitionTile = ['→', '←', '⬆', '⬇'].includes(currentTile);

        // If we're not on a transition tile and there's a collision, revert movement
        if (!isTransitionTile && this.mapManager.isCollision(this.player.x * 16, this.player.y * 16)) {
            console.log('Collision detected, reverting movement');
            this.player.x = oldX;
            this.player.y = oldY;
            return false;
        }

        // Handle room transitions
        this.mapManager.update(deltaTime);

        // If room changed, log the transition
        if (oldRoom !== this.mapManager.currentRoom) {
            console.log(`Room transition: ${oldRoom} -> ${this.mapManager.currentRoom}`);
            return true;
        }

        // Check for collisions with NPCs or monsters if position changed
        if (oldX !== this.player.x || oldY !== this.player.y) {
            if (!this.checkMonsterCollision()) {
                this.checkNPCCollision();
            }
            return true;
        }

        return false;
    }

    update = async (deltaTime) => {
        const input = this.input.getInput();

        switch(this.gameState.currentState) {
            case 'SPLASH':
                this.gameState.splashAnimationFrame++;
                if (input.aPressed || input.startPressed) {
                    console.log('Input detected on splash screen, transitioning to EXPLORING');
                    if (!this.audioInitialized) {
                        try {
                            await this.audioManager.initialize();
                            this.audioInitialized = true;
                        } catch (error) {
                            console.error('Audio initialization failed:', error);
                        }
                    }

                    try {
                        if (this.audioInitialized) {
                            await this.audioManager.playStartup();
                        }
                    } catch (error) {
                        console.error('Error playing startup sound:', error);
                    }

                    if (this.gameState.hasSaveGame) {
                        this.gameState.loadGame();
                    }
                    this.gameState.setState('EXPLORING');

                    try {
                        if (this.audioInitialized) {
                            await this.audioManager.playBgm();
                        }
                    } catch (error) {
                        console.error('Error playing background music:', error);
                    }
                }
                break;

            case 'EXPLORING':
                if (input.startPressed) {
                    console.log('Opening menu');
                    try {
                        if (this.audioInitialized) {
                            await this.audioManager.playSelect();
                        }
                    } catch (error) {
                        console.error('Error playing menu select sound:', error);
                    }
                    this.gameState.toggleMenu();
                    break;
                }

                this.handleMovement(input, deltaTime);

                // Update monsters in current room
                for (let monster of this.monsters) {
                    if (monster.room === this.mapManager.currentRoom) {
                        monster.update(deltaTime, this.mapManager);
                    }
                }
                break;

            case 'DIALOG':
                if (input.aPressed) {
                    const npc = this.gameState.currentDialog;
                    npc.nextDialogue();
                    if (npc.currentDialogueIndex === 0) {
                        this.gameState.closeDialog();
                    }
                }
                break;

            case 'BATTLE':
                const battleResult = this.battleSystem.update(deltaTime, input, this.gameState);
                if (battleResult && battleResult.hit) {
                    try {
                        if (this.audioInitialized) {
                            await this.audioManager.playDamage();
                        }
                    } catch (error) {
                        console.error('Error playing damage sound:', error);
                    }
                }
                if (!this.battleSystem.inBattle) {
                    console.log('Battle ended, returning to exploration');
                    this.gameState.setState('EXPLORING');

                    // Check if we need to spawn a new monster
                    const monstersInCurrentRoom = this.monsters.filter(m => m.room === this.mapManager.currentRoom).length;
                    if (monstersInCurrentRoom < 1) {
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

                        const validPositions = positions.filter(pos => {
                            return !this.monsters.some(m => m.room === this.mapManager.currentRoom && m.x === pos.x && m.y === pos.y) &&
                                   !(this.player.x === pos.x && this.player.y === pos.y);
                        });

                        if (validPositions.length > 0) {
                            const pos = validPositions[Math.floor(Math.random() * validPositions.length)];
                            const type = monsterTypes[Math.floor(Math.random() * monsterTypes.length)];
                            const hp = 10 + (type.level * 5);
                            this.monsters.push(new Monster(pos.x, pos.y, type.emoji, type.name, type.level, hp, hp, this.mapManager.currentRoom));
                        }
                    }
                }
                break;

            case 'MENU':
                if (input.upPressed || input.downPressed) {
                    try {
                        if (this.audioInitialized) {
                            await this.audioManager.playSelect();
                        }
                    } catch (error) {
                        console.error('Error playing menu navigation sound:', error);
                    }
                }
                if (input.upPressed) {
                    this.gameState.selectPreviousMenuOption();
                }
                if (input.downPressed) {
                    this.gameState.selectNextMenuOption();
                }
                if (input.aPressed) {
                    console.log('Executing menu option:', this.gameState.menuOptions[this.gameState.selectedMenuOption]);
                    try {
                        if (this.audioInitialized) {
                            await this.audioManager.playSelect();
                        }
                    } catch (error) {
                        console.error('Error playing menu select sound:', error);
                    }
                    this.gameState.executeMenuOption();
                }
                if (input.bPressed) {
                    console.log('Closing menu');
                    try {
                        if (this.audioInitialized) {
                            await this.audioManager.playSelect();
                        }
                    } catch (error) {
                        console.error('Error playing menu close sound:', error);
                    }
                    this.gameState.toggleMenu();
                }
                break;
        }
    }

    renderDialog() {
        const npc = this.gameState.currentDialog;
        if (!npc) return;

        // Draw dialog box background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        this.ctx.fillRect(10, 100, 140, 40);
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(10, 100, 140, 40);

        // Draw NPC emoji and name
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '12px monospace';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`${npc.emoji} ${npc.name}:`, 15, 115);

        // Draw current dialogue
        this.ctx.font = '10px monospace';
        this.ctx.fillText(npc.getCurrentDialogue(), 15, 130);

        // Draw prompt
        this.ctx.textAlign = 'right';
        this.ctx.fillText('🅰️ Continue', 145, 135);
    }

    render = () => {
        this.ctx.fillStyle = '#9bbc0f';
        this.ctx.fillRect(0, 0, 160, 144);

        switch(this.gameState.currentState) {
            case 'SPLASH':
                this.renderSplashScreen();
                break;

            case 'EXPLORING':
            case 'DIALOG':
                this.mapManager.render(this.renderer);

                // Render NPCs
                for (let npc of this.gameState.npcs) {
                    npc.render(this.renderer);
                }

                // Render monsters in current room
                for (let monster of this.monsters) {
                    if (monster.room === this.mapManager.currentRoom) {
                        monster.render(this.renderer, this.mapManager);
                    }
                }

                this.player.render(this.renderer);

                if (this.gameState.currentState === 'DIALOG') {
                    this.renderDialog();
                }
                break;

            case 'BATTLE':
                this.battleSystem.render(this.renderer);
                break;

            case 'MENU':
                // Render the game world behind the menu
                this.mapManager.render(this.renderer);
                for (let monster of this.monsters) {
                    if (monster.room === this.mapManager.currentRoom) {
                        monster.render(this.renderer, this.mapManager);
                    }
                }
                this.player.render(this.renderer);

                // Render menu
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
                this.ctx.fillRect(5, 5, 150, 100);
                this.ctx.strokeStyle = '#ffffff';
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(5, 5, 150, 100);

                this.gameState.menuOptions.forEach((option, index) => {
                    const isSelected = index === this.gameState.selectedMenuOption;
                    if (isSelected) {
                        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
                        this.ctx.fillRect(10, 10 + (index * 20), 140, 18);
                    }

                    this.ctx.fillStyle = '#000000';
                    this.renderer.drawText(
                        `${isSelected ? '▶️ ' : '  '}${option}`,
                        76,
                        25 + (index * 20),
                        12
                    );
                    this.ctx.fillStyle = '#ffffff';
                    this.renderer.drawText(
                        `${isSelected ? '▶️ ' : '  '}${option}`,
                        75,
                        24 + (index * 20),
                        12
                    );
                });

                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
                this.ctx.fillRect(5, 110, 150, 20);
                this.ctx.strokeRect(5, 110, 150, 20);

                this.ctx.fillStyle = '#ffffff';
                this.renderer.drawText('🅰️:Select 🅱️:Back', 75, 124, 10);
                break;
        }
    }

    renderSplashScreen = () => {
        const ctx = this.ctx;
        ctx.fillStyle = '#9bbc0f';
        ctx.fillRect(0, 0, 160, 144);

        const progress = Math.min(1, (Date.now() - this.gameState.splashStartTime) / 2000);
        ctx.fillStyle = '#0f380f';
        ctx.font = '16px monospace';
        ctx.textAlign = 'center';

        const bounce = Math.sin(progress * Math.PI) * (1 - progress) * 10;
        const y = 50 + bounce;

        ctx.fillText('Emoji Game', 80, y);
        ctx.fillText('System', 80, y + 20);

        if (progress > 0.5) {
            const alpha = Math.min(1, (progress - 0.5) * 2);
            ctx.fillStyle = `rgba(15, 56, 15, ${alpha})`;
            ctx.font = '8px monospace';
            ctx.fillText('PRESS START', 80, 100);

            if (this.gameState.hasSaveGame) {
                ctx.fillText('(SAVE DATA EXISTS)', 80, 110);
            }
        }

        const emoji = ['🎮', '🎲', '🎯', '🎪'];
        emoji.forEach((e, i) => {
            const angle = (progress * Math.PI * 2) + (i * Math.PI / 2);
            const x = 80 + Math.cos(angle) * 40;
            const y = 72 + Math.sin(angle) * 20;
            ctx.font = '16px serif';
            ctx.fillText(e, x, y);
        });
    }

    gameLoop = async (currentTime = 0) => {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        await this.update(deltaTime);
        this.render();

        requestAnimationFrame(this.gameLoop);
    }
}

window.addEventListener('load', () => {
    console.log('Window loaded, creating game instance');
    new Game();
});
