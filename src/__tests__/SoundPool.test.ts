import { NativeModules } from 'react-native';
import SoundPool, { SoundPoolManager } from '../index';

const mockNativeSoundPool = NativeModules.SoundPool;

describe('SoundPool (Low-Level API)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes pool capacity', async () => {
    const success = await SoundPool.initPool(16);
    expect(mockNativeSoundPool.initPool).toHaveBeenCalledWith(16);
    expect(success).toBe(true);
  });

  it('loads an audio file and returns soundId', async () => {
    const soundId = await SoundPool.load('card_slide_7.wav');
    expect(mockNativeSoundPool.load).toHaveBeenCalledWith('card_slide_7.wav');
    expect(soundId).toBe(42);
  });

  it('plays loaded sound with options', async () => {
    const streamId = await SoundPool.play(42, {
      volume: 0.8,
      leftVolume: 0.7,
      rightVolume: 0.9,
      priority: 2,
      loop: true,
      rate: 1.5,
    });

    expect(mockNativeSoundPool.play).toHaveBeenCalledWith(42, 0.7, 0.9, 2, -1, 1.5);
    expect(streamId).toBe(101);
  });

  it('stops, pauses, resumes and controls streams', () => {
    SoundPool.stop(101);
    expect(mockNativeSoundPool.stop).toHaveBeenCalledWith(101);

    SoundPool.pause(101);
    expect(mockNativeSoundPool.pause).toHaveBeenCalledWith(101);

    SoundPool.resume(101);
    expect(mockNativeSoundPool.resume).toHaveBeenCalledWith(101);

    SoundPool.setVolume(101, 0.5, 0.5);
    expect(mockNativeSoundPool.setVolume).toHaveBeenCalledWith(101, 0.5, 0.5);

    SoundPool.setRate(101, 1.2);
    expect(mockNativeSoundPool.setRate).toHaveBeenCalledWith(101, 1.2);

    SoundPool.setLoop(101, 3);
    expect(mockNativeSoundPool.setLoop).toHaveBeenCalledWith(101, 3);

    SoundPool.stopAll();
    expect(mockNativeSoundPool.stopAll).toHaveBeenCalled();

    SoundPool.unload(42);
    expect(mockNativeSoundPool.unload).toHaveBeenCalledWith(42);

    SoundPool.releasePool();
    expect(mockNativeSoundPool.releasePool).toHaveBeenCalled();
  });

  it('configures audio session category on iOS', () => {
    SoundPool.setCategory('Playback', true);
    expect(mockNativeSoundPool.setCategory).toHaveBeenCalledWith('Playback', true);
  });
});

describe('SoundPoolManager (High-Level API)', () => {
  let manager: SoundPoolManager;

  beforeEach(() => {
    jest.clearAllMocks();
    manager = new SoundPoolManager();
  });

  it('preloads sound manifest', async () => {
    await manager.preload({
      cardSlide: 'card_slide_7.wav',
      chipLay: 'chip_lay_1.wav',
    });

    expect(mockNativeSoundPool.load).toHaveBeenCalledWith('card_slide_7.wav');
    expect(mockNativeSoundPool.load).toHaveBeenCalledWith('chip_lay_1.wav');
  });

  it('plays preloaded sound by name', async () => {
    await manager.loadSound('chipLay', 'chip_lay_1.wav');
    const streamId = await manager.play('chipLay', { volume: 0.75 });

    expect(mockNativeSoundPool.play).toHaveBeenCalledWith(42, 0.75, 0.75, 1, 0, 1.0);
    expect(streamId).toBe(101);
  });

  it('ignores playback when sound is disabled', async () => {
    await manager.loadSound('chipLay', 'chip_lay_1.wav');
    manager.setSoundEnabled(false);

    const streamId = await manager.play('chipLay');
    expect(streamId).toBe(-1);
    expect(mockNativeSoundPool.play).not.toHaveBeenCalled();
    expect(manager.isSoundEnabled()).toBe(false);
  });

  it('supports fire-and-forget playAsync without errors', async () => {
    await manager.loadSound('chipLay', 'chip_lay_1.wav');
    manager.playAsync('chipLay', { volume: 0.8 });

    expect(mockNativeSoundPool.play).toHaveBeenCalled();
  });
});
