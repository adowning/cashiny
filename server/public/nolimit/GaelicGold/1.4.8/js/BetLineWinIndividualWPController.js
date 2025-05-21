"use strict";
/**
 * Created by Ning Jiang on 3/21/2017.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BetLineWinIndividualWPController = void 0;
const BetLineEvent_1 = require("../../../core/betline/event/BetLineEvent");
const EventHandler_1 = require("../../../core/event/EventHandler");
const GameEvent_1 = require("../../../core/event/GameEvent");
const GameConfig_1 = require("../../../core/gameconfig/GameConfig");
const Reels_1 = require("../../../core/reel/reelarea/Reels");
const IndividualWinPresentationController_1 = require("../../../core/winpresentation/individualwin/IndividualWinPresentationController");
const gsap_1 = require("gsap");
class BetLineWinIndividualWPController extends IndividualWinPresentationController_1.IndividualWinPresentationController {
    constructor(config, name = "BetLineIndividualWin", tweakEnabled) {
        super(name, tweakEnabled, 1 /* BetWinMode.BET_LINE */);
        this._config = config;
    }
    getLineAnimation(betLineWinData) {
        const timeline = new gsap_1.TimelineLite();
        timeline.add(() => {
            EventHandler_1.EventHandler.dispatchEvent(new GameEvent_1.GameEvent(BetLineEvent_1.BetLineEvent.HIDE_ALL_BET_LINES));
            EventHandler_1.EventHandler.dispatchEvent(new GameEvent_1.GameEvent(BetLineEvent_1.BetLineEvent.SHOW_WIN_BET_LINE, betLineWinData.betLineIndex + 1));
        });
        for (let i = 0; i < betLineWinData.nrOfSymbols; i++) {
            const symbol = Reels_1.Reels.getSymbol(i, betLineWinData.betLine[i]);
            if (symbol) {
                this.addSymbolWinAnimationToTimeline(betLineWinData, timeline, this._config.symbolTimeOffsetCalculator(timeline.totalDuration(), i, betLineWinData.betLine[i]), symbol, i, betLineWinData.betLine[i]);
                if (this._winSymbols.indexOf(symbol) === -1) {
                    this._winSymbols.push(symbol);
                }
            }
        }
        return timeline;
    }
    addSymbolWinAnimationToTimeline(betLineWinData, timeline, startTime, symbol, reelId, symbolId) {
        timeline.add([
            () => this.sortSymbolDepthToTop(symbol),
            symbol.changeState({
                state: GameConfig_1.GameConfig.instance.SYMBOL_STATES.win,
                setStack: true,
                fadeInDuration: 0.4
            })
        ], startTime);
    }
    sortSymbolDepthToTop(symbol) {
        if (symbol && symbol.parent) {
            symbol.parent.addChild(symbol);
        }
    }
}
exports.BetLineWinIndividualWPController = BetLineWinIndividualWPController;
//# sourceMappingURL=BetLineWinIndividualWPController.js.map