export class InputHandler {
    constructor() {
        this.keys = {
            up: false,
            down: false,
            left: false,
            right: false,
            a: false,
            b: false,
            x: false,
            y: false,
            start: false,
            select: false
        };

        // Track previous state to handle button press events
        this.previousKeys = { ...this.keys };

        this.setupKeyboardControls();
        this.setupButtonControls();

        // Debug: Log when instance is created
        console.log('InputHandler initialized');
    }

    setupKeyboardControls = () => {
        const keyMap = {
            'ArrowUp': 'up',
            'ArrowDown': 'down',
            'ArrowLeft': 'left',
            'ArrowRight': 'right',
            'z': 'a',
            'x': 'b',
            'c': 'x',
            'v': 'y',
            'Enter': 'start',
            'Shift': 'select'
        };

        document.addEventListener('keydown', (e) => {
            console.log('Keydown event:', e.key); // Debug log
            const key = keyMap[e.key];
            if (key) {
                e.preventDefault();
                this.keys[key] = true;
                console.log('Key pressed:', key, this.keys); // Debug log with state
            }
        });

        document.addEventListener('keyup', (e) => {
            const key = keyMap[e.key];
            if (key) {
                e.preventDefault();
                this.keys[key] = false;
                console.log('Key released:', key, this.keys); // Debug log with state
            }
        });
    }

    setupButtonControls = () => {
        const buttons = {
            '.up': 'up',
            '.down': 'down',
            '.left': 'left',
            '.right': 'right',
            '.a': 'a',
            '.b': 'b',
            '.x': 'x',
            '.y': 'y',
            '.start': 'start',
            '.select': 'select'
        };

        Object.entries(buttons).forEach(([selector, key]) => {
            const button = document.querySelector(selector);
            if (button) {
                button.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    this.keys[key] = true;
                    console.log('Button touched:', key); // Debug log
                });
                button.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    this.keys[key] = false;
                });
                button.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    this.keys[key] = true;
                    console.log('Button clicked:', key); // Debug log
                });
                button.addEventListener('mouseup', (e) => {
                    e.preventDefault();
                    this.keys[key] = false;
                });
                button.addEventListener('mouseleave', () => {
                    this.keys[key] = false;
                });
            } else {
                console.warn(`Button not found: ${selector}`); // Debug warning
            }
        });
    }

    getInput = () => {
        const input = {
            ...this.keys,
            // Add "just pressed" states for all buttons
            upPressed: this.keys.up && !this.previousKeys.up,
            downPressed: this.keys.down && !this.previousKeys.down,
            leftPressed: this.keys.left && !this.previousKeys.left,
            rightPressed: this.keys.right && !this.previousKeys.right,
            aPressed: this.keys.a && !this.previousKeys.a,
            bPressed: this.keys.b && !this.previousKeys.b,
            xPressed: this.keys.x && !this.previousKeys.x,
            yPressed: this.keys.y && !this.previousKeys.y,
            startPressed: this.keys.start && !this.previousKeys.start,
            selectPressed: this.keys.select && !this.previousKeys.select
        };

        // Debug log for pressed states
        if (Object.values(input).some(v => v)) {
            console.log('Current input state:', input);
        }

        // Update previous keys state
        Object.keys(this.keys).forEach(key => {
            this.previousKeys[key] = this.keys[key];
        });

        return input;
    }

    clearInputs = () => {
        Object.keys(this.keys).forEach(key => {
            this.keys[key] = false;
            this.previousKeys[key] = false;
        });
    }
}
