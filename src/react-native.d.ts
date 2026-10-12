declare module 'react-native' {
  export const NativeModules: {
    SoundPool?: any;
    [key: string]: any;
  };
  export const Platform: {
    OS: 'ios' | 'android' | 'windows' | 'macos' | 'web';
    select: <T>(specifics: { [platform: string]: T }) => T;
  };
  export type AppStateStatus = 'active' | 'background' | 'inactive' | 'unknown' | 'extension';
  export interface NativeEventSubscription {
    remove(): void;
  }
  export const AppState: {
    currentState: AppStateStatus;
    addEventListener(
      type: 'change' | 'memoryWarning' | 'blur' | 'focus',
      listener: (state: any) => void
    ): NativeEventSubscription;
  };
}
