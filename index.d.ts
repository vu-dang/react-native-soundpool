import { PlayOptions, AudioCategory } from './types';
import { SoundPoolManager } from './SoundPoolManager';
export * from './types';
export { SoundPoolManager };
/**
 * Low-level SoundPool API providing direct access to native SoundPool operations.
 */
export declare const SoundPool: {
    /**
     * Initialize pool stream capacity.
     * @param maxStreams Maximum concurrent audio voices (default 32)
     */
    initPool: (maxStreams?: number) => Promise<boolean>;
    /**
     * Load an audio file into memory.
     * @param source Raw resource name (e.g. 'card_slide') or file path
     * @returns Sound ID assigned by native pool
     */
    load: (source: string) => Promise<number>;
    /**
     * Play a loaded sound with options.
     * @param soundId Sound ID returned by load()
     * @param options Volume, pan, loop, priority, rate
     * @returns Stream ID
     */
    play: (soundId: number, options?: PlayOptions) => Promise<number>;
    /**
     * Stop an active audio stream.
     */
    stop: (streamId: number) => void;
    /**
     * Pause an active audio stream.
     */
    pause: (streamId: number) => void;
    /**
     * Resume a paused audio stream.
     */
    resume: (streamId: number) => void;
    /**
     * Stop all active streams.
     */
    stopAll: () => void;
    /**
     * Set stream volume.
     */
    setVolume: (streamId: number, leftVolume: number, rightVolume?: number) => void;
    /**
     * Set stream playback speed multiplier (0.5 to 2.0).
     */
    setRate: (streamId: number, rate: number) => void;
    /**
     * Set stream loop count (-1 for infinite).
     */
    setLoop: (streamId: number, loop: number) => void;
    /**
     * Set global master volume (0.0 to 1.0).
     */
    setMasterVolume: (volume: number) => void;
    /**
     * Configure audio session category on iOS.
     */
    setCategory: (category?: AudioCategory, mixWithOthers?: boolean) => void;
    /**
     * Unload sound by sound ID.
     */
    unload: (soundId: number) => void;
    /**
     * Release and destroy the native sound pool.
     */
    releasePool: () => void;
};
export default SoundPool;
//# sourceMappingURL=index.d.ts.map