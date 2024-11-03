export class GameState {
    constructor() {
        this.currentState = 'EXPLORING'; // EXPLORING, BATTLE, MENU
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
            }
        };
        this.menuOpen = false;
        this.menuOptions = ['Items 🎒', 'Status 📊', 'Save 💾', 'Exit ❌'];
        this.selectedMenuOption = 0;
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
        this.selectedMenuOption = (this.selectedMenuOption + 1) % this.menuOptions.length;
    }

    selectPreviousMenuOption = () => {
        this.selectedMenuOption = (this.selectedMenuOption - 1 + this.menuOptions.length) % this.menuOptions.length;
    }

    executeMenuOption = () => {
        switch(this.selectedMenuOption) {
            case 0: // Items
                // TODO: Implement inventory
                break;
            case 1: // Status
                // TODO: Show player stats
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
            state: this.currentState
        };
        localStorage.setItem('rpgSaveData', JSON.stringify(saveData));
    }

    loadGame = () => {
        const saveData = localStorage.getItem('rpgSaveData');
        if (saveData) {
            const data = JSON.parse(saveData);
            this.player = data.player;
            this.currentState = data.state;
            return true;
        }
        return false;
    }
}
