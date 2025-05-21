"use strict";
/**
 * Created by Ning Jiang on 8/21/2019.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AvalancheReelController = void 0;
const gsap_1 = require("gsap");
const EventHandler_1 = require("../../../core/event/EventHandler");
const GameEvent_1 = require("../../../core/event/GameEvent");
const GameConfig_1 = require("../../../core/gameconfig/GameConfig");
const GameMode_1 = require("../../../core/gamemode/GameMode");
const GameModuleConfig_1 = require("../../../core/gamemoduleconfig/GameModuleConfig");
const ReelEvent_1 = require("../../../core/reel/event/ReelEvent");
const ReelAnimationState_1 = require("../../../core/reel/reel/ReelAnimationState");
const ReelController_1 = require("../../../core/reel/reel/ReelController");
const Reels_1 = require("../../../core/reel/reelarea/Reels");
const ReelSymbolName_1 = require("../../../core/reelsymbol/ReelSymbolName");
const ArrayHelper_1 = require("../../../core/utils/ArrayHelper");
const Logger_1 = require("@nolimitcity/slot-launcher/bin/utils/Logger");
const AvalancheReelEvent_1 = require("./AvalancheReelEvent");
const AvalancheReelPartAnimator_1 = require("./AvalancheReelPartAnimator");
class AvalancheReelController extends ReelController_1.ReelController {
    constructor(reelId) {
        super(reelId);
    }
    createReelPartAnimator() {
        this._avalancheReelPartAnimator = GameModuleConfig_1.GameModuleConfig.instance.REEL_PART_ANIMATOR ? GameModuleConfig_1.GameModuleConfig.instance.REEL_PART_ANIMATOR(this._reelId) : new AvalancheReelPartAnimator_1.AvalancheReelPartAnimator(this._reelId);
        return this._avalancheReelPartAnimator;
    }
    parseInitData(data) {
        super.parseInitData(data);
        this._reelsAfterCollapes = data.reelsAfterCollapse[this._reelId];
        this._allWinPositions = ArrayHelper_1.ArrayHelper.initArrayWithValues(this._symNumTotal, (index) => this._reelsAfterCollapes[index] === ReelSymbolName_1.ReelSymbolName.EMPTY);
    }
    onGameDataParsed(data) {
        super.onGameDataParsed(data);
        this._reelsAfterCollapes = data.reelsAfterCollapse[this._reelId].concat();
        this._allWinPositions = data.allWinPositions[this._reelId].concat();
        this._newSymbols = data.newSymbols[this._reelId] ? data.newSymbols[this._reelId].concat() : [];
        this._nearWinPositions = data.nearWinPositions;
    }
    makeUpStopReelSet(bottomFillUpTotalNum, init) {
        if (init && this.isNextAvalanche()) {
            return this._reelsAfterCollapes.concat();
        }
        if (!init && this.isAvalanche()) {
            return this._newSymbols.concat();
        }
        return this._stopReelSet.concat();
    }
    moveReelSetPosition() {
        if (this._currentReelSetPosition == 0) {
            debugger;
            throw new Error("AvalancheReelController.moveReelSetPosition():ReelSet position cannot be smaller than 0!");
        }
        this._currentReelSetPosition--;
    }
    addAvalancheToTimeline(timeline, previousDelay, addDelay, positions) {
        if (positions == null) {
            positions = this._allWinPositions.concat();
        }
        if (!positions.includes(false)) {
            addDelay = false; // all symbols to be removed, no avalanche.
        }
        const delay = addDelay ? previousDelay + this.getNormalStopDelay(this.reelId) : previousDelay; // TODO: should be able to override the delay
        const avalancheTimeline = new gsap_1.TimelineLite();
        avalancheTimeline.add(() => this._currentState = ReelAnimationState_1.ReelAnimationState.AVALANCHE);
        avalancheTimeline.add(this._avalancheReelPartAnimator.getAvalancheAnimation(positions, this._allWinPositions, 0, (symbol) => this.removeSymbol(symbol)));
        avalancheTimeline.add(() => EventHandler_1.EventHandler.dispatchEvent(new GameEvent_1.GameEvent(AvalancheReelEvent_1.AvalancheReelEvent.REEL_AVALANCHE_COMPLETE, this.reelId)));
        timeline.add(avalancheTimeline, delay);
        return delay;
    }
    startSpinAnimation(data, previousDelay) {
        this._isSpinBlurred = true;
        let delay = previousDelay;
        const timeline = new gsap_1.TimelineLite();
        if (this.isAvalanche()) {
            this._currentState = ReelAnimationState_1.ReelAnimationState.AVALANCHE_START;
            if (this._allWinPositions.includes(true)) {
                delay = previousDelay + (this.reelId === 0 ? 0 : (data.fastSpin ? ReelController_1.ReelController._reelFastStartDelays[this._reelId] : ReelController_1.ReelController._reelStartDelays[this._reelId]));
                const positions = this._allWinPositions.concat();
                timeline.add(() => this._avalancheReelPartAnimator.getAvalancheAnimation(positions, null, delay, (symbol) => this.removeSymbol(symbol)));
            }
        }
        else {
            this._currentState = ReelAnimationState_1.ReelAnimationState.ALL_OUT;
            delay = previousDelay + (this.reelId === 0 ? 0 : (data.fastSpin ? ReelController_1.ReelController._reelFastStartDelays[this._reelId] : ReelController_1.ReelController._reelStartDelays[this._reelId]));
            timeline.add(() => this._avalancheReelPartAnimator.getAllOutAnimation(delay, (symbol) => this.removeSymbol(symbol)));
        }
        timeline.add(() => this.onSpinStartedCompleted());
        return delay;
    }
    onSpinStartedCompleted() {
        this._currentState = ReelAnimationState_1.ReelAnimationState.SPIN;
        EventHandler_1.EventHandler.dispatchEvent(new GameEvent_1.GameEvent(ReelEvent_1.ReelEvent.REEL_SPIN_STARTED, this._reelId));
    }
    stopSpin(stopData, previousDelay) {
        this._reelPartAnimator.isQuickStop = stopData.quickStop;
        this._reelPartAnimator.isFastSpin = stopData.fastSpin;
        // Don't need to handle quick stop in AVALANCHE_START and ALL_OUT because they will be changed into SPIN immediately.
        if (this.currentState === ReelAnimationState_1.ReelAnimationState.AVALANCHE_NEW || this.currentState === ReelAnimationState_1.ReelAnimationState.ALL_IN) {
            // if this._stopTimeline == null, In between the reelStopped and reelStopPresentation, do nothing.
            if (this._stopTimeline != null) {
                if (this._stopTimeline.isActive()) {
                    this._stopTimeline.paused();
                    this._stopTimeline.kill();
                    const timeline = new gsap_1.TimelineLite();
                    timeline.add(this._avalancheReelPartAnimator.getQuickStopNewSymbolsInAnimation());
                    timeline.add(() => this.onSpinStopAnimationCompleted());
                    this._stopTimeline = timeline;
                }
            }
            return 0;
        }
        if (stopData.active) {
            if (this._reelPartAnimator.isQuickStop) {
                this._addedStopDelay = 0;
            }
            const stopTimerDelay = previousDelay + this.getFakeStopDelay() + this._addedStopDelay;
            this._addedStopDelay = 0;
            if (this._reelStopDelayTimer && this._reelStopDelayTimer.isActive()) {
                // quick stop.
                const timelineLeftTime = this._reelStopDelayTimer.totalDuration() - this._reelStopDelayTimer.time();
                if (stopTimerDelay >= timelineLeftTime) {
                    return timelineLeftTime;
                }
                this._reelStopDelayTimer.pause();
                this._reelStopDelayTimer.kill();
            }
            this._reelStopDelayTimer = gsap_1.TweenLite.to(this, stopTimerDelay, { onComplete: () => this.clearStopDelay() });
            return stopTimerDelay;
        }
        else {
            // If reel not active we fake a spin stopped
            Logger_1.Logger.logDev(`ReelController.stopSpin():Inactive reel ${this._reelId} stop spin animation completed!`);
            EventHandler_1.EventHandler.dispatchEvent(new GameEvent_1.GameEvent(ReelEvent_1.ReelEvent.REEL_STOP_SPIN_ANIMATION_COMPLETE, {
                reelId: this._reelId,
                fastSpin: this._reelPartAnimator.isFastSpin,
                quickStop: this._reelPartAnimator.isQuickStop,
                active: false
            }));
            return previousDelay;
        }
    }
    getFakeStopDelay() {
        if (this.reelId === 0) {
            return 0.01;
        }
        if (this._reelPartAnimator.isQuickStop) {
            return this.getQuickStopDelay(this.reelId);
        }
        // A very hack solution.
        return 100; // give a very long delay and change it when the previous reel land and start near win.
    }
    onStopDelayDone() {
        this._currentReelSet = this.makeUpStopReelSet(0, false);
        this._currentReelSetPosition = this._currentReelSet.length;
        const timeline = new gsap_1.TimelineLite();
        timeline.add(() => this.onSpinStopStarted());
        if (this.isAvalanche()) {
            this._currentState = ReelAnimationState_1.ReelAnimationState.AVALANCHE_NEW;
        }
        else {
            this._currentState = ReelAnimationState_1.ReelAnimationState.ALL_IN;
        }
        timeline.add(this._avalancheReelPartAnimator.getNewSymbolsInAnimation(this.getNewSymbols(), this._nearWinPositions[this.reelId]));
        timeline.add(() => this.onSpinStopAnimationCompleted());
        this._stopTimeline = timeline;
        if (this.reelId < GameConfig_1.GameConfig.instance.REELS_NUM - 1) {
            const nextReelId = this.reelId + 1;
            // TODO: quick fix for Dragon, need to get a better solution for slot-game.
            let nextDelay = this.getReelStopOffset(nextReelId);
            if (Reels_1.Reels.getReel(nextReelId).shouldPlayNearWinStop()) {
                const currentDuration = this._avalancheReelPartAnimator.currentTimeline ? this._avalancheReelPartAnimator.currentTimeline.totalDuration() : 0;
                nextDelay = Math.max(0, currentDuration + nextDelay);
            }
            EventHandler_1.EventHandler.dispatchEvent(new GameEvent_1.GameEvent(ReelEvent_1.ReelEvent.REEL_REFRESH_STOP_DELAY, {
                reelId: nextReelId,
                delay: nextDelay
            }));
        }
    }
    getQuickStopDelay(reelId) {
        return ReelController_1.ReelController._reelQuickStopDelays[reelId];
    }
    getFastSpinStopDelay(reelId) {
        return this.getQuickStopDelay(reelId);
    }
    getNearWinStopDelay(reelId) {
        return ReelController_1.ReelController._reelNearWinStopDelays[reelId];
    }
    getNormalStopDelay(reelId) {
        return ReelController_1.ReelController._reelStopDelays[reelId];
    }
    getReelStopOffset(reelId) {
        if (this.isAvalanche() && this._newSymbols.length === 0) {
            return 0;
        }
        if (this._reelPartAnimator.isQuickStop) {
            return this.getQuickStopDelay(reelId);
        }
        if (this._nearWinPositions[reelId][this._nearWinPositions[reelId].length - 1]) {
            return this.getNearWinStopDelay(reelId);
        }
        if (this._reelPartAnimator.isFastSpin) {
            return this.getFastSpinStopDelay(reelId);
        }
        return this.getNormalStopDelay(reelId);
    }
    // Doesn't handle if the bottom stacked symbol should connect to the leftover symbol in an avalanche.
    getNewSymbols() {
        const result = [];
        let previousSymbol = null;
        while (this._currentReelSetPosition > 0) {
            const newSymbol = this.createNextSymbol(previousSymbol);
            // Logger.logDev(`Reel ${this.reelId} got new symbol ${newSymbol.symName}`);
            result.unshift(newSymbol);
            previousSymbol = newSymbol;
        }
        return result;
    }
    onSpinStopAnimationCompleted() {
        this._isSpinBlurred = false;
        this._stopTimeline = null;
        super.onSpinStopAnimationCompleted();
    }
    // To override for more features.
    isAvalanche() {
        return this._gameMode === GameMode_1.GameMode.NORMAL_AVALANCHE || this._gameMode === GameMode_1.GameMode.FREESPIN_AVALANCHE;
    }
    isNextAvalanche() {
        return this._nextGameMode === GameMode_1.GameMode.NORMAL_AVALANCHE || this._nextGameMode === GameMode_1.GameMode.FREESPIN_AVALANCHE;
    }
    shouldPlayNearWinStop() {
        if (this._reelPartAnimator.isQuickStop) {
            return false;
        }
        const symId = (this.isAvalanche() ? this._newSymbols.length : this._stopReelSet.length) - 1;
        return this._nearWinPositions[this.reelId][symId];
    }
}
exports.AvalancheReelController = AvalancheReelController;
//# sourceMappingURL=AvalancheReelController.js.map