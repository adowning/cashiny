"use strict";
/**
 * Created by Ning Jiang on 3/21/2017.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SequentiallyInitialWPController = void 0;
const Reels_1 = require("../../../../core/reel/reelarea/Reels");
const SlotGame_1 = require("../../../../core/SlotGame");
const InitialWinPresentationController_1 = require("../InitialWinPresentationController");
class SequentiallyInitialWPController extends InitialWinPresentationController_1.InitialWinPresentationController {
    constructor(indexes, config = {
        name: "SequentiallyInitialWin",
        hasWinCountUp: true,
        skippable: true,
        tweakEnabled: true
    }) {
        super(indexes, config);
    }
    addWinAnimationsToTimeline(timeline) {
        let startTime = 0;
        for (let i = 0; i < this._betWinsData.length; i++) {
            startTime += this.addSingleBetWinAnimationToTimeline(this._betWinsData[i], timeline, startTime);
        }
    }
    // TODO: refactor.
    addWinCountUpToTimeline(timeline) {
        const singleWin = this._gameData.singleWin;
        const totalWin = this._gameData.totalWin;
        const duration = this.getWinCountUpDuration(timeline);
        const delay = this.getWinCountUpDelay(timeline);
        timeline.add(() => SlotGame_1.SlotGame.winFieldController.showWinField(), delay + duration);
    }
    getWinCountUpDuration(timeline) {
        if (this._gameData.currentWinRatio <= 1) {
            return 0;
        }
        return timeline.totalDuration();
    }
    getWinCountUpDelay(timeline) {
        return 0;
    }
    // this is for overriding so you can get sym in different way.
    findSymbol(reelId, symId) {
        return Reels_1.Reels.getSymbol(reelId, symId);
    }
}
exports.SequentiallyInitialWPController = SequentiallyInitialWPController;
//# sourceMappingURL=SequentiallyInitialWPController.js.map