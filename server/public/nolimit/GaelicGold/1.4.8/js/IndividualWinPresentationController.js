"use strict";
/**
 * Created by Ning Jiang on 2/7/2017.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.IndividualWinPresentationController = void 0;
const Logger_1 = require("@nolimitcity/slot-launcher/bin/utils/Logger");
const gsap_1 = require("gsap");
const EventHandler_1 = require("../../event/EventHandler");
const GameEvent_1 = require("../../event/GameEvent");
const GameConfig_1 = require("../../gameconfig/GameConfig");
const WinPresentationEvent_1 = require("../event/WinPresentationEvent");
const WinPresentationController_1 = require("../WinPresentationController");
class IndividualWinPresentationController extends WinPresentationController_1.WinPresentationController {
    constructor(name = "IndividualWin", tweakEnabled, betWinMode) {
        super([-1, -1], {
            name: name,
            tweakEnabled: tweakEnabled,
            betWinMode: betWinMode
        });
        this._currentIndex = -1;
        this._winSymbols = [];
    }
    hasWin() {
        return this._betWinsData != null && this._betWinsData.length > 0;
    }
    startWinPresentation() {
        if (this.playAllNoWinSymbols) {
            this.playAllNoWinSymbols();
        }
        this.playNextBetWinPresentation();
    }
    playNextBetWinPresentation() {
        if (!this._isPlaying) {
            return;
        }
        this.resetWinSymbols(false);
        // play next line
        this._currentIndex++;
        if (this._currentIndex >= this._betWinsData.length) {
            this._currentIndex = 0;
        }
        this._currentLineAnimation = new gsap_1.TimelineLite();
        // Add 0.1 time offset here to make sure the resetWinSymbols have time to finish.
        this._currentLineAnimation.add(this.getLineAnimation(this._betWinsData[this._currentIndex]), 0.1);
        this._currentLineAnimation.add(() => {
            this.playNextBetWinPresentation();
        });
    }
    stopWinPresentation(isAborted) {
        this._isPlaying = false;
        if (this._currentLineAnimation) {
            if (this._currentLineAnimation.isActive()) {
                this._currentLineAnimation.pause();
                this._currentLineAnimation.kill();
            }
            this._currentLineAnimation = null;
        }
        this._currentIndex = -1;
        this.resetWinSymbols(true);
    }
    abort() {
        if (this._isPlaying) {
            Logger_1.Logger.logDev(`[WinPresentation]-${this.moduleName}.abort()`);
            EventHandler_1.EventHandler.dispatchEvent(new GameEvent_1.GameEvent(WinPresentationEvent_1.WinPresentationEvent.WIN_PRESENTATION_ABORTED, this.moduleName));
            this.finish(true);
        }
    }
    resetWinSymbols(isStop) {
        if (!isStop) {
            return;
        }
        while (this._winSymbols.length > 0) {
            this._winSymbols.pop().changeState({ state: GameConfig_1.GameConfig.instance.SYMBOL_STATES.win, frames: [-1, -1] });
        }
    }
}
exports.IndividualWinPresentationController = IndividualWinPresentationController;
//# sourceMappingURL=IndividualWinPresentationController.js.map