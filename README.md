# @vu-dang/react-native-soundpool

[![npm version](https://img.shields.io/npm/v/@vu-dang/react-native-soundpool.svg)](https://www.npmjs.com/package/@vu-dang/react-native-soundpool)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/vu-dang/react-native-soundpool/pulls)

Ultra-low-latency, polyphonic game sound effects for React Native.

Powered by native **Android `SoundPool`** and **iOS `AVAudioPlayer` multi-voice audio pools**, `@vu-dang/react-native-soundpool` delivers instant, sub-5ms audio playback without interrupting active background music (Spotify, Apple Music, YouTube Music, Podcasts).

---

## Why @vu-dang/react-native-soundpool?

Most React Native audio libraries (like `react-native-sound` or `MediaPlayer`) were designed for long-form playback (songs, video soundtracks, podcasts). For mobile games and fast-paced UI interactions, they present major bottlenecks:

| Feature | `react-native-sound` / `MediaPlayer` | `@vu-dang/react-native-soundpool` |
| :--- | :--- | :--- |
| **Background Music** | ❌ Interrupts/pauses Spotify & Apple Music by claiming exclusive audio focus | ✅ **Seamless mixing**: Never interrupts user's background music |
| **Audio Latency** | ⚠️ 50ms – 200ms lag per trigger | ⚡ **< 5ms near-zero latency** |
| **Polyphony** | ⚠️ Requires JS-level instance pooling and manual busy-flag tracking | 🚀 **Native hardware polyphony**: Trigger overlapping sounds simultaneously |
| **Memory Footprint** | ⚠️ Heavy `MediaPlayer` instances | 🍃 Minimal: Decodes audio directly into uncompressed PCM memory |

---

## Features

- 🎮 **Purpose-Built for Games**: Fast card dealing, chip clatters, button clicks, coin drops, and combo sounds.
- 🎵 **Uninterrupted Background Music**: Configured with `USAGE_GAME` on Android and `AVAudioSessionCategoryOptionMixWithOthers` on iOS.
- ⚡ **Native Hardware Polyphony**: Play dozens of simultaneous overlapping sounds with a single load.
- 🎛️ **Granular Controls**: Volume, left/right stereo pan, pitch/playback rate (0.5x – 2.0x), and looping.
- 📦 **Zero External Audio Dependencies**: Pure native Kotlin & Swift implementations using built-in system APIs.
- 🛡️ **TypeScript First**: Full static typing and IDE autocompletion out of the box.

---

## Installation

```bash
npm install @vu-dang/react-native-soundpool
# or
yarn add @vu-dang/react-native-soundpool
```

### iOS Setup

Navigate to your `ios` folder and install pods:

```bash
cd ios && pod install
```

Add your audio files (e.g. `.wav`, `.mp3`) to your Xcode project under **Resources** (or drag them into your project in Xcode with *"Copy items if needed"* checked).

### Android Setup

Place your audio files into `android/app/src/main/res/raw/` (lowercase names with underscores, e.g. `card_slide.wav` or `chip_lay.wav`).

Autolinking handles module registration automatically on React Native 0.60+.

---

## Quick Start

### 1. High-Level `SoundPoolManager` (Recommended for Games)

The `SoundPoolManager` makes game audio effortless by handling preloading, fire-and-forget triggering, and global mute controls:

```typescript
import { SoundPoolManager } from '@vu-dang/react-native-soundpool';

export const soundManager = new SoundPoolManager();

// 1. Preload audio assets once during game startup
await soundManager.preload({
  cardSlide: 'card_slide_7.wav',
  chipLay: 'chip_lay_1.wav',
  chipsCollide: 'chips_collide_1.wav',
});

// 2. Play instantly anywhere in your game (unawaited, fire-and-forget)
soundManager.playAsync('cardSlide', { volume: 0.8 });

// 3. Rapid triggers overlap naturally with native polyphony
for (let i = 0; i < 5; i++) {
  setTimeout(() => soundManager.playAsync('chipsCollide'), i * 80);
}

// 4. Toggle sound mute from settings
soundManager.setSoundEnabled(false);
```

---

### 2. Low-Level `SoundPool` API

For fine-grained control over individual audio streams:

```typescript
import SoundPool from '@vu-dang/react-native-soundpool';

// Load sound and get sound ID
const soundId = await SoundPool.load('chip_lay_1.wav');

// Play with custom stereo panning, rate, and volume
const streamId = await SoundPool.play(soundId, {
  volume: 0.9,
  leftVolume: 0.5,
  rightVolume: 1.0,
  rate: 1.2, // 1.2x speed
  loop: false,
});

// Control stream
SoundPool.pause(streamId);
SoundPool.resume(streamId);
SoundPool.setVolume(streamId, 0.5);
SoundPool.stop(streamId);

// Unload when finished
SoundPool.unload(soundId);
```

---

## API Reference

### `SoundPool` (Low-Level)

| Method | Parameters | Return | Description |
| :--- | :--- | :--- | :--- |
| `initPool(maxStreams)` | `maxStreams: number` | `Promise<boolean>` | Configures maximum simultaneous audio voices (default 32). |
| `load(source)` | `source: string` | `Promise<number>` | Loads audio file into memory. Returns `soundId`. |
| `play(soundId, options?)` | `soundId: number`, `options?: PlayOptions` | `Promise<number>` | Plays sound. Returns `streamId`. |
| `stop(streamId)` | `streamId: number` | `void` | Stops playback of specified stream. |
| `pause(streamId)` | `streamId: number` | `void` | Pauses specified stream. |
| `resume(streamId)` | `streamId: number` | `void` | Resumes playback of paused stream. |
| `stopAll()` | — | `void` | Stops all active audio streams. |
| `setVolume(streamId, left, right?)` | `streamId`, `left`, `right` | `void` | Sets left and right channel volume (0.0 to 1.0). |
| `setRate(streamId, rate)` | `streamId`, `rate: number` | `void` | Sets playback speed (0.5 to 2.0). |
| `setLoop(streamId, loop)` | `streamId`, `loop: number` | `void` | Sets loop count (-1 for infinite). |
| `setMasterVolume(volume)` | `volume: number` | `void` | Sets master volume applied to all streams. |
| `setCategory(category, mixWithOthers)` | `'Playback' \| 'Ambient'`, `boolean` | `void` | Configures iOS audio session category. |
| `unload(soundId)` | `soundId: number` | `void` | Deallocates sound from memory. |
| `releasePool()` | — | `void` | Releases all sounds and frees native resources. |

---

### `SoundPoolManager` (High-Level)

| Method | Parameters | Return | Description |
| :--- | :--- | :--- | :--- |
| `preload(manifest)` | `Record<string, string>` | `Promise<void>` | Preloads a dictionary of named sound clips. |
| `play(name, options?)` | `name: string`, `options?: PlayOptions` | `Promise<number>` | Plays sound and returns `streamId`. |
| `playAsync(name, options?)` | `name: string`, `options?: PlayOptions` | `void` | Fire-and-forget play method. |
| `setSoundEnabled(enabled)` | `enabled: boolean` | `void` | Toggles sound on/off. Stops all playing sounds when false. |
| `isSoundEnabled()` | — | `boolean` | Returns current sound toggle state. |
| `setMasterVolume(volume)` | `volume: number` | `void` | Adjusts master volume (0.0 to 1.0). |
| `stop(streamId)` | `streamId: number` | `void` | Stops specific stream. |
| `stopAll()` | — | `void` | Stops all playing sounds. |
| `release()` | — | `void` | Cleans up all loaded sounds. |

---

## PlayOptions

```typescript
export interface PlayOptions {
  volume?: number;       // Master volume 0.0 to 1.0 (default 1.0)
  leftVolume?: number;   // Left channel volume 0.0 to 1.0
  rightVolume?: number;  // Right channel volume 0.0 to 1.0
  priority?: number;     // Stream priority (default 1)
  loop?: boolean | number; // false/0 for once, true/-1 for infinite loop
  rate?: number;         // Playback speed 0.5 to 2.0 (default 1.0)
}
```

---

## License

MIT © [Vu Dang](https://github.com/vu-dang)
