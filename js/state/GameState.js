import { Monster } from '../entities/Monster.js';
import NPC from '../entities/NPC.js';

export class GameState {
    constructor() {
        this.currentState = 'SPLASH';
        this.splashStartTime = Date.now();
        this.splashAnimationFrame = 0;
        this.player = null;
        this.hasSaveGame = this.checkSaveGame();
        this.selectedMenuOption = 0;
        this.menuOptions = ['Items', 'Save', 'Load', 'Close'];
        this.inventory = [
            { name: 'Potion', quantity: 3, healing: 10 },
            { name: 'Ether', quantity: 2, mpRestore: 5 }
        ];

        // Initialize NPCs per room
        this.npcs = [
            // Village NPCs (Room 0)
            new NPC(3, 3, '👨‍🦳', [
                'Welcome to our village!',
                'Beware of the monsters in the forest.',
                'The wizard in the dungeon might help you.'
            ], 0),
            new NPC(8, 3, '👩‍🌾', [
                'I grow the best vegetables in town.',
                'The forest has been dangerous lately.',
                'Be careful out there!'
            ], 0),

            // Forest NPCs (Room 1)
            new NPC(3, 4, '💂', [
                'The dungeon entrance is just ahead.',
                'Many warriors have gone in...',
                'Few have returned.'
            ], 1),
            new NPC(8, 4, '🧝', [
                'The forest spirits are restless.',
                'Something evil lurks in the dungeon.',
                'Seek the wizard\'s guidance.'
            ], 1),

            // Dungeon NPCs (Room 2)
            new NPC(5, 4, '🧙‍♂️', [
                'Ah, a brave soul ventures forth!',
                'I sense great potential within you.',
                'Train hard and grow stronger!'
            ], 2)
        ];

        // Dialog state
        this.currentDialog = null;
    }

    checkSaveGame() {
        return localStorage.getItem('gameState') !== null;
    }

    setPlayer(player) {
        this.player = player;
    }

    setState(newState) {
        if (newState === 'MENU' && this.currentState === 'BATTLE') {
            return; // Can't open menu during battle
        }
        this.currentState = newState;
    }

    showDialog(npc) {
        this.currentDialog = npc;
        this.setState('DIALOG');
    }

    closeDialog() {
        this.currentDialog = null;
        this.setState('EXPLORING');
    }

    getNPCsInCurrentRoom(currentRoom) {
        return this.npcs.filter(npc => npc.room === currentRoom);
    }

    toggleMenu() {
        if (this.currentState === 'MENU') {
            this.setState('EXPLORING');
        } else if (this.currentState === 'EXPLORING') {
            this.setState('MENU');
        }
    }

    selectNextMenuOption() {
        this.selectedMenuOption =
            (this.selectedMenuOption + 1) % this.menuOptions.length;
    }

    selectPreviousMenuOption() {
        this.selectedMenuOption =
            (this.selectedMenuOption - 1 + this.menuOptions.length) % this.menuOptions.length;
    }

    executeMenuOption() {
        const option = this.menuOptions[this.selectedMenuOption];
        switch (option) {
            case 'Save':
                this.saveGame();
                break;
            case 'Load':
                this.loadGame();
                break;
            case 'Close':
                this.setState('EXPLORING');
                break;
        }
    }

    saveGame() {
        const saveData = {
            playerX: this.player.x,
            playerY: this.player.y,
            currentRoom: this.player.currentRoom,
            inventory: this.inventory,
            monsters: this.monsters.map(monster => ({
                x: monster.x,
                y: monster.y,
                emoji: monster.emoji,
                name: monster.name,
                level: monster.level,
                hp: monster.hp,
                maxHp: monster.maxHp,
                room: monster.room
            })),
            npcs: this.npcs.map(npc => ({
                x: npc.x,
                y: npc.y,
                emoji: npc.emoji,
                dialogues: npc.dialogues,
                currentDialogueIndex: npc.currentDialogueIndex,
                room: npc.room
            }))
        };

        try {
            localStorage.setItem('gameState', JSON.stringify(saveData));
            console.log('Game saved successfully');
        } catch (error) {
            console.error('Failed to save game:', error);
        }
    }

    loadGame() {
        try {
            const saveData = JSON.parse(localStorage.getItem('gameState'));
            if (!saveData) {
                console.error('No save data found');
                return false;
            }

            // Restore player position
            this.player.x = saveData.playerX;
            this.player.y = saveData.playerY;
            this.player.currentRoom = saveData.currentRoom;

            // Restore inventory
            if (Array.isArray(saveData.inventory)) {
                this.inventory = saveData.inventory;
            }

            // Restore monsters
            if (Array.isArray(saveData.monsters)) {
                this.monsters = saveData.monsters.map(monsterData =>
                    new Monster(
                        monsterData.x,
                        monsterData.y,
                        monsterData.emoji,
                        monsterData.name,
                        monsterData.level,
                        monsterData.hp,
                        monsterData.maxHp,
                        monsterData.room
                    )
                );
            }

            // Restore NPCs
            if (Array.isArray(saveData.npcs)) {
                this.npcs = saveData.npcs.map(npcData =>
                    new NPC(
                        npcData.x,
                        npcData.y,
                        npcData.emoji,
                        npcData.dialogues,
                        npcData.room
                    )
                );
            }

            console.log('Game loaded successfully');
            return true;
        } catch (error) {
            console.error('Failed to load game:', error);
            return false;
        }
    }
}
