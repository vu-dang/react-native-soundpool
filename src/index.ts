import { NativeModules } from 'react-native';
import { NativeSoundPoolInterface, PlayOptions, AudioCategory } from './types';
import { SoundPoolManager } from './SoundPoolManager';

const NativeSoundPool: NativeSoundPoolInterface = NativeModules.SoundPool;

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
  initPool: (maxStreams: number = 32): Promise<boolean> => {
    return NativeSoundPool?.initPool(maxStreams) ?? Promise.resolve(false);
  },

  /**
   * Load an audio file into memory.
   * @param source Raw resource name (e.g. 'card_slide') or file path
   * @returns Sound ID assigned by native pool
   */
  load: (source: string): Promise<number> => {
    return NativeSoundPool?.load(source) ?? Promise.reject(new Error('SoundPool not linked'));
  },

  /**
   * Play a loaded sound with options.
   * @param soundId Sound ID returned by load()
   * @param options Volume, pan, loop, priority, rate
   * @returns Stream ID
   */
  play: (soundId: number, options?: PlayOptions): Promise<number> => {
    const volume = options?.volume ?? 1.0;
    const left = options?.leftVolume ?? volume;
    const right = options?.rightVolume ?? volume;
    const priority = options?.priority ?? 1;
    const rate = options?.rate ?? 1.0;

    let loop = 0;
    if (typeof options?.loop === 'boolean') {
      loop = options.loop ? -1 : 0;
    } else if (typeof options?.loop === 'number') {
      loop = options.loop;
    }

    return (
      NativeSoundPool?.play(soundId, left, right, priority, loop, rate) ??
      Promise.reject(new Error('SoundPool not linked'))
    );
  },

  /**
   * Stop an active audio stream.
   */
  stop: (streamId: number): void => {
    NativeSoundPool?.stop(streamId);
  },

  /**
   * Pause an active audio stream.
   */
  pause: (streamId: number): void => {
    NativeSoundPool?.pause(streamId);
  },

  /**
   * Resume a paused audio stream.
   */
  resume: (streamId: number): void => {
    NativeSoundPool?.resume(streamId);
  },

  /**
   * Stop all active streams.
   */
  stopAll: (): void => {
    NativeSoundPool?.stopAll();
  },

  /**
   * Set stream volume.
   */
  setVolume: (streamId: number, leftVolume: number, rightVolume: number = leftVolume): void => {
    NativeSoundPool?.setVolume(streamId, leftVolume, rightVolume);
  },

  /**
   * Set stream playback speed multiplier (0.5 to 2.0).
   */
  setRate: (streamId: number, rate: number): void => {
    NativeSoundPool?.setRate(streamId, rate);
  },

  /**
   * Set stream loop count (-1 for infinite).
   */
  setLoop: (streamId: number, loop: number): void => {
    NativeSoundPool?.setLoop(streamId, loop);
  },

  /**
   * Set global master volume (0.0 to 1.0).
   */
  setMasterVolume: (volume: number): void => {
    NativeSoundPool?.setMasterVolume(volume);
  },

  /**
   * Configure audio session category on iOS.
   */
  setCategory: (category: AudioCategory = 'Playback', mixWithOthers: boolean = true): void => {
    NativeSoundPool?.setCategory(category, mixWithOthers);
  },

  /**
   * Unload sound by sound ID.
   */
  unload: (soundId: number): void => {
    NativeSoundPool?.unload(soundId);
  },

  /**
   * Release and destroy the native sound pool.
   */
  releasePool: (): void => {
    NativeSoundPool?.releasePool();
  },
};

export default SoundPool;
