"use strict";
/**
 * Created by Ning Jiang on 4/1/2016.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpinEvent = void 0;
class SpinEvent {
}
// Tells all relevant modules to prepare before start the spin animation.
SpinEvent.RESTORE = "spinEvent_restore";
// Tells all relevant modules to prepare before start the spin animation.
SpinEvent.BEFORE_START = "spinEvent_beforeStart";
// Tells all relevant modules to start the spin animation.
SpinEvent.START = "spinEvent_start";
// All reels have finished spin-in animation and started the full speed spin.
SpinEvent.STARTED = "spinEvent_started";
// the api tells the reels to stop.
SpinEvent.STOP = "spinEvent_stop";
// when all the reels have stopped, the game sends this event.
SpinEvent.STOPPED = "spinEvent_stopped";
// When the win presentation starts, send to api to enable the button for abort.
SpinEvent.WANT_SKIPPABLE = "spinEvent_wantSkippable";
// the api sends this event during wp to tell the game to abort and start the next spin directly.
SpinEvent.SKIP = "spinEvent_skip";
// when all the wp animation is finished, tell the api.
SpinEvent.DONE = "spinEvent_done";
// tells the individual win to start
SpinEvent.IDLE = "spinEvent_idle";
// game tells the api that the keypad should be ready to start a new spin at the same time abort what's playing on
// the screen (win presentations, count up). The api will complete finish and new bet in one go if the spin button
// is clicked and send "bet" directly back to client.
/**
 * @deprecated since, v 0.44.x
 */
SpinEvent.FINISHING = "spinEvent_finishing";
// game tell the api that the round is finished.
SpinEvent.FINISH = "spinEvent_finish";
SpinEvent.FASTSPIN = "spinSetting_fastspin";
SpinEvent.ADD_STOP_DELAY = "spinEvent_addStopDelay";
SpinEvent.INTRO = "SpinEvent_intro";
exports.SpinEvent = SpinEvent;
//# sourceMappingURL=SpinEvent.js.map