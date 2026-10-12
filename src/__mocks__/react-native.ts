export const NativeModules: { SoundPool: any; [key: string]: any } = {
  SoundPool: {
    initPool: jest.fn().mockResolvedValue(true),
    load: jest.fn().mockImplementation((source: string) => Promise.resolve(42)),
    play: jest.fn().mockImplementation(() => Promise.resolve(101)),
    stop: jest.fn(),
    pause: jest.fn(),
    resume: jest.fn(),
    autoPause: jest.fn(),
    autoResume: jest.fn(),
    stopAll: jest.fn(),
    setVolume: jest.fn(),
    setRate: jest.fn(),
    setLoop: jest.fn(),
    setMasterVolume: jest.fn(),
    setCategory: jest.fn(),
    unload: jest.fn(),
    releasePool: jest.fn(),
    reactivate: jest.fn(),
  },
};

export const Platform = {
  OS: 'ios',
  select: jest.fn((dict: any) => dict.ios || dict.default),
};

export const AppState = {
  addEventListener: jest.fn().mockReturnValue({ remove: jest.fn() }),
  currentState: 'active',
};
