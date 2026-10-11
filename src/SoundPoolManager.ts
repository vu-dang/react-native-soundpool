import { NativeModules, Platform } from 'react-native';
import { NativeSoundPoolInterface, PlayOptions, AudioCategory } from './types';

const NativeSoundPool: NativeSoundPoolInterface = NativeModules.SoundPool;

if (!NativeSoundPool) {
  console.warn(
    '[react-native-soundpool] NativeModules.SoundPool is not linked. Audio playback will be disabled.'
  );
}

export class SoundPoolManager {
  private soundMap: Map<string, number> = new Map();
  private soundEnabled: boolean = true;
  private isLoaded: boolean = false;
  private masterVolume: number = 1.0;

  constructor() {
    if (NativeSoundPool && Platform.OS === 'ios') {
      // Configure audio session to Ambient with mixWithOthers=true by default for non-interrupting game audio
      NativeSoundPool.setCategory('Ambient', true);
    }
  }

  /**
   * Configure the iOS audio session category.
   * @param category 'Ambient' (default for game sound effects, mixes with Apple Music/Spotify) or 'Playback' (plays even when silent switch is on)
   * @param mixWithOthers When true (default), background music (Spotify, Apple Music, podcasts) is never interrupted.
   */
  public setCategory(category: AudioCategory = 'Ambient', mixWithOthers: boolean = true): void {
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
  public async loadSound(name: string, source: string): Promise<number> {
    if (!NativeSoundPool) return -1;
    try {
      const soundId = await NativeSoundPool.load(source);
      this.soundMap.set(name, soundId);
      return soundId;
    } catch (error) {
      console.warn(`[react-native-soundpool] Failed to load "${name}" (${source}):`, error);
      return -1;
    }
  }

  /**
   * Preload multiple audio clips at once from a key-value manifest.
   * @param manifest Map of sound names to resource filenames: `{ cardSlide: 'card_slide_7.wav', chipLay: 'chip_lay_1.wav' }`
   */
  public async preload(manifest: Record<string, string>): Promise<void> {
    if (this.isLoaded || !NativeSoundPool) return;
    this.isLoaded = true;

    const entries = Object.entries(manifest);
    await Promise.all(
      entries.map(async ([name, file]) => {
        await this.loadSound(name, file);
      })
    );
  }

  /**
   * Play a preloaded sound effect.
   * @param name Key of the sound effect
   * @param options Playback options (volume, leftVolume, rightVolume, rate, loop, priority)
   * @returns Stream ID of the playing sound instance, or -1 if sound is disabled / not loaded
   */
  public async play(name: string, options?: PlayOptions): Promise<number> {
    if (!this.soundEnabled || !NativeSoundPool) return -1;

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
    } else if (typeof options?.loop === 'number') {
      loopValue = options.loop;
    }

    try {
      return await NativeSoundPool.play(
        soundId,
        leftVolume,
        rightVolume,
        priority,
        loopValue,
        rate
      );
    } catch (error) {
      // Streams busy or play failed silently
      return -1;
    }
  }

  /**
   * Fire-and-forget play method for instantaneous, unawaited UI triggers (card deals, chip drops).
   */
  public playAsync(name: string, options?: PlayOptions): void {
    if (!this.soundEnabled || !NativeSoundPool) return;
    this.play(name, options).catch(() => {});
  }

  /**
   * Stop an active sound stream.
   * @param streamId Stream ID returned by `play()`
   */
  public stop(streamId: number): void {
    if (streamId > 0 && NativeSoundPool) {
      NativeSoundPool.stop(streamId);
    }
  }

  /**
   * Pause an active sound stream.
   */
  public pause(streamId: number): void {
    if (streamId > 0 && NativeSoundPool) {
      NativeSoundPool.pause(streamId);
    }
  }

  /**
   * Resume a paused sound stream.
   */
  public resume(streamId: number): void {
    if (streamId > 0 && NativeSoundPool) {
      NativeSoundPool.resume(streamId);
    }
  }

  /**
   * Stop all active sound streams across the pool.
   */
  public stopAll(): void {
    if (NativeSoundPool) {
      NativeSoundPool.stopAll();
    }
  }

  /**
   * Adjust volume for a playing stream.
   */
  public setVolume(streamId: number, volume: number): void {
    if (streamId > 0 && NativeSoundPool) {
      NativeSoundPool.setVolume(streamId, volume, volume);
    }
  }

  /**
   * Adjust master volume (0.0 to 1.0) applied across all sounds.
   */
  public setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    if (NativeSoundPool) {
      NativeSoundPool.setMasterVolume(this.masterVolume);
    }
  }

  /**
   * Enable or disable all sound playback.
   */
  public setSoundEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
    if (!enabled) {
      this.stopAll();
    }
  }

  /**
   * Check if sound playback is enabled.
   */
  public isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  /**
   * Unload a specific sound from memory.
   */
  public unload(name: string): void {
    const soundId = this.soundMap.get(name);
    if (soundId !== undefined && NativeSoundPool) {
      NativeSoundPool.unload(soundId);
      this.soundMap.delete(name);
    }
  }

  /**
   * Release all loaded sounds and shut down the native sound pool.
   */
  public release(): void {
    if (NativeSoundPool) {
      NativeSoundPool.releasePool();
    }
    this.soundMap.clear();
    this.isLoaded = false;
  }
}
