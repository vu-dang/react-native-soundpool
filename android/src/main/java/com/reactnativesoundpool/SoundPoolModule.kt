package com.reactnativesoundpool

import android.content.Context
import android.content.res.AssetFileDescriptor
import android.media.AudioAttributes
import android.media.SoundPool
import android.net.Uri
import com.facebook.react.bridge.LifecycleEventListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.io.File
import java.util.concurrent.ConcurrentHashMap

class SoundPoolModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext),
    SoundPool.OnLoadCompleteListener,
    LifecycleEventListener {

    private var soundPool: SoundPool? = null
    private var masterVolume: Float = 1.0f
    private val pendingPromises = ConcurrentHashMap<Int, Promise>()
    private val loadedSoundIds = ConcurrentHashMap.newKeySet<Int>()
    private var maxStreams: Int = 32

    init {
        reactContext.addLifecycleEventListener(this)
        createSoundPool()
    }

    override fun getName(): String {
        return "SoundPool"
    }

    private fun createSoundPool() {
        if (soundPool != null) return

        val audioAttributes = AudioAttributes.Builder()
            .setUsage(AudioAttributes.USAGE_GAME)
            .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
            .build()

        soundPool = SoundPool.Builder()
            .setMaxStreams(maxStreams)
            .setAudioAttributes(audioAttributes)
            .build().apply {
                setOnLoadCompleteListener(this@SoundPoolModule)
            }
    }

    override fun onLoadComplete(pool: SoundPool?, sampleId: Int, status: Int) {
        val promise = pendingPromises.remove(sampleId)
        if (status == 0) {
            loadedSoundIds.add(sampleId)
            promise?.resolve(sampleId)
        } else {
            promise?.reject("LOAD_ERROR", "Failed to decode audio clip (sampleId: $sampleId, status: $status)")
        }
    }

    @ReactMethod
    fun initPool(maxStreamsCount: Int, promise: Promise) {
        try {
            this.maxStreams = if (maxStreamsCount > 0) maxStreamsCount else 32
            soundPool?.release()
            soundPool = null
            createSoundPool()
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("INIT_ERROR", e.localizedMessage, e)
        }
    }

    @ReactMethod
    fun load(source: String, promise: Promise) {
        val pool = soundPool ?: run {
            promise.reject("NOT_INITIALIZED", "SoundPool is not initialized")
            return
        }

        try {
            val context = reactApplicationContext

            // 1. Check raw resources (e.g. "card_fan_2" or "card_fan_2.wav")
            val cleanName = source.substringAfterLast("/").substringBeforeLast(".")
            val resId = context.resources.getIdentifier(cleanName, "raw", context.packageName)
            if (resId != 0) {
                val sampleId = pool.load(context, resId, 1)
                pendingPromises[sampleId] = promise
                return
            }

            // 2. Check Android assets folder
            try {
                val afd: AssetFileDescriptor = context.assets.openFd(source)
                val sampleId = pool.load(afd, 1)
                afd.close()
                pendingPromises[sampleId] = promise
                return
            } catch (_: Exception) {
                // Not in assets, proceed to file check
            }

            // 3. Check filesystem path or URI
            val cleanPath = if (source.startsWith("file://")) {
                Uri.parse(source).path ?: source
            } else {
                source
            }

            val file = File(cleanPath)
            if (file.exists()) {
                val sampleId = pool.load(file.absolutePath, 1)
                pendingPromises[sampleId] = promise
                return
            }

            promise.reject("FILE_NOT_FOUND", "Could not locate audio asset: $source")
        } catch (e: Exception) {
            promise.reject("LOAD_FAILED", "Exception while loading sound: ${e.localizedMessage}", e)
        }
    }

    @ReactMethod
    fun play(
        soundId: Int,
        leftVolume: Double,
        rightVolume: Double,
        priority: Int,
        loop: Int,
        rate: Double,
        promise: Promise
    ) {
        val pool = soundPool ?: run {
            promise.reject("NOT_INITIALIZED", "SoundPool is not initialized")
            return
        }

        try {
            val effectiveLeft = (leftVolume.toFloat() * masterVolume).coerceIn(0f, 1f)
            val effectiveRight = (rightVolume.toFloat() * masterVolume).coerceIn(0f, 1f)
            val effectiveRate = rate.toFloat().coerceIn(0.5f, 2.0f)

            val streamId = pool.play(
                soundId,
                effectiveLeft,
                effectiveRight,
                priority,
                loop,
                effectiveRate
            )

            if (streamId == 0) {
                // streamId 0 means SoundPool could not play (not yet loaded or no free streams)
                promise.reject("PLAY_FAILED", "Failed to play sound ID: $soundId. Stream capacity exceeded or sound not loaded.")
            } else {
                promise.resolve(streamId)
            }
        } catch (e: Exception) {
            promise.reject("PLAY_ERROR", e.localizedMessage, e)
        }
    }

    @ReactMethod
    fun stop(streamId: Int) {
        soundPool?.stop(streamId)
    }

    @ReactMethod
    fun pause(streamId: Int) {
        soundPool?.pause(streamId)
    }

    @ReactMethod
    fun resume(streamId: Int) {
        soundPool?.resume(streamId)
    }

    @ReactMethod
    fun autoPause() {
        soundPool?.autoPause()
    }

    @ReactMethod
    fun autoResume() {
        soundPool?.autoResume()
    }

    @ReactMethod
    fun stopAll() {
        soundPool?.autoPause()
    }

    @ReactMethod
    fun setVolume(streamId: Int, leftVolume: Double, rightVolume: Double) {
        val effectiveLeft = (leftVolume.toFloat() * masterVolume).coerceIn(0f, 1f)
        val effectiveRight = (rightVolume.toFloat() * masterVolume).coerceIn(0f, 1f)
        soundPool?.setVolume(streamId, effectiveLeft, effectiveRight)
    }

    @ReactMethod
    fun setRate(streamId: Int, rate: Double) {
        val effectiveRate = rate.toFloat().coerceIn(0.5f, 2.0f)
        soundPool?.setRate(streamId, effectiveRate)
    }

    @ReactMethod
    fun setLoop(streamId: Int, loop: Int) {
        soundPool?.setLoop(streamId, loop)
    }

    @ReactMethod
    fun setMasterVolume(volume: Double) {
        masterVolume = volume.toFloat().coerceIn(0f, 1f)
    }

    @ReactMethod
    fun setCategory(category: String, mixWithOthers: Boolean) {
        // No-op on Android: SoundPool never takes exclusive audio focus
    }

    @ReactMethod
    fun unload(soundId: Int) {
        loadedSoundIds.remove(soundId)
        soundPool?.unload(soundId)
    }

    @ReactMethod
    fun releasePool() {
        loadedSoundIds.clear()
        pendingPromises.clear()
        soundPool?.release()
        soundPool = null
    }

    @ReactMethod
    fun reactivate() {
        soundPool?.autoResume()
    }

    // Lifecycle listener methods
    override fun onHostResume() {
        soundPool?.autoResume()
    }

    override fun onHostPause() {
        // Keeps background playback state consistent
    }

    override fun onHostDestroy() {
        releasePool()
    }
}
