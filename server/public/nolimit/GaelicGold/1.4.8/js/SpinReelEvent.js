"use strict";
/**
 * Created by Ning Jiang on 8/29/2019.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpinReelEvent = void 0;
class SpinReelEvent {
}
SpinReelEvent.REEL_STOP_SPIN_BOUNCE_STARTED = "spinReelEvent_reelStopSpinBounceStarted";
SpinReelEvent.REEL_SET_SPIN_SPEED = "spinReelEvent_reelSetSpinSpeed";
SpinReelEvent.REEL_SET_CURRENT_REEL_SET = "spinReelEvent_setCurrentReelSet";
SpinReelEvent.ADD_SLOW_ATTENTION_SPIN_SYMBOL_TO_REEL = "spinReelEvent_addSlowAttentionSpinSymbolToReel";
SpinReelEvent.REMOVE_SLOW_ATTENTION_SPIN_SYMBOL_FROM_REEL = "spinReelEvent_removeSlowAttentionSpinSymbolFromReel";
// To set the reel to be a full stacked reel.
// WARNING: this event must be sent before the previous spin stop, because the next reel set is made up when reel stop.
SpinReelEvent.SET_REEL_NEXT_SPIN_FULL_STACKED = "spinReelEvent_setReelNextSpinFullStacked";
SpinReelEvent.REEL_TRY_NEAR_WIN = "reelEvent_reelTryNearWin";
SpinReelEvent.REEL_ON_NEAR_WIN = "reelEvent_reelOnNearWin";
exports.SpinReelEvent = SpinReelEvent;
//# sourceMappingURL=SpinReelEvent.js.map