"use strict";
/**
 * Created by Jerker Nord on 2016-04-13.
 * Refactored by Ning Jiang on 2016-12-6.
 * Refactored by Ning Jiang on 2019-08. Adding avalanche.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReelPartAnimator = void 0;
const MathHelper_1 = require("../../utils/MathHelper");
const BaseController_1 = require("../../base/BaseController");
const GameConfig_1 = require("../../gameconfig/GameConfig");
const ArrayHelper_1 = require("../../utils/ArrayHelper");
class ReelPartAnimator extends BaseController_1.BaseController {
    get symWidth() {
        var _a;
        return (_a = this._symWidth) !== null && _a !== void 0 ? _a : GameConfig_1.GameConfig.instance.SYMBOL_WIDTH;
    }
    set symWidth(value) {
        this._symWidth = value;
    }
    get symHeight() {
        var _a;
        return (_a = this._symHeight) !== null && _a !== void 0 ? _a : GameConfig_1.GameConfig.instance.SYMBOL_HEIGHT;
    }
    set symHeight(value) {
        this._symHeight = value;
    }
    get symBottomPadding() {
        var _a;
        return (_a = this._symBottomPadding) !== null && _a !== void 0 ? _a : GameConfig_1.GameConfig.instance.SYMBOL_BOTTOM_PADDING;
    }
    set symBottomPadding(value) {
        this._symBottomPadding = value;
    }
    get symStep() {
        return this.symHeight + this.symBottomPadding;
    }
    get symbolsToAnimate() {
        return this._symbolsToAnimate;
    }
    get startSpeed() {
        return this._startSpinSpeed;
    }
    set startSpeed(value) {
        this._startSpinSpeed = value;
    }
    get spinSpeed() {
        return this._spinSpeed;
    }
    set spinSpeed(value) {
        this._spinSpeed = value;
    }
    get stopSpeed() {
        return this._stopSpinSpeed;
    }
    set stopSpeed(value) {
        this._stopSpinSpeed = value;
    }
    get isFastSpin() {
        return this._isFastSpin;
    }
    set isFastSpin(value) {
        this._isFastSpin = value;
    }
    get isQuickStop() {
        return this._isQuickStop;
    }
    set isQuickStop(value) {
        this._isQuickStop = value;
    }
    constructor(reelId) {
        super(!ReelPartAnimator._configInitialized, `ReelPartAnimator${reelId}`);
        this._reelId = reelId;
        this.initConfig();
    }
    initConfig() {
        if (ReelPartAnimator._configInitialized) {
            return;
        }
        const startSpeed = GameConfig_1.GameConfig.instance.REEL_SPIN_START_SPEED;
        if ((0, MathHelper_1.isNumber)(startSpeed)) {
            this.addTweakModuleSlider({
                text: "Spin Start Speed",
                minValue: 0.1,
                maxValue: 2.2,
                startValue: startSpeed,
                onValueChangeCallback: (text, newValue) => ReelPartAnimator.onSpinStartSpeedChanged(newValue)
            });
            ReelPartAnimator._spinStartSpeeds = ArrayHelper_1.ArrayHelper.initArrayWithValues(GameConfig_1.GameConfig.instance.REELS_NUM, () => startSpeed);
        }
        else {
            ReelPartAnimator._spinStartSpeeds = startSpeed;
            if (ReelPartAnimator._spinStartSpeeds.length != GameConfig_1.GameConfig.instance.REELS_NUM) {
                debugger;
                throw new Error(`ReelPartAnimator.initConfig(): Invalid config REEL_SPIN_START_SPEED, the length doesn't match the amount of reels!`);
            }
        }
        if (GameConfig_1.GameConfig.instance.REEL_FAST_SPIN_START_SPEED) {
            const fastStartSpeed = GameConfig_1.GameConfig.instance.REEL_FAST_SPIN_START_SPEED;
            if ((0, MathHelper_1.isNumber)(fastStartSpeed)) {
                this.addTweakModuleSlider({
                    text: "Fast Spin Start Speed",
                    minValue: 0.1,
                    maxValue: 2.2,
                    startValue: fastStartSpeed,
                    onValueChangeCallback: (text, newValue) => ReelPartAnimator.onFastSpinStartSpeedChanged(newValue)
                });
                ReelPartAnimator._fastSpinStartSpeeds = ArrayHelper_1.ArrayHelper.initArrayWithValues(GameConfig_1.GameConfig.instance.REELS_NUM, () => fastStartSpeed);
            }
            else {
                ReelPartAnimator._fastSpinStartSpeeds = fastStartSpeed;
                if (ReelPartAnimator._fastSpinStartSpeeds.length != GameConfig_1.GameConfig.instance.REELS_NUM) {
                    debugger;
                    throw new Error(`ReelPartAnimator.initConfig(): Invalid config REEL_FAST_SPIN_START_SPEED, the length doesn't match the amount of reels!`);
                }
            }
        }
        else {
            ReelPartAnimator._fastSpinStartSpeeds = ReelPartAnimator._spinStartSpeeds.concat();
        }
        const spinSpeed = GameConfig_1.GameConfig.instance.REEL_SPIN_SPIN_SPEED;
        if ((0, MathHelper_1.isNumber)(spinSpeed)) {
            this.addTweakModuleSlider({
                text: "Spin Spin Speed",
                minValue: 0.012,
                maxValue: 2.0,
                startValue: spinSpeed,
                onValueChangeCallback: (text, newValue) => ReelPartAnimator.onSpinSpinSpeedChanged(newValue)
            });
            ReelPartAnimator._spinSpinSpeeds = ArrayHelper_1.ArrayHelper.initArrayWithValues(GameConfig_1.GameConfig.instance.REELS_NUM, () => spinSpeed);
        }
        else {
            ReelPartAnimator._spinSpinSpeeds = spinSpeed;
            if (ReelPartAnimator._spinSpinSpeeds.length != GameConfig_1.GameConfig.instance.REELS_NUM) {
                debugger;
                throw new Error(`ReelPartAnimator.initConfig(): Invalid config REEL_SPIN_SPIN_SPEED, the length doesn't match the amount of reels!`);
            }
        }
        const nearWinSpinSpeed = GameConfig_1.GameConfig.instance.REEL_NEAR_WIN_SPIN_SPEED;
        if ((0, MathHelper_1.isNumber)(nearWinSpinSpeed)) {
            this.addTweakModuleSlider({
                text: "Near Win Spin Speed",
                minValue: 0.01,
                maxValue: 2.0,
                startValue: nearWinSpinSpeed,
                onValueChangeCallback: (text, newValue) => ReelPartAnimator.onNearWinSpinSpeedChanged(newValue)
            });
            ReelPartAnimator._nearWinSpinSpeeds = ArrayHelper_1.ArrayHelper.initArrayWithValues(GameConfig_1.GameConfig.instance.REELS_NUM, () => nearWinSpinSpeed);
        }
        else {
            ReelPartAnimator._nearWinSpinSpeeds = nearWinSpinSpeed;
            if (ReelPartAnimator._nearWinSpinSpeeds.length != GameConfig_1.GameConfig.instance.REELS_NUM) {
                debugger;
                throw new Error(`ReelPartAnimator.initConfig(): Invalid config REEL_NEAR_WIN_SPIN_SPEED, the length doesn't match the amount of reels!`);
            }
        }
        const stopSpeed = GameConfig_1.GameConfig.instance.REEL_SPIN_STOP_SPEED;
        if ((0, MathHelper_1.isNumber)(stopSpeed)) {
            this.addTweakModuleSlider({
                text: "Spin Stop Speed",
                minValue: 0.1,
                maxValue: 5.0,
                startValue: stopSpeed,
                onValueChangeCallback: (text, newValue) => ReelPartAnimator.onSpinStopSpeedChanged(newValue)
            });
            ReelPartAnimator._spinStopSpeeds = ArrayHelper_1.ArrayHelper.initArrayWithValues(GameConfig_1.GameConfig.instance.REELS_NUM, () => stopSpeed);
        }
        else {
            ReelPartAnimator._spinStopSpeeds = stopSpeed;
            if (ReelPartAnimator._spinStopSpeeds.length != GameConfig_1.GameConfig.instance.REELS_NUM) {
                debugger;
                throw new Error(`ReelPartAnimator.initConfig(): Invalid config REEL_SPIN_STOP_SPEED, the length doesn't match the amount of reels!`);
            }
        }
        const quickStopSpeed = GameConfig_1.GameConfig.instance.REEL_SPIN_QUICK_STOP_SPEED;
        if ((0, MathHelper_1.isNumber)(quickStopSpeed)) {
            this.addTweakModuleSlider({
                text: "Spin Quick Stop Speed",
                minValue: 0.1,
                maxValue: 5.0,
                startValue: quickStopSpeed,
                onValueChangeCallback: (text, newValue) => ReelPartAnimator.onSpinQuickStopSpeedChanged(newValue)
            });
            ReelPartAnimator._spinQuickStopSpeeds = ArrayHelper_1.ArrayHelper.initArrayWithValues(GameConfig_1.GameConfig.instance.REELS_NUM, () => quickStopSpeed);
        }
        else {
            ReelPartAnimator._spinQuickStopSpeeds = quickStopSpeed;
            if (ReelPartAnimator._spinQuickStopSpeeds.length != GameConfig_1.GameConfig.instance.REELS_NUM) {
                debugger;
                throw new Error(`ReelPartAnimator.initConfig(): Invalid config REEL_SPIN_QUICK_STOP_SPEED, the length doesn't match the amount of reels!`);
            }
        }
        ReelPartAnimator._configInitialized = true;
    }
    static onSpinStartSpeedChanged(newValue) {
        this._spinStartSpeeds = ArrayHelper_1.ArrayHelper.initArrayWithValues(GameConfig_1.GameConfig.instance.REELS_NUM, () => newValue);
    }
    static onFastSpinStartSpeedChanged(newValue) {
        this._fastSpinStartSpeeds = ArrayHelper_1.ArrayHelper.initArrayWithValues(GameConfig_1.GameConfig.instance.REELS_NUM, () => newValue);
    }
    static onSpinSpinSpeedChanged(newValue) {
        this._spinSpinSpeeds = ArrayHelper_1.ArrayHelper.initArrayWithValues(GameConfig_1.GameConfig.instance.REELS_NUM, () => newValue);
    }
    static onNearWinSpinSpeedChanged(newValue) {
        this._nearWinSpinSpeeds = ArrayHelper_1.ArrayHelper.initArrayWithValues(GameConfig_1.GameConfig.instance.REELS_NUM, () => newValue);
    }
    static onSpinStopSpeedChanged(newValue) {
        this._spinStopSpeeds = ArrayHelper_1.ArrayHelper.initArrayWithValues(GameConfig_1.GameConfig.instance.REELS_NUM, () => newValue);
    }
    static onSpinQuickStopSpeedChanged(newValue) {
        this._spinQuickStopSpeeds = ArrayHelper_1.ArrayHelper.initArrayWithValues(GameConfig_1.GameConfig.instance.REELS_NUM, () => newValue);
    }
    initSymbols(symbols) {
        this.setAllSymbols(symbols);
        this.initTargetPositions();
        this.initSymbolsPosition();
    }
    setAllSymbols(symbols) {
        this._symbolsToAnimate = symbols;
    }
    resetStartSpin(isFastSpin) {
        this.isFastSpin = isFastSpin;
        this.isQuickStop = false;
        this.startSpeed = isFastSpin ? ReelPartAnimator._fastSpinStartSpeeds[this._reelId] : ReelPartAnimator._spinStartSpeeds[this._reelId];
        this.spinSpeed = ReelPartAnimator._spinSpinSpeeds[this._reelId];
        this.stopSpeed = isFastSpin ? ReelPartAnimator._spinQuickStopSpeeds[this._reelId] : ReelPartAnimator._spinStopSpeeds[this._reelId];
    }
}
ReelPartAnimator._configInitialized = false;
exports.ReelPartAnimator = ReelPartAnimator;
//# sourceMappingURL=ReelPartAnimator.js.map