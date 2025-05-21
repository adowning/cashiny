"use strict";
/**
 * Created by Ning Jiang on 8/8/2017.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.StepCountUpBigWinController = void 0;
const gsap_1 = require("gsap");
const EventHandler_1 = require("../../../../core/event/EventHandler");
const GameEvent_1 = require("../../../../core/event/GameEvent");
const GameConfig_1 = require("../../../../core/gameconfig/GameConfig");
const SpinEvent_1 = require("../../../../core/spin/event/SpinEvent");
const WinPresentationController_1 = require("../../../../core/winpresentation/WinPresentationController");
class StepCountUpBigWinController extends WinPresentationController_1.WinPresentationController {
    constructor(indexes, bwConfig, wpConfig = {
        name: "StepCountUpBigWin",
        skippable: true,
        tweakEnabled: true
    }) {
        super(indexes, wpConfig);
        this._winLevel = -1;
        this._currentLevel = -1;
        this._winRatios = GameConfig_1.GameConfig.instance.WIN_RATIOS.bigWin;
        this._skipLastLevelCountUpIfSmall = bwConfig.skipLastLevelCountUpIfSmall === true;
        this._skippableOnEachLevel = bwConfig.skippableOnEachLevel === true;
    }
    parseFeatureGameData(data) {
        if (data && data.isBigWin) {
            for (let i = this._winRatios.length - 1; i >= 0; i--) {
                if (data.currentWinRatio > this._winRatios[i].ratio) {
                    this._winLevel = i;
                    return;
                }
            }
            // if the winRation is exactly 15
            this._winLevel = 0;
        }
        else {
            this._winLevel = -1;
        }
    }
    hasWin() {
        return this._gameData != null && this._gameData.isBigWin;
    }
    startWinPresentation() {
        this.playBigWinLevelAnimation(0);
        if (this.playSymbolsAnimation) {
            this.playSymbolsAnimation();
        }
        if (this.playBigWinSound) {
            this.playBigWinSound();
        }
    }
    playBigWinLevelAnimation(currentLevel) {
        this._currentLevel = currentLevel;
        const shouldSkipLastSmallLevel = this._skipLastLevelCountUpIfSmall && currentLevel === this._winLevel && this.isLevelWinTooSmall(currentLevel);
        if (!shouldSkipLastSmallLevel && currentLevel <= this._winLevel) {
            if (this._skippableOnEachLevel) {
                EventHandler_1.EventHandler.dispatchEvent(new GameEvent_1.GameEvent(SpinEvent_1.SpinEvent.WANT_SKIPPABLE));
            }
            const levelAnimation = this.getBigWinLevelAnimation(currentLevel);
            this._currentTimeline = new gsap_1.TimelineLite({ paused: true });
            this._currentTimeline.add([
                levelAnimation,
                this.playBigWinCountUp(currentLevel, levelAnimation.totalDuration()),
                () => {
                    if (this.playBigWinLevelSound) {
                        this.playBigWinLevelSound(currentLevel);
                    }
                }
            ]);
            this._currentTimeline.add(() => {
                this.playBigWinLevelAnimation(currentLevel + 1);
            });
            this._currentTimeline.play();
        }
        else {
            this.finish();
        }
    }
    // To override with other conditions.
    isLevelWinTooSmall(level) {
        if (level === 0) {
            return false;
        }
        const fromValue = this._gameData.playedBetValue * GameConfig_1.GameConfig.instance.WIN_RATIOS.bigWin[level].ratio;
        const toValue = this._gameData.singleWin;
        return (toValue - fromValue) <= (fromValue * 0.1);
    }
    playBigWinCountUp(level, duration) {
        const preTotalWin = this._gameData.totalWin - this._gameData.singleWin;
        const fromValue = level === 0 ? 0 : this._gameData.playedBetValue * GameConfig_1.GameConfig.instance.WIN_RATIOS.bigWin[level].ratio;
        const toValue = level === this._winLevel ? this._gameData.singleWin : this._gameData.playedBetValue * GameConfig_1.GameConfig.instance.WIN_RATIOS.bigWin[level + 1].ratio;
        const timeline = new gsap_1.TimelineLite();
        timeline.add([
            this.playCountUp(fromValue, toValue, duration, preTotalWin),
            () => {
                if (this.playBigWinCountUpSound) {
                    this.playBigWinCountUpSound(level);
                }
            }
        ]);
        return timeline;
    }
    abort() {
        if (this._isPlaying && this._skippable && this._skippableOnEachLevel) {
            this.abortCurrentLevel(this._currentLevel);
        }
        else {
            super.abort();
        }
    }
    abortCurrentLevel(level) {
        if (this._currentTimeline && this._currentTimeline.isActive()) {
            this._currentTimeline.progress(1);
        }
        else {
            debugger;
            // TODO: Test will it ever be here?
        }
        // TODO: override to add abort level sound or maybe some animation in game.
    }
    stopWinPresentation(isAborted) {
        if (this._currentTimeline && this._currentTimeline.isActive()) {
            this._currentTimeline.pause();
            this._currentTimeline.kill();
        }
        this._currentTimeline = null;
        if (this.playSymbolsAnimation) {
            if (this.stopSymbolsAnimation == null) {
                debugger;
                throw new Error(`StepCountUpBigWinController.stopWinPresentation():stopSymbolsAnimation() must be implemented when there is sound playing.`);
            }
            this.stopSymbolsAnimation();
        }
        if (this.playBigWinSound || this.playBigWinLevelSound || this.playBigWinCountUpSound) {
            if (this.stopAllSounds == null) {
                debugger;
                throw new Error(`StepCountUpBigWinController.stopWinPresentation():stopAllSounds() must be implemented when there is sound playing.`);
            }
            this.stopAllSounds();
        }
        if (this.playEndingAnimation) {
            this.playEndingAnimation(isAborted);
        }
    }
    resetFeature() {
        this._winLevel = -1;
        this._currentLevel = -1;
    }
}
exports.StepCountUpBigWinController = StepCountUpBigWinController;
//# sourceMappingURL=StepCountUpBigWinController.js.map