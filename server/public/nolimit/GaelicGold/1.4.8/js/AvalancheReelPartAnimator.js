"use strict";
/**
 * Created by Ning Jiang on 8/21/2019.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AvalancheReelPartAnimator = void 0;
const EventHandler_1 = require("../../../core/event/EventHandler");
const GameEvent_1 = require("../../../core/event/GameEvent");
const GameConfig_1 = require("../../../core/gameconfig/GameConfig");
const ReelPartAnimator_1 = require("../../../core/reel/reel/ReelPartAnimator");
const ArrayHelper_1 = require("../../../core/utils/ArrayHelper");
const gsap_1 = require("gsap");
const MathHelper_1 = require("../../../core/utils/MathHelper");
const AvalancheReelEvent_1 = require("./AvalancheReelEvent");
class AvalancheReelPartAnimator extends ReelPartAnimator_1.ReelPartAnimator {
    get isQuickStop() {
        return this._isQuickStop;
    }
    set isQuickStop(value) {
        this._isQuickStop = value;
        if (this._isQuickStop) {
            this._stopSymDelay = AvalancheReelPartAnimator._quickStopSymbolDelay[this._reelId];
            this.stopSpeed = ReelPartAnimator_1.ReelPartAnimator._spinQuickStopSpeeds[this._reelId];
        }
    }
    get startSymDelay() {
        return this._startSymDelay;
    }
    set startSymDelay(value) {
        this._startSymDelay = value;
    }
    get stopSymDelay() {
        return this._stopSymDelay;
    }
    set stopSymDelay(value) {
        this._stopSymDelay = value;
    }
    get currentTimeline() {
        return this._currentTimeline;
    }
    constructor(reelId) {
        super(reelId);
    }
    initConfig() {
        if (ReelPartAnimator_1.ReelPartAnimator._configInitialized) {
            return;
        }
        const startSymDelay = GameConfig_1.GameConfig.instance.REEL_SPIN_START_SYMBOL_DELAY ? GameConfig_1.GameConfig.instance.REEL_SPIN_START_SYMBOL_DELAY : 0;
        if ((0, MathHelper_1.isNumber)(startSymDelay)) {
            this.addTweakModuleSlider({
                text: "Avalanche Spin Out Symbol Delay",
                minValue: 0,
                maxValue: 2,
                startValue: startSymDelay,
                onValueChangeCallback: (text, newValue) => AvalancheReelPartAnimator.onSpinStartSymbolDelayChanged(newValue)
            });
            AvalancheReelPartAnimator._startSymbolDelay = ArrayHelper_1.ArrayHelper.initArrayWithValues(GameConfig_1.GameConfig.instance.REELS_NUM, () => startSymDelay);
        }
        else {
            AvalancheReelPartAnimator._startSymbolDelay = startSymDelay;
            if (AvalancheReelPartAnimator._startSymbolDelay.length != GameConfig_1.GameConfig.instance.REELS_NUM) {
                debugger;
                throw new Error(`AvalancheReelPartAnimator.initConfig(): Invalid config REEL_SPIN_START_SYMBOL_DELAY, the length doesn't match the amount of reels!`);
            }
        }
        if (GameConfig_1.GameConfig.instance.REEL_FAST_SPIN_START_SYMBOL_DELAY) {
            const fastStartSymDelay = GameConfig_1.GameConfig.instance.REEL_FAST_SPIN_START_SYMBOL_DELAY;
            if ((0, MathHelper_1.isNumber)(fastStartSymDelay)) {
                this.addTweakModuleSlider({
                    text: "Avalanche Fast Spin Out Symbol Delay",
                    minValue: 0,
                    maxValue: 2,
                    startValue: fastStartSymDelay,
                    onValueChangeCallback: (text, newValue) => AvalancheReelPartAnimator.onSpinFastStartSymbolDelayChanged(newValue)
                });
                AvalancheReelPartAnimator._fastStartSymbolDelay = ArrayHelper_1.ArrayHelper.initArrayWithValues(GameConfig_1.GameConfig.instance.REELS_NUM, () => fastStartSymDelay);
            }
            else {
                AvalancheReelPartAnimator._fastStartSymbolDelay = fastStartSymDelay;
                if (AvalancheReelPartAnimator._fastStartSymbolDelay.length != GameConfig_1.GameConfig.instance.REELS_NUM) {
                    debugger;
                    throw new Error(`AvalancheReelPartAnimator.initConfig(): Invalid config REEL_FAST_SPIN_START_SYMBOL_DELAY, the length doesn't match the amount of reels!`);
                }
            }
        }
        else {
            AvalancheReelPartAnimator._fastStartSymbolDelay = AvalancheReelPartAnimator._startSymbolDelay.concat();
        }
        const stopSymDelay = GameConfig_1.GameConfig.instance.REEL_SPIN_STOP_SYMBOL_DELAY ? GameConfig_1.GameConfig.instance.REEL_SPIN_STOP_SYMBOL_DELAY : 0;
        if ((0, MathHelper_1.isNumber)(stopSymDelay)) {
            this.addTweakModuleSlider({
                text: "Avalanche Spin In Symbol Delay",
                minValue: 0,
                maxValue: 2,
                startValue: stopSymDelay,
                onValueChangeCallback: (text, newValue) => AvalancheReelPartAnimator.onSpinStopSymbolDelayChanged(newValue)
            });
            AvalancheReelPartAnimator._stopSymbolDelay = ArrayHelper_1.ArrayHelper.initArrayWithValues(GameConfig_1.GameConfig.instance.REELS_NUM, () => stopSymDelay);
        }
        else {
            AvalancheReelPartAnimator._stopSymbolDelay = stopSymDelay;
            if (AvalancheReelPartAnimator._stopSymbolDelay.length != GameConfig_1.GameConfig.instance.REELS_NUM) {
                debugger;
                throw new Error(`AvalancheReelPartAnimator.initConfig(): Invalid config REEL_SPIN_STOP_SYMBOL_DELAY, the length doesn't match the amount of reels!`);
            }
        }
        const quickStopSymDelay = GameConfig_1.GameConfig.instance.REEL_SPIN_QUICK_STOP_SYMBOL_DELAY ? GameConfig_1.GameConfig.instance.REEL_SPIN_QUICK_STOP_SYMBOL_DELAY : 0;
        if ((0, MathHelper_1.isNumber)(quickStopSymDelay)) {
            this.addTweakModuleSlider({
                text: "Avalanche Quick Spin In Symbol Delay",
                minValue: 0,
                maxValue: 2,
                startValue: quickStopSymDelay,
                onValueChangeCallback: (text, newValue) => AvalancheReelPartAnimator.onSpinQuickStopSymbolDelayChanged(newValue)
            });
            AvalancheReelPartAnimator._quickStopSymbolDelay = ArrayHelper_1.ArrayHelper.initArrayWithValues(GameConfig_1.GameConfig.instance.REELS_NUM, () => quickStopSymDelay);
        }
        else {
            AvalancheReelPartAnimator._quickStopSymbolDelay = quickStopSymDelay;
            if (AvalancheReelPartAnimator._quickStopSymbolDelay.length != GameConfig_1.GameConfig.instance.REELS_NUM) {
                debugger;
                throw new Error(`AvalancheReelPartAnimator.initConfig(): Invalid config REEL_SPIN_QUICK_STOP_SYMBOL_DELAY, the length doesn't match the amount of reels!`);
            }
        }
        const nearWinSymDelay = GameConfig_1.GameConfig.instance.REEL_SPIN_NEAR_WIN_STOP_SYMBOL_DELAY ? GameConfig_1.GameConfig.instance.REEL_SPIN_NEAR_WIN_STOP_SYMBOL_DELAY : 0;
        if ((0, MathHelper_1.isNumber)(nearWinSymDelay)) {
            this.addTweakModuleSlider({
                text: "Avalanche Near Win Spin In Symbol Delay",
                minValue: 0,
                maxValue: 2,
                startValue: nearWinSymDelay,
                onValueChangeCallback: (text, newValue) => AvalancheReelPartAnimator.onSpinNearWinSymbolDelayChanged(newValue)
            });
            AvalancheReelPartAnimator._nearWinStopSymbolDelay = ArrayHelper_1.ArrayHelper.initArrayWithValues(GameConfig_1.GameConfig.instance.REELS_NUM, () => nearWinSymDelay);
        }
        else {
            AvalancheReelPartAnimator._nearWinStopSymbolDelay = nearWinSymDelay;
            if (AvalancheReelPartAnimator._nearWinStopSymbolDelay.length != GameConfig_1.GameConfig.instance.REELS_NUM) {
                debugger;
                throw new Error(`AvalancheReelPartAnimator.initConfig(): Invalid config REEL_SPIN_NEAR_WIN_STOP_SYMBOL_DELAY, the length doesn't match the amount of reels!`);
            }
        }
        super.initConfig();
    }
    static onSpinStartSymbolDelayChanged(newValue) {
        AvalancheReelPartAnimator._startSymbolDelay = ArrayHelper_1.ArrayHelper.initArrayWithValues(GameConfig_1.GameConfig.instance.REELS_NUM, () => newValue);
    }
    static onSpinFastStartSymbolDelayChanged(newValue) {
        AvalancheReelPartAnimator._fastStartSymbolDelay = ArrayHelper_1.ArrayHelper.initArrayWithValues(GameConfig_1.GameConfig.instance.REELS_NUM, () => newValue);
    }
    static onSpinStopSymbolDelayChanged(newValue) {
        AvalancheReelPartAnimator._stopSymbolDelay = ArrayHelper_1.ArrayHelper.initArrayWithValues(GameConfig_1.GameConfig.instance.REELS_NUM, () => newValue);
    }
    static onSpinQuickStopSymbolDelayChanged(newValue) {
        AvalancheReelPartAnimator._quickStopSymbolDelay = ArrayHelper_1.ArrayHelper.initArrayWithValues(GameConfig_1.GameConfig.instance.REELS_NUM, () => newValue);
    }
    static onSpinNearWinSymbolDelayChanged(newValue) {
        AvalancheReelPartAnimator._nearWinStopSymbolDelay = ArrayHelper_1.ArrayHelper.initArrayWithValues(GameConfig_1.GameConfig.instance.REELS_NUM, () => newValue);
    }
    // these positions assume all the symbols has the same height. Override for different features.
    initTargetPositions() {
        this._targetPositions = [];
        let targetPosition;
        const positionsNumTotal = GameConfig_1.GameConfig.instance.SYMBOLS_NUM_IN_REEL[2];
        for (let i = 0; i < positionsNumTotal; i++) {
            targetPosition = this.symStep * i + this._symHeight / 2;
            this._targetPositions.push(targetPosition);
        }
    }
    initSymbolsPosition() {
        // Do it from the bottom.
        for (let i = 0; i < this._symbolsToAnimate.length; i++) {
            this.symbolsToAnimate[this._symbolsToAnimate.length - 1 - i].y = this._targetPositions[this._targetPositions.length - 1 - i];
        }
    }
    resetStartSpin(isFastSpin) {
        super.resetStartSpin(isFastSpin);
        this._startSymDelay = isFastSpin ? AvalancheReelPartAnimator._fastStartSymbolDelay[this._reelId] : AvalancheReelPartAnimator._startSymbolDelay[this._reelId];
        this._stopSymDelay = isFastSpin ? AvalancheReelPartAnimator._quickStopSymbolDelay[this._reelId] : AvalancheReelPartAnimator._stopSymbolDelay[this._reelId];
    }
    // TODO: there is a risk that the win positions are removed when creating the timeline but the symbolsToAnimate will only be updated when the timeline start.
    // So if there is a duration between the creating and playing, and the timeline is abort, it can be a problem.
    // So when abort happens, always have to check if the progress === 0 then play() and progress(1) before checking the isActive() then pause and kill or progress(1)
    getAvalancheAnimation(positions, allWinPositions, delay, onSymbolCompleteCallback) {
        if (!positions.includes(true)) {
            return new gsap_1.TimelineLite();
        }
        const timeline = new gsap_1.TimelineLite();
        const leftSymbols = this._symbolsToAnimate.concat();
        // To remove all win position symbols.
        let i = 1;
        // Logger.logDev(`reel ${this._reelId} BEFORE`);
        // Logger.logDev(`avalanche positions ${positions.toString()}`);
        // Logger.logDev(`leftSymbol = ${leftSymbols.map((symbol) => symbol.symName).toString()}`);
        while (positions.length > 0) {
            if ((leftSymbols.length - i) < 0) {
                break; // if the position is longer than symbols.
            }
            const toRemove = positions.pop();
            if (toRemove) {
                const symId = leftSymbols.length - i;
                const symbol = leftSymbols.splice(symId, 1)[0];
                timeline.add(() => onSymbolCompleteCallback(symbol));
                if (allWinPositions != null) {
                    allWinPositions.splice(allWinPositions.length - i, 1); // Change the winPositions too so it doesn't run it again when zerobet start.
                    allWinPositions.unshift(false);
                }
            }
            else {
                i++;
            }
        }
        timeline.add(() => this._symbolsToAnimate = leftSymbols.concat()); // Must update the _symbolsToAnimate before new symbols come in.
        // Logger.logDev(`reel ${this._reelId} AFTER:`);
        // Logger.logDev(`leftSymbol = ${leftSymbols.map((symbol) => symbol.symName).toString()}`);
        // Get symbol avalanche animations.
        for (let i = 0; i < leftSymbols.length; i++) {
            const symId = leftSymbols.length - 1 - i;
            const positionId = this._targetPositions.length - 1 - i;
            const symbol = leftSymbols[symId];
            if (symbol == null) {
                debugger;
                throw new Error(`AvalancheReelPartAnimator.getAvalancheAnimation, symbol at index ${symId} is null!`);
            }
            else {
                delay = this.addSymbolInAnimationToTimeline(symbol, timeline, delay, this._targetPositions[positionId], i === 0, false, false);
            }
        }
        timeline.add(() => this._currentTimeline = null);
        this._currentTimeline = timeline;
        return timeline;
    }
    getAllOutAnimation(delay, onSymbolCompleteCallback) {
        const timeline = new gsap_1.TimelineLite();
        // Remove symbols from symbolsToAnimate so it's ready to get new symbols in.
        while (this._symbolsToAnimate.length > 0) {
            const symbol = this._symbolsToAnimate.pop();
            if (symbol == null) {
                debugger;
                throw new Error(`AvalancheReelPartAnimator.animateAllOut, symbol is null!`);
            }
            else {
                delay = this.addSymbolOutAnimationToTimeline(symbol, timeline, delay, onSymbolCompleteCallback);
            }
        }
        timeline.add(() => this._currentTimeline = null);
        this._currentTimeline = timeline;
        return timeline;
    }
    // TODO: override the whole animation or create end pos and start pos config.
    addSymbolOutAnimationToTimeline(symbol, timeline, delay, onSymbolCompleteCallback) {
        if (symbol.stackedSymName.isStacked && !symbol.visible) {
            onSymbolCompleteCallback(symbol);
            return delay;
        }
        delay += this.startSymDelay;
        timeline.add(symbol.changeState({
            state: GameConfig_1.GameConfig.instance.SYMBOL_STATES.spin,
            setStack: true,
            replay: false,
            fadeInDuration: GameConfig_1.GameConfig.instance.REEL_SPIN_START_SYMBOL_CHANGE_TO_SPIN_STATE_DURATION,
            fadeInDelay: GameConfig_1.GameConfig.instance.REEL_SPIN_START_SYMBOL_CHANGE_TO_SPIN_STATE_DELAY
        }), delay);
        timeline.add(gsap_1.TweenLite.to(symbol, this.startSpeed, {
            ease: GameConfig_1.GameConfig.instance.REEL_SPIN_START_EASE,
            y: symbol.y + GameConfig_1.GameConfig.instance.REEL_AREA_HEIGHT,
            onComplete: () => onSymbolCompleteCallback(symbol)
        }), delay);
        return delay;
    }
    // Change the return type to any so it can use CustomEase which doesn't extend from Ease.
    getDefaultStopEase() {
        const stopEaseConfig = this.isQuickStop ? GameConfig_1.GameConfig.instance.REEL_SPIN_QUICK_STOP_ELASTIC_CONFIG : GameConfig_1.GameConfig.instance.REEL_SPIN_STOP_ELASTIC_CONFIG;
        return gsap_1.Elastic.easeOut.config(stopEaseConfig[0], stopEaseConfig[1]);
    }
    getNewSymbolsInAnimation(newSymbols, nearWinPositions) {
        // No win on this reel
        if (newSymbols.length === 0) {
            return new gsap_1.TimelineLite();
        }
        if (newSymbols.length + this._symbolsToAnimate.length != this._targetPositions.length) {
            debugger;
            throw new Error("AvalancheReelPartAnimator.getAvalancheNewAnimation(): the amount of symbols doesn't match the positions!");
        }
        const timeline = new gsap_1.TimelineLite();
        let delay = 0;
        let firstSymbol = true;
        while (newSymbols.length > 0) {
            const symbol = newSymbols.pop();
            this._symbolsToAnimate.unshift(symbol);
            const symId = newSymbols.length;
            delay = this.addSymbolInAnimationToTimeline(symbol, timeline, delay, this._targetPositions[symId], firstSymbol, nearWinPositions[symId], true);
            firstSymbol = false;
        }
        timeline.add(() => this._currentTimeline = null);
        this._currentTimeline = timeline;
        return timeline;
    }
    getQuickStopNewSymbolsInAnimation() {
        const timeline = new gsap_1.TimelineLite();
        let delay = 0;
        for (let i = 0; i < this._symbolsToAnimate.length; i++) {
            const symId = this._symbolsToAnimate.length - 1 - i;
            const symbol = this._symbolsToAnimate[symId];
            // Now sure how do we want to do with the first symbol when quick stop, it might or might not be the real fist symbol.
            delay = this.addSymbolInAnimationToTimeline(symbol, timeline, delay, this._targetPositions[symId], false, false, true);
        }
        timeline.add(() => this._currentTimeline = null);
        this._currentTimeline = timeline;
        return timeline;
    }
    addSymbolInAnimationToTimeline(symbol, timeline, delay, targetPosition, firstSymbol, nearWin, triggerAttention) {
        if (symbol.stackedSymName.isStacked && !symbol.visible) {
            return delay; // do not play invisible stacked symbols.
        }
        if (symbol.y === targetPosition) {
            return delay;
        }
        const distanceFactor = MathHelper_1.MathHelper.roundToDecimals((targetPosition - symbol.y) / GameConfig_1.GameConfig.instance.REEL_AREA_HEIGHT, 3);
        delay += (nearWin && !this.isQuickStop) ? AvalancheReelPartAnimator._nearWinStopSymbolDelay[this._reelId] : this.stopSymDelay;
        const stopSpeed = (nearWin && !this.isQuickStop) ? ReelPartAnimator_1.ReelPartAnimator._nearWinSpinSpeeds[this._reelId] : this.stopSpeed;
        timeline.add(gsap_1.TweenLite.to(symbol, stopSpeed * distanceFactor, {
            ease: this.getDefaultStopEase(),
            y: targetPosition,
            onComplete: () => {
                if (triggerAttention) {
                    this.onSymbolInAttentionPointReached(symbol);
                }
            }
        }), delay);
        const unBlurSymbolTimeline = new gsap_1.TimelineLite({ paused: true });
        unBlurSymbolTimeline.add(symbol.changeState({
            state: GameConfig_1.GameConfig.instance.REEL_SPIN_STOP_SYMBOL_STATE ? GameConfig_1.GameConfig.instance.REEL_SPIN_STOP_SYMBOL_STATE() : GameConfig_1.GameConfig.instance.SYMBOL_STATES.normal,
            replay: false,
            setStack: true,
            fadeInDuration: GameConfig_1.GameConfig.instance.REEL_SPIN_STOP_SYMBOL_CHANGE_FROM_SPIN_STATE_DURATION * distanceFactor,
            fadeInDelay: GameConfig_1.GameConfig.instance.REEL_SPIN_STOP_SYMBOL_CHANGE_FROM_SPIN_STATE_DELAY * distanceFactor
        }));
        timeline.add(() => unBlurSymbolTimeline.play(), delay);
        timeline.add(() => { }, delay + unBlurSymbolTimeline.totalDuration());
        return delay;
    }
    onSymbolInAttentionPointReached(symbol) {
        EventHandler_1.EventHandler.dispatchEvent(new GameEvent_1.GameEvent(AvalancheReelEvent_1.AvalancheReelEvent.REEL_STOP_SPIN_SYMBOL_ATTENTION_START, {
            reelId: this._reelId,
            symbols: [symbol],
            quickStop: this.isQuickStop
        }));
    }
}
exports.AvalancheReelPartAnimator = AvalancheReelPartAnimator;
//# sourceMappingURL=AvalancheReelPartAnimator.js.map