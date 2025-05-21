"use strict";
/**
 * Created by Ning Jiang on 5/9/2019.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.NudgeStackedSymbolWPController = void 0;
const Logger_1 = require("@nolimitcity/slot-launcher/bin/utils/Logger");
const gsap_1 = require("gsap");
const EventHandler_1 = require("../../../core/event/EventHandler");
const GameConfig_1 = require("../../../core/gameconfig/GameConfig");
const Reels_1 = require("../../../core/reel/reelarea/Reels");
const ArrayHelper_1 = require("../../../core/utils/ArrayHelper");
const WinPresentationController_1 = require("../../../core/winpresentation/WinPresentationController");
const NudgeReelEvent_1 = require("../../reel/nudgereel/NudgeReelEvent");
class NudgeStackedSymbolWPController extends WinPresentationController_1.WinPresentationController {
    constructor(indexes, nudgeConfig, wpConfig = {
        name: "NudgeStackedSymbol",
        skippable: true,
        tweakEnabled: true
    }) {
        super(indexes, wpConfig);
        this._nudgeAborted = false;
        this._nudgeConfig = nudgeConfig;
        if (this._nudgeConfig.endingDelay == null) {
            this._nudgeConfig.endingDelay = 0;
        }
        this.resetFeature();
    }
    addFeatureEventHandlers() {
        EventHandler_1.EventHandler.addEventListener(this, NudgeReelEvent_1.NudgeReelEvent.NUDGE_STEP_START, (event) => this.onNudgeStepStart(event.params[0], event.params[1]));
        EventHandler_1.EventHandler.addEventListener(this, NudgeReelEvent_1.NudgeReelEvent.NUDGE_STEP_COMPLETED, (event) => this.onNudgeStepCompeted(event.params[0], event.params[1]));
        EventHandler_1.EventHandler.addEventListener(this, NudgeReelEvent_1.NudgeReelEvent.NUDGE_COMPLETED, (event) => this.onNudgeCompleted(event.params[0], event.params[1]));
    }
    parseFeatureGameData(data) {
        this._nudgeData = data;
        this._noWinNudge = this.isNoWinNudge(data);
    }
    isNoWinNudge(data) {
        const hasWin = this._betWinsData != null && this._betWinsData.length > 0;
        return !hasWin;
    }
    hasWin() {
        Logger_1.Logger.logDev(`server data doReelNudge: ${this._nudgeData.doReelNudge.toString()}`);
        return this._nudgeData.doReelNudge.indexOf(true) > -1;
    }
    startWinPresentation() {
        let delay = 0;
        this._nudgeData.doReelNudge.forEach((doNudge, reelId) => {
            if (doNudge) {
                this.doReelNudge(reelId, delay);
                delay += this.getReelNoWinNudge(reelId) ? this.getNoWinNudgeSpeed() : this.getNextReelNudgeDelayDelta(reelId);
            }
        });
    }
    getNextReelNudgeDelayDelta(reelId) {
        return Math.abs(this._steps[reelId]) * this._nudgeConfig.nudgeStepSpeed;
    }
    getNoWinNudgeSpeed() {
        return 0.001;
    }
    doReelNudge(reelId, delay) {
        this._nudgeState[reelId] = true;
        let symbolIndex = -1;
        let stackIndex = -1;
        const checkRange = this.getNudgeRange(reelId);
        for (let i = checkRange[0]; i < checkRange[1]; i++) {
            const symbol = Reels_1.Reels.getSymbol(reelId, i, false);
            if (symbol.symName.indexOf(this._nudgeConfig.stackedSymbolKeyword) > -1) {
                symbolIndex = i;
                stackIndex = symbol.stackedSymName.index;
                break;
            }
        }
        if (symbolIndex === -1) {
            debugger;
            throw new Error(`NudgeStackedSymbolWPController.doReelNudge():There is no symbol contains ${this._nudgeConfig.stackedSymbolKeyword} in a nudging reel. reelId = ${reelId}`);
        }
        this._nudgeSymbolId[reelId] = symbolIndex;
        this._steps[reelId] = checkRange[0] + stackIndex - symbolIndex;
        const ease = this._nudgeConfig.nudgeEase ? this._nudgeConfig.nudgeEase : gsap_1.Elastic.easeIn.config(1, 1);
        Reels_1.Reels.getReel(reelId).nudge(this._steps[reelId], this.getReelNoWinNudge(reelId) ? this.getNoWinNudgeSpeed() : this._nudgeConfig.nudgeStepSpeed, ease, delay);
    }
    // Can override this to give condition for the stacked symbol not included in the win.
    getReelNoWinNudge(reelId) {
        return this._noWinNudge;
    }
    // The range is the startIndex (include) in the reel symbols to the endIndex (NOT include).
    // If there are 3 symbols in reel, the index is [0, 3].
    // If you have a special feature that the are actually 5 symbols but you only show 3 symbols from the bottom of the 5 symbols, then you should return [2, 5].
    getNudgeRange(reelId) {
        return [0, GameConfig_1.GameConfig.instance.SYMBOLS_NUM_IN_REEL[2]];
    }
    onNudgeStepStart(reelId, stepLeft) {
        if (!this._nudgeState[reelId]) {
            return;
        }
        if (!this.getReelNoWinNudge(reelId)) {
            if (this.playNudgeStepStart) {
                this.playNudgeStepStart(reelId, stepLeft);
            }
        }
    }
    onNudgeStepCompeted(reelId, stepsLeft) {
        if (!this._nudgeState[reelId]) {
            return;
        }
        const steps = this._steps[reelId];
        if (steps > 0) {
            this._nudgedSteps[reelId]++;
        }
        else if (steps < 0) {
            this._nudgedSteps[reelId]--;
        }
        else {
            // ==0? error?
        }
        if (this.playOnNudgeStepComplete) {
            this.playOnNudgeStepComplete(reelId, stepsLeft);
        }
    }
    onNudgeCompleted(reelId, aborted) {
        if (!this._nudgeState[reelId]) {
            return;
        }
        this._nudgeState[reelId] = false;
        if (this.playOnReelNudgeComplete) {
            this.playOnReelNudgeComplete(reelId, aborted);
        }
        if (this._nudgeState.indexOf(true) > -1) {
            return;
        }
        this.playOnAllNudgeComplete(aborted);
    }
    playOnAllNudgeComplete(aborted) {
        this._finishTimeline = new gsap_1.TimelineLite();
        this._finishTimeline.add(() => this.finish(), (this._noWinNudge || aborted) ? 0 : this._nudgeConfig.endingDelay);
        this._finishTimeline.play();
    }
    abortWinPresentation() {
        let playNudgeAbortSound = false;
        this._nudgeState.forEach((isNudging, reelId) => {
            if (isNudging) {
                this._nudgeAborted = true;
                if (Math.abs(this._steps[reelId]) - Math.abs(this._nudgedSteps[reelId]) > 0) {
                    playNudgeAbortSound = true;
                }
                this.abortNudgingReel(reelId);
            }
        });
        if (this._nudgeAborted && playNudgeAbortSound && this.playNudgeAbortSound) {
            this.playNudgeAbortSound();
        }
    }
    stopWinPresentation(isAborted) {
        if (this._finishTimeline) {
            this._finishTimeline.paused();
            this._finishTimeline.kill();
            this._finishTimeline = null;
        }
    }
    abortNudgingReel(reelId) {
        Reels_1.Reels.getReel(reelId).abortNudge();
    }
    resetFeature() {
        this._nudgeData = null;
        this._nudgeAborted = false;
        this._noWinNudge = false;
        this._steps = ArrayHelper_1.ArrayHelper.initArrayWithValues(GameConfig_1.GameConfig.instance.REELS_NUM, () => 0);
        this._nudgedSteps = ArrayHelper_1.ArrayHelper.initArrayWithValues(GameConfig_1.GameConfig.instance.REELS_NUM, () => 0);
        this._nudgeState = ArrayHelper_1.ArrayHelper.initArrayWithValues(GameConfig_1.GameConfig.instance.REELS_NUM, () => false);
        this._nudgeSymbolId = ArrayHelper_1.ArrayHelper.initArrayWithValues(GameConfig_1.GameConfig.instance.REELS_NUM, () => -1); // -1 can also get a symbol, but we exclude -1 before we actaull use it.
    }
}
exports.NudgeStackedSymbolWPController = NudgeStackedSymbolWPController;
//# sourceMappingURL=NudgeStackedSymbolWPController.js.map