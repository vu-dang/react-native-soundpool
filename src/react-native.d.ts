declare module 'react-native' {
  export const NativeModules: {
    SoundPool?: any;
    [key: string]: any;
  };
  export const Platform: {
    OS: 'ios' | 'android' | 'windows' | 'macos' | 'web';
    select: <T>(specifics: { [platform: string]: T }) => T;
  };
}
