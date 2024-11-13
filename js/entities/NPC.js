class NPC {
    constructor(x, y, emoji, dialogues) {
        this.x = x;
        this.y = y;
        this.emoji = emoji;
        this.name = this.getNameFromEmoji(emoji);
        this.dialogues = dialogues;
        this.width = 16;  // Match game grid
        this.height = 16; // Match game grid
        this.currentDialogueIndex = 0;
    }

    // Get a name based on the emoji
    getNameFromEmoji(emoji) {
        const emojiNames = {
            '👨‍🦳': 'Elder',
            '👩‍🌾': 'Farmer',
            '🧙‍♂️': 'Wizard',
            '👩‍🍳': 'Chef',
            '👨‍🏫': 'Teacher'
        };
        return emojiNames[emoji] || 'Villager';
    }

    // Get the current dialogue
    getCurrentDialogue() {
        return this.dialogues[this.currentDialogueIndex];
    }

    // Cycle through dialogues
    nextDialogue() {
        this.currentDialogueIndex =
            (this.currentDialogueIndex + 1) % this.dialogues.length;
    }

    // Check collision with player
    isCollidingWith(player) {
        const distance = Math.abs(player.x - this.x) + Math.abs(player.y - this.y);
        return distance <= 1; // Adjacent or same tile
    }

    // Render the NPC
    render(renderer) {
        renderer.ctx.font = '16px serif';
        renderer.ctx.textAlign = 'center';
        renderer.ctx.fillText(this.emoji, this.x * 16 + 8, this.y * 16 + 16);
    }
}

export default NPC;
