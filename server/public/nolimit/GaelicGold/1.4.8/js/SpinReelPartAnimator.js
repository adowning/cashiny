"use strict";
/**
 * Created by Ning Jiang on 8/21/2019.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpinReelPartAnimator = void 0;
const gsap_1 = require("gsap");
const EventHandler_1 = require("../../../core/event/EventHandler");
const GameEvent_1 = require("../../../core/event/GameEvent");
const GameConfig_1 = require("../../../core/gameconfig/GameConfig");
const ReelPartAnimator_1 = require("../../../core/reel/reel/ReelPartAnimator");
const ArrayHelper_1 = require("../../../core/utils/ArrayHelper");
const MathHelper_1 = require("../../../core/utils/MathHelper");
const SpinReelEvent_1 = require("./SpinReelEvent");
class SpinReelPartAnimator extends ReelPartAnimator_1.ReelPartAnimator {
    get isQuickStop() {
        return this._isQuickStop;
    }
    set isQuickStop(value) {
        this._isQuickStop = value;
        if (this._isQuickStop) {
            if (this._spinSpeedsQueue && this._spinSpeedsQueue.length > 0) {
                this._spinSpeedsQueue.length = 0;
            }
            this.stopSpeed = ReelPartAnimator_1.ReelPartAnimator._spinQuickStopSpeeds[this._reelId];
        }
    }
    get preYPos() {
        return this._preYPos;
    }
    get yPos() {
        return this._yPos;
    }
    set yPos(value) {
        if (value === this._yPos) {
            return;
        }
        this._preYPos = this._yPos;
        this._yPos = value;
        const y = MathHelper_1.MathHelper.floorToDecimals(value, 2);
        for (let i = 0; i < this._symbolsToAnimate.length; i++) {
            this._symbolsToAnimate[i].y = MathHelper_1.MathHelper.floorToDecimals((this._targetPositions[i] + y), 2);
        }
    }
    get currentSpeed() {
        return this._currentSpeed;
    }
    get spinSpeedsQueue() {
        return this._spinSpeedsQueue;
    }
    get currentStepLeftTime() {
        if (this._currentTween != null && this._currentTween.isActive()) {
            return this._currentSpeed * (1 - this._currentTween.progress());
        }
        return 0;
    }
    constructor(reelId) {
        super(reelId);
        this._currentSpeed = 0;
    }
    // these positions assume all the symbols has the same height. Override for different features.
    initTargetPositions() {
        this._targetPositions = [];
        let targetPosition;
        const positionsNumTotal = ArrayHelper_1.ArrayHelper.arraySum(GameConfig_1.GameConfig.instance.SYMBOLS_NUM_IN_REEL) + 1;
        const positionsNumTop = GameConfig_1.GameConfig.instance.SYMBOLS_NUM_IN_REEL[0] + GameConfig_1.GameConfig.instance.SYMBOLS_NUM_IN_REEL[1] + 1;
        for (let i = 0; i < positionsNumTotal; i++) {
            targetPosition = this.symStep * (i - positionsNumTop) + this._symHeight / 2;
            this._targetPositions.push(targetPosition);
        }
    }
    initSymbolsPosition() {
        this._yPos = 0;
        this._preYPos = 0;
        this.yPos = this.symStep;
    }
    getStartSpinAnimate(delay, newSymbol) {
        this._symbolsToAnimate.unshift(newSymbol);
        this.resetSymbolsPosition();
        const speed = this.calculateStartSpinSpeed();
        this._currentTween = gsap_1.TweenLite.to(this, speed, {
            ease: GameConfig_1.GameConfig.instance.REEL_SPIN_START_EASE,
            yPos: this.symStep
        });
        const timeline = new gsap_1.TimelineLite();
        timeline.add([
            this._currentTween,
            () => {
                this._currentSpeed = speed;
                this.fadeInBlurSymbols();
            }
        ], delay);
        return timeline;
    }
    calculateStartSpinSpeed() {
        return this.startSpeed;
    }
    fadeInBlurSymbols() {
        for (let i = 0; i < this._symbolsToAnimate.length; i++) {
            this._symbolsToAnimate[i].changeState({
                state: GameConfig_1.GameConfig.instance.SYMBOL_STATES.spin,
                replay: false,
                fadeInDuration: GameConfig_1.GameConfig.instance.REEL_SPIN_START_SYMBOL_CHANGE_TO_SPIN_STATE_DURATION,
                fadeInDelay: GameConfig_1.GameConfig.instance.REEL_SPIN_START_SYMBOL_CHANGE_TO_SPIN_STATE_DELAY
            });
        }
    }
    resetSymbolsPosition() {
        this.yPos = 0;
        this._preYPos = 0;
    }
    getSpinAnimation(newSymbol) {
        this._symbolsToAnimate.unshift(newSymbol);
        this.resetSymbolsPosition();
        const speed = this.calculateSpinSpeed();
        this._currentTween = gsap_1.TweenLite.to(this, speed, {
            ease: gsap_1.Linear.easeNone,
            yPos: this.symStep
        });
        const timeline = new gsap_1.TimelineLite();
        timeline.add([
            this._currentTween,
            () => this._currentSpeed = speed
        ]);
        return timeline;
    }
    calculateSpinSpeed() {
        return (!this.isQuickStop && this._spinSpeedsQueue && this._spinSpeedsQueue.length > 0) ? this._spinSpeedsQueue.shift() : this.spinSpeed;
    }
    // TO override for different speeds.
    setupTweenSpinSpeedQueue(endSpeed, steps) {
        this._spinSpeedsQueue = ArrayHelper_1.ArrayHelper.initArrayWithValues(steps, (index) => endSpeed);
        // const offset:number = MathHelper.limitDecimals((endSpeed - this._currentSpeed) / (Math.floor(steps / 2)), 2);
        // const offset:number = MathHelper.limitDecimals((endSpeed - this._currentSpeed) / 2, 2); // only tween for 1 step so the symbol lands on the top position can slow down too.
        // for(let i:number = 0; i < steps; i++) {
        //     this._spinSpeedsQueue.push(endSpeed);
        // }
        // this._spinSpeedsQueue[steps - 1] = endSpeed; // To make sure the end speed in the end.
    }
    getStopTime(stopSteps, nearWin) {
        // this is the stop time we know before stop. if there is slow motion spin happens during stopping, we add the delay when stop at onStopDelayDone().
        const spinSpeed = (!this.isQuickStop && nearWin) ? SpinReelPartAnimator._nearWinSpinSpeeds[this._reelId] : this.spinSpeed;
        return spinSpeed * stopSteps + this.stopSpeed;
    }
    getSpinStopEase() {
        const config = GameConfig_1.GameConfig.instance.REEL_SPIN_STOP_ELASTIC_CONFIG;
        return gsap_1.Elastic.easeOut.config(config[0], config[1]);
    }
    getSpinQuickStopEase() {
        const configQuick = GameConfig_1.GameConfig.instance.REEL_SPIN_QUICK_STOP_ELASTIC_CONFIG;
        return gsap_1.Elastic.easeOut.config(configQuick[0], configQuick[1]);
    }
    getStopSpinAnimation(newSymbol) {
        this._symbolsToAnimate.unshift(newSymbol);
        this.resetSymbolsPosition();
        this._bouncingTargetReached = false;
        const speed = this.calculationStopSpinSpeed();
        this._currentTween = gsap_1.TweenLite.to(this, speed, {
            ease: this.isQuickStop ? this.getSpinQuickStopEase() : this.getSpinStopEase(),
            yPos: this.symStep,
            onUpdate: () => this.onBouncingUpdate()
        });
        const timeline = new gsap_1.TimelineLite();
        timeline.add([
            this._currentTween,
            () => {
                this._currentSpeed = speed;
                this.fadeOutSymbolBlur();
            }
        ]);
        timeline.add(() => this.onSpinStopCompleted());
        return timeline;
    }
    calculationStopSpinSpeed() {
        return (!this.isQuickStop && this._spinSpeedsQueue && this._spinSpeedsQueue.length > 0) ? this._spinSpeedsQueue.shift() : this.stopSpeed;
    }
    onBouncingUpdate() {
        if (this._bouncingTargetReached) {
            return;
        }
        if (this._yPos < this._preYPos) {
            this.onBouncingTargetReached();
        }
    }
    onBouncingTargetReached() {
        this._bouncingTargetReached = true;
        EventHandler_1.EventHandler.dispatchEvent(new GameEvent_1.GameEvent(SpinReelEvent_1.SpinReelEvent.REEL_STOP_SPIN_BOUNCE_STARTED, { reelId: this._reelId, quickStop: this.isQuickStop, fastSpin: this.isFastSpin }));
    }
    fadeOutSymbolBlur() {
        for (let i = 0; i < this._symbolsToAnimate.length; i++) {
            this._symbolsToAnimate[i].changeState({
                state: GameConfig_1.GameConfig.instance.REEL_SPIN_STOP_SYMBOL_STATE ? GameConfig_1.GameConfig.instance.REEL_SPIN_STOP_SYMBOL_STATE() : GameConfig_1.GameConfig.instance.SYMBOL_STATES.normal,
                replay: false,
                fadeInDuration: GameConfig_1.GameConfig.instance.REEL_SPIN_STOP_SYMBOL_CHANGE_FROM_SPIN_STATE_DURATION,
                fadeInDelay: GameConfig_1.GameConfig.instance.REEL_SPIN_STOP_SYMBOL_CHANGE_FROM_SPIN_STATE_DELAY
            });
        }
    }
    onSpinStopCompleted() {
        this._currentSpeed = 0;
        this._currentTween = null;
        if (this._spinSpeedsQueue && this._spinSpeedsQueue.length > 0) {
            this._spinSpeedsQueue.length = 0;
        }
        if (!this._bouncingTargetReached) {
            this.onBouncingTargetReached();
        }
    }
    playNearWin(speed) {
        this.spinSpeed = speed !== null && speed !== void 0 ? speed : SpinReelPartAnimator._nearWinSpinSpeeds[this._reelId];
    }
}
exports.SpinReelPartAnimator = SpinReelPartAnimator;
//# sourceMappingURL=SpinReelPartAnimator.js.map