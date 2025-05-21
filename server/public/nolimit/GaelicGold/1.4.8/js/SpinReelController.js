"use strict";
/**
 * Created by Ning Jiang on 8/21/2019.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpinReelController = void 0;
const Logger_1 = require("@nolimitcity/slot-launcher/bin/utils/Logger");
const gsap_1 = require("gsap");
const EventHandler_1 = require("../../../core/event/EventHandler");
const GameEvent_1 = require("../../../core/event/GameEvent");
const GameConfig_1 = require("../../../core/gameconfig/GameConfig");
const GameModuleConfig_1 = require("../../../core/gamemoduleconfig/GameModuleConfig");
const ReelEvent_1 = require("../../../core/reel/event/ReelEvent");
const ReelAnimationState_1 = require("../../../core/reel/reel/ReelAnimationState");
const ReelController_1 = require("../../../core/reel/reel/ReelController");
const StateReelSymbol_1 = require("../../../core/reelsymbol/StateReelSymbol");
const ArrayHelper_1 = require("../../../core/utils/ArrayHelper");
const Helper_1 = require("../../../core/utils/Helper");
const MathHelper_1 = require("../../../core/utils/MathHelper");
const SpinReelEvent_1 = require("./SpinReelEvent");
const SpinReelPartAnimator_1 = require("./SpinReelPartAnimator");
class SpinReelController extends ReelController_1.ReelController {
    get currentSpinStepLeftTime() {
        return this._spinReelPartAnimator.currentStepLeftTime;
    }
    constructor(reelId) {
        super(reelId);
        this._stopCounter = 0;
    }
    initValues() {
        super.initValues();
        this._symNumTop = GameConfig_1.GameConfig.instance.SYMBOLS_NUM_IN_REEL[0] + GameConfig_1.GameConfig.instance.SYMBOLS_NUM_IN_REEL[1];
        this._attentionSymbols = [];
        this._isNextSpinFullStacked = GameConfig_1.GameConfig.instance.FULL_STACKED_REELS == null ? false : GameConfig_1.GameConfig.instance.FULL_STACKED_REELS[this._reelId];
    }
    createReelPartAnimator() {
        this._spinReelPartAnimator = GameModuleConfig_1.GameModuleConfig.instance.REEL_PART_ANIMATOR ? GameModuleConfig_1.GameModuleConfig.instance.REEL_PART_ANIMATOR(this._reelId) : new SpinReelPartAnimator_1.SpinReelPartAnimator(this._reelId);
        return this._spinReelPartAnimator;
    }
    addEventListeners() {
        super.addEventListeners();
        EventHandler_1.EventHandler.addEventListener(this, SpinReelEvent_1.SpinReelEvent.REEL_SET_CURRENT_REEL_SET, (event) => this.setCurrentReelSet(event.params[0]));
        EventHandler_1.EventHandler.addEventListener(this, SpinReelEvent_1.SpinReelEvent.ADD_SLOW_ATTENTION_SPIN_SYMBOL_TO_REEL, (event) => this.onAddSpinningAttentionSymbol(event.params[0]));
        EventHandler_1.EventHandler.addEventListener(this, SpinReelEvent_1.SpinReelEvent.REMOVE_SLOW_ATTENTION_SPIN_SYMBOL_FROM_REEL, (event) => this.onRemoveSpinningAttentionSymbol(event.params[0], event.params[1]));
        EventHandler_1.EventHandler.addEventListener(this, SpinReelEvent_1.SpinReelEvent.SET_REEL_NEXT_SPIN_FULL_STACKED, (event) => this.onSetReelNextSpinFullStack(event.params[0], event.params[1]));
        EventHandler_1.EventHandler.addEventListener(this, SpinReelEvent_1.SpinReelEvent.REEL_SET_SPIN_SPEED, (event) => this.setReelSpinSpeed(event.params[0]));
        EventHandler_1.EventHandler.addEventListener(this, SpinReelEvent_1.SpinReelEvent.REEL_TRY_NEAR_WIN, (event) => this.tryPlayNearWin(event.params[0]));
    }
    parseInitData(data) {
        super.parseInitData(data);
        this._nextFullReelSet = Helper_1.Helper.getReelSet(data.nextReelSetName, this._reelId);
        this._currentFullReelSet = Helper_1.Helper.getReelSet(data.initReelSet, this._reelId);
    }
    onGameDataParsed(data) {
        super.onGameDataParsed(data);
        this._nextFullReelSet = Helper_1.Helper.getReelSet(data.nextReelSetName, this._reelId);
        this._nearWinReels = data.nearWinReels.concat();
        this._nearWinBigWinReels = data.nearWinBigWinReels.concat();
    }
    makeUpStopReelSet(bottomFillUpTotalNum, init) {
        const randomPosition = this.randomizeReelSetPosition(this._nextFullReelSet);
        const topFillUp = this.makeUpStackedSymbolTop(this._stopReelSet[0]);
        const bottomFillUp = this.makeUpStackedSymbolBottom(this._stopReelSet[this._stopReelSet.length - 1], bottomFillUpTotalNum, init);
        const bottomRandomFillUp = this.makeUpStopReelSetRandomBottomFillUp(bottomFillUpTotalNum - bottomFillUp.length, init);
        return this._nextFullReelSet.slice(0, randomPosition + 1).concat(topFillUp).concat(this._stopReelSet).concat(bottomFillUp).concat(bottomRandomFillUp);
    }
    // Get a position that the symbol is not part of a stacked symbol unless it's the bottom of the stacked symbol.
    randomizeReelSetPosition(reelSet) {
        let position;
        do {
            position = MathHelper_1.MathHelper.randomNumberInRange(0, reelSet.length - 1);
        } while (position < 3);
        const parsedStackedName = StateReelSymbol_1.StateReelSymbol.parseStackedSymbolName(reelSet[position], this._reelId);
        if (parsedStackedName.isStacked) {
            position += parsedStackedName.totalNum - 1 - parsedStackedName.index;
        }
        return position;
    }
    // When maxNum is null, make up the full stacked symbol.
    makeUpStackedSymbolTop(targetSymName) {
        let result = [];
        const stackedName = StateReelSymbol_1.StateReelSymbol.parseStackedSymbolName(targetSymName, this._reelId);
        if (stackedName.isStacked && stackedName.index > 0) {
            for (let i = 0; i < stackedName.index; i++) {
                result.push(`${stackedName.symName}*${i}`);
            }
        }
        return result;
    }
    // When maxNum is null, make up the full stacked symbol.
    makeUpStackedSymbolBottom(targetSymName, maxNum, init) {
        let result = [];
        const stackedName = StateReelSymbol_1.StateReelSymbol.parseStackedSymbolName(targetSymName, this._reelId);
        if (stackedName.isStacked && stackedName.index < (stackedName.totalNum - 1)) {
            let stackedNum = init ? Math.min(stackedName.totalNum, stackedName.index + maxNum + 1) : stackedName.totalNum;
            for (let i = stackedName.index + 1; i < stackedNum; i++) {
                result.push(`${stackedName.symName}*${i}`);
            }
        }
        return result;
    }
    makeUpStopReelSetRandomBottomFillUp(length, init) {
        if (length <= 0) {
            this._addedExtraStoppingFullStackedSymbolNum = -length;
            if (this._reelId === 1) {
                Logger_1.Logger.logDev(`makeUpStopReelSetRandomBottomFillUp 1 _addedExtraStoppingFullStackedSymbolNum = ${this._addedExtraStoppingFullStackedSymbolNum}`);
            }
            return [];
        }
        if (this._isFullStacked) {
            const result = [];
            let counter = length;
            do {
                // TODO: maybe exclude some special stacked symbols here?
                const randomStackedSymbol = this._currentFullReelSet[MathHelper_1.MathHelper.randomNumberInRange(0, this._currentFullReelSet.length - 1)];
                const parsedStackedSymName = StateReelSymbol_1.StateReelSymbol.parseStackedSymbolName(randomStackedSymbol, this._reelId);
                if (!parsedStackedSymName.isStacked) {
                    debugger;
                    throw new Error("ReelController.makeUpStopReelSetRandomBottomFillUp(): When reel is full stacked, the nextReelSet should only contain stacked symbols!");
                }
                for (let i = 0; i < parsedStackedSymName.totalNum; i++) {
                    result.push(`${parsedStackedSymName.symName}*${i}`);
                    counter--;
                    if (init && counter === 0) {
                        return result;
                    }
                }
            } while (counter > 0);
            if (result.length > length) {
                // Tell the reels behind to add spin delay for the extra symbols.
                this._addedExtraStoppingFullStackedSymbolNum += result.length - length;
                Logger_1.Logger.logDev(`makeUpStopReelSetRandomBottomFillUp 2 _addedExtraStoppingFullStackedSymbolNum = ${this._addedExtraStoppingFullStackedSymbolNum}`);
            }
            return result;
        }
        else {
            return ArrayHelper_1.ArrayHelper.initArrayWithValues(length, index => this.getRandomSymbolFromReelSet(this._currentFullReelSet));
        }
    }
    isSpecialSymbol(symbolName) {
        return super.isSpecialSymbol(symbolName) || this.isSlowAttentionSymbol(symbolName);
    }
    isSlowAttentionSymbol(symName) {
        for (let attentionSymbolConfig of this._attentionSymbols) {
            if (attentionSymbolConfig.symName === symName) {
                return true;
            }
        }
        return false;
    }
    moveReelSetPosition() {
        if (this._currentReelSetPosition == 0) {
            if (this._currentFullReelSet == null) {
                debugger;
                throw new Error("ReelController.createNextSymbol():This is a bug that Ning is trying to reproduce!");
            }
            this._currentReelSet = this._currentFullReelSet.concat();
        }
        this._currentReelSetPosition--;
        this._currentReelSetPosition = ArrayHelper_1.ArrayHelper.reviseIndexInLoopRange(this._currentReelSet.length, this._currentReelSetPosition);
    }
    createNextSymbol(previousSymbol, init) {
        if (this._stopCounter > 0) {
            // change the counter outside if{} so we don't put extra added symbols for the stop offset in the stop
            // symbols.
            this._stopCounter--;
        }
        return super.createNextSymbol(previousSymbol, init);
    }
    setStartSpinData(data) {
        super.setStartSpinData(data);
        this._addedExtraStoppingFullStackedSymbolNum = 0;
        this._currentFullReelSet = this._nextFullReelSet.concat();
        this._isFullStacked = this._isNextSpinFullStacked;
    }
    startSpinAnimation(data, previousDelay) {
        this._isSpinBlurred = true;
        const delay = previousDelay + (this.reelId === 0 ? 0 : (data.fastSpin ? ReelController_1.ReelController._reelFastStartDelays[this._reelId] : ReelController_1.ReelController._reelStartDelays[this._reelId]));
        this._currentState = ReelAnimationState_1.ReelAnimationState.START_SPIN;
        const timeline = new gsap_1.TimelineLite();
        timeline.add(this._spinReelPartAnimator.getStartSpinAnimate(delay, this.createNextSymbol()));
        timeline.add(() => this.onSpinStartedCompleted());
        return delay;
    }
    // When the attention symbol is in the specified position, the attention should start and play for steps of symbols.
    // TODO: need to test if this is not conflict with nudge.
    tryStartSlowSpinAttention() {
        for (let attentionSymbolConfig of this._attentionSymbols) {
            if (this._symNumTop + attentionSymbolConfig.startPosition < 0) {
                debugger;
                throw new Error("ReelController.tryStartSlowSpinAttention(), the start position is out of reel's range!");
            }
            const attentionSymbol = this.allSymbols[this._symNumTop + attentionSymbolConfig.startPosition];
            if (attentionSymbolConfig.symName === attentionSymbol.symName) {
                this._spinReelPartAnimator.setupTweenSpinSpeedQueue(attentionSymbolConfig.spinSpeed, attentionSymbolConfig.steps);
                attentionSymbol.changeState({
                    state: attentionSymbolConfig.symbolState ? attentionSymbolConfig.symbolState : GameConfig_1.GameConfig.instance.SYMBOL_STATES.normal,
                    replay: false,
                    fadeInDuration: attentionSymbolConfig.spinSpeed / 2,
                    fadeInDelay: 0
                });
                this._reelView.addChild(attentionSymbol);
                return;
            }
        }
        // NOTE: I don't set the symbol state back to spin because the symbol wil either spin away or stop. This will also make it easier if there are more than 1 attention symbols slow down the reel together.
    }
    onSpinStartedCompleted() {
        this.updateStackedSymbols(this.allSymbols[this.allSymbols.length - 1], null, 1, false);
        this.removeSymbol(this.allSymbols.pop());
        this.tryStartSlowSpinAttention();
        this._currentState = ReelAnimationState_1.ReelAnimationState.SPIN;
        this.spinSpinAnimation();
        EventHandler_1.EventHandler.dispatchEvent(new GameEvent_1.GameEvent(ReelEvent_1.ReelEvent.REEL_SPIN_STARTED, this._reelId));
    }
    onSpinStepCompleted() {
        this.updateStackedSymbols(this.allSymbols[this.allSymbols.length - 2], null, 1, false);
        this.removeSymbol(this.allSymbols.pop());
        this.tryStartSlowSpinAttention();
        switch (this._currentState) {
            case ReelAnimationState_1.ReelAnimationState.SPIN:
                this.spinSpinAnimation();
                return;
            case ReelAnimationState_1.ReelAnimationState.STOP_SPIN:
                if (this._stopCounter > 1) {
                    this.spinSpinAnimation();
                    return;
                }
                const timeline = new gsap_1.TimelineLite();
                timeline.add([
                    () => this._isSpinBlurred = false,
                    this._spinReelPartAnimator.getStopSpinAnimation(this.createNextSymbol()),
                    () => this.onSpinStopStarted()
                ]);
                timeline.add(() => this.onSpinStopAnimationCompleted());
                return;
            default:
                debugger;
                throw new Error(`SpinReelController.onSpinStepCompleted()`);
        }
    }
    spinSpinAnimation() {
        const timeline = new gsap_1.TimelineLite();
        timeline.add(this._spinReelPartAnimator.getSpinAnimation(this.createNextSymbol()));
        timeline.add(() => this.onSpinStepCompleted());
    }
    // The stop offset is for features on the reel to prolong the stop.
    // The reelArea will take the biggest offset as the real stop offset.
    getSpinStopOffset() {
        if (this._currentState === ReelAnimationState_1.ReelAnimationState.INACTIVE || this._currentState === ReelAnimationState_1.ReelAnimationState.IDLE) {
            return 0;
        }
        // check if there is unfinished stacked wilds in the bottom of the stop reel set.
        // When the offset is more than 0, we have to make sure to compensate it from the stop reel set.
        let spinStopOffset = 0;
        let bottomSymbol = this._stopReelSet[this._stopReelSet.length - 1];
        let parsedStackedName = StateReelSymbol_1.StateReelSymbol.parseStackedSymbolName(bottomSymbol, this._reelId);
        if (parsedStackedName.isStacked && parsedStackedName.index < (parsedStackedName.totalNum - 1)) {
            spinStopOffset = parsedStackedName.totalNum - 1 - parsedStackedName.index;
        }
        return Math.max(0, spinStopOffset - GameConfig_1.GameConfig.instance.SYMBOLS_NUM_IN_REEL[4]);
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
    // If a reel has special delay based on feature, override this method.
    getStopDelayDelta(stopSpinData) {
        if (stopSpinData.quickStop) {
            return this.getQuickStopDelay(this.reelId);
        }
        if (this.hasNearWin()) {
            return this.getNearWinStopDelay(this.reelId);
        }
        if (stopSpinData.fastSpin) {
            return this.getFastSpinStopDelay(this.reelId);
        }
        return this.getNormalStopDelay(this.reelId);
    }
    calculateStopTime(offset) {
        return this._spinReelPartAnimator.getStopTime(this._symNumTotal + offset - 1, this.hasNearWin());
    }
    stopSpin(stopData, previousStopTime) {
        this._reelPartAnimator.isQuickStop = stopData.quickStop;
        this._reelPartAnimator.isFastSpin = stopData.fastSpin;
        this._spinStopOffset = stopData.spinStopOffset;
        // Quick stop stopping reel
        if (this.currentState === ReelAnimationState_1.ReelAnimationState.STOP_SPIN) {
            return this._spinReelPartAnimator.getStopTime(this._stopCounter - 1, false) + this.currentSpinStepLeftTime;
        }
        // Don't need to restore spin speed if quick stop near win?
        if (stopData.active) {
            const stopTimeTotal = this._spinReelPartAnimator.getStopTime(this._symNumTotal + this._spinStopOffset - 1, this.hasNearWin());
            if (this._reelPartAnimator.isQuickStop) {
                this._addedStopDelay = 0;
            }
            const stopTimerDelay = Math.max(0, previousStopTime + this.getStopDelayDelta(stopData) + this._addedStopDelay - stopTimeTotal);
            this._addedStopDelay = 0;
            if (this._reelStopDelayTimer && this._reelStopDelayTimer.isActive()) {
                // quick stop.
                const timelineLeftTime = this._reelStopDelayTimer.totalDuration() - this._reelStopDelayTimer.time();
                if (stopTimerDelay >= timelineLeftTime) {
                    return timelineLeftTime + stopTimeTotal;
                }
                this._reelStopDelayTimer.pause();
                this._reelStopDelayTimer.kill();
            }
            this._reelStopDelayTimer = gsap_1.TweenLite.to(this, stopTimerDelay, { onComplete: () => this.clearStopDelay() });
            return stopTimerDelay + stopTimeTotal + this.currentSpinStepLeftTime;
        }
        else {
            // If reel not active we fake a spin stopped so it actually send the event.
            Logger_1.Logger.logDev(`ReelController.stopSpin():Inactive reel ${this._reelId} stop spin animation completed!`);
            EventHandler_1.EventHandler.dispatchEvent(new GameEvent_1.GameEvent(ReelEvent_1.ReelEvent.REEL_STOP_SPIN_ANIMATION_COMPLETE, {
                reelId: this._reelId,
                fastSpin: this._reelPartAnimator.isFastSpin,
                quickStop: this._reelPartAnimator.isQuickStop,
                active: false
            }));
            return previousStopTime;
        }
    }
    onStopDelayDone() {
        let addDelayToNextReel = 0;
        const unfinishedSpinningStackedSymbolFillUp = this.handleUnfinishedSpinningStackedSymbols();
        this._currentReelSet = this.makeUpStopReelSet(GameConfig_1.GameConfig.instance.SYMBOLS_NUM_IN_REEL[4] + this._spinStopOffset - unfinishedSpinningStackedSymbolFillUp.length, false).concat(unfinishedSpinningStackedSymbolFillUp);
        this._currentReelSetPosition = this._currentReelSet.length;
        if (this._addedExtraStoppingFullStackedSymbolNum > 0) {
            // To add delay on the rest of reels. if there is any slow motion, it will be calculated in checkSlowMotionStopDelay().
            addDelayToNextReel += this._addedExtraStoppingFullStackedSymbolNum * this._spinReelPartAnimator.spinSpeed;
            this._spinStopOffset += this._addedExtraStoppingFullStackedSymbolNum;
        }
        this._stopCounter = this._symNumTotal + this._spinStopOffset;
        this._currentState = ReelAnimationState_1.ReelAnimationState.STOP_SPIN;
        if (!this._reelPartAnimator.isQuickStop && this._reelId < (GameConfig_1.GameConfig.instance.REELS_NUM - 1)) {
            addDelayToNextReel += this.checkSlowMotionStopDelay();
        }
        addDelayToNextReel += this.currentSpinStepLeftTime;
        if (addDelayToNextReel > 0) {
            EventHandler_1.EventHandler.dispatchEvent(new GameEvent_1.GameEvent(ReelEvent_1.ReelEvent.REEL_ADD_STOP_DELAY, {
                reelId: this._reelId + 1,
                delay: addDelayToNextReel
            }));
        }
    }
    checkSlowMotionStopDelay() {
        if (this._attentionSymbols.length === 0) {
            return 0;
        }
        // If the reel is on slow motion spin or the stop reelset contains the slow motion symbol, add stopDelay to the reels after it.
        let slowMotionStopDelayOffset = 0;
        let slowSteps = 0;
        let slowSpeed = 0;
        let stepsBeforeSlow = 0;
        for (let i = 0; i < this._stopCounter - 1; i++) {
            // If the reel is just on slow motion
            let stepOffset = 0;
            if (this._spinReelPartAnimator.spinSpeedsQueue && this._spinReelPartAnimator.spinSpeedsQueue[i]) {
                stepOffset = this._spinReelPartAnimator.spinSpeedsQueue[i] - this._spinReelPartAnimator.spinSpeed;
            }
            // Check if the symbol triggers new slow mo.
            for (let j = 0; j < this._attentionSymbols.length; j++) {
                const attentionSymbolConfig = this._attentionSymbols[j];
                if (this._currentReelSet[this._currentReelSet.length - 1 - i] === attentionSymbolConfig.symName) {
                    stepsBeforeSlow = this._symNumTop + attentionSymbolConfig.startPosition;
                    slowSteps = attentionSymbolConfig.steps;
                    slowSpeed = attentionSymbolConfig.spinSpeed;
                    break;
                }
            }
            // the new symbol slow motion will override if there is on going slow motion before stop.
            if (stepsBeforeSlow > 0) {
                stepsBeforeSlow--;
            }
            else {
                if (slowSteps > 0) {
                    slowSteps--;
                    stepOffset = slowSpeed - this._spinReelPartAnimator.spinSpeed;
                }
            }
            slowMotionStopDelayOffset += stepOffset;
        }
        // stop step speed offset
        if (slowSteps > 0) {
            slowMotionStopDelayOffset += slowSpeed - this._spinReelPartAnimator.stopSpeed;
        }
        return slowMotionStopDelayOffset;
    }
    // If there are unfinished stacked symbols, fill it up.
    handleUnfinishedSpinningStackedSymbols() {
        if (GameConfig_1.GameConfig.instance.STACKED_SYMBOLS == null) {
            return [];
        }
        const lastStackedName = this.allSymbols[0].stackedSymName;
        if (!lastStackedName.isStacked || lastStackedName.index === 0) {
            return [];
        }
        return ArrayHelper_1.ArrayHelper.initArrayWithValues(lastStackedName.index, index => `${lastStackedName.symName}*${index}`);
    }
    onSpinStopAnimationCompleted() {
        this.removeSymbol(this.allSymbols.pop());
        this.updateStackedSymbols(this.allSymbols[this.allSymbols.length - 1], null, 1, false);
        super.onSpinStopAnimationCompleted();
        if (!this._reelPartAnimator.isQuickStop && this.reelId < (GameConfig_1.GameConfig.instance.REELS_NUM - 1)) {
            EventHandler_1.EventHandler.dispatchEvent(new GameEvent_1.GameEvent(SpinReelEvent_1.SpinReelEvent.REEL_TRY_NEAR_WIN, this.reelId + 1));
        }
    }
    /**
     * Used to set a new reel set during spin. But it does NOT change the next reelSet which will be used when a new spin start.
     * Example : EventHandler.dispatchEvent(new GameEvent(SpinReelEvent.REEL_SET_CURRENT_REEL_SET, {reelSetName :
     * "BASE_REELSET_WILD", reelSetPosition: 10}));
     * If reelSetPosition is not given, use a random value.
     * @param data
     */
    setCurrentReelSet(data) {
        this._currentFullReelSet = Helper_1.Helper.getReelSet(data.reelSetName, this._reelId);
        // Added +1 in the random position, if this is used during spinning, the spin will first move the reelSetPosition before getting the next symbol.
        // If the random position is a bottom of the stack, then we use +1 to make sure it's safe after moving the position.
        const topFillUp = this.makeUpStackedSymbolTop(this.allSymbols[0].symName);
        const position = data.reelSetPosition == null ? this.randomizeReelSetPosition(this._currentFullReelSet) : data.reelSetPosition;
        this._currentReelSet = this._currentFullReelSet.slice(0, position + 1).concat(topFillUp);
        this._currentReelSetPosition = this._currentReelSet.length;
    }
    onAddSpinningAttentionSymbol(symConfig) {
        if (symConfig.reelId != this._reelId) {
            return;
        }
        this._attentionSymbols.forEach((existedConfig) => {
            if (existedConfig.symName === symConfig.symName) {
                existedConfig.startPosition = symConfig.startPosition;
                existedConfig.steps = symConfig.steps;
                existedConfig.spinSpeed = symConfig.spinSpeed;
                return;
            }
        });
        this._attentionSymbols.push(symConfig);
    }
    onRemoveSpinningAttentionSymbol(reelId, symName) {
        if (reelId != this._reelId) {
            return;
        }
        ArrayHelper_1.ArrayHelper.removeFirstMatchElementWithCondition(this._attentionSymbols, (symbolConfig) => {
            return symbolConfig.symName === symName;
        });
    }
    onSetReelNextSpinFullStack(reelId, isNextSpinFullStaked) {
        if (reelId != this._reelId) {
            return;
        }
        this._isNextSpinFullStacked = isNextSpinFullStaked;
    }
    setReelSpinSpeed(data) {
        if (data.reelId != this._reelId) {
            return;
        }
        if (!this._reelPartAnimator.isQuickStop) {
            gsap_1.TweenLite.to(this._reelPartAnimator, data.fadeInTime, { spinSpeed: data.spinSpeed });
        }
    }
    tryPlayNearWin(reelId) {
        if (reelId !== this.reelId) {
            return;
        }
        if (this.hasNearWin() && this.currentState === ReelAnimationState_1.ReelAnimationState.SPIN) {
            this.playNearWin(reelId);
        }
    }
    playNearWin(id) {
        this._spinReelPartAnimator.playNearWin();
        this._isNearWin = true;
        EventHandler_1.EventHandler.dispatchEvent(new GameEvent_1.GameEvent(SpinReelEvent_1.SpinReelEvent.REEL_ON_NEAR_WIN, this._reelId));
    }
    hasNearWin(reelId) {
        reelId = reelId !== null && reelId !== void 0 ? reelId : this.reelId;
        return (this._nearWinReels != null && this._nearWinReels[reelId]) || (this._nearWinBigWinReels != null && this._nearWinBigWinReels[reelId]);
    }
    findSymbol(symId, onlyVisibleStackedSymbol = true) {
        return super.findSymbol(symId + this._symNumTop, onlyVisibleStackedSymbol);
    }
}
exports.SpinReelController = SpinReelController;
//# sourceMappingURL=SpinReelController.js.map