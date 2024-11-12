export class GameState {
    constructor() {
        this.currentState = 'SPLASH';
        this.splashStartTime = Date.now();
        this.splashAnimationFrame = 0;
        this.hasSaveGame = false;
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
        // TODO: Implement save functionality
        console.log('Saving game...');
        this.hasSaveGame = true;
    }

    loadGame() {
        // TODO: Implement load functionality
        console.log('Loading game...');
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
