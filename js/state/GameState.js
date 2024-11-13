import { Monster } from '../entities/Monster.js';

export class GameState {
    constructor() {
        this.currentState = 'SPLASH';
        this.splashStartTime = Date.now();
        this.splashAnimationFrame = 0;
        this.hasSaveGame = this.checkSaveGame();
        this.selectedMenuOption = 0;
        this.menuOptions = ['Continue', 'Save Game', 'Settings'];

        // Initialize player
        this.player = null; // Will be set by the game instance

        // Initialize inventory
        this.inventory = [
            { name: 'Potion', quantity: 3, healing: 10 },
            { name: 'Ether', quantity: 2, mpRestore: 5 }
        ];
    }

    checkSaveGame() {
        return localStorage.getItem('gameState') !== null;
    }

    setPlayer(player) {
        this.player = player;
    }

    setState(newState) {
        console.log(`Transitioning from ${this.currentState} to ${newState}`);
        this.currentState = newState;

        if (newState === 'SPLASH') {
            this.splashStartTime = Date.now();
            this.splashAnimationFrame = 0;
        }
    }

    toggleMenu() {
        if (this.currentState === 'MENU') {
            this.setState('EXPLORING');
        } else {
            this.setState('MENU');
        }
    }

    selectNextMenuOption() {
        this.selectedMenuOption = (this.selectedMenuOption + 1) % this.menuOptions.length;
    }

    selectPreviousMenuOption() {
        this.selectedMenuOption = (this.selectedMenuOption - 1 + this.menuOptions.length) % this.menuOptions.length;
    }

    executeMenuOption() {
        const option = this.menuOptions[this.selectedMenuOption];
        switch (option) {
            case 'Continue':
                this.setState('EXPLORING');
                break;
            case 'Save Game':
                this.saveGame();
                break;
            case 'Settings':
                // TODO: Implement settings
                break;
        }
    }

    saveGame() {
        if (!this.player) return;

        const saveData = {
            player: {
                x: this.player.x,
                y: this.player.y,
                stats: this.player.stats
            },
            inventory: this.inventory,
            currentRoom: window.game.mapManager.currentRoom,
            monsters: window.game.monsters.map(monster => ({
                x: monster.x,
                y: monster.y,
                emoji: monster.emoji,
                name: monster.name,
                level: monster.level,
                hp: monster.hp,
                maxHp: monster.maxHp,
                room: monster.room
            }))
        };

        try {
            localStorage.setItem('gameState', JSON.stringify(saveData));
            console.log('Game saved successfully');
            this.hasSaveGame = true;
        } catch (error) {
            console.error('Failed to save game:', error);
        }
    }

    loadGame() {
        try {
            const saveData = JSON.parse(localStorage.getItem('gameState'));
            if (!saveData) return false;

            // Restore player state
            if (this.player && saveData.player) {
                this.player.x = saveData.player.x;
                this.player.y = saveData.player.y;
                Object.assign(this.player.stats, saveData.player.stats);
            }

            // Restore inventory
            if (saveData.inventory) {
                this.inventory = saveData.inventory;
            }

            // Restore current room
            if (typeof saveData.currentRoom === 'number') {
                window.game.mapManager.currentRoom = saveData.currentRoom;
            }

            // Restore monsters
            if (Array.isArray(saveData.monsters)) {
                window.game.monsters = saveData.monsters.map(monsterData =>
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

            console.log('Game loaded successfully');
            return true;
        } catch (error) {
            console.error('Failed to load game:', error);
            return false;
        }
    }

    useItem(index, target) {
        const item = this.inventory[index];
        if (!item || item.quantity <= 0) return false;

        if (item.healing && target.stats.hp < target.stats.maxHp) {
            target.heal(item.healing);
            item.quantity--;
            return true;
        } else if (item.mpRestore && target.stats.mp < target.stats.maxMp) {
            target.restoreMp(item.mpRestore);
            item.quantity--;
            return true;
        }
        return false;
    }

    castSpell(index, caster, target) {
        const spell = caster.spells[index];
        if (!spell) return false;

        if (caster.useMp(spell.mpCost)) {
            if (spell.damage) {
                target.hp -= spell.damage;
                return true;
            } else if (spell.healing) {
                caster.heal(spell.healing);
                return true;
            }
        }
        return false;
    }
}
