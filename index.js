import { NativeModules } from 'react-native';
import { SoundPoolManager } from './SoundPoolManager';
const NativeSoundPool = NativeModules.SoundPool;
export * from './types';
export { SoundPoolManager };
/**
 * Low-level SoundPool API providing direct access to native SoundPool operations.
 */
export const SoundPool = {
    /**
     * Initialize pool stream capacity.
     * @param maxStreams Maximum concurrent audio voices (default 32)
     */
    initPool: (maxStreams = 32) => {
        return NativeSoundPool?.initPool(maxStreams) ?? Promise.resolve(false);
    },
    /**
     * Load an audio file into memory.
     * @param source Raw resource name (e.g. 'card_slide') or file path
     * @returns Sound ID assigned by native pool
     */
    load: (source) => {
        return NativeSoundPool?.load(source) ?? Promise.reject(new Error('SoundPool not linked'));
    },
    /**
     * Play a loaded sound with options.
     * @param soundId Sound ID returned by load()
     * @param options Volume, pan, loop, priority, rate
     * @returns Stream ID
     */
    play: (soundId, options) => {
        const volume = options?.volume ?? 1.0;
        const left = options?.leftVolume ?? volume;
        const right = options?.rightVolume ?? volume;
        const priority = options?.priority ?? 1;
        const rate = options?.rate ?? 1.0;
        let loop = 0;
        if (typeof options?.loop === 'boolean') {
            loop = options.loop ? -1 : 0;
        }
        else if (typeof options?.loop === 'number') {
            loop = options.loop;
        }
        return (NativeSoundPool?.play(soundId, left, right, priority, loop, rate) ??
            Promise.reject(new Error('SoundPool not linked')));
    },
    /**
     * Stop an active audio stream.
     */
    stop: (streamId) => {
        NativeSoundPool?.stop(streamId);
    },
    /**
     * Pause an active audio stream.
     */
    pause: (streamId) => {
        NativeSoundPool?.pause(streamId);
    },
    /**
     * Resume a paused audio stream.
     */
    resume: (streamId) => {
        NativeSoundPool?.resume(streamId);
    },
    /**
     * Stop all active streams.
     */
    stopAll: () => {
        NativeSoundPool?.stopAll();
    },
    /**
     * Set stream volume.
     */
    setVolume: (streamId, leftVolume, rightVolume = leftVolume) => {
        NativeSoundPool?.setVolume(streamId, leftVolume, rightVolume);
    },
    /**
     * Set stream playback speed multiplier (0.5 to 2.0).
     */
    setRate: (streamId, rate) => {
        NativeSoundPool?.setRate(streamId, rate);
    },
    /**
     * Set stream loop count (-1 for infinite).
     */
    setLoop: (streamId, loop) => {
        NativeSoundPool?.setLoop(streamId, loop);
    },
    /**
     * Set global master volume (0.0 to 1.0).
     */
    setMasterVolume: (volume) => {
        NativeSoundPool?.setMasterVolume(volume);
    },
    /**
     * Configure audio session category on iOS.
     */
    setCategory: (category = 'Playback', mixWithOthers = true) => {
        NativeSoundPool?.setCategory(category, mixWithOthers);
    },
    /**
     * Unload sound by sound ID.
     */
    unload: (soundId) => {
        NativeSoundPool?.unload(soundId);
    },
    /**
     * Release and destroy the native sound pool.
     */
    releasePool: () => {
        NativeSoundPool?.releasePool();
    },
};
export default SoundPool;
//# sourceMappingURL=index.js.map