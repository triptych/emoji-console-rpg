export class BattleSystem {
    constructor() {
        this.inBattle = false;
        this.currentEnemy = null;
        this.battleMenu = {
            options: ['⚔️ Attack', '✨ Magic', '🎒 Items', '🏃 Run'],
            selectedIndex: 0
        };
        this.lastInputTime = 0;
        this.inputDelay = 200; // Milliseconds between menu movements
    }

    startBattle = (enemy) => {
        this.inBattle = true;
        this.currentEnemy = enemy;
        this.battleMenu.selectedIndex = 0;
    }

    update = (deltaTime, input) => {
        if (!this.inBattle) return;

        const currentTime = performance.now();

        if (currentTime - this.lastInputTime > this.inputDelay) {
            if (input.upPressed) {
                this.battleMenu.selectedIndex = Math.max(0, this.battleMenu.selectedIndex - 1);
                this.lastInputTime = currentTime;
            }
            if (input.downPressed) {
                this.battleMenu.selectedIndex = Math.min(
                    this.battleMenu.options.length - 1,
                    this.battleMenu.selectedIndex + 1
                );
                this.lastInputTime = currentTime;
            }
        }

        if (input.aPressed) {
            this.executeAction(this.battleMenu.selectedIndex);
        }

        if (input.bPressed) {
            if (this.battleMenu.selectedIndex === 3) {
                this.attemptRun();
            }
        }
    }

    executeAction = (index) => {
        switch(index) {
            case 0: // Attack
                this.performAttack();
                break;
            case 1: // Magic
                this.openMagicMenu();
                break;
            case 2: // Items
                this.openItemMenu();
                break;
            case 3: // Run
                this.attemptRun();
                break;
        }
    }

    performAttack = () => {
        if (this.currentEnemy) {
            this.currentEnemy.hp -= 3;
            if (this.currentEnemy.hp <= 0) {
                this.endBattle(true);
            }
        }
    }

    openMagicMenu = () => {
        console.log('Magic menu not implemented yet');
    }

    openItemMenu = () => {
        console.log('Item menu not implemented yet');
    }

    attemptRun = () => {
        if (Math.random() < 0.75) {
            this.endBattle(false);
        }
    }

    endBattle = (victory) => {
        this.inBattle = false;
        this.currentEnemy = null;
        this.battleMenu.selectedIndex = 0;
    }

    render = (renderer) => {
        if (!this.inBattle) return;

        // Clear the screen with battle background
        renderer.ctx.fillStyle = '#9bbc0f';
        renderer.ctx.fillRect(0, 0, 160, 144);

        // Draw enemy at the top right
        const enemyX = 110;
        const enemyY = 20;
        if (this.currentEnemy) {
            renderer.drawCharacter(this.currentEnemy.emoji, enemyX, enemyY, 24);

            // Draw enemy HP bar background
            renderer.ctx.fillStyle = '#2c2c2c';
            renderer.ctx.fillRect(enemyX - 20, enemyY - 15, 52, 8);

            // Draw enemy HP bar
            const hpPercentage = this.currentEnemy.hp / this.currentEnemy.maxHp;
            renderer.ctx.fillStyle = hpPercentage > 0.5 ? '#9bbc0f' : hpPercentage > 0.2 ? '#8b8b8b' : '#ff0000';
            renderer.ctx.fillRect(enemyX - 19, enemyY - 14, 50 * hpPercentage, 6);
        }

        // Draw player at the bottom left
        renderer.drawCharacter('🧙‍♂️', 20, 60, 24);

        // Draw player stats with dark background for better contrast
        renderer.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        renderer.ctx.fillRect(8, 88, 60, 24);

        // Draw stats text in white
        renderer.ctx.fillStyle = '#ffffff';
        renderer.drawText('HP: 20/20', 10, 90, 8);
        renderer.drawText('MP: 10/10', 10, 100, 8);

        // Draw battle menu background
        renderer.ctx.fillStyle = 'rgba(0, 0, 0, 0.9)'; // Made slightly more opaque
        renderer.ctx.fillRect(80, 70, 75, 70);

        // Draw battle menu options in white
        this.battleMenu.options.forEach((option, index) => {
            const isSelected = index === this.battleMenu.selectedIndex;
            // Draw white text for better contrast
            renderer.ctx.fillStyle = '#ffffff';
            renderer.drawText(
                `${isSelected ? '▶️' : '  '}${option}`,
                85,
                80 + (index * 15),
                10
            );
        });
    }
}
