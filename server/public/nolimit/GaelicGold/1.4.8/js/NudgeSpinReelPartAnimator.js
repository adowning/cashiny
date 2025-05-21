"use strict";
/**
 * Created by Ning Jiang on 10/31/2017.
 * Moved from WildNudge by Ning Jiang on 5/17/2018.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.NudgeSpinReelPartAnimator = void 0;
const gsap_1 = require("gsap");
const Logger_1 = require("@nolimitcity/slot-launcher/bin/utils/Logger");
const SpinReelPartAnimator_1 = require("../spinreel/SpinReelPartAnimator");
class NudgeSpinReelPartAnimator extends SpinReelPartAnimator_1.SpinReelPartAnimator {
    get nudgeSteps() {
        return this._nudgeSteps;
    }
    set nudgeSteps(value) {
        this._nudgeSteps = value;
    }
    get nudgeStepSpeed() {
        return this._nudgeStepSpeed;
    }
    set nudgeStepSpeed(value) {
        this._nudgeStepSpeed = value;
    }
    get ease() {
        return this._ease;
    }
    set ease(value) {
        this._ease = value;
    }
    get aborted() {
        return this._aborted;
    }
    set aborted(value) {
        this._aborted = value;
    }
    constructor(reelId) {
        super(reelId);
        this._aborted = false;
    }
    getNudgeCompleteAnimation(delay) {
        this._nudgeTimeline = new gsap_1.TimelineLite();
        this._nudgeTimeline.add(() => this.onNudgeCompleted(), delay);
        return this._nudgeTimeline;
    }
    getNudgeDownAnimation(nextNudgeDownSymbol) {
        this._symbolsToAnimate.unshift(nextNudgeDownSymbol);
        this.resetSymbolsPosition();
        this._nudgeTimeline = new gsap_1.TimelineLite();
        if (this._aborted) {
            Logger_1.Logger.logDev(`NudgeSpinReelPartAnimator nudgeDown after abort. at reel ${this._reelId}`);
            this._nudgeTimeline.add(() => this.yPos = this.symStep);
        }
        else {
            Logger_1.Logger.logDev(`NudgeSpinReelPartAnimator nudgeDown  at reel ${this._reelId}`);
            this._nudgeTimeline.add(gsap_1.TweenLite.to(this, this._nudgeStepSpeed, {
                ease: this.ease,
                yPos: this.symStep
            }));
        }
        this._nudgeTimeline.add(() => this.onNudgeDownStepCompleted());
        return this._nudgeTimeline;
    }
    onNudgeDownStepCompleted() {
        Logger_1.Logger.logDev(`NudgeSpinReelPartAnimator.onNudgeDownStepCompleted, abort: ${this._aborted}  at reel ${this._reelId}`);
        this._nudgeSteps--;
        this._nudgeTimeline = null;
    }
    onNudgeCompleted() {
        Logger_1.Logger.logDev(`NudgeSpinReelPartAnimator.onNudgeCompleted  at reel ${this._reelId}`);
    }
    getNudgeUpAnimation(nextNudgeUpSymbol) {
        this._symbolsToAnimate.push(nextNudgeUpSymbol);
        this.resetSymbolsPositionBeforeNudgeUp();
        this._nudgeTimeline = new gsap_1.TimelineLite();
        if (this._aborted) {
            Logger_1.Logger.logDev(`NudgeSpinReelPartAnimator nudgeUp after abort.  at reel ${this._reelId}`);
            this._nudgeTimeline.add(() => this.yPos = 0);
        }
        else {
            Logger_1.Logger.logDev(`NudgeSpinReelPartAnimator nudgeUp. at reel ${this._reelId}`);
            this._nudgeTimeline.add(gsap_1.TweenLite.to(this, this._nudgeStepSpeed, {
                ease: this.ease,
                yPos: 0
            }));
        }
        this._nudgeTimeline.add(() => this.onNudgeUpStepCompleted());
        return this._nudgeTimeline;
    }
    resetSymbolsPositionBeforeNudgeUp() {
        this.yPos = this.symStep;
    }
    onNudgeUpStepCompleted() {
        Logger_1.Logger.logDev(`NudgeSpinReelPartAnimator.onNudgeUpStepCompleted, abort: ${this._aborted}  at reel ${this._reelId}`);
        this._nudgeSteps++;
        this._nudgeTimeline = null;
    }
}
exports.NudgeSpinReelPartAnimator = NudgeSpinReelPartAnimator;
//# sourceMappingURL=NudgeSpinReelPartAnimator.js.map