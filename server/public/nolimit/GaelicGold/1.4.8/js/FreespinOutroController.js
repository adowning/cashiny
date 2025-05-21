"use strict";
/**
 * Created by Ning Jiang on 10/16/2017.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FreespinOutroController = void 0;
const GameMode_1 = require("../../../core/gamemode/GameMode");
const ScreenController_1 = require("../../../core/screen/ScreenController");
const SlotGame_1 = require("../../../core/SlotGame");
class FreespinOutroController extends ScreenController_1.ScreenController {
    constructor(config, tweakEnabled) {
        super("FreespinOutro", config, tweakEnabled);
    }
    calculateIsTriggered(data) {
        return data.mode === GameMode_1.GameMode.FREESPIN && data.freespinsLeft === 0;
    }
    show() {
        super.show();
        SlotGame_1.SlotGame.keypad.setZeroBetSpinCounter(-1);
        return true;
    }
    close() {
        // If you want to reset the symbols back to the sets winning the freespin and start the individual win presentation,
        // 1. get the symbols from serverData.reelsEnteringFreespin and replace them to the reels.
        // 2. get the win data winning the freespin, send it with event WinPresentationEvent.UPDATE_DISPLAYED_BET_LINE_WINS
        // 3. send event SpinEvent.IDLE to start the individual win.
        super.close();
    }
}
exports.FreespinOutroController = FreespinOutroController;
//# sourceMappingURL=FreespinOutroController.js.map