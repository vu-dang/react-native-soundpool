import { PlayOptions, AudioCategory } from './types';
export declare class SoundPoolManager {
    private soundMap;
    private soundEnabled;
    private isLoaded;
    private masterVolume;
    constructor();
    /**
     * Configure the iOS audio session category.
     * @param category 'Playback' (default, plays even if device is silenced) or 'Ambient' (silenced by hardware mute switch)
     * @param mixWithOthers When true (default), background music (Spotify, Apple Music, podcasts) is never interrupted.
     */
    setCategory(category?: AudioCategory, mixWithOthers?: boolean): void;
    /**
     * Preload an audio clip into memory.
     * @param name Unique key for the sound effect (e.g. 'cardSlide')
     * @param source Resource name or path (e.g. 'card_slide_7.wav')
     * @returns Sound ID assigned by the native sound pool
     */
    loadSound(name: string, source: string): Promise<number>;
    /**
     * Preload multiple audio clips at once from a key-value manifest.
     * @param manifest Map of sound names to resource filenames: `{ cardSlide: 'card_slide_7.wav', chipLay: 'chip_lay_1.wav' }`
     */
    preload(manifest: Record<string, string>): Promise<void>;
    /**
     * Play a preloaded sound effect.
     * @param name Key of the sound effect
     * @param options Playback options (volume, leftVolume, rightVolume, rate, loop, priority)
     * @returns Stream ID of the playing sound instance, or -1 if sound is disabled / not loaded
     */
    play(name: string, options?: PlayOptions): Promise<number>;
    /**
     * Fire-and-forget play method for instantaneous, unawaited UI triggers (card deals, chip drops).
     */
    playAsync(name: string, options?: PlayOptions): void;
    /**
     * Stop an active sound stream.
     * @param streamId Stream ID returned by `play()`
     */
    stop(streamId: number): void;
    /**
     * Pause an active sound stream.
     */
    pause(streamId: number): void;
    /**
     * Resume a paused sound stream.
     */
    resume(streamId: number): void;
    /**
     * Stop all active sound streams across the pool.
     */
    stopAll(): void;
    /**
     * Adjust volume for a playing stream.
     */
    setVolume(streamId: number, volume: number): void;
    /**
     * Adjust master volume (0.0 to 1.0) applied across all sounds.
     */
    setMasterVolume(volume: number): void;
    /**
     * Enable or disable all sound playback.
     */
    setSoundEnabled(enabled: boolean): void;
    /**
     * Check if sound playback is enabled.
     */
    isSoundEnabled(): boolean;
    /**
     * Unload a specific sound from memory.
     */
    unload(name: string): void;
    /**
     * Release all loaded sounds and shut down the native sound pool.
     */
    release(): void;
}
//# sourceMappingURL=SoundPoolManager.d.ts.map