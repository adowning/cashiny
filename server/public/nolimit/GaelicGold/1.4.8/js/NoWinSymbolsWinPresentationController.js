"use strict";
/**
 * Created by Ning Jiang on 5/17/2019.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoWinSymbolsWinPresentationController = void 0;
const EventHandler_1 = require("../../../core/event/EventHandler");
const GameConfig_1 = require("../../../core/gameconfig/GameConfig");
const Reels_1 = require("../../../core/reel/reelarea/Reels");
const StateReelSymbol_1 = require("../../../core/reelsymbol/StateReelSymbol");
const SpinEvent_1 = require("../../../core/spin/event/SpinEvent");
const ArrayHelper_1 = require("../../../core/utils/ArrayHelper");
const WinPresentationController_1 = require("../../../core/winpresentation/WinPresentationController");
class NoWinSymbolsWinPresentationController extends WinPresentationController_1.WinPresentationController {
    constructor(indexes, noWinConfig, wpConfig = {
        name: "NoWinSymbol",
        skippable: false
    }) {
        super(indexes, wpConfig);
        this._noWinSymbols = [];
        this._reelsNum = GameConfig_1.GameConfig.instance.REELS_NUM;
        this._symbolsNum = GameConfig_1.GameConfig.instance.SYMBOLS_NUM_IN_REEL[2];
        this._noWinConfig = noWinConfig;
    }
    addFeatureEventHandlers() {
        EventHandler_1.EventHandler.addEventListener(this, SpinEvent_1.SpinEvent.BEFORE_START, (event) => this.onBeforeSpinStart());
    }
    onBeforeSpinStart() {
        while (this._noWinSymbols.length > 0) {
            const symbol = this._noWinSymbols.pop();
            symbol.changeState({
                state: GameConfig_1.GameConfig.instance.SYMBOL_STATES.normal,
                fadeInDuration: 0.5
            });
            // Logger.logDev(`onBeforeSpinStart: NoWinSymbols.length = ${this._noWinSymbols.length}`);
        }
    }
    parseFeatureGameData(data) {
        if (!this.hasWin()) {
            return;
        }
        this._symbolWinStates = ArrayHelper_1.ArrayHelper.initArrayWithValues(this._reelsNum, () => {
            return ArrayHelper_1.ArrayHelper.initArrayWithValues(this._symbolsNum, () => false);
        });
        switch (GameConfig_1.GameConfig.instance.BET_WIN_MODE) {
            case 1 /* BetWinMode.BET_LINE */:
                this.getBetLineSymbolWinStates();
                break;
            case 2 /* BetWinMode.BET_WAY */:
                this.getBetWaySymbolWinStates();
                break;
            default:
            // do nothing or override?
        }
    }
    getBetWaySymbolWinStates() {
        this._betWinsData.forEach((winData) => {
            const betWayWinData = winData;
            for (let reelId = 0; reelId < betWayWinData.reelWinPositions.length; reelId++) {
                for (let symbolId = 0; symbolId < betWayWinData.reelWinPositions[reelId].length; symbolId++) {
                    if (betWayWinData.reelWinPositions[reelId][symbolId]) {
                        this._symbolWinStates[reelId][symbolId] = true;
                        this.updateStackedSymbolWinStates(reelId, symbolId);
                    }
                }
            }
        });
    }
    getBetLineSymbolWinStates() {
        this._betWinsData.forEach((winData) => {
            const betLineWinData = winData;
            for (let reelId = 0; reelId < betLineWinData.nrOfSymbols; reelId++) {
                const symbolId = betLineWinData.betLine[reelId];
                this._symbolWinStates[reelId][symbolId] = true;
                this.updateStackedSymbolWinStates(reelId, symbolId);
            }
        });
    }
    updateStackedSymbolWinStates(reelId, symbolId) {
        if (GameConfig_1.GameConfig.instance.STACKED_SYMBOLS == null) {
            return;
        }
        // To mark all the stack win.
        const parsedStackedSymbolName = StateReelSymbol_1.StateReelSymbol.parseStackedSymbolName(this._gameData.reels[reelId][symbolId + GameConfig_1.GameConfig.instance.SYMBOLS_NUM_IN_REEL[1]], reelId);
        if (parsedStackedSymbolName.isStacked) {
            for (let i = 0; i < parsedStackedSymbolName.totalNum; i++) {
                this._symbolWinStates[reelId][Math.min(GameConfig_1.GameConfig.instance.SYMBOLS_NUM_IN_REEL[2] - 1, Math.max(0, i - parsedStackedSymbolName.index + symbolId))] = true;
            }
        }
    }
    hasWin() {
        return this._betWinsData != null && this._betWinsData.length > 0;
    }
    startWinPresentation() {
        this.finish();
    }
    stopWinPresentation(isAborted) {
        // If abort before running this wp, we don't need to reset no win symbols.
        if (isAborted) {
            return;
        }
        let noWinSymbol;
        for (let i = 0; i < this._symbolWinStates.length; i++) {
            for (let j = 0; j < this._symbolWinStates[i].length; j++) {
                if (this._symbolWinStates[i][j]) {
                    continue;
                }
                noWinSymbol = Reels_1.Reels.getSymbol(i, j);
                if (noWinSymbol == null) {
                    continue;
                }
                noWinSymbol.changeState({
                    state: GameConfig_1.GameConfig.instance.SYMBOL_STATES.noWin,
                    fadeInDuration: this._noWinConfig.noWinStateFadeInDuration
                });
                this._noWinSymbols.push(noWinSymbol);
            }
        }
    }
}
exports.NoWinSymbolsWinPresentationController = NoWinSymbolsWinPresentationController;
//# sourceMappingURL=NoWinSymbolsWinPresentationController.js.map