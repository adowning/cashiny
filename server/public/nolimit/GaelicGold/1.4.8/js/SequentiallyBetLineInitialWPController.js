"use strict";
/**
 * Created by Ning Jiang on 2/10/2017.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SequentiallyBetLineInitialWPController = void 0;
const BetLineEvent_1 = require("../../../../core/betline/event/BetLineEvent");
const EventHandler_1 = require("../../../../core/event/EventHandler");
const GameEvent_1 = require("../../../../core/event/GameEvent");
const GameConfig_1 = require("../../../../core/gameconfig/GameConfig");
const SequentiallyInitialWPController_1 = require("./SequentiallyInitialWPController");
class SequentiallyBetLineInitialWPController extends SequentiallyInitialWPController_1.SequentiallyInitialWPController {
    constructor(indexes, config = {
        name: "SequentiallyBetLineInitialWin",
        hasWinCountUp: true,
        skippable: true,
        tweakEnabled: true,
        betWinMode: 1 /* BetWinMode.BET_LINE */,
        shouldPlayBetLine: true
    }) {
        super(indexes, config);
        this._betLineWinConfig = config;
    }
    addSingleBetWinAnimationToTimeline(betLineWinData, timeline, startTime) {
        const symbolsNum = betLineWinData.nrOfSymbols;
        let symbol;
        let symbolDelay = 0;
        for (let i = 0; i < symbolsNum; i++) {
            symbol = this.findSymbol(i, betLineWinData.betLine[i]);
            if (!symbol) {
                debugger;
                throw new Error(`Error: SequentiallyBetLineInitialWPController.playBetWinPresentation(): Cannot find symbol at reel ${i} symbol ${betLineWinData.betLine[i]}`);
            }
            symbolDelay += this.addSymbolWinAnimationToTimeline(betLineWinData, timeline, startTime + symbolDelay, symbol, i, betLineWinData.betLine[i]);
            // timeline.add(symbol!.changeState({
            //     name : GameConfig.instance.SYMBOL_STATES.win.value,
            //     fadeInDuration : 0.1
            // }), symbolDuration * i);
            if (this._winSymbols.indexOf(symbol) === -1) {
                this._winSymbols.push(symbol);
            }
        }
        if (this._betLineWinConfig.shouldPlayBetLine) {
            timeline.add(() => this.playBetLine(betLineWinData.betLineIndex + 1), startTime);
        }
        return this.getNextBetWinAnimationTimeOffset(symbolDelay);
    }
    // Returns the offset time in the main timeline from this symbol animation start to when the next symbol animation should start.
    addSymbolWinAnimationToTimeline(betLineWinData, timeline, startTime, symbol, reelId, symbolId) {
        const symbolAnimation = symbol.changeState({
            state: GameConfig_1.GameConfig.instance.SYMBOL_STATES.win,
            setStack: true,
            fadeInDuration: 0.1
        });
        timeline.add([
            () => this.sortSymbolDepthToTop(symbol),
            symbolAnimation
        ], startTime);
        return this.getNextSymbolAnimationTimeOffset(symbolAnimation.totalDuration());
    }
    sortSymbolDepthToTop(symbol) {
        if (symbol && symbol.parent) {
            symbol.parent.addChild(symbol);
        }
    }
    playBetLine(betLineNumber) {
        EventHandler_1.EventHandler.dispatchEvent(new GameEvent_1.GameEvent(BetLineEvent_1.BetLineEvent.SHOW_WIN_BET_LINE, betLineNumber));
    }
    getNextBetWinAnimationTimeOffset(lastSymbolDelay) {
        return lastSymbolDelay;
    }
    getNextSymbolAnimationTimeOffset(duration) {
        return duration;
    }
}
exports.SequentiallyBetLineInitialWPController = SequentiallyBetLineInitialWPController;
//# sourceMappingURL=SequentiallyBetLineInitialWPController.js.map