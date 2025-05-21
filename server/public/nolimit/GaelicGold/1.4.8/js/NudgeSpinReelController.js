"use strict";
/**
 * Created by Ning Jiang on 8/31/2017.
 * Moved from WildNudge by Ning Jiang on 5/17/2018.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.NudgeSpinReelController = void 0;
const Logger_1 = require("@nolimitcity/slot-launcher/bin/utils/Logger");
const gsap_1 = require("gsap");
const EventHandler_1 = require("../../../core/event/EventHandler");
const GameEvent_1 = require("../../../core/event/GameEvent");
const GameConfig_1 = require("../../../core/gameconfig/GameConfig");
const ReelAnimationState_1 = require("../../../core/reel/reel/ReelAnimationState");
const SpinReelController_1 = require("../spinreel/SpinReelController");
const NudgeReelEvent_1 = require("./NudgeReelEvent");
const MathHelper_1 = require("../../../core/utils/MathHelper");
class NudgeSpinReelController extends SpinReelController_1.SpinReelController {
    constructor(reelId) {
        super(reelId);
        this._maxRemovedSymbolLength = 3;
        this._nudgeAnimator = this._reelPartAnimator;
        this._removedSymbolPool = [];
        if (GameConfig_1.GameConfig.instance.STACKED_SYMBOLS == null) {
            Logger_1.Logger.logDev("NudgeSpinReelController.constructor(): GameConfig.STACKED_SYMBOLS has not stacked symbol for nudging!");
        }
        for (let key in GameConfig_1.GameConfig.instance.STACKED_SYMBOLS) {
            if (GameConfig_1.GameConfig.instance.STACKED_SYMBOLS[key].reels != null && GameConfig_1.GameConfig.instance.STACKED_SYMBOLS[key].reels.indexOf(reelId) < 0) {
                continue;
            }
            const totalNum = (0, MathHelper_1.isNumber)(GameConfig_1.GameConfig.instance.STACKED_SYMBOLS[key].totalNum) ? GameConfig_1.GameConfig.instance.STACKED_SYMBOLS[key].totalNum : GameConfig_1.GameConfig.instance.STACKED_SYMBOLS[key].totalNum[this._reelId];
            this._maxRemovedSymbolLength = Math.max(this._maxRemovedSymbolLength, totalNum + 1);
        }
    }
    onGameDataParsed(data) {
        super.onGameDataParsed(data);
        this._doNudge = this.parseDoNudge(data);
        this._extraTopSymbols = (data.extraSymbolsOnTop != null && data.extraSymbolsOnTop[this._reelId] != null) ? data.extraSymbolsOnTop[this._reelId] : [];
    }
    // The "doReelNudge" is given by the server to indicate if the reel should nudge. In different games, it can be more different values for nudging in different features.
    // Override for different calculations.
    parseDoNudge(data) {
        return (data.doReelNudge != null && data.doReelNudge[this._reelId] != null) ? data.doReelNudge[this._reelId] : false;
    }
    makeUpStackedSymbolTop(targetSymName) {
        var _a;
        const topSym = (((_a = this._extraTopSymbols) === null || _a === void 0 ? void 0 : _a.length) > 0 && this._doNudge) ? this._extraTopSymbols[0] : targetSymName;
        const extraSymbols = this._extraTopSymbols != null && this._doNudge ? this._extraTopSymbols : [];
        if (extraSymbols.length > 0) {
            // TODO: shall check if the extraTopSymbols bottom match the top of the stopReelSet? Server check it.
        }
        return super.makeUpStackedSymbolTop(topSym).concat(extraSymbols);
    }
    nudge(steps, stepSpeed, ease, delay) {
        if (this._currentState != ReelAnimationState_1.ReelAnimationState.IDLE && this._currentState != ReelAnimationState_1.ReelAnimationState.INACTIVE) {
            debugger;
            throw new Error("NudgeSpinReelController.nudge(): Can not nudge when reel is not idling or inactive.");
        }
        this._spinStateBeforeNudge = this._currentState;
        this._currentState = ReelAnimationState_1.ReelAnimationState.NUDGE;
        this._nudgeAnimator.nudgeSteps = steps;
        this._nudgeAnimator.nudgeStepSpeed = stepSpeed;
        this._nudgeAnimator.ease = ease;
        this.nudgeInDirection(delay);
    }
    abortNudge(steps) {
        Logger_1.Logger.logDev(`NudgeSpinReelController.abortNudge() at reel ${this._reelId}`);
        if (this._currentState != ReelAnimationState_1.ReelAnimationState.NUDGE && steps == null) {
            Logger_1.Logger.logDev(`NudgeReelController.abortNudge() The reel is not nudging. reelId = ${this._reelId}`);
            return;
        }
        if (steps != null) {
            this._nudgeAnimator.nudgeSteps = steps;
        }
        this._nudgeAnimator.aborted = true;
        if (this._currentTimeline && this._currentTimeline.isActive()) {
            this._currentTimeline.progress(1);
        }
        this._currentState = this._spinStateBeforeNudge;
        this._spinStateBeforeNudge = null;
    }
    nudgeInDirection(delay) {
        Logger_1.Logger.logDev(`nudge ${this._nudgeAnimator.nudgeSteps} steps left  at reel ${this._reelId}`);
        if (delay == null) {
            delay = 0;
        }
        const timeline = new gsap_1.TimelineLite();
        this._currentTimeline = timeline;
        if (this._nudgeAnimator.nudgeSteps === 0) {
            timeline.add(this._nudgeAnimator.getNudgeCompleteAnimation(delay));
            timeline.add(() => this.onNudgeCompleted());
            return;
        }
        timeline.add(() => this.onNudgeStepStart(this._nudgeAnimator.nudgeSteps), delay);
        if (this._nudgeAnimator.nudgeSteps > 0) {
            timeline.add(this._nudgeAnimator.getNudgeDownAnimation(this.createNextNudgeDownSymbol()));
            timeline.add(() => this.onNudgeDownStepCompleted(this.allSymbols.pop()));
            return;
        }
        timeline.add(this._nudgeAnimator.getNudgeUpAnimation(this.createNextNudgeUpSymbol()));
        timeline.add(() => this.onNudgeUpStepCompleted(this.allSymbols.shift()));
    }
    onNudgeStepStart(steps) {
        EventHandler_1.EventHandler.dispatchEvent(new GameEvent_1.GameEvent(NudgeReelEvent_1.NudgeReelEvent.NUDGE_STEP_START, this._reelId, steps));
    }
    onNudgeDownStepCompleted(symbolToRemove) {
        this.updateStackedSymbols(this._reelPartAnimator.symbolsToAnimate[this._reelPartAnimator.symbolsToAnimate.length - 1], null, 1, false);
        this.removeSymbol(symbolToRemove);
        this.onNudgeStepCompleted();
    }
    onNudgeUpStepCompleted(symbolToRemove) {
        this.updateStackedSymbols(this._reelPartAnimator.symbolsToAnimate[this._reelPartAnimator.symbolsToAnimate.length - 1], null, 1, false);
        super.removeSymbol(symbolToRemove);
        this.onNudgeStepCompleted();
    }
    onNudgeStepCompleted() {
        Logger_1.Logger.logDev(`NudgeSpinReelController.onNudgeStepCompleted at reel ${this._reelId}`);
        EventHandler_1.EventHandler.dispatchEvent(new GameEvent_1.GameEvent(NudgeReelEvent_1.NudgeReelEvent.NUDGE_STEP_COMPLETED, this._reelId, this._nudgeAnimator.nudgeSteps));
        this.nudgeInDirection();
    }
    onNudgeCompleted() {
        this._currentTimeline = null;
        this._currentState = this._spinStateBeforeNudge;
        this._spinStateBeforeNudge = null;
        EventHandler_1.EventHandler.dispatchEvent(new GameEvent_1.GameEvent(NudgeReelEvent_1.NudgeReelEvent.NUDGE_COMPLETED, this._reelId, this._nudgeAnimator.aborted));
        this._nudgeAnimator.aborted = false;
    }
    createNextNudgeDownSymbol() {
        return super.createNextSymbol(this._nudgeAnimator.symbolsToAnimate[0]);
    }
    createNextNudgeUpSymbol() {
        this._currentReelSetPosition++;
        const newSymbol = this._removedSymbolPool.shift();
        newSymbol.changeState({
            state: GameConfig_1.GameConfig.instance.SYMBOL_STATES.normal
        });
        this._reelView.addChild(newSymbol);
        this.updateStackedSymbols(newSymbol, this.allSymbols[this.allSymbols.length - 1], 1, false);
        return newSymbol;
    }
    removeSymbol(symbolToRemove) {
        this._reelView.removeChild(symbolToRemove);
        this._removedSymbolPool.unshift(symbolToRemove);
        if (this._removedSymbolPool.length > this._maxRemovedSymbolLength) {
            this._reelPartCreator.deleteSymbol(this._removedSymbolPool.pop());
        }
    }
}
exports.NudgeSpinReelController = NudgeSpinReelController;
//# sourceMappingURL=NudgeSpinReelController.js.map