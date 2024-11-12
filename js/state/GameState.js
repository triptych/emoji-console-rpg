export class GameState {
    constructor() {
        this.currentState = 'SPLASH';
        this.splashStartTime = Date.now();
        this.splashAnimationFrame = 0;
        this.hasSaveGame = false;
        this.selectedMenuOption = 0;
        this.menuOptions = ['Continue', 'Save Game', 'Settings'];
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
}
