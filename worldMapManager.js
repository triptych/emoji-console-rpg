[1mdiff --git a/js/main.js b/js/main.js[m
[1mindex a2e50f5..7438d38 100644[m
[1m--- a/js/main.js[m
[1m+++ b/js/main.js[m
[36m@@ -6,6 +6,7 @@[m [mimport { Player } from './entities/Player.js';[m
 import { BattleSystem } from './battle/BattleSystem.js';[m
 import { Monster } from './entities/Monster.js';[m
 import { AudioManager } from './audio/AudioManager.js';[m
[32m+[m[32mimport NPC from './entities/NPC.js';[m
 [m
 class Game {[m
     constructor() {[m
[36m@@ -22,7 +23,7 @@[m [mclass Game {[m
 [m
         // Initialize core game systems[m
         this.gameState = new GameState();[m
[31m-        this.gameState.setPlayer(this.player); // Set player in game state[m
[32m+[m[32m        this.gameState.setPlayer(this.player);[m
 [m
         this.renderer = new Renderer(this.ctx);[m
         this.renderer.setGameState(this.gameState);[m
[36m@@ -34,9 +35,9 @@[m [mclass Game {[m
 [m
         // Initialize monsters with room assignments[m
         this.monsters = [[m
[31m-            new Monster(5, 5, '👻', 'Ghost', 2, 15, 15, 0),   // Room 0[m
[31m-            new Monster(8, 3, '🐉', 'Dragon', 3, 20, 20, 1),  // Room 1[m
[31m-            new Monster(3, 7, '🧟', 'Zombie', 1, 10, 10, 2)   // Room 2[m
[32m+[m[32m            new Monster(5, 5, '👻', 'Ghost', 2, 15, 15, 0),[m
[32m+[m[32m            new Monster(8, 3, '🐉', 'Dragon', 3, 20, 20, 1),[m
[32m+[m[32m            new Monster(3, 7, '🧟', 'Zombie', 1, 10, 10, 2)[m
         ];[m
 [m
         this.lastTime = 0;[m
[36m@@ -73,20 +74,12 @@[m [mclass Game {[m
         const baseWidth = 160;[m
         const baseHeight = 144;[m
         const dpr = window.devicePixelRatio || 1;[m
[31m-        const scale = 3; // Match the CSS scale factor[m
[32m+[m[32m        const scale = 3;[m
 [m
[31m-        // Set the canvas's internal dimensions with scale and DPR[m
         this.canvas.width = baseWidth * scale * dpr;[m
         this.canvas.height = baseHeight * scale * dpr;[m
[31m-[m
[31m-        // Scale the context to handle both the game scale and device pixel ratio[m
         this.ctx.scale(scale * dpr, scale * dpr);[m
[31m-[m
[31m-        // Disable image smoothing for crisp pixel art[m
         this.ctx.imageSmoothingEnabled = false;[m
[31m-        this.ctx.mozImageSmoothingEnabled = false;[m
[31m-        this.ctx.webkitImageSmoothingEnabled = false;[m
[31m-        this.ctx.msImageSmoothingEnabled = false;[m
     }[m
 [m
     init = () => {[m
[36m@@ -94,15 +87,24 @@[m [mclass Game {[m
         this.gameLoop();[m
     }[m
 [m
[32m+[m[32m    checkNPCCollision = () => {[m
[32m+[m[32m        const npcsInRoom = this.gameState.getNPCsInCurrentRoom(this.mapManager.currentRoom);[m
[32m+[m[32m        for (let npc of npcsInRoom) {[m
[32m+[m[32m            if (npc.isCollidingWith(this.player)) {[m
[32m+[m[32m                this.gameState.showDialog(npc);[m
[32m+[m[32m                return true;[m
[32m+[m[32m            }[m
[32m+[m[32m        }[m
[32m+[m[32m        return false;[m
[32m+[m[32m    }[m
[32m+[m
     checkMonsterCollision = () => {[m
[31m-        // Only check monsters in current room[m
         const currentRoomMonsters = this.monsters.filter(m => m.room === this.mapManager.currentRoom);[m
         for (let monster of currentRoomMonsters) {[m
             if (monster.x === this.player.x && monster.y === this.player.y) {[m
                 console.log('Monster collision!');[m
                 this.gameState.setState('BATTLE');[m
                 this.battleSystem.startBattle(monster.getBattleStats());[m
[31m-                // Remove the monster after starting battle[m
                 this.monsters = this.monsters.filter(m => m !== monster);[m
                 return true;[m
             }[m
[36m@@ -118,16 +120,12 @@[m [mclass Game {[m
                 this.gameState.splashAnimationFrame++;[m
                 if (input.aPressed || input.startPressed) {[m
                     console.log('Input detected on splash screen, transitioning to EXPLORING');[m
[31m-                    // Initialize audio system if not already initialized[m
                     if (!this.audioInitialized) {[m
                         try {[m
[31m-                            console.log('Initializing audio system...');[m
                             await this.audioManager.initialize();[m
                             this.audioInitialized = true;[m
[31m-                            console.log('Audio system initialized successfully');[m
                         } catch (error) {[m
                             console.error('Audio initialization failed:', error);[m
[31m-                            // Continue even if audio fails[m
                         }[m
                     }[m
 [m
[36m@@ -184,10 +182,20 @@[m [mclass Game {[m
                 }[m
 [m
                 if (oldX !== this.player.x || oldY !== this.player.y) {[m
[31m-                    this.checkMonsterCollision();[m
[32m+[m[32m                    if (!this.checkMonsterCollision()) {[m
[32m+[m[32m                        this.checkNPCCollision();[m
[32m+[m[32m                    }[m
                 }[m
[32m+[m[32m                break;[m
 [m
[31m-                this.mapManager.update(deltaTime);[m
[32m+[m[32m            case 'DIALOG':[m
[32m+[m[32m                if (input.aPressed) {[m
[32m+[m[32m                    const npc = this.gameState.currentDialog;[m
[32m+[m[32m                    npc.nextDialogue();[m
[32m+[m[32m                    if (npc.currentDialogueIndex === 0) {[m
[32m+[m[32m                        this.gameState.closeDialog();[m
[32m+[m[32m                    }[m
[32m+[m[32m                }[m
                 break;[m
 [m
             case 'BATTLE':[m
[36m@@ -205,7 +213,7 @@[m [mclass Game {[m
                     console.log('Battle ended, returning to exploration');[m
                     this.gameState.setState('EXPLORING');[m
 [m
[31m-                    // Check if we need to spawn a new monster in the current room[m
[32m+[m[32m                    // Check if we need to spawn a new monster[m
                     const monstersInCurrentRoom = this.monsters.filter(m => m.room === this.mapManager.currentRoom).length;[m
                     if (monstersInCurrentRoom < 1) {[m
                         const positions = [[m
[36m@@ -220,7 +228,6 @@[m [mclass Game {[m
                             {emoji: '🐺', name: 'Wolf', level: 2}[m
                         ];[m
 [m
[31m-                        // Find a position that's not occupied by other monsters or the player[m
                         const validPositions = positions.filter(pos => {[m
                             return !this.monsters.some(m => m.room === this.mapManager.currentRoom && m.x === pos.x && m.y === pos.y) &&[m
                                    !(this.player.x === pos.x && this.player.y === pos.y);[m
[36m@@ -278,48 +285,30 @@[m [mclass Game {[m
         }[m
     }[m
 [m
[31m-    renderSplashScreen = () => {[m
[31m-        const ctx = this.ctx;[m
[31m-        ctx.fillStyle = '#9bbc0f';[m
[31m-        ctx.fillRect(0, 0, 160, 144);[m
[31m-[m
[31m-        // Calculate animation progress (0 to 1)[m
[31m-        const progress = Math.min(1, (Date.now() - this.gameState.splashStartTime) / 2000);[m
[31m-[m
[31m-        // Animated title[m
[31m-        ctx.fillStyle = '#0f380f';[m
[31m-        ctx.font = '16px monospace';[m
[31m-        ctx.textAlign = 'center';[m
[31m-[m
[31m-        // Apply bounce effect[m
[31m-        const bounce = Math.sin(progress * Math.PI) * (1 - progress) * 10;[m
[31m-        const y = 50 + bounce;[m
[31m-[m
[31m-        ctx.fillText('Emoji Game', 80, y);[m
[31m-        ctx.fillText('System', 80, y + 20);[m
[31m-[m
[31m-        // Fade in press start text[m
[31m-        if (progress > 0.5) {[m
[31m-            const alpha = Math.min(1, (progress - 0.5) * 2);[m
[31m-            ctx.fillStyle = `rgba(15, 56, 15, ${alpha})`;[m
[31m-            ctx.font = '8px monospace';[m
[31m-            ctx.fillText('PRESS START', 80, 100);[m
[31m-[m
[31m-            // Show "Continue" text if save exists[m
[31m-            if (this.gameState.hasSaveGame) {[m
[31m-                ctx.fillText('(SAVE DATA EXISTS)', 80, 110);[m
[31m-            }[m
[31m-        }[m
[31m-[m
[31m-        // Draw decorative emoji[m
[31m-        const emoji = ['🎮', '🎲', '🎯', '🎪'];[m
[31m-        emoji.forEach((e, i) => {[m
[31m-            const angle = (progress * Math.PI * 2) + (i * Math.PI / 2);[m
[31m-            const x = 80 + Math.cos(angle) * 40;[m
[31m-            const y = 72 + Math.sin(angle) * 20;[m
[31m-            ctx.font = '16px serif';[m
[31m-            ctx.fillText(e, x, y);[m
[31m-        });[m
[32m+[m[32m    renderDialog() {[m
[32m+[m[32m        const npc = this.gameState.currentDialog;[m
[32m+[m[32m        if (!npc) return;[m
[32m+[m
[32m+[m[32m        // Draw dialog box background[m
[32m+[m[32m        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';[m
[32m+[m[32m        this.ctx.fillRect(10, 100, 140, 40);[m
[32m+[m[32m        this.ctx.strokeStyle = '#ffffff';[m
[32m+[m[32m        this.ctx.lineWidth = 1;[m
[32m+[m[32m        this.ctx.strokeRect(10, 100, 140, 40);[m
[32m+[m
[32m+[m[32m        // Draw NPC emoji and name[m
[32m+[m[32m        this.ctx.fillStyle = '#ffffff';[m
[32m+[m[32m        this.ctx.font = '12px monospace';[m
[32m+[m[32m        this.ctx.textAlign = 'left';[m
[32m+[m[32m        this.ctx.fillText(`${npc.emoji} ${npc.name}:`, 15, 115);[m
[32m+[m
[32m+[m[32m        // Draw current dialogue[m
[32m+[m[32m        this.ctx.font = '10px monospace';[m
[32m+[m[32m        this.ctx.fillText(npc.getCurrentDialogue(), 15, 130);[m
[32m+[m
[32m+[m[32m        // Draw prompt[m
[32m+[m[32m        this.ctx.textAlign = 'right';[m
[32m+[m[32m        this.ctx.fillText('🅰️ Continue', 145, 135);[m
     }[m
 [m
     render = () => {[m
[36m@@ -332,12 +321,27 @@[m [mclass Game {[m
                 break;[m
 [m
             case 'EXPLORING':[m
[32m+[m[32m            case 'DIALOG':[m
                 this.mapManager.render(this.renderer);[m
[32m+[m
[32m+[m[32m                // Render NPCs in current room[m
[32m+[m[32m                const npcsInRoom = this.gameState.getNPCsInCurrentRoom(this.mapManager.currentRoom);[m
[32m+[m[32m                for (let npc of npcsInRoom) {[m
[32m+[m[32m                    npc.render(this.renderer);[m
[32m+[m[32m                }[m
[32m+[m
                 // Render monsters in current room[m
                 for (let monster of this.monsters) {[m
[31m-                    monster.render(this.renderer, this.mapManager);[m
[32m+[m[32m                    if (monster.room === this.mapManager.currentRoom) {[m
[32m+[m[32m                        monster.render(this.renderer, this.mapManager);[m
[32m+[m[32m                    }[m
                 }[m
[32m+[m
                 this.player.render(this.renderer);[m
[32m+[m
[32m+[m[32m                if (this.gameState.currentState === 'DIALOG') {[m
[32m+[m[32m                    this.renderDialog();[m
[32m+[m[32m                }[m
                 break;[m
 [m
             case 'BATTLE':[m
[36m@@ -348,30 +352,26 @@[m [mclass Game {[m
                 // Render the game world behind the menu[m
                 this.mapManager.render(this.renderer);[m
                 for (let monster of this.monsters) {[m
[31m-                    monster.render(this.renderer, this.mapManager);[m
[32m+[m[32m                    if (monster.room === this.mapManager.currentRoom) {[m
[32m+[m[32m                        monster.render(this.renderer, this.mapManager);[m
[32m+[m[32m                    }[m
                 }[m
                 this.player.render(this.renderer);[m
 [m
[31m-                // Render semi-transparent menu background[m
[32m+[m[32m                // Render menu[m
                 this.ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';[m
                 this.ctx.fillRect(5, 5, 150, 100);[m
[31m-[m
[31m-                // Add menu border[m
                 this.ctx.strokeStyle = '#ffffff';[m
                 this.ctx.lineWidth = 1;[m
                 this.ctx.strokeRect(5, 5, 150, 100);[m
 [m
[31m-                // Render menu options with better spacing and contrast[m
                 this.gameState.menuOptions.forEach((option, index) => {[m
                     const isSelected = index === this.gameState.selectedMenuOption;[m
[31m-[m
[31m-                    // Draw selection highlight[m
                     if (isSelected) {[m
                         this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';[m
                         this.ctx.fillRect(10, 10 + (index * 20), 140, 18);[m
                     }[m
 [m
[31m-                    // Draw text with shadow for better readability[m
                     this.ctx.fillStyle = '#000000';[m
                     this.renderer.drawText([m
                         `${isSelected ? '▶️ ' : '  '}${option}`,[m
[36m@@ -388,7 +388,6 @@[m [mclass Game {[m
                     );[m
                 });[m
 [m
[31m-                // Render controls hint at the bottom[m
                 this.ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';[m
                 this.ctx.fillRect(5, 110, 150, 20);[m
                 this.ctx.strokeRect(5, 110, 150, 20);[m
[36m@@ -399,6 +398,43 @@[m [mclass Game {[m
         }[m
     }[m
 [m
[32m+[m[32m    renderSplashScreen = () => {[m
[32m+[m[32m        const ctx = this.ctx;[m
[32m+[m[32m        ctx.fillStyle = '#9bbc0f';[m
[32m+[m[32m        ctx.fillRect(0, 0, 160, 144);[m
[32m+[m
[32m+[m[32m        const progress = Math.min(1, (Date.now() - this.gameState.splashStartTime) / 2000);[m
[32m+[m[32m        ctx.fillStyle = '#0f380f';[m
[32m+[m[32m        ctx.font = '16px monospace';[m
[32m+[m[32m        ctx.textAlign = 'center';[m
[32m+[m
[32m+[m[32m        const bounce = Math.sin(progress * Math.PI) * (1 - progress) * 10;[m
[32m+[m[32m        const y = 50 + bounce;[m
[32m+[m
[32m+[m[32m        ctx.fillText('Emoji Game', 80, y);[m
[32m+[m[32m        ctx.fillText('System', 80, y + 20);[m
[32m+[m
[32m+[m[32m        if (progress > 0.5) {[m
[32m+[m[32m            const alpha = Math.min(1, (progress - 0.5) * 2);[m
[32m+[m[32m            ctx.fillStyle = `rgba(15, 56, 15, ${alpha})`;[m
[32m+[m[32m            ctx.font = '8px monospace';[m
[32m+[m[32m            ctx.fillText('PRESS START', 80, 100);[m
[32m+[m
[32m+[m[32m            if (this.gameState.hasSaveGame) {[m
[32m+[m[32m                ctx.fillText('(SAVE DATA EXISTS)', 80, 110);[m
[32m+[m[32m            }[m
[32m+[m[32m        }[m
[32m+[m
[32m+[m[32m        const emoji = ['🎮', '🎲', '🎯', '🎪'];[m
[32m+[m[32m        emoji.forEach((e, i) => {[m
[32m+[m[32m            const angle = (progress * Math.PI * 2) + (i * Math.PI / 2);[m
[32m+[m[32m            const x = 80 + Math.cos(angle) * 40;[m
[32m+[m[32m            const y = 72 + Math.sin(angle) * 20;[m
[32m+[m[32m            ctx.font = '16px serif';[m
[32m+[m[32m            ctx.fillText(e, x, y);[m
[32m+[m[32m        });[m
[32m+[m[32m    }[m
[32m+[m
     gameLoop = async (currentTime = 0) => {[m
         const deltaTime = currentTime - this.lastTime;[m
         this.lastTime = currentTime;[m
[1mdiff --git a/js/state/GameState.js b/js/state/GameState.js[m
[1mindex 30ebb1e..9a60372 100644[m
[1m--- a/js/state/GameState.js[m
[1m+++ b/js/state/GameState.js[m
[36m@@ -1,4 +1,5 @@[m
 import { Monster } from '../entities/Monster.js';[m
[32m+[m[32mimport NPC from '../entities/NPC.js';[m
 [m
 export class GameState {[m
     constructor() {[m
[36m@@ -17,6 +18,16 @@[m [mexport class GameState {[m
             { name: 'Potion', quantity: 3, healing: 10 },[m
             { name: 'Ether', quantity: 2, mpRestore: 5 }[m
         ];[m
[32m+[m
[32m+[m[32m        // Initialize NPCs per room[m
[32m+[m[32m        this.npcs = [[m
[32m+[m[32m            new NPC(3, 3, '👨‍🦳', ['Welcome to the game!', 'I am the village elder.', 'Beware of monsters in the area.'], 0),[m
[32m+[m[32m            new NPC(7, 7, '👩‍🌾', ['I grow the best crops in town.', 'Would you like some fresh vegetables?'], 1),[m
[32m+[m[32m            new NPC(10, 4, '🧙‍♂️', ['I sense great power within you.', 'Train hard and become stronger!'], 2)[m
[32m+[m[32m        ];[m
[32m+[m
[32m+[m[32m        // Dialog state[m
[32m+[m[32m        this.currentDialog = null;[m
     }[m
 [m
     checkSaveGame() {[m
[36m@@ -37,6 +48,20 @@[m [mexport class GameState {[m
         }[m
     }[m
 [m
[32m+[m[32m    showDialog(npc) {[m
[32m+[m[32m        this.currentDialog = npc;[m
[32m+[m[32m        this.setState('DIALOG');[m
[32m+[m[32m    }[m
[32m+[m
[32m+[m[32m    closeDialog() {[m
[32m+[m[32m        this.currentDialog = null;[m
[32m+[m[32m        this.setState('EXPLORING');[m
[32m+[m[32m    }[m
[32m+[m
[32m+[m[32m    getNPCsInCurrentRoom(currentRoom) {[m
[32m+[m[32m        return this.npcs.filter(npc => npc.room === currentRoom);[m
[32m+[m[32m    }[m
[32m+[m
     toggleMenu() {[m
         if (this.currentState === 'MENU') {[m
             this.setState('EXPLORING');[m
[36m@@ -88,6 +113,14 @@[m [mexport class GameState {[m
                 hp: monster.hp,[m
                 maxHp: monster.maxHp,[m
                 room: monster.room[m
[32m+[m[32m            })),[m
[32m+[m[32m            npcs: this.npcs.map(npc => ({[m
[32m+[m[32m                x: npc.x,[m
[32m+[m[32m                y: npc.y,[m
[32m+[m[32m                emoji: npc.emoji,[m
[32m+[m[32m                dialogues: npc.dialogues,[m
[32m+[m[32m                currentDialogueIndex: npc.currentDialogueIndex,[m
[32m+[m[32m                room: npc.room[m
             }))[m
         };[m
 [m
[36m@@ -138,6 +171,19 @@[m [mexport class GameState {[m
                 );[m
             }[m
 [m
[32m+[m[32m            // Restore NPCs[m
[32m+[m[32m            if (Array.isArray(saveData.npcs)) {[m
[32m+[m[32m                this.npcs = saveData.npcs.map(npcData =>[m
[32m+[m[32m                    new NPC([m
[32m+[m[32m                        npcData.x,[m
[32m+[m[32m                        npcData.y,[m
[32m+[m[32m                        npcData.emoji,[m
[32m+[m[32m                        npcData.dialogues,[m
[32m+[m[32m                        npcData.room[m
[32m+[m[32m                    )[m
[32m+[m[32m                );[m
[32m+[m[32m            }[m
[32m+[m
             console.log('Game loaded successfully');[m
             return true;[m
         } catch (error) {[m
