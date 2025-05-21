"use strict";
/**
 * Created by Jerker Nord on 2016-04-13.
 * Refactored by Ning Jiang on 2016-11-30.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReelEvent = void 0;
class ReelEvent {
}
// When the reel has started, send this event.
ReelEvent.REEL_SPIN_STARTED = "reelEvent_reelSpinStarted";
// When all the reel have done REEL_SPIN_STARTED
ReelEvent.ALL_REELS_SPIN_STARTED = "reelEvent_allReelSpinStarted";
// Tell all the reels should stop.
ReelEvent.ALL_REELS_STOP_SPIN = "reelEvent_allReelsStopSpin";
// When reel has started to stop.
ReelEvent.REEL_STOP_SPIN_STARTED = "reelEvent_reelStopSpinStarted";
// When the reel has stopped spinning
ReelEvent.REEL_STOP_SPIN_ANIMATION_COMPLETE = "reelEvent_reelStopSpinAnimationComplete";
// When all the attention and other single reel stop animation complete.
ReelEvent.REEL_STOP_PRESENTATIONS_COMPLETE = "reelEvent_reelStopPresentationsComplete";
ReelEvent.REEL_STOP_SPIN_COMPLETE = "reelEvent_reelStopSpinComplete";
ReelEvent.ALL_REELS_SPIN_ANIMATION_STOPPED = "reelEvent_allReelsSpinAnimationStopped";
ReelEvent.ALL_REELS_SPIN_STOPPED = "reelEvent_allReelsSpinStopped";
// For add more spin time to a reel while spinning.
ReelEvent.REEL_ADD_STOP_DELAY = "reelEvent_reelAddStopDelay";
ReelEvent.REEL_REFRESH_STOP_DELAY = "reelEvent_reelRefreshStopDelay";
exports.ReelEvent = ReelEvent;
//# sourceMappingURL=ReelEvent.js.map