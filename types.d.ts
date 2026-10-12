export interface PlayOptions {
    /**
     * Playback volume from 0.0 to 1.0. Defaults to 1.0.
     */
    volume?: number;
    /**
     * Left channel volume from 0.0 to 1.0. Defaults to `volume`.
     */
    leftVolume?: number;
    /**
     * Right channel volume from 0.0 to 1.0. Defaults to `volume`.
     */
    rightVolume?: number;
    /**
     * Stream priority (0 = lowest). Defaults to 1.
     */
    priority?: number;
    /**
     * Loop configuration:
     * - `false` or `0`: play once (default)
     * - `true` or `-1`: loop indefinitely
     * - positive integer: loop N additional times
     */
    loop?: boolean | number;
    /**
     * Playback speed multiplier (0.5 to 2.0). Defaults to 1.0.
     */
    rate?: number;
}
export type AudioCategory = 'Playback' | 'Ambient';
export interface NativeSoundPoolInterface {
    initPool(maxStreamsCount: number): Promise<boolean>;
    load(source: string): Promise<number>;
    play(soundId: number, leftVolume: number, rightVolume: number, priority: number, loop: number, rate: number): Promise<number>;
    stop(streamId: number): void;
    pause(streamId: number): void;
    resume(streamId: number): void;
    autoPause(): void;
    autoResume(): void;
    stopAll(): void;
    setVolume(streamId: number, leftVolume: number, rightVolume: number): void;
    setRate(streamId: number, rate: number): void;
    setLoop(streamId: number, loop: number): void;
    setMasterVolume(volume: number): void;
    setCategory(category: string, mixWithOthers: boolean): void;
    unload(soundId: number): void;
    releasePool(): void;
    reactivate?(): void;
}
//# sourceMappingURL=types.d.ts.map