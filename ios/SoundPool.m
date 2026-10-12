#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(SoundPool, NSObject)

RCT_EXTERN_METHOD(initPool:(NSInteger)maxStreamsCount
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(load:(NSString *)source
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(play:(NSInteger)soundId
                  leftVolume:(double)leftVolume
                  rightVolume:(double)rightVolume
                  priority:(NSInteger)priority
                  loop:(NSInteger)loop
                  rate:(double)rate
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(stop:(NSInteger)streamId)
RCT_EXTERN_METHOD(pause:(NSInteger)streamId)
RCT_EXTERN_METHOD(resume:(NSInteger)streamId)
RCT_EXTERN_METHOD(autoPause)
RCT_EXTERN_METHOD(autoResume)
RCT_EXTERN_METHOD(stopAll)
RCT_EXTERN_METHOD(setVolume:(NSInteger)streamId leftVolume:(double)leftVolume rightVolume:(double)rightVolume)
RCT_EXTERN_METHOD(setRate:(NSInteger)streamId rate:(double)rate)
RCT_EXTERN_METHOD(setLoop:(NSInteger)streamId loop:(NSInteger)loop)
RCT_EXTERN_METHOD(setMasterVolume:(double)volume)
RCT_EXTERN_METHOD(setCategory:(NSString *)category mixWithOthers:(BOOL)mixWithOthers)
RCT_EXTERN_METHOD(unload:(NSInteger)soundId)
RCT_EXTERN_METHOD(releasePool)
RCT_EXTERN_METHOD(reactivate)

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

@end
