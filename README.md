# Emoji Console RPG

A retro-style RPG game built with vanilla JavaScript, featuring emoji-based graphics and a classic GameBoy-inspired interface.

## Features

### Core Gameplay

- 🎮 Classic GameBoy-style interface with authentic color palette
- 👾 Emoji-based graphics and characters
- 🗺️ Tile-based movement system with smooth character transitions
- 🎯 Grid-based collision detection
- 💾 Save/load game functionality

### Battle System

- ⚔️ Turn-based battle system with dynamic animations
- 🔮 Magic system with MP cost management
- 🎒 Item inventory system with usable items
- 🏃 Battle escape mechanics with success probability
- 💫 Visual effects including enemy shake animations
- 📊 HP/MP status bars with color-coded indicators

### UI Features

- 📱 Mobile-responsive design
- 💬 Dynamic battle log system
- 📜 Context-sensitive menu system
- 🎯 Cursor-based menu navigation
- 🌟 Splash screen with animations
- ⚙️ Game state management with multiple screens (Splash, Menu, Exploring, Battle)

### Character System

- 🧙‍♂️ Player character with stats management
- 👹 Enemy encounter system
- 🏃‍♂️ Smooth movement controls with configurable speed
- ✨ Character status tracking (HP/MP)

## Controls

- Arrow keys / D-pad: Move character
- A (Z key): Confirm/Action
- B (X key): Cancel/Back
- Start (Enter key): Open menu
- Select (Shift key): Secondary menu

### Battle Controls

- ⬆️⬇️: Navigate menu options
- Z: Confirm selection
- X: Back/Cancel action

## Development

This game is built using vanilla HTML, CSS, and JavaScript with a modular architecture. No build tools or frameworks required - just serve the files and play!

### Project Structure

```
emoji-console-rpg/
├── index.html          # Main game HTML
├── styles/
│   └── main.css        # Game styles
└── js/
    ├── main.js         # Game initialization
    ├── battle/         # Battle system
    ├── entities/       # Game entities
    ├── graphics/       # Rendering system
    ├── input/          # Input handling
    ├── state/          # Game state management
    └── world/          # World/map management
```

## Getting Started

1. Clone the repository
2. Open index.html in a modern web browser
3. Start playing!

## License

MIT License - feel free to use and modify for your own projects!
