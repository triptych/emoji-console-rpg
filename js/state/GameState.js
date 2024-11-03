export class GameState {
    constructor() {
        this.currentState = 'SPLASH'; // SPLASH, EXPLORING, BATTLE, MENU
        this.splashAnimationFrame = 0;
        this.splashStartTime = Date.now();
        this.hasSaveGame = this.checkSaveExists();
        this.player = {
            position: { x: 0, y: 0 },
            stats: {
                level: 1,
                hp: 20,
                maxHp: 20,
                mp: 10,
                maxMp: 10,
                strength: 5,
                defense: 3,
                speed: 3
            },
            inventory: [],
            equipment: {
                weapon: null,
                armor: null,
                accessory: null
            },
            spells: [
                { name: '🔥 Fire', mpCost: 3, power: 8, type: 'damage' },
                { name: '❄️ Ice', mpCost: 4, power: 10, type: 'damage' },
                { name: '💚 Heal', mpCost: 5, power: 15, type: 'heal' },
                { name: '⚡ Thunder', mpCost: 6, power: 12, type: 'damage' }
            ]
        };
        this.menuOpen = false;
        this.menuOptions = ['Items 🎒', 'Status 📊', 'Save 💾', 'Exit ❌'];
        this.selectedMenuOption = 0;
        this.lastMenuMove = 0;
        this.menuMoveDelay = 200; // Milliseconds between menu movements
        this.inventory = [
            { name: '🧪 Potion', type: 'heal', power: 20, quantity: 3 },
            { name: '⚡ Ether', type: 'mp', power: 10, quantity: 2 },
            { name: '🌟 Elixir', type: 'full', power: 0, quantity: 1 }
        ];
    }

    checkSaveExists = () => {
        return localStorage.getItem('rpgSaveData') !== null;
    }

    setState = (newState) => {
        this.currentState = newState;
    }

    getState = () => {
        return this.currentState;
    }

    toggleMenu = () => {
        this.menuOpen = !this.menuOpen;
        if (this.menuOpen) {
            this.currentState = 'MENU';
        } else {
            this.currentState = 'EXPLORING';
        }
    }

    selectNextMenuOption = () => {
        const currentTime = performance.now();
        if (currentTime - this.lastMenuMove > this.menuMoveDelay) {
            this.selectedMenuOption = (this.selectedMenuOption + 1) % this.menuOptions.length;
            this.lastMenuMove = currentTime;
        }
    }

    selectPreviousMenuOption = () => {
        const currentTime = performance.now();
        if (currentTime - this.lastMenuMove > this.menuMoveDelay) {
            this.selectedMenuOption = (this.selectedMenuOption - 1 + this.menuOptions.length) % this.menuOptions.length;
            this.lastMenuMove = currentTime;
        }
    }

    useItem = (itemIndex, target) => {
        const item = this.inventory[itemIndex];
        if (!item || item.quantity <= 0) return false;

        switch(item.type) {
            case 'heal':
                target.stats.hp = Math.min(target.stats.maxHp, target.stats.hp + item.power);
                break;
            case 'mp':
                target.stats.mp = Math.min(target.stats.maxMp, target.stats.mp + item.power);
                break;
            case 'full':
                target.stats.hp = target.stats.maxHp;
                target.stats.mp = target.stats.maxMp;
                break;
        }

        item.quantity--;
        if (item.quantity <= 0) {
            this.inventory.splice(itemIndex, 1);
        }
        return true;
    }

    castSpell = (spellIndex, caster, target) => {
        const spell = this.player.spells[spellIndex];
        if (!spell || caster.stats.mp < spell.mpCost) return false;

        caster.stats.mp -= spell.mpCost;

        switch(spell.type) {
            case 'damage':
                target.hp -= spell.power;
                break;
            case 'heal':
                caster.stats.hp = Math.min(caster.stats.maxHp, caster.stats.hp + spell.power);
                break;
        }

        return true;
    }

    executeMenuOption = () => {
        switch(this.selectedMenuOption) {
            case 0: // Items
                // Handled by inventory system
                break;
            case 1: // Status
                // Show player stats
                break;
            case 2: // Save
                this.saveGame();
                break;
            case 3: // Exit
                this.toggleMenu();
                break;
        }
    }

    saveGame = () => {
        const saveData = {
            player: this.player,
            inventory: this.inventory,
            state: this.currentState === 'MENU' ? 'EXPLORING' : this.currentState
        };
        localStorage.setItem('rpgSaveData', JSON.stringify(saveData));
    }

    loadGame = () => {
        const saveData = localStorage.getItem('rpgSaveData');
        if (saveData) {
            const data = JSON.parse(saveData);
            this.player = data.player;
            this.inventory = data.inventory;
            this.currentState = data.state;
            return true;
        }
        return false;
    }
}
