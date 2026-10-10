import Foundation
import AVFoundation
import React

@objc(SoundPool)
class SoundPool: NSObject, AVAudioPlayerDelegate {

    private struct SoundEntry {
        let url: URL
        var players: [AVAudioPlayer]
    }

    private var soundEntries: [Int: SoundEntry] = [:]
    private var activeStreams: [Int: AVAudioPlayer] = [:]
    private var nextSoundId: Int = 1
    private var nextStreamId: Int = 1
    private var masterVolume: Float = 1.0
    private var maxStreams: Int = 32
    private let poolPerSound: Int = 4

    private let serialQueue = DispatchQueue(label: "com.reactnativesoundpool.queue")

    override init() {
        super.init()
        setupAudioSession(category: "Playback", mixWithOthers: true)
    }

    private func setupAudioSession(category: String, mixWithOthers: Bool) {
        let session = AVAudioSession.sharedInstance()
        let cat: AVAudioSession.Category = (category.lowercased() == "ambient") ? .ambient : .playback

        var options: AVAudioSession.CategoryOptions = [.allowBluetooth]
        if mixWithOthers {
            options.insert(.mixWithOthers)
        }

        do {
            try session.setCategory(cat, options: options)
            try session.setActive(true)
        } catch {
            print("[SoundPool] Warning: failed to configure AVAudioSession: \(error.localizedDescription)")
        }
    }

    private func resolveURL(_ source: String) -> URL? {
        if source.hasPrefix("file://") {
            return URL(string: source)
        }
        if source.hasPrefix("/") {
            return URL(fileURLWithPath: source)
        }

        let ns = source as NSString
        let fileName = (ns.lastPathComponent as NSString).deletingPathExtension
        let ext = (ns.lastPathComponent as NSString).pathExtension

        let extensionsToTry = ext.isEmpty ? ["wav", "mp3", "m4a", "aac", "caf", "aiff"] : [ext]

        for testExt in extensionsToTry {
            if let bundleUrl = Bundle.main.url(forResource: fileName, withExtension: testExt) {
                return bundleUrl
            }
        }

        return nil
    }

    @objc(initPool:resolver:rejecter:)
    func initPool(_ maxStreamsCount: NSInteger, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        serialQueue.async {
            self.maxStreams = maxStreamsCount > 0 ? maxStreamsCount : 32
            resolve(true)
        }
    }

    @objc(load:resolver:rejecter:)
    func load(_ source: NSString, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        serialQueue.async {
            guard let url = self.resolveURL(source as String) else {
                reject("FILE_NOT_FOUND", "Could not resolve audio asset: \(source)", nil)
                return
            }

            var initialPlayers: [AVAudioPlayer] = []
            do {
                for _ in 0..<self.poolPerSound {
                    let player = try AVAudioPlayer(contentsOf: url)
                    player.enableRate = true
                    player.prepareToPlay()
                    initialPlayers.append(player)
                }

                let soundId = self.nextSoundId
                self.nextSoundId += 1
                self.soundEntries[soundId] = SoundEntry(url: url, players: initialPlayers)
                resolve(soundId)
            } catch {
                reject("LOAD_FAILED", "Failed to decode audio: \(error.localizedDescription)", error)
            }
        }
    }

    @objc(play:leftVolume:rightVolume:priority:loop:rate:resolver:rejecter:)
    func play(
        _ soundId: NSInteger,
        leftVolume: Double,
        rightVolume: Double,
        priority: NSInteger,
        loop: NSInteger,
        rate: Double,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        serialQueue.async {
            guard var entry = self.soundEntries[soundId] else {
                reject("SOUND_NOT_FOUND", "Sound ID \(soundId) has not been loaded", nil)
                return
            }

            // Find an idle player
            var targetPlayer: AVAudioPlayer? = entry.players.first(where: { !$0.isPlaying })

            // If all players are busy, expand pool up to 8 per sound
            if targetPlayer == nil && entry.players.count < 8 {
                if let newPlayer = try? AVAudioPlayer(contentsOf: entry.url) {
                    newPlayer.enableRate = true
                    newPlayer.prepareToPlay()
                    entry.players.append(newPlayer)
                    self.soundEntries[soundId] = entry
                    targetPlayer = newPlayer
                }
            }

            // If still nil, recycle the oldest playing player
            if targetPlayer == nil {
                targetPlayer = entry.players.max(by: { $0.currentTime < $1.currentTime })
            }

            guard let player = targetPlayer else {
                reject("PLAY_FAILED", "No available audio players for sound ID: \(soundId)", nil)
                return
            }

            let avgVol = Float((leftVolume + rightVolume) / 2.0)
            let pan = Float(rightVolume - leftVolume).clamped(to: -1.0...1.0)
            let clampedRate = Float(rate).clamped(to: 0.5...2.0)

            player.volume = (avgVol * self.masterVolume).clamped(to: 0.0...1.0)
            player.pan = pan
            player.rate = clampedRate
            player.numberOfLoops = loop < 0 ? -1 : loop
            player.currentTime = 0

            let streamId = self.nextStreamId
            self.nextStreamId += 1

            player.delegate = self
            player.play()

            self.activeStreams[streamId] = player
            resolve(streamId)
        }
    }

