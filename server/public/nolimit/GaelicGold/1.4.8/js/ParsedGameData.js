"use strict";
/**
 * Created by Ning Jiang on 4/19/2016.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParsedGameData = void 0;
const GameConfig_1 = require("../../gameconfig/GameConfig");
const ParsedServerData_1 = require("./ParsedServerData");
class ParsedGameData extends ParsedServerData_1.ParsedServerData {
    // private readonly _currentSymbols:string[][];
    // private readonly _visibleSymbols:string[][];
    get betWins() {
        return this._betWins;
    }
    // The total win for the single spin/fall. if there is multiplier/bonus win/coin win, they are all included.
    // If there is other wins than basic spin wins in a specific game, there will be extra data fields.
    get singleWin() {
        return this._singleWin;
    }
    get playedBetValue() {
        return this._playedBetValue;
    }
    get wasFeatureBuy() {
        return this._wasFeatureBuy;
    }
    get reelsEnteringFreespin() {
        return this._reelsEnteringFreespin;
    }
    get betLineWinsEnteringFreespin() {
        return this._betLineWinsEnteringFreespin;
    }
    get scatterPositionsEnteringFreespin() {
        return this._scatterPositionsEnteringFreespin;
    }
    get currentWinRatio() {
        return this._currentWinRatio;
    }
    get isBigWin() {
        return this._isBigWin;
    }
    get currentWinRatioConfig() {
        return this._currentWinRatioConfig;
    }
    // public get currentSymbols():string[][] {
    //     return this._currentSymbols;
    // }
    //
    // public get visibleSymbols():string[][] {
    //     return this._visibleSymbols;
    // }
    constructor(rawData, dataParser) {
        super(rawData, dataParser);
        this._betWins = dataParser.parseBetWins(rawData);
        this._singleWin = dataParser.parseSingleWin(rawData);
        this._playedBetValue = dataParser.parsePlayedBetValue(rawData);
        this._reelsEnteringFreespin = dataParser.parseReelsEnteringFreespin(rawData);
        this._betLineWinsEnteringFreespin = dataParser.parseBetLineWinsEnteringFreespin(rawData);
        this._scatterPositionsEnteringFreespin = dataParser.parseScatterPositionsEnteringFreespin(rawData);
        this._wasFeatureBuy = dataParser.parseWasFeatureBuy(rawData);
        // Calculated values.
        this._currentWinRatio = this._singleWin / this._playedBetValue;
        this._isBigWin = this._currentWinRatio >= GameConfig_1.GameConfig.instance.WIN_RATIOS.bigWin[0].ratio;
        this._currentWinRatioConfig = ParsedGameData.getWinRatioConfig(this._currentWinRatio);
        // this._currentSymbols = dataParser.parseEndSymbols(rawData);
        // this._visibleSymbols = dataParser.parseVisibleSymbols(this._currentSymbols);
    }
    // TODO: this doesn't take care of the win lower than the configed lowest win level. we can solve it by defining TINY_WIN ratio:0.001. but this is not the best way.
    static getWinRatioConfig(winRatio) {
        let winLevels = GameConfig_1.GameConfig.instance.WIN_RATIOS.normalWin.concat();
        winLevels = winLevels.concat(GameConfig_1.GameConfig.instance.WIN_RATIOS.bigWin);
        for (let i = winLevels.length - 1; i >= 0; i--) {
            const winLevel = winLevels[i];
            if (winRatio >= winLevel.ratio) {
                return winLevel;
            }
        }
        return null;
    }
    parseScatterPositions(rawData, dataParser) {
        return dataParser.parseScatterPositions(rawData);
    }
}
exports.ParsedGameData = ParsedGameData;
//# sourceMappingURL=ParsedGameData.js.map