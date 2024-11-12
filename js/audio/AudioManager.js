export class AudioManager {
    constructor() {
        this.audioContext = null;
        this.sounds = {
            startup: null,
            bgm: null,
            select: null,
            damage: null
        };
        this.bgmNode = null;
        this.initialized = false;
    }

    async initialize() {
        if (this.initialized) return;

        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            await this.audioContext.resume();
            await this.createSounds();
            this.initialized = true;
            console.log('Audio system initialized successfully');
        } catch (error) {
            console.error('Failed to initialize audio system:', error);
        }
    }

    async createSounds() {
        // Create startup sound - a rising chord
        const startupBuffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.5, this.audioContext.sampleRate);
        const startupData = startupBuffer.getChannelData(0);
        for (let i = 0; i < startupBuffer.length; i++) {
            // Create a rising chord with multiple frequencies
            const t = i / this.audioContext.sampleRate;
            startupData[i] =
                0.2 * Math.sin(2 * Math.PI * 440 * Math.pow(2, t * 2) * t) + // Base frequency
                0.1 * Math.sin(2 * Math.PI * 554 * Math.pow(2, t * 2) * t) + // Major third
                0.1 * Math.sin(2 * Math.PI * 659 * Math.pow(2, t * 2) * t);  // Perfect fifth
            // Apply fade in/out envelope
            const envelope = Math.sin(Math.PI * t * 2);
            startupData[i] *= envelope;
        }
        this.sounds.startup = startupBuffer;

        // Create background music - a simple looping melody
        const bgmBuffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 2, this.audioContext.sampleRate);
        const bgmData = bgmBuffer.getChannelData(0);
        const notes = [440, 494, 523, 587, 659, 587, 523, 494]; // Simple scale
        const noteLength = this.audioContext.sampleRate / 4; // Quarter note length

        for (let i = 0; i < bgmBuffer.length; i++) {
            const noteIndex = Math.floor((i / noteLength) % notes.length);
            const t = i / this.audioContext.sampleRate;
            bgmData[i] =
                0.15 * Math.sin(2 * Math.PI * notes[noteIndex] * t) * // Main note
                (1 - (i % noteLength) / noteLength); // Note envelope
        }
        this.sounds.bgm = bgmBuffer;

        // Create UI select sound - a quick blip
        const selectBuffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.1, this.audioContext.sampleRate);
        const selectData = selectBuffer.getChannelData(0);
        for (let i = 0; i < selectBuffer.length; i++) {
            const t = i / this.audioContext.sampleRate;
            selectData[i] = 0.2 * Math.sin(2 * Math.PI * 880 * t) * Math.exp(-20 * t);
        }
        this.sounds.select = selectBuffer;

        // Create damage sound - a harsh noise burst
        const damageBuffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.2, this.audioContext.sampleRate);
        const damageData = damageBuffer.getChannelData(0);
        for (let i = 0; i < damageBuffer.length; i++) {
            const t = i / this.audioContext.sampleRate;
            damageData[i] =
                0.3 * (Math.random() * 2 - 1) * // Noise
                Math.exp(-10 * t); // Envelope
        }
        this.sounds.damage = damageBuffer;
    }

    async ensureAudioContext() {
        if (!this.initialized) {
            await this.initialize();
        } else if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
    }

    async playSound(soundName) {
        try {
            await this.ensureAudioContext();

            if (!this.sounds[soundName]) return null;

            const source = this.audioContext.createBufferSource();
            source.buffer = this.sounds[soundName];

            // Create gain node for volume control
            const gainNode = this.audioContext.createGain();
            gainNode.gain.value = 0.5; // Set volume to 50%

            // Connect nodes
            source.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            // Special handling for background music
            if (soundName === 'bgm') {
                source.loop = true;
                this.bgmNode = source;
            }

            source.start(0);
            return source;
        } catch (error) {
            console.error(`Failed to play sound ${soundName}:`, error);
            return null;
        }
    }

    async stopBgm() {
        if (this.bgmNode) {
            try {
                this.bgmNode.stop();
                this.bgmNode = null;
            } catch (error) {
                console.error('Failed to stop background music:', error);
            }
        }
    }

    async playStartup() {
        return this.playSound('startup');
    }

    async playBgm() {
        return this.playSound('bgm');
    }

    async playSelect() {
        return this.playSound('select');
    }

    async playDamage() {
        return this.playSound('damage');
    }
}
