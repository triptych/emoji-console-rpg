export class BattleSystem {
    constructor() {
        this.inBattle = false;
        this.currentEnemy = null;
        this.battleMenu = {
            options: ['⚔️ Attack', '✨ Magic', '🎒 Items', '🏃 Run'],
            selectedIndex: 0
        };
        this.magicMenu = {
            active: false,
            selectedIndex: 0
        };
        this.itemMenu = {
            active: false,
            selectedIndex: 0
        };
        this.lastInputTime = 0;
        this.inputDelay = 200;
        this.battleLog = [];
    }

    startBattle = (enemy) => {
        this.inBattle = true;
        this.currentEnemy = enemy;
        this.battleMenu.selectedIndex = 0;
        this.magicMenu.active = false;
        this.itemMenu.active = false;
        this.battleLog = [
            'A wild ' + enemy.name + ' appears!',
            'Select action with ⬆️⬇️'
        ];
    }

    update = (deltaTime, input, gameState) => {
        if (!this.inBattle) return;

        const currentTime = performance.now();

        if (currentTime - this.lastInputTime > this.inputDelay) {
            if (this.magicMenu.active) {
                this.handleMagicMenuInput(input, gameState);
            } else if (this.itemMenu.active) {
                this.handleItemMenuInput(input, gameState);
            } else {
                this.handleMainMenuInput(input, gameState);
            }
            this.lastInputTime = currentTime;
        }
    }

    handleMainMenuInput = (input, gameState) => {
        if (input.upPressed || input.up) {
            this.battleMenu.selectedIndex = (this.battleMenu.selectedIndex - 1 + this.battleMenu.options.length) % this.battleMenu.options.length;
        }
        if (input.downPressed || input.down) {
            this.battleMenu.selectedIndex = (this.battleMenu.selectedIndex + 1) % this.battleMenu.options.length;
        }
        if (input.aPressed) {
            this.executeAction(this.battleMenu.selectedIndex, gameState);
        }
        if (input.bPressed && this.battleMenu.selectedIndex === 3) {
            this.attemptRun(gameState);
        }
    }

    handleMagicMenuInput = (input, gameState) => {
        const spells = gameState.player.spells;
        if (input.upPressed || input.up) {
            this.magicMenu.selectedIndex = (this.magicMenu.selectedIndex - 1 + spells.length) % spells.length;
        }
        if (input.downPressed || input.down) {
            this.magicMenu.selectedIndex = (this.magicMenu.selectedIndex + 1) % spells.length;
        }
        if (input.aPressed) {
            const success = gameState.castSpell(
                this.magicMenu.selectedIndex,
                gameState.player,
                this.currentEnemy
            );
            if (success) {
                const spell = spells[this.magicMenu.selectedIndex];
                this.battleLog.push(`Used ${spell.name}!`);
                this.magicMenu.active = false;
                this.enemyTurn(gameState);
            } else {
                this.battleLog.push('Not enough MP!');
            }
        }
        if (input.bPressed) {
            this.magicMenu.active = false;
            this.battleLog.push('Select action with ⬆️⬇️');
        }
    }

    handleItemMenuInput = (input, gameState) => {
        const items = gameState.inventory;
        if (items.length === 0) {
            this.battleLog.push('No items!');
            this.itemMenu.active = false;
            this.battleLog.push('Select action with ⬆️⬇️');
            return;
        }

        if (input.upPressed || input.up) {
            this.itemMenu.selectedIndex = (this.itemMenu.selectedIndex - 1 + items.length) % items.length;
        }
        if (input.downPressed || input.down) {
            this.itemMenu.selectedIndex = (this.itemMenu.selectedIndex + 1) % items.length;
        }
        if (input.aPressed) {
            const success = gameState.useItem(this.itemMenu.selectedIndex, gameState.player);
            if (success) {
                const item = items[this.itemMenu.selectedIndex];
                this.battleLog.push(`Used ${item.name}!`);
                this.itemMenu.active = false;
                this.enemyTurn(gameState);
            }
        }
        if (input.bPressed) {
            this.itemMenu.active = false;
            this.battleLog.push('Select action with ⬆️⬇️');
        }
    }

    executeAction = (index, gameState) => {
        switch(index) {
            case 0: // Attack
                this.performAttack(gameState);
                break;
            case 1: // Magic
                this.openMagicMenu();
                break;
            case 2: // Items
                this.openItemMenu();
                break;
            case 3: // Run
                this.attemptRun(gameState);
                break;
        }
    }

    performAttack = (gameState) => {
        if (this.currentEnemy) {
            const damage = 3;
            this.currentEnemy.hp -= damage;
            this.battleLog.push(`Dealt ${damage} damage!`);
            if (this.currentEnemy.hp <= 0) {
                this.endBattle(true);
            } else {
                this.enemyTurn(gameState);
            }
        }
    }

    enemyTurn = (gameState) => {
        if (this.currentEnemy && this.currentEnemy.hp > 0) {
            const damage = 2;
            gameState.player.stats.hp -= damage;
            this.battleLog.push(`Enemy dealt ${damage} damage!`);
            this.battleLog.push('Select action with ⬆️⬇️');

            if (gameState.player.stats.hp <= 0) {
                this.endBattle(false);
            }
        }
    }

    openMagicMenu = () => {
        this.magicMenu.active = true;
        this.magicMenu.selectedIndex = 0;
        this.battleLog.push('Select a spell');
        this.battleLog.push('Use ⬆️⬇️ and Z');
    }

    openItemMenu = () => {
        this.itemMenu.active = true;
        this.itemMenu.selectedIndex = 0;
        this.battleLog.push('Select an item');
        this.battleLog.push('Use ⬆️⬇️ and Z');
    }

    attemptRun = (gameState) => {
        if (Math.random() < 0.75) {
            this.battleLog.push('Got away safely!');
            this.endBattle(false);
        } else {
            this.battleLog.push('Could not escape!');
            this.enemyTurn(gameState);
        }
    }

    endBattle = (victory) => {
        if (victory) {
            this.battleLog.push('Victory!');
        }
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
        renderer.drawCharacter('🧙‍♂️', 30, 60, 24);

        // Draw player stats
        renderer.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        renderer.ctx.fillRect(15, 88, 60, 24);
        renderer.drawStats(40, 100);

        // Draw battle log background with more width
        renderer.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        renderer.ctx.fillRect(15, 10, 130, 30);

        // Draw last two battle log messages with adjusted position
        const lastMessages = this.battleLog.slice(-2);
        lastMessages.forEach((msg, i) => {
            renderer.ctx.fillStyle = '#ffffff';
            renderer.drawText(msg, 75, 20 + (i * 12), 8);
        });

        // Draw controls hint at the bottom with adjusted position
        renderer.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        renderer.ctx.fillRect(15, 115, 130, 20);
        renderer.ctx.fillStyle = '#ffffff';
        renderer.drawText('⬆️⬇️:Select  Z:OK  X:Back', 75, 127, 8);

        if (this.magicMenu.active) {
            // Draw magic menu
            renderer.ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
            renderer.ctx.fillRect(85, 45, 75, 70);

            renderer.gameState.player.spells.forEach((spell, index) => {
                const isSelected = index === this.magicMenu.selectedIndex;
                renderer.ctx.fillStyle = '#ffffff';
                renderer.drawText(
                    `${isSelected ? '▶️' : '  '}${spell.name}`,
                    90,
                    55 + (index * 15),
                    10
                );
                renderer.drawText(
                    `MP: ${spell.mpCost}`,
                    90,
                    63 + (index * 15),
                    8
                );
            });
        } else if (this.itemMenu.active) {
            // Draw item menu
            renderer.ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
            renderer.ctx.fillRect(85, 45, 75, 70);

            renderer.gameState.inventory.forEach((item, index) => {
                const isSelected = index === this.itemMenu.selectedIndex;
                renderer.ctx.fillStyle = '#ffffff';
                renderer.drawText(
                    `${isSelected ? '▶️' : '  '}${item.name} x${item.quantity}`,
                    90,
                    55 + (index * 15),
                    10
                );
            });
        } else {
            // Draw battle menu background
            renderer.ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
            renderer.ctx.fillRect(85, 45, 75, 70);

            // Draw battle menu options
            this.battleMenu.options.forEach((option, index) => {
                const isSelected = index === this.battleMenu.selectedIndex;
                renderer.ctx.fillStyle = '#ffffff';
                renderer.drawText(
                    `${isSelected ? '▶️' : '  '}${option}`,
                    120,
                    55 + (index * 15),
                    10
                );
            });
        }
    }
}
