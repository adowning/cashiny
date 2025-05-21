"use strict";
/**
 * Created by Ning Jiang on 3/21/2016.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlotApiEventIntroCommand = exports.SlotApiEvent = void 0;
class SlotApiEvent {
}
SlotApiEvent.INIT = "init";
SlotApiEvent.CONFIG = "config";
SlotApiEvent.INTRO = "intro";
SlotApiEvent.CUSTOM = "custom";
SlotApiEvent.RESIZE = "resize";
SlotApiEvent.TICK = "tick";
SlotApiEvent.ERROR = "error";
SlotApiEvent.BET = "bet";
SlotApiEvent.BET_LEVELS = "betLevels";
SlotApiEvent.BALANCE = "balance";
SlotApiEvent.CURRENCY = "currency";
SlotApiEvent.FREE_BETS = "freeBets";
SlotApiEvent.AUTO_PLAY = "autoplay";
SlotApiEvent.FAST_SPIN = "fastspin";
SlotApiEvent.READY = "ready";
SlotApiEvent.GAME = "game";
SlotApiEvent.STARTING = "starting";
SlotApiEvent.STARTED = "started";
SlotApiEvent.STOPPABLE = "stoppable";
SlotApiEvent.STOP = "stop";
SlotApiEvent.STOPPING = "stopping";
SlotApiEvent.SKIPPABLE = "skippable";
SlotApiEvent.SKIP = "skip";
SlotApiEvent.SKIPPED = "skipped";
SlotApiEvent.DONE = "done";
SlotApiEvent.FINISHING = "finishing";
SlotApiEvent.FINISH = "finish";
SlotApiEvent.STATE = "state";
SlotApiEvent.LOADING = "loading";
SlotApiEvent.AUDIO = "audio";
SlotApiEvent.UPDATE_FREESPINS_LEFT = "updateFreeSpins";
SlotApiEvent.CURRENT_BET = "currentBet";
SlotApiEvent.MIN_SPIN_TIME = "minSpinTime";
SlotApiEvent.BUTTON_POSITION = "buttonPosition";
SlotApiEvent.GAMBLE_DONE = "gambleDone";
exports.SlotApiEvent = SlotApiEvent;
class SlotApiEventIntroCommand {
}
SlotApiEventIntroCommand.SHOW = "show";
SlotApiEventIntroCommand.CLOSE = "close";
SlotApiEventIntroCommand.API_READY = "apiReady";
exports.SlotApiEventIntroCommand = SlotApiEventIntroCommand;
//# sourceMappingURL=SlotApiEvent.js.map