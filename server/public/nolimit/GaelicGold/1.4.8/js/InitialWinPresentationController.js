"use strict";
/**
 * Created by Ning Jiang on 3/6/2018.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.InitialWinPresentationController = void 0;
const gsap_1 = require("gsap");
const GameConfig_1 = require("../../../core/gameconfig/GameConfig");
const WinPresentationController_1 = require("../../../core/winpresentation/WinPresentationController");
class InitialWinPresentationController extends WinPresentationController_1.WinPresentationController {
    constructor(indexes, config = {
        name: "InitialWin",
        hasWinCountUp: true,
        skippable: true,
        tweakEnabled: true
    }) {
        super(indexes, config);
        this._config = config;
        this._winSymbols = [];
    }
    hasWin() {
        return this._betWinsData != null && this._betWinsData.length > 0;
    }
    startWinPresentation() {
        const timeline = new gsap_1.TimelineLite({
            paused: true,
            onComplete: () => this.finish()
        });
        if (this.playAllNoWinSymbols) {
            this.playAllNoWinSymbols(timeline);
        }
        this.addWinAnimationsToTimeline(timeline);
        if (this._config.hasWinCountUp && this.addWinCountUpToTimeline) {
            this.addWinCountUpToTimeline(timeline);
        }
        this._timeline = timeline;
        this._timeline.play();
    }
    stopWinPresentation(isAborted) {
        if (this._timeline) {
            if (this._timeline.isActive()) {
                this._timeline.pause();
                this._timeline.kill();
            }
            this._timeline = null;
        }
        while (this._winSymbols.length > 0) {
            this._winSymbols.pop().changeState({
                state: GameConfig_1.GameConfig.instance.SYMBOL_STATES.win,
                frames: [-1, -1]
            });
        }
    }
}
exports.InitialWinPresentationController = InitialWinPresentationController;
//# sourceMappingURL=InitialWinPresentationController.js.map