    @objc(stop:)
    func stop(_ streamId: NSInteger) {
        serialQueue.async {
            self.activeStreams[streamId]?.stop()
            self.activeStreams.removeValue(forKey: streamId)
        }
    }

    @objc(pause:)
    func pause(_ streamId: NSInteger) {
        serialQueue.async {
            self.activeStreams[streamId]?.pause()
        }
    }

    @objc(resume:)
    func resume(_ streamId: NSInteger) {
        serialQueue.async {
            self.activeStreams[streamId]?.play()
        }
    }

    @objc(autoPause)
    func autoPause() {
        serialQueue.async {
            self.activeStreams.values.forEach { $0.pause() }
        }
    }

    @objc(autoResume)
    func autoResume() {
        serialQueue.async {
            self.activeStreams.values.forEach { $0.play() }
        }
    }

    @objc(stopAll)
    func stopAll() {
        serialQueue.async {
            self.activeStreams.values.forEach { $0.stop() }
            self.activeStreams.removeAll()
        }
    }

    @objc(setVolume:leftVolume:rightVolume:)
    func setVolume(_ streamId: NSInteger, leftVolume: Double, rightVolume: Double) {
        serialQueue.async {
            if let player = self.activeStreams[streamId] {
                let avgVol = Float((leftVolume + rightVolume) / 2.0)
                let pan = Float(rightVolume - leftVolume).clamped(to: -1.0...1.0)
                player.volume = (avgVol * self.masterVolume).clamped(to: 0.0...1.0)
                player.pan = pan
            }
        }
    }

    @objc(setRate:rate:)
    func setRate(_ streamId: NSInteger, rate: Double) {
        serialQueue.async {
            self.activeStreams[streamId]?.rate = Float(rate).clamped(to: 0.5...2.0)
        }
    }

    @objc(setLoop:loop:)
    func setLoop(_ streamId: NSInteger, loop: NSInteger) {
        serialQueue.async {
            self.activeStreams[streamId]?.numberOfLoops = loop < 0 ? -1 : loop
        }
    }

    @objc(setMasterVolume:)
    func setMasterVolume(_ volume: Double) {
        serialQueue.async {
            self.masterVolume = Float(volume).clamped(to: 0.0...1.0)
            self.activeStreams.values.forEach { player in
                player.volume = self.masterVolume
            }
        }
    }

    @objc(setCategory:mixWithOthers:)
    func setCategory(_ category: NSString, mixWithOthers: Bool) {
        serialQueue.async {
            self.setupAudioSession(category: category as String, mixWithOthers: mixWithOthers)
        }
    }

    @objc(unload:)
    func unload(_ soundId: NSInteger) {
        serialQueue.async {
            if let entry = self.soundEntries.removeValue(forKey: soundId) {
                entry.players.forEach { $0.stop() }
            }
        }
    }

    @objc(releasePool)
    func releasePool() {
        serialQueue.async {
            self.activeStreams.values.forEach { $0.stop() }
            self.activeStreams.removeAll()
            self.soundEntries.values.forEach { entry in
                entry.players.forEach { $0.stop() }
            }
            self.soundEntries.removeAll()
        }
    }

    // MARK: - AVAudioPlayerDelegate
    func audioPlayerDidFinishPlaying(_ player: AVAudioPlayer, successfully flag: Bool) {
        serialQueue.async {
            if let (streamId, _) = self.activeStreams.first(where: { $0.value === player }) {
                self.activeStreams.removeValue(forKey: streamId)
            }
        }
    }
}

private extension Comparable {
    func clamped(to limits: ClosedRange<Self>) -> Self {
        return min(max(self, limits.lowerBound), limits.upperBound)
    }
}
