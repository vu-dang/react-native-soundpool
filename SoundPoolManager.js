import { NativeModules, Platform } from 'react-native';
const NativeSoundPool = NativeModules.SoundPool;
if (!NativeSoundPool) {
    console.warn('[react-native-soundpool] NativeModules.SoundPool is not linked. Audio playback will be disabled.');
}
export class SoundPoolManager {
    constructor() {
        this.soundMap = new Map();
        this.soundEnabled = true;
        this.isLoaded = false;
        this.masterVolume = 1.0;
        if (NativeSoundPool && Platform.OS === 'ios') {
            // Configure audio session to Playback with mixWithOthers=true by default
            NativeSoundPool.setCategory('Playback', true);
        }
    }
    /**
     * Configure the iOS audio session category.
     * @param category 'Playback' (default, plays even if device is silenced) or 'Ambient' (silenced by hardware mute switch)
     * @param mixWithOthers When true (default), background music (Spotify, Apple Music, podcasts) is never interrupted.
     */
    setCategory(category = 'Playback', mixWithOthers = true) {
        if (NativeSoundPool && Platform.OS === 'ios') {
            NativeSoundPool.setCategory(category, mixWithOthers);
        }
    }
    /**
     * Preload an audio clip into memory.
     * @param name Unique key for the sound effect (e.g. 'cardSlide')
     * @param source Resource name or path (e.g. 'card_slide_7.wav')
     * @returns Sound ID assigned by the native sound pool
     */
    async loadSound(name, source) {
        if (!NativeSoundPool)
            return -1;
        try {
            const soundId = await NativeSoundPool.load(source);
            this.soundMap.set(name, soundId);
            return soundId;
        }
        catch (error) {
            console.warn(`[react-native-soundpool] Failed to load "${name}" (${source}):`, error);
            return -1;
        }
    }
    /**
     * Preload multiple audio clips at once from a key-value manifest.
     * @param manifest Map of sound names to resource filenames: `{ cardSlide: 'card_slide_7.wav', chipLay: 'chip_lay_1.wav' }`
     */
    async preload(manifest) {
        if (this.isLoaded || !NativeSoundPool)
            return;
        this.isLoaded = true;
        const entries = Object.entries(manifest);
        await Promise.all(entries.map(async ([name, file]) => {
            await this.loadSound(name, file);
        }));
    }
    /**
     * Play a preloaded sound effect.
     * @param name Key of the sound effect
     * @param options Playback options (volume, leftVolume, rightVolume, rate, loop, priority)
     * @returns Stream ID of the playing sound instance, or -1 if sound is disabled / not loaded
     */
    async play(name, options) {
        if (!this.soundEnabled || !NativeSoundPool)
            return -1;
        const soundId = this.soundMap.get(name);
        if (soundId === undefined || soundId <= 0) {
            return -1;
        }
        const volume = options?.volume ?? 1.0;
        const leftVolume = options?.leftVolume ?? volume;
        const rightVolume = options?.rightVolume ?? volume;
        const priority = options?.priority ?? 1;
        const rate = options?.rate ?? 1.0;
        let loopValue = 0;
        if (typeof options?.loop === 'boolean') {
            loopValue = options.loop ? -1 : 0;
        }
        else if (typeof options?.loop === 'number') {
            loopValue = options.loop;
        }
        try {
            return await NativeSoundPool.play(soundId, leftVolume, rightVolume, priority, loopValue, rate);
        }
        catch (error) {
            // Streams busy or play failed silently
            return -1;
        }
    }
    /**
     * Fire-and-forget play method for instantaneous, unawaited UI triggers (card deals, chip drops).
     */
    playAsync(name, options) {
        if (!this.soundEnabled || !NativeSoundPool)
            return;
        this.play(name, options).catch(() => { });
    }
    /**
     * Stop an active sound stream.
     * @param streamId Stream ID returned by `play()`
     */
    stop(streamId) {
        if (streamId > 0 && NativeSoundPool) {
            NativeSoundPool.stop(streamId);
        }
    }
    /**
     * Pause an active sound stream.
     */
    pause(streamId) {
        if (streamId > 0 && NativeSoundPool) {
            NativeSoundPool.pause(streamId);
        }
    }
    /**
     * Resume a paused sound stream.
     */
    resume(streamId) {
        if (streamId > 0 && NativeSoundPool) {
            NativeSoundPool.resume(streamId);
        }
    }
    /**
     * Stop all active sound streams across the pool.
     */
    stopAll() {
        if (NativeSoundPool) {
            NativeSoundPool.stopAll();
        }
    }
    /**
     * Adjust volume for a playing stream.
     */
    setVolume(streamId, volume) {
        if (streamId > 0 && NativeSoundPool) {
            NativeSoundPool.setVolume(streamId, volume, volume);
        }
    }
    /**
     * Adjust master volume (0.0 to 1.0) applied across all sounds.
     */
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        if (NativeSoundPool) {
            NativeSoundPool.setMasterVolume(this.masterVolume);
        }
    }
    /**
     * Enable or disable all sound playback.
     */
    setSoundEnabled(enabled) {
        this.soundEnabled = enabled;
        if (!enabled) {
            this.stopAll();
        }
    }
    /**
     * Check if sound playback is enabled.
     */
    isSoundEnabled() {
        return this.soundEnabled;
    }
    /**
     * Unload a specific sound from memory.
     */
    unload(name) {
        const soundId = this.soundMap.get(name);
        if (soundId !== undefined && NativeSoundPool) {
            NativeSoundPool.unload(soundId);
            this.soundMap.delete(name);
        }
    }
    /**
     * Release all loaded sounds and shut down the native sound pool.
     */
    release() {
        if (NativeSoundPool) {
            NativeSoundPool.releasePool();
        }
        this.soundMap.clear();
        this.isLoaded = false;
    }
}
//# sourceMappingURL=SoundPoolManager.js.